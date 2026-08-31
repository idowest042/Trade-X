import { useState, useEffect, useRef } from "react";
import api from "../../lib/api";

// Polls GET /api/market/prices. The backend itself caches against CoinGecko
// for 5 minutes (15 on rate limit), so polling every 60s here just checks
// for a fresher cache — it does not hammer CoinGecko harder than your
// backend already guards against.
const POLL_MS = 60000;

export default function useMarketData() {
  const [coins, setCoins]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [isFallback, setIsFallback] = useState(false);
  const [isStale, setIsStale]     = useState(false);
  const timerRef = useRef(null);

  const fetchPrices = async () => {
    try {
      const { data } = await api.get("/api/market/prices");
      if (data.success) {
        setCoins(data.data || []);
        setIsFallback(!!data.isFallback);
        setIsStale(!!data.stale);
        setError(null);
      } else {
        setError(data.error || "Failed to load market data.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load market data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    timerRef.current = setInterval(fetchPrices, POLL_MS);
    return () => clearInterval(timerRef.current);
  }, []);

  return { coins, loading, error, isFallback, isStale, refetch: fetchPrices };
}