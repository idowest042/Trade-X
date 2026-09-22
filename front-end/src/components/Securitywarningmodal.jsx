import { ShieldAlert } from "lucide-react";

/**
 * TradeX risk disclosure modal.
 * Blocks interaction until the user clicks OK.
 *
 * Props:
 *  - onClose: function called when user dismisses the modal
 */
export default function SecurityWarningModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden animate-[tx-modal-in_0.25s_ease-out]">
        {/* Header */}
        <div className="flex items-center gap-3 bg-blue-50 px-6 py-4 border-b border-blue-100">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Risk Disclosure</h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            <span className="font-semibold text-gray-900">
              Trading involves significant risk.
            </span>{" "}
            The value of your investments can go up as well as down, and you
            may lose some or all of your invested capital. Past performance
            is not a reliable indicator of future results.
          </p>
          <p>
            Only invest funds you can afford to lose, and make sure you fully
            understand the products and risks involved before placing any
            trade.
          </p>
          <p>
            If you are unsure about anything, please reach out to our support
            team at{" "}
            <a
              href="mailto:support@tradex.com"
              className="font-medium text-blue-600 hover:underline"
            >
              support@tradex.com
            </a>{" "}
            before proceeding.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>

      <style>{`
        @keyframes tx-modal-in {
          0% { opacity: 0; transform: translateY(12px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}