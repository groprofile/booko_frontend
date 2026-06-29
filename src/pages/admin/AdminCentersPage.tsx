import { useState, useEffect, useCallback } from "react";
import { Search, CheckCircle, X, MapPin, Building2, Clock, RefreshCw } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { apiGet, apiPost, getAdminToken, ApiError } from "../../lib/api";

interface ApiCenter {
  id: string;
  center_name: string;
  city: string;
  locality?: string;
  address?: string;
  approval_status: string;
  is_active: boolean;
  created_at: string;
  contact_phone?: string;
  vendors?: { business_name?: string; email?: string };
  categories?: { name?: string };
}

const STATUS_OPTS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  rejected: "bg-red-100 text-red-700",
};

function RejectModal({
  center,
  onClose,
  onRejected,
}: {
  center: ApiCenter;
  onClose: () => void;
  onRejected: () => void;
}) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleReject() {
    const token = getAdminToken();
    if (!token) return;
    setSaving(true);
    setError("");
    try {
      await apiPost(`/admin/centers/${center.id}/reject`, { reason: reason.trim() || "Rejected by admin" }, token);
      onRejected();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to reject center");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#E2E8F0] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
          <p className="text-sm font-bold text-[#0F172A]">Reject Center</p>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#0F172A] transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="p-5">
          <p className="text-xs text-[#64748B]">
            Rejecting <span className="font-semibold text-[#0F172A]">{center.center_name}</span>
          </p>
          <div className="mt-3 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#0F172A]">Reason (optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this center is being rejected…"
              rows={3}
              className="bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#DC2626] focus:ring-2 focus:ring-red-200 rounded-xl px-4 py-2.5 text-sm outline-none text-[#0F172A] placeholder:text-[#94A3B8] resize-none"
            />
          </div>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          <div className="mt-4 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#E2E8F0] py-2.5 text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={saving}
              className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {saving ? "Rejecting…" : "Reject Center"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminCentersPage() {
  const [centers, setCenters] = useState<ApiCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<ApiCenter | null>(null);

  const load = useCallback(() => {
    const token = getAdminToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    apiGet<ApiCenter[]>(`/admin/centers${statusFilter !== "all" ? `?status=${statusFilter}` : ""}`, token)
      .then(setCenters)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load centers"))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleApprove(center: ApiCenter) {
    const token = getAdminToken();
    if (!token) return;
    setApprovingId(center.id);
    try {
      await apiPost(`/admin/centers/${center.id}/approve`, {}, token);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to approve center");
    } finally {
      setApprovingId(null);
    }
  }

  const filtered = centers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.center_name.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      (c.vendors?.business_name ?? "").toLowerCase().includes(q) ||
      (c.locality ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout title="Center Management" subtitle="Approve and manage workspace centers">
      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search center name, vendor, city…"
            className="h-9 w-full rounded-xl border border-[#E2E8F0] bg-white pl-9 pr-4 text-sm outline-none focus:border-[#2563EB]"
          />
        </div>
        <div className="flex gap-1.5">
          {STATUS_OPTS.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === s.value
                  ? "bg-[#0F172A] text-white"
                  : "border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#0F172A]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs text-[#64748B] hover:border-[#0F172A] transition-colors"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* Summary bar */}
      {!loading && (
        <div className="mb-4 flex gap-3">
          {[
            { label: "Total Shown", count: filtered.length, color: "text-[#0F172A]" },
            { label: "Pending", count: centers.filter((c) => c.approval_status === "pending").length, color: "text-amber-600" },
            { label: "Approved", count: centers.filter((c) => c.approval_status === "approved").length, color: "text-emerald-600" },
            { label: "Rejected", count: centers.filter((c) => c.approval_status === "rejected").length, color: "text-red-600" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-center shadow-sm">
              <p className={`text-lg font-extrabold ${s.color}`}>{s.count}</p>
              <p className="text-[10px] text-[#94A3B8]">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Center cards */}
      {loading ? (
        <div className="py-16 text-center text-sm text-[#94A3B8]">Loading centers…</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Building2 size={32} className="mx-auto text-[#E2E8F0]" />
          <p className="mt-3 text-sm text-[#94A3B8]">No centers found for this filter.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div key={c.id} className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#0F172A] truncate">{c.center_name}</p>
                  <p className="mt-0.5 text-xs text-[#64748B] truncate">
                    {c.vendors?.business_name ?? "Unknown vendor"}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                    STATUS_STYLES[c.approval_status] ?? "bg-slate-100 text-slate-500"
                  }`}
                >
                  {c.approval_status.charAt(0).toUpperCase() + c.approval_status.slice(1)}
                </span>
              </div>

              {/* Location */}
              <div className="mt-3 flex items-center gap-1.5 text-xs text-[#64748B]">
                <MapPin size={11} />
                {c.locality ? `${c.locality}, ` : ""}{c.city}
              </div>

              {/* Category */}
              {c.categories?.name && (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#94A3B8]">
                  <Building2 size={10} />
                  {c.categories.name}
                </div>
              )}

              {/* Created at */}
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#94A3B8]">
                <Clock size={10} />
                {new Date(c.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>

              {/* Actions */}
              {c.approval_status === "pending" && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleApprove(c)}
                    disabled={approvingId === c.id}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#2563EB] py-2 text-xs font-bold text-white hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle size={12} />
                    {approvingId === c.id ? "Approving…" : "Approve"}
                  </button>
                  <button
                    onClick={() => setRejectTarget(c)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] py-2 text-xs font-bold text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
                  >
                    <X size={12} /> Reject
                  </button>
                </div>
              )}

              {c.approval_status === "approved" && (
                <div className="mt-4 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] px-3 py-2 text-xs text-emerald-700 text-center font-semibold">
                  ✓ Live
                </div>
              )}

              {c.approval_status === "rejected" && (
                <div className="mt-4 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] px-3 py-2 text-xs text-red-600 text-center font-semibold">
                  Rejected
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {rejectTarget && (
        <RejectModal
          center={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onRejected={() => {
            setRejectTarget(null);
            load();
          }}
        />
      )}
    </AdminLayout>
  );
}
