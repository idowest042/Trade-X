import { useId } from "react";

/**
 * TradeX logomark.
 * An abstract "X" built from two crossing trend strokes, with a rising
 * accent dot standing in for a live data point. No wordmark — mark only.
 *
 * Usage:
 *   <Logo className="h-9 w-9" />          // icon only
 *   <Logo className="h-10 w-10" title />  // with sr-only title for a11y
 */
export default function Logo({ className = "h-9 w-9", title = true }) {
  const gradId = useId();

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={title ? "TradeX" : undefined}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={`tx-grad-${gradId}`} x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id={`tx-accent-${gradId}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#2dd4bf" />
        </linearGradient>
      </defs>

      {/* Rounded square backdrop */}
      <rect
        x="1.5"
        y="1.5"
        width="37"
        height="37"
        rx="10"
        fill={`url(#tx-grad-${gradId})`}
      />

      {/* Falling stroke of the X (upper-left to lower-right) — steady, muted */}
      <path
        d="M11 11 L29 29"
        stroke="white"
        strokeOpacity="0.55"
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* Rising stroke of the X (lower-left to upper-right) — the "trend line" */}
      <path
        d="M11 29 L29 11"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* Accent dot marking the high point of the rising stroke */}
      <circle
        cx="29"
        cy="11"
        r="3.4"
        fill={`url(#tx-accent-${gradId})`}
        stroke="white"
        strokeWidth="1.4"
      />
    </svg>
  );
}