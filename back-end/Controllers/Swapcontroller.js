import User        from "../models/User.js";
import Swap        from "../models/Swap.js";
import Transaction from "../models/Transaction.js";

// ─── Admin-controlled exchange rates (USD-equivalent) ─────────────────────────
// 1 unit of each currency = X USD
export const EXCHANGE_RATES = {
  USD:  1,
  USDT: 1,
  BTC:  67000,
  ETH:  3500,
  SOL:  170,
  BNB:  600,
};

export const SUPPORTED = Object.keys(EXCHANGE_RATES);
const FEE_PCT = 0.02; // 2%

// Helper: get balance for a currency from a user doc
function getBalance(user, currency) {
  if (currency === "USD") return user.balance || 0;
  return user.cryptoBalances?.[currency] || 0;
}

// Helper: update balance for a currency
function buildBalanceUpdate(currency, delta) {
  if (currency === "USD") return { $inc: { balance: delta } };
  return { $inc: { [`cryptoBalances.${currency}`]: delta } };
}

// ─── GET /api/swap/rates ──────────────────────────────────────────────────────
export const getRates = (req, res) => {
  res.json({ rates: EXCHANGE_RATES, fee: FEE_PCT, supported: SUPPORTED });
};

// ─── POST /api/swap ───────────────────────────────────────────────────────────
export const createSwap = async (req, res) => {
  try {
    const { fromCurrency, toCurrency, amount } = req.body;
    const userId = req.user._id;

    // 1. Validate currencies
    if (!SUPPORTED.includes(fromCurrency) || !SUPPORTED.includes(toCurrency)) {
      return res.status(400).json({ message: "Unsupported currency." });
    }
    if (fromCurrency === toCurrency) {
      return res.status(400).json({ message: "Cannot swap the same currency." });
    }

    // 2. Validate amount
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ message: "Enter a valid amount." });
    }

    // 3. Load user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    // 4. Check balance
    const fromBalance = getBalance(user, fromCurrency);
    if (fromBalance < parsedAmount) {
      return res.status(400).json({
        message: `Insufficient ${fromCurrency} balance. You have ${fromBalance.toFixed(6)}.`,
      });
    }

    // 5. Calculate conversion
    const fromUSD    = parsedAmount * EXCHANGE_RATES[fromCurrency];
    const fee        = parseFloat((fromUSD * FEE_PCT).toFixed(6));
    const netUSD     = fromUSD - fee;
    const rate       = EXCHANGE_RATES[toCurrency];
    const converted  = parseFloat((netUSD / rate).toFixed(8));

    // 6. Update balances
    await User.findByIdAndUpdate(userId, buildBalanceUpdate(fromCurrency, -parsedAmount));
    await User.findByIdAndUpdate(userId, buildBalanceUpdate(toCurrency, converted));

    // 7. Save swap record
    const swap = await Swap.create({
      userId,
      fromCurrency,
      toCurrency,
      amount:          parsedAmount,
      fee,
      convertedAmount: converted,
      rate,
    });

    // 8. Log transaction
    await Transaction.create({
      userId,
      type:        "swap",
      amount:      parsedAmount,
      status:      "approved",
      description: `Swapped ${parsedAmount} ${fromCurrency} → ${converted} ${toCurrency} (fee: $${fee.toFixed(2)})`,
      referenceId: swap._id,
    });

    return res.status(201).json({
      message: `Swapped ${parsedAmount} ${fromCurrency} → ${converted} ${toCurrency} successfully.`,
      swap,
      converted,
      fee,
    });
  } catch (err) {
    console.error("createSwap:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// ─── GET /api/swap/my ─────────────────────────────────────────────────────────
export const getMySwaps = async (req, res) => {
  try {
    const swaps = await Swap.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ swaps });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};