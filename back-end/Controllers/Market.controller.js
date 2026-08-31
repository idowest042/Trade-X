import axios from 'axios';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const CACHE_DURATION = 300000;           // 5 minutes
const RATE_LIMIT_CACHE_DURATION = 900000; // 15 minutes on rate limit
const STARTUP_DELAY = 5000;              // Wait 5s before first fetch

// How many coins to pull, ranked by real market cap. This is still ONE
// HTTP call to CoinGecko regardless of this number (up to their per-page
// max of 250) — the free tier bills per call, not per coin returned, so
// raising this costs nothing extra in rate limit. Going above 250 would
// require a second page (a second call) — not needed yet.
const MARKET_PAGE_SIZE = 150;

let priceCache = {
  data: null,
  timestamp: null,
  isRateLimited: false,
  rateLimitedAt: null
};

let ongoingRequest = null; // Deduplication lock

// Kept only for the hardcoded emergency-fallback list below (used when
// CoinGecko is fully down AND we have no cache at all) — no longer used
// to filter the live query, which now pulls top coins by market cap
// instead of a fixed id list.
const FALLBACK_COIN_IDS = [
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

// Fallback data so the app is usable even when CoinGecko is down AND
// there's no cache at all to fall back on.
const FALLBACK_DATA = FALLBACK_COIN_IDS.map(id => ({
  id,
  symbol: SYMBOL_MAP[id] || id.toUpperCase(),
  name: id.charAt(0).toUpperCase() + id.slice(1),
  price: 0,
  change24h: 0,
  marketCap: 0,
  volume24h: 0,
  high24h: 0,
  low24h: 0,
  image: null,
  lastUpdated: new Date().toISOString(),
  isFallback: true
}));

const fetchFromCoinGecko = async (retryCount = 0) => {
  const MAX_RETRIES = 1;
  const RETRY_DELAY = 10000;

  try {
    const response = await axios.get(`${COINGECKO_BASE_URL}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: MARKET_PAGE_SIZE,
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

      if (priceCache.data) {
        console.log('✅ Returning cached data due to rate limit');
        return priceCache.data.map(coin => ({ ...coin, isCached: true }));
      }

      if (retryCount < MAX_RETRIES) {
        console.log(`🔄 Retrying in ${RETRY_DELAY}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchFromCoinGecko(retryCount + 1);
      }

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
      high24h: coin.high_24h,
      low24h: coin.low_24h,
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

export const initMarketCache = () => {
  setTimeout(async () => {
    console.log('🔄 Warming up market price cache...');
    try {
      if (ongoingRequest) return;
      ongoingRequest = fetchFromCoinGecko();
      const data = await ongoingRequest;
      const normalized = normalizePriceData(data);
      priceCache = { data: normalized, timestamp: Date.now(), isRateLimited: priceCache.isRateLimited };
      console.log(`✅ Market cache warmed up (${normalized.length} coins)`);
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
        isFallback: !!priceCache.data?.[0]?.isFallback,
        timestamp: priceCache.timestamp
      });
    }

    if (!ongoingRequest) {
      ongoingRequest = fetchFromCoinGecko().finally(() => { ongoingRequest = null; });
    }

    console.log('🔄 Fetching fresh prices from CoinGecko');
    const coinGeckoData = await ongoingRequest;
    const normalizedData = normalizePriceData(coinGeckoData);
    const isFallback = normalizedData.some(coin => coin.isFallback);

    priceCache = {
      ...priceCache,
      data: normalizedData,
      timestamp: Date.now()
    };

    res.status(200).json({
      success: true,
      data: normalizedData,
      cached: false,
      isFallback,
      timestamp: priceCache.timestamp
    });

  } catch (error) {
    console.error('❌ Market prices fetch failed:', {
      message: error.message,
      timestamp: new Date().toISOString(),
      endpoint: req.originalUrl,
      ip: req.ip
    });

    if (priceCache.data) {
      console.log('⚠️  Serving stale cache after fetch failure');
      return res.status(200).json({
        success: true,
        data: priceCache.data,
        cached: true,
        stale: true,
        isFallback: !!priceCache.data?.[0]?.isFallback,
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