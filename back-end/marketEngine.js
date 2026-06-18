// ─── Market Simulation Engine ─────────────────────────────────────────────────

const BASE_PRICES = {
  BTC: 67000,
  ETH:  3500,
  SOL:   170,
  BNB:   600,
};

const VOLATILITY = {
  BTC: 0.0018,
  ETH: 0.0025,
  SOL: 0.0045,
  BNB: 0.0030,
};

const state = {};
for (const [asset, price] of Object.entries(BASE_PRICES)) {
  state[asset] = { open: price, high: price, low: price, close: price };
}

export function getCurrentPrice(asset) {
  return state[asset]?.close ?? BASE_PRICES[asset] ?? 0;
}

export function getCurrentPrices() {
  return Object.fromEntries(Object.entries(state).map(([a, s]) => [a, s.close]));
}

function nextCandle(asset) {
  const s   = state[asset];
  const vol = VOLATILITY[asset];
  const chg = s.close * vol * (Math.random() * 2 - 1);
  const close = parseFloat(Math.max(0.01, s.close + chg).toFixed(2));

  const wick = Math.random() * vol * 0.6;
  const high = parseFloat((Math.max(s.close, close) * (1 + wick)).toFixed(2));
  const low  = parseFloat((Math.min(s.close, close) * (1 - wick)).toFixed(2));

  const candle = { time: Math.floor(Date.now() / 1000), open: s.close, high, low, close };
  state[asset] = { open: candle.open, high, low, close };
  return candle;
}

let _timer = null;

export function startMarketEngine(io) {
  if (_timer) return;
  _timer = setInterval(() => {
    for (const asset of Object.keys(BASE_PRICES)) {
      const candle = nextCandle(asset);
      io.emit("market:update", { asset, candle });
    }
  }, 2000);
  console.log("📈 Market engine running — 2s ticks");
}

export function stopMarketEngine() {
  if (_timer) { clearInterval(_timer); _timer = null; }
}