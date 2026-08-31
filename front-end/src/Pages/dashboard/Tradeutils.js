// Shared constants + formatters used across the Trade Hub.
// Nothing here talks to the network — pure data + pure functions.

// The ONLY assets your backend's Trade schema accepts (enum-enforced
// server-side in Models/Trade.js). Everything else from /api/market/prices
// is browsable but not tradeable on this platform yet.
export const TRADEABLE_SYMBOLS = ["BTC", "ETH", "SOL", "BNB"];

// Maps a CoinGecko coin id (from /api/market/prices) to the symbol your
// Trade schema expects, for the 4 coins that are both listed AND tradeable.
export const TRADEABLE_ID_BY_SYMBOL = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
};

export const isTradeable = (symbol) => TRADEABLE_SYMBOLS.includes(symbol);

// Dynamic precision — a $67,000 BTC and a $0.0000047 SHIB both need to look
// right. Mirrors how real exchanges scale decimal places to price magnitude.
export function formatPrice(price) {
  if (price == null || Number.isNaN(price)) return "—";
  const n = Number(price);
  if (n === 0) return "0";
  if (n >= 1) return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n >= 0.01) return n.toFixed(4);
  if (n >= 0.0001) return n.toFixed(6);
  return n.toFixed(8);
}

// Compact large numbers for volume / market cap columns: 1.2B, 456.7M, 12.3K
export function formatCompact(num) {
  if (num == null || Number.isNaN(num)) return "—";
  const n = Number(num);
  const abs = Math.abs(n);
  if (abs >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (abs >= 1e9)  return (n / 1e9).toFixed(2) + "B";
  if (abs >= 1e6)  return (n / 1e6).toFixed(2) + "M";
  if (abs >= 1e3)  return (n / 1e3).toFixed(2) + "K";
  return n.toFixed(2);
}

export function formatUsd(num) {
  if (num == null || Number.isNaN(num)) return "—";
  return Number(num).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

// Client-side "favorites" — genuinely persisted, just not on the backend.
// No backend model exists for this yet (confirmed), so this is local to
// the browser/device rather than fabricated as if it were server data.
const FAVORITES_KEY = "tradex_favorite_coins";

export function getFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(symbol) {
  const current = getFavorites();
  const next = current.includes(symbol)
    ? current.filter((s) => s !== symbol)
    : [...current, symbol];
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable (private mode, etc.) — fail silently
  }
  return next;
}