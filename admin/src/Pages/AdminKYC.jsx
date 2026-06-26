import { useEffect, useState } from "react";
import { Eye, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, StatusBadge, Table, ActionBtn, fmt } from "../Components/AdminUI";
import api from "../lib/api";

const DOC_LABELS = { national_id: "National ID", passport: "Passport", drivers_license: "Driver's License" };

function KycModal({ sub, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [reason,  setReason]  = useState("");

  const handle = async (action) => {
    setLoading(true);
    const tid = toast.loading(`${action === "approve" ? "Approving" : "Rejecting"}…`);
    try {
      const url = `/api/admin/kyc/${sub._id}/${action}`;
      await api.put(url, action === "reject" ? { reason } : {});
      toast.success(`KYC ${action}d`, { id: tid });
      onUpdate(sub._id, action === "approve" ? "approved" : "rejected");
      onClose();
    } catch (err) {
      toast.error("Action failed", { id: tid, description: err.response?.data?.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="font-bold text-slate-800">KYC Review — {sub.firstName} {sub.lastName}</p>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["Full Name",    `${sub.firstName} ${sub.lastName}`],
              ["Date of Birth", sub.dob],
              ["Nationality",  sub.nationality],
              ["Document",     DOC_LABELS[sub.documentType] || sub.documentType],
              ["Address",      sub.addressLine],
              ["City/State",   `${sub.city}, ${sub.state}`],
              ["Country",      sub.country],
              ["Social Link",  sub.socialLink || "—"],
              ["Submitted",    fmt(sub.createdAt)],
              ["Status",       sub.status],
            ].map(([k, v]) => (
              <div key={k} className="bg-slate-50 rounded-lg px-3 py-2">
                <p className="text-xs text-slate-400 font-semibold uppercase">{k}</p>
                <p className="text-sm font-medium text-slate-800 mt-0.5 break-all">{v}</p>
              </div>
            ))}
          </div>

          {/* Document images */}
          {[["Front", sub.frontImage], ["Back", sub.backImage]].map(([label, path]) => (
  <div key={label}>
    <p className="text-xs font-semibold text-slate-500 mb-1 uppercase">{label}</p>
    <a href={path}
      target="_blank" rel="noreferrer"
      className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
      <ExternalLink size={12} />
      View document
    </a>
  </div>
))}

          {/* Rejection reason */}
          {sub.status === "pending" && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">
                Rejection reason (if rejecting)
              </label>
              <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2}
                placeholder="Optional reason for rejection…"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-slate-50" />
            </div>
          )}
        </div>

        {sub.status === "pending" && (
          <div className="px-6 py-4 border-t border-slate-100 flex gap-2 justify-end">
            <ActionBtn label="Reject"  color="red"   onClick={() => handle("reject")}  disabled={loading} />
            <ActionBtn label="Approve" color="green" onClick={() => handle("approve")} disabled={loading} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminKYC() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState("pending");
  const [selected, setSelected]       = useState(null);

  useEffect(() => {
    api.get("/api/admin/kyc")
      .then(({ data }) => setSubmissions(data.submissions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = (id, newStatus) => {
    setSubmissions(prev => prev.map(s => s._id === id ? { ...s, status: newStatus } : s));
  };

  const filtered = submissions.filter(s => filter === "all" ? true : s.status === filter);
  const counts   = { all: submissions.length, pending: submissions.filter(s => s.status === "pending").length, approved: submissions.filter(s => s.status === "approved").length, rejected: submissions.filter(s => s.status === "rejected").length };

  return (
    <div className="space-y-5">
      <PageHeader title="KYC Management" subtitle="Review and approve identity verification submissions." />

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {["all", "pending", "approved", "rejected"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all
              ${filter === f ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      <Table
        headers={["User", "Document", "Nationality", "Submitted", "Status", "Action"]}
        loading={loading}
        emptyMsg="No KYC submissions found.">
        {filtered.map(s => (
          <tr key={s._id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
            <td className="px-4 py-3.5">
              <p className="font-semibold text-slate-800 text-sm">{s.firstName} {s.lastName}</p>
              <p className="text-xs text-slate-400">{s.userId?.email || "—"}</p>
            </td>
            <td className="px-4 py-3.5 text-sm text-slate-600">{DOC_LABELS[s.documentType] || s.documentType}</td>
            <td className="px-4 py-3.5 text-sm text-slate-600">{s.nationality}</td>
            <td className="px-4 py-3.5 text-xs text-slate-400">{fmt(s.createdAt)}</td>
            <td className="px-4 py-3.5"><StatusBadge status={s.status} /></td>
            <td className="px-4 py-3.5">
              <ActionBtn label="Review" color="blue" onClick={() => setSelected(s)} />
            </td>
          </tr>
        ))}
      </Table>

      {selected && <KycModal sub={selected} onClose={() => setSelected(null)} onUpdate={handleUpdate} />}
    </div>
  );
}