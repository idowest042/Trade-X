// ─── Reusable admin UI primitives ────────────────────────────────────────────

export function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-bold text-slate-900">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

export function StatCard({ label, value, color = "blue" }) {
  const colors = {
    blue:   "bg-blue-50 border-blue-100 text-blue-700",
    green:  "bg-green-50 border-green-100 text-green-700",
    amber:  "bg-amber-50 border-amber-100 text-amber-700",
    red:    "bg-red-50 border-red-100 text-red-700",
    slate:  "bg-slate-50 border-slate-200 text-slate-700",
    purple: "bg-purple-50 border-purple-100 text-purple-700",
  };
  return (
    <div className={`rounded-xl border px-5 py-4 ${colors[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    pending:   "bg-amber-100 text-amber-700",
    approved:  "bg-green-100 text-green-700",
    rejected:  "bg-red-100 text-red-600",
    active:    "bg-blue-100 text-blue-700",
    completed: "bg-slate-100 text-slate-600",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${map[status] || "bg-slate-100 text-slate-500"}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}

export function Table({ headers, children, loading, emptyMsg = "No records found." }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {headers.map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={headers.length} className="px-4 py-8 text-center text-sm text-slate-400">
                  Loading…
                </td>
              </tr>
            ) : !children || (Array.isArray(children) && children.length === 0) ? (
              <tr>
                <td colSpan={headers.length} className="px-4 py-8 text-center text-sm text-slate-400">
                  {emptyMsg}
                </td>
              </tr>
            ) : children}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ActionBtn({ onClick, label, color = "blue", disabled = false }) {
  const colors = {
    blue:  "bg-blue-600 hover:bg-blue-700 text-white",
    green: "bg-green-600 hover:bg-green-700 text-white",
    red:   "bg-red-500 hover:bg-red-600 text-white",
    slate: "bg-slate-100 hover:bg-slate-200 text-slate-700",
  };
  return (
    <button onClick={onClick} disabled={disabled}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${colors[color]}`}>
      {label}
    </button>
  );
}

export function fmt(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}