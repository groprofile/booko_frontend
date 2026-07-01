import { useState, useEffect } from "react";
import { RotateCcw, CheckCircle, XCircle, Clock, AlertCircle, Loader2, X } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { apiGet, apiPost, getAdminToken } from "../../lib/api";

interface Refund {
  id: string;
  booking_id: string;
  user_name?: string;
  user_email?: string;
  center_name?: string;
  amount_paise: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  requested_at: string;
  resolved_at?: string;
  admin_note?: string;
}

const fmt = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

type Filter = "all" | "pending" | "approved" | "rejected";

interface ActionModalProps {
  refundId: string;
  action: "approve" | "reject";
  amount: number;
  onClose: () => void;
  onDone: () => void;
}

function ActionModal({ refundId, action, amount, onClose, onDone }: ActionModalProps) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handle() {
    setLoading(true);
    setError("");
    try {
      const token = getAdminToken() ?? undefined;
      await apiPost(`/admin/refunds/${refundId}/${action}`, { adminNote: note.trim() || undefined }, token);
      onDone();
    } catch (err) {
      setError((err as Error).message ?? "Action failed");
    } finally {
      setLoading(false);
    }
  }

  const isApprove = action === "approve";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#E2E8F0] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
          <div className="flex items-center gap-2.5">
            {isApprove
              ? <CheckCircle size={15} className="text-emerald-500" />
              : <XCircle size={15} className="text-red-500" />}
            <h3 className="text-sm font-bold text-[#0F172A]">
              {isApprove ? "Approve Refund" : "Reject Refund"}
            </h3>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#0F172A]"><X size={15} /></button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-[#64748B]">
            {isApprove
              ? `This will initiate a refund of ${fmt(amount)} to the customer's payment source.`
              : `This will reject the refund request for ${fmt(amount)}.`}
          </p>
          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#0F172A]">Admin Note (optional)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
              placeholder="Reason or internal notes…"
              className="bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] rounded-xl px-4 py-2.5 text-sm outline-none resize-none w-full placeholder:text-[#94A3B8]" />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 rounded-xl border border-[#E2E8F0] py-2.5 text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
              Cancel
            </button>
            <button onClick={handle} disabled={loading}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50 ${
                isApprove ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-500 hover:bg-red-600"
              }`}>
              {loading ? <Loader2 size={13} className="animate-spin" /> : null}
              {loading ? "Processing…" : isApprove ? "Approve" : "Reject"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [modal, setModal] = useState<{ refundId: string; action: "approve" | "reject"; amount: number } | null>(null);

  function load() {
    const token = getAdminToken() ?? undefined;
    apiGet<{ refunds: Refund[] } | Refund[]>("/admin/refunds", token)
      .then((data) => {
        if (Array.isArray(data)) setRefunds(data);
        else setRefunds((data as { refunds: Refund[] }).refunds ?? []);
      })
      .catch((err) => setError((err as Error).message ?? "Failed to load refunds"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? refunds : refunds.filter((r) => r.status === filter);
  const pending = refunds.filter((r) => r.status === "pending");
  const totalPending = pending.reduce((a, r) => a + r.amount_paise, 0);

  return (
    <AdminLayout title="Refund Requests" subtitle="Review and process customer refund requests">
      {/* Summary */}
      <div className="mb-5 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Requests", value: refunds.length.toString(), icon: RotateCcw, color: "#2563EB", bg: "#EFF6FF" },
          { label: "Pending", value: pending.length.toString(), icon: Clock, color: "#D97706", bg: "#FEF3C7" },
          { label: "Pending Amount", value: fmt(totalPending), icon: AlertCircle, color: "#DC2626", bg: "#FEE2E2" },
          { label: "Approved", value: refunds.filter((r) => r.status === "approved").length.toString(), icon: CheckCircle, color: "#16A34A", bg: "#DCFCE7" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#64748B]">{m.label}</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: m.bg }}>
                <m.icon size={15} style={{ color: m.color }} />
              </div>
            </div>
            <p className="mt-2 text-xl font-extrabold" style={{ color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "pending", "approved", "rejected"] as Filter[]).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              filter === s ? "bg-[#2563EB] text-white" : "border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#2563EB]"
            }`}>
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            {s !== "all" && ` (${refunds.filter((r) => r.status === s).length})`}
          </button>
        ))}
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      {loading ? (
        <div className="py-16 text-center text-sm text-[#94A3B8]">Loading refunds…</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                  {["Booking ID", "Customer", "Center", "Amount", "Reason", "Requested", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#64748B]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="py-16 text-center text-sm text-[#94A3B8]">No refunds found</td></tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-[#2563EB]">{r.booking_id.slice(0, 8)}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#0F172A]">{r.user_name ?? "—"}</p>
                        <p className="text-xs text-[#94A3B8]">{r.user_email ?? ""}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#64748B]">{r.center_name ?? "—"}</td>
                      <td className="px-4 py-3 font-bold text-[#0F172A]">{fmt(r.amount_paise)}</td>
                      <td className="px-4 py-3 max-w-[180px]">
                        <p className="truncate text-xs text-[#64748B]">{r.reason}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#64748B]">{r.requested_at.slice(0, 10)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[r.status]}`}>
                          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {r.status === "pending" ? (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => setModal({ refundId: r.id, action: "approve", amount: r.amount_paise })}
                              className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors">
                              <CheckCircle size={11} /> Approve
                            </button>
                            <button
                              onClick={() => setModal({ refundId: r.id, action: "reject", amount: r.amount_paise })}
                              className="flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors">
                              <XCircle size={11} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-[#94A3B8]">{r.resolved_at?.slice(0, 10) ?? "—"}</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <ActionModal
          refundId={modal.refundId}
          action={modal.action}
          amount={modal.amount}
          onClose={() => setModal(null)}
          onDone={() => { setModal(null); load(); }}
        />
      )}
    </AdminLayout>
  );
}
