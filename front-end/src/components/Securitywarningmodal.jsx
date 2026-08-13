import { ShieldAlert } from "lucide-react";

/**
 * TradeX security/scam warning modal.
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
          <h2 className="text-lg font-bold text-gray-900">Security Notice</h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            <span className="font-semibold text-gray-900">
              NEVER make payments
            </span>{" "}
            to any external wallet addresses or account details provided by
            anyone outside your financial adviser. Our staff will{" "}
            <span className="font-semibold text-gray-900">NEVER</span> ask
            you to send money to any wallet address, Western Union, or bank
            account different from those provided only within our website.
          </p>
          <p>
            Before making any transaction, please always contact your
            financial adviser for guidance.
          </p>
          <p>
            Always be vigilant and always inquire from our official support
            email{" "}
            <a
              href="mailto:support@tradex.com"
              className="font-medium text-blue-600 hover:underline"
            >
              support@tradex.com
            </a>{" "}
            to confirm any of such claims.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
          >
            OK
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