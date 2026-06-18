import axios from 'axios';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const CACHE_DURATION = 300000;           // 5 minutes (was 2 — too aggressive)
const RATE_LIMIT_CACHE_DURATION = 900000; // 15 minutes on rate limit
const STARTUP_DELAY = 5000;              // Wait 5s before first fetch

let priceCache = {
  data: null,
  timestamp: null,
  isRateLimited: false,
  rateLimitedAt: null
};

let ongoingRequest = null; // Deduplication lock

const TRACKED_COINS = [
  'bitcoin', 'ethereum', 'tether', 'binancecoin', 'solana',
  'ripple', 'usd-coin', 'cardano', 'avalanche-2', 'dogecoin',
  'polkadot', 'tron', 'chainlink', 'polygon', 'litecoin',
  'shiba-inu', 'dai', 'uniswap', 'cosmos', 'stellar'
];

const SYMBOL_MAP = {
  'bitcoin': 'BTC', 'ethereum': 'ETH', 'tether': 'USDT',
  'binancecoin': 'BNB', 'solana': 'SOL', 'ripple': 'XRP',
  'usd-coin': 'USDC', 'cardano': 'ADA', 'avalanche-2': 'AVAX',
  'dogecoin': 'DOGE', 'polkadot': 'DOT', 'tron': 'TRX',
  'chainlink': 'LINK', 'polygon': 'MATIC', 'litecoin': 'LTC',
  'shiba-inu': 'SHIB', 'dai': 'DAI', 'uniswap': 'UNI',
  'cosmos': 'ATOM', 'stellar': 'XLM'
};

// Fallback data so the app is usable even when CoinGecko is down
const FALLBACK_DATA = TRACKED_COINS.map(id => ({
  id,
  symbol: SYMBOL_MAP[id] || id.toUpperCase(),
  name: id.charAt(0).toUpperCase() + id.slice(1),
  price: 0,
  change24h: 0,
  marketCap: 0,
  volume24h: 0,
  image: null,
  lastUpdated: new Date().toISOString(),
  isFallback: true
}));

const fetchFromCoinGecko = async (retryCount = 0) => {
  const MAX_RETRIES = 1; // Reduced from 2 — don't hammer a rate-limited API
  const RETRY_DELAY = 10000; // 10s between retries (was 2s — too fast)

  try {
    const response = await axios.get(`${COINGECKO_BASE_URL}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        ids: TRACKED_COINS.join(','),
        order: 'market_cap_desc',
        per_page: TRACKED_COINS.length,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h'
      },
      timeout: 15000
    });

    priceCache.isRateLimited = false;
    priceCache.rateLimitedAt = null;
    return response.data;

  } catch (error) {
    console.error('CoinGecko API Error:', {
      message: error.message,
      status: error.response?.status,
      timestamp: new Date().toISOString()
    });

    if (error.response?.status === 429) {
      console.warn('⚠️  Rate limited by CoinGecko.');
      priceCache.isRateLimited = true;
      priceCache.rateLimitedAt = Date.now();

      // Return existing cache if available — don't retry immediately
      if (priceCache.data) {
        console.log('✅ Returning cached data due to rate limit');
        return priceCache.data.map(coin => ({ ...coin, isCached: true }));
      }

      // Only retry once, with a long delay
      if (retryCount < MAX_RETRIES) {
        console.log(`🔄 Retrying in ${RETRY_DELAY}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchFromCoinGecko(retryCount + 1);
      }

      // Return fallback instead of throwing — keeps app alive
      console.warn('⚠️  No cache available, returning fallback data');
      return FALLBACK_DATA;
    }

    if (error.response?.status >= 500) {
      throw new Error('CoinGecko service is temporarily unavailable.');
    } else if (error.request) {
      throw new Error('Network error. Unable to reach CoinGecko.');
    } else {
      throw new Error('Unexpected error fetching prices.');
    }
  }
};

const normalizePriceData = (data) => {
  // Handle both raw CoinGecko format and already-normalized fallback format
  return data.map(coin => {
    if (coin.isFallback || coin.isCached) return coin;
    return {
      id: coin.id,
      symbol: SYMBOL_MAP[coin.id] || coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h || 0,
      marketCap: coin.market_cap,
      volume24h: coin.total_volume,
      image: coin.image,
      lastUpdated: coin.last_updated
    };
  });
};

const isCacheValid = () => {
  if (!priceCache.data || !priceCache.timestamp) return false;
  const age = Date.now() - priceCache.timestamp;
  const duration = priceCache.isRateLimited ? RATE_LIMIT_CACHE_DURATION : CACHE_DURATION;
  return age < duration;
};

// Called once at server startup — delayed to avoid hitting limits immediately
export const initMarketCache = () => {
  setTimeout(async () => {
    console.log('🔄 Warming up market price cache...');
    try {
      if (ongoingRequest) return;
      ongoingRequest = fetchFromCoinGecko();
      const data = await ongoingRequest;
      const normalized = normalizePriceData(data);
      priceCache = { data: normalized, timestamp: Date.now(), isRateLimited: priceCache.isRateLimited };
      console.log('✅ Market cache warmed up');
    } catch (err) {
      console.warn('⚠️  Cache warm-up failed, will retry on first request:', err.message);
    } finally {
      ongoingRequest = null;
    }
  }, STARTUP_DELAY);
};

export const getMarketPrices = async (req, res) => {
  try {
    if (isCacheValid()) {
      return res.status(200).json({
        success: true,
        data: priceCache.data,
        cached: true,
        timestamp: priceCache.timestamp
      });
    }

    // Deduplicate: if a fetch is already in progress, wait for it
    if (!ongoingRequest) {
      ongoingRequest = fetchFromCoinGecko().finally(() => { ongoingRequest = null; });
    }

    console.log('🔄 Fetching fresh prices from CoinGecko');
    const coinGeckoData = await ongoingRequest;
    const normalizedData = normalizePriceData(coinGeckoData);

    priceCache = {
      ...priceCache,
      data: normalizedData,
      timestamp: Date.now()
    };

    res.status(200).json({
      success: true,
      data: normalizedData,
      cached: false,
      timestamp: priceCache.timestamp
    });

  } catch (error) {
    console.error('❌ Market prices fetch failed:', {
      message: error.message,
      timestamp: new Date().toISOString(),
      endpoint: req.originalUrl,
      ip: req.ip
    });

    // If we have stale cache, serve it rather than returning a 500
    if (priceCache.data) {
      console.log('⚠️  Serving stale cache after fetch failure');
      return res.status(200).json({
        success: true,
        data: priceCache.data,
        cached: true,
        stale: true,
        timestamp: priceCache.timestamp
      });
    }

    res.status(503).json({
      success: false,
      error: error.message || 'Unable to fetch cryptocurrency prices at this time',
      timestamp: Date.now()
    });
  }
};

export const clearPriceCache = () => {
  priceCache = { data: null, timestamp: null, isRateLimited: false, rateLimitedAt: null };
  console.log('🗑️  Price cache cleared');
};