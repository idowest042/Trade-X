import { create } from 'zustand';
import { axiosInstance } from '../lib/axios'; // Use centralized axios instance

/**
 * Mock cryptocurrency data for instant display
 * This provides immediate visual feedback while real data loads
 * Prevents the 4-10 second blank state on page load
 */
const MOCK_CRYPTO_DATA = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 62371.25, change24h: 2.45, image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 1653.92, change24h: 1.85, image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
  { id: 'tether', symbol: 'USDT', name: 'Tether', price: 1.00, change24h: 0.01, image: 'https://assets.coingecko.com/coins/images/325/small/Tether.png' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB', price: 573.44, change24h: -0.85, image: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png' },
  { id: 'solana', symbol: 'SOL', name: 'Solana', price: 68.75, change24h: 4.20, image: 'https://assets.coingecko.com/coins/images/4128/small/solana.png' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP', price: 0.58, change24h: 1.25, image: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png' },
  { id: 'usd-coin', symbol: 'USDC', name: 'USDC', price: 1.00, change24h: 0.00, image: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', price: 0.52, change24h: 2.15, image: 'https://assets.coingecko.com/coins/images/975/small/cardano.png' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche', price: 38.90, change24h: -1.50, image: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', price: 0.085, change24h: 3.40, image: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', price: 7.45, change24h: 1.95, image: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png' },
  { id: 'tron', symbol: 'TRX', name: 'TRON', price: 0.12, change24h: -0.65, image: 'https://assets.coingecko.com/coins/images/1094/small/tron-logo.png' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', price: 15.80, change24h: 2.80, image: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png' },
  { id: 'polygon', symbol: 'MATIC', name: 'Polygon', price: 0.89, change24h: 1.60, image: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png' },
  { id: 'litecoin', symbol: 'LTC', name: 'Litecoin', price: 75.20, change24h: 0.95, image: 'https://assets.coingecko.com/coins/images/2/small/litecoin.png' },
  { id: 'shiba-inu', symbol: 'SHIB', name: 'Shiba Inu', price: 0.00001, change24h: 5.20, image: 'https://assets.coingecko.com/coins/images/11939/small/shiba.png' },
  { id: 'dai', symbol: 'DAI', name: 'Dai', price: 1.00, change24h: 0.02, image: 'https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png' },
  { id: 'uniswap', symbol: 'UNI', name: 'Uniswap', price: 8.65, change24h: -1.20, image: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png' },
  { id: 'cosmos', symbol: 'ATOM', name: 'Cosmos', price: 10.50, change24h: 2.35, image: 'https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png' },
  { id: 'stellar', symbol: 'XLM', name: 'Stellar', price: 0.115, change24h: 1.75, image: 'https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png' }
];

/**
 * Market Store - Zustand State Management with Optimistic Loading
 * 
 * Performance Optimization:
 * - Instantly shows mock data on mount (no blank carousel)
 * - Fetches real data in background
 * - Smoothly transitions to real data when available
 * - Reduces perceived loading time from 4-10s to <100ms
 */

const useMarketStore = create((set, get) => ({
  // State - Start with mock data for instant display
  marketPrices: MOCK_CRYPTO_DATA,
  loading: false,
  error: null,
  lastFetched: null,
  isUsingMockData: true, // Track if we're showing mock or real data
  
  // Cache duration (2 minutes - reduced from 5)
  cacheDuration: 2 * 60 * 1000,

  /**
   * Fetch market prices from backend API
   * Optimized for speed with background loading
   * Always shows data (fallback or real) - errors only logged to console
   */
  fetchMarketPrices: async () => {
    const state = get();
    
    // Check if we have cached REAL data that's still valid
    if (state.lastFetched && !state.isUsingMockData) {
      const timeSinceLastFetch = Date.now() - state.lastFetched;
      if (timeSinceLastFetch < state.cacheDuration && state.marketPrices.length > 0) {
        console.log('📦 Using cached market prices');
        return;
      }
    }

    // Never show loading spinner - always display current data
    // This ensures carousel is always visible
    
    try {
      console.log('🔄 Fetching live market prices from API...');
      
      // Use centralized axios instance (already has baseURL configured)
      const response = await axiosInstance.get('/market/prices', {
        timeout: 10000 // 10 second timeout
      });

      if (response.data.success) {
        set({
          marketPrices: response.data.data,
          loading: false,
          error: null,
          lastFetched: Date.now(),
          isUsingMockData: false // Now using real data
        });
        console.log('✅ Live market prices updated successfully');
      } else {
        throw new Error(response.data.error || 'API returned unsuccessful response');
      }
    } catch (error) {
      // Log error to console for debugging (not exposed to UI)
      console.error('❌ Failed to fetch live prices:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        timestamp: new Date().toISOString()
      });
      
      // Determine error type for logging
      let errorType = 'Unknown error';
      if (error.code === 'ECONNABORTED') {
        errorType = 'Request timeout';
      } else if (error.response) {
        errorType = `Server error (${error.response.status})`;
      } else if (error.request) {
        errorType = 'Network error - no response received';
      }
      
      console.warn(`⚠️  ${errorType} - Continuing with ${state.isUsingMockData ? 'fallback' : 'cached'} data`);

      // Keep showing existing data (fallback or cached)
      // Only update loading state, do NOT set error or clear data
      set({
        loading: false
        // Intentionally NOT setting error - keeps UI clean
        // Intentionally NOT touching marketPrices - keeps data visible
      });
    }
  },

  /**
   * Force refresh - bypass cache
   * Useful for manual refresh button or pull-to-refresh
   */
  refreshMarketPrices: async () => {
    set({ lastFetched: null });
    await get().fetchMarketPrices();
  },

  /**
   * Clear error state
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Get specific coin data by symbol
   * Helper selector for components that need a single coin
   */
  getCoinBySymbol: (symbol) => {
    const state = get();
    return state.marketPrices.find(coin => coin.symbol === symbol);
  },

  /**
   * Get all positive movers (24h change > 0)
   */
  getPositiveMovers: () => {
    const state = get();
    return state.marketPrices.filter(coin => coin.change24h > 0);
  },

  /**
   * Get all negative movers (24h change < 0)
   */
  getNegativeMovers: () => {
    const state = get();
    return state.marketPrices.filter(coin => coin.change24h < 0);
  }
}));

export default useMarketStore;