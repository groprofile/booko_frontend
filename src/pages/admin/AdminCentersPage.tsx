import { useState, useEffect, useCallback } from "react";
import { Search, CheckCircle, X, MapPin, Building2, Clock, RefreshCw, Plus, Percent, Pencil, Check } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { showToast } from "../../components/admin/Toast";
import { apiGet, apiPost, apiPatch, getAdminToken, ApiError } from "../../lib/api";

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
  commission_percent?: string | number | null;
  vendors?: { business_name?: string; email?: string };
  categories?: { name?: string; commission_percent?: string | number | null };
}

// Resolves the effective commission for a centre and where it comes from —
// center override → category override → platform default.
function resolveCommission(center: ApiCenter, globalRate: number | null): { value: number | null; source: string } {
  if (center.commission_percent != null) return { value: Number(center.commission_percent), source: "override" };
  if (center.categories?.commission_percent != null) return { value: Number(center.categories.commission_percent), source: "category" };
  if (globalRate != null) return { value: globalRate, source: "platform default" };
  return { value: null, source: "platform default" };
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

interface VendorOption {
  id: string;
  business_name: string;
  owner_name: string;
  city?: string;
}

function AddCenterModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    vendorId: "", centerName: "", address: "", city: "", state: "",
    locality: "", pincode: "", contactName: "", contactPhone: "",
    openingTime: "", closingTime: "", description: "", googleMapUrl: "",
  });

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    apiGet<{ vendors: VendorOption[] }>("/admin/vendors?status=approved&limit=200", token)
      .then((r) => setVendors(r.vendors ?? []))
      .catch(() => setVendors([]))
      .finally(() => setLoadingVendors(false));
  }, []);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.vendorId) { setError("Please select a vendor"); return; }
    if (!form.centerName.trim()) { setError("Center name is required"); return; }
    if (!form.address.trim()) { setError("Address is required"); return; }
    if (!form.city.trim()) { setError("City is required"); return; }
    if (!form.state.trim()) { setError("State is required"); return; }

    const token = getAdminToken();
    if (!token) return;
    setSaving(true);
    setError("");
    try {
      await apiPost("/admin/centers", {
        vendorId: form.vendorId,
        centerName: form.centerName.trim(),
        description: form.description.trim() || undefined,
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        locality: form.locality.trim() || undefined,
        pincode: form.pincode.trim() || undefined,
        contactName: form.contactName.trim() || undefined,
        contactPhone: form.contactPhone.trim() || undefined,
        openingTime: form.openingTime || undefined,
        closingTime: form.closingTime || undefined,
        googleMapUrl: form.googleMapUrl.trim() || undefined,
      }, token);
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create center");
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15";
  const lbl = "mb-1 block text-xs font-semibold text-[#0F172A]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[#E2E8F0] bg-white shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4 shrink-0">
          <p className="text-sm font-bold text-[#0F172A]">Add Center for Vendor</p>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#0F172A] transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 flex flex-col gap-4">
          {/* Vendor */}
          <div>
            <label className={lbl}>Vendor <span className="text-red-500">*</span></label>
            {loadingVendors ? (
              <p className="text-xs text-[#94A3B8]">Loading vendors…</p>
            ) : (
              <select value={form.vendorId} onChange={(e) => set("vendorId", e.target.value)} className={inp}>
                <option value="">Select approved vendor…</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.business_name} — {v.owner_name}{v.city ? ` (${v.city})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Center name */}
          <div>
            <label className={lbl}>Center Name <span className="text-red-500">*</span></label>
            <input className={inp} placeholder="e.g. Bokko Andheri East" value={form.centerName} onChange={(e) => set("centerName", e.target.value)} />
          </div>

          {/* Address */}
          <div>
            <label className={lbl}>Address <span className="text-red-500">*</span></label>
            <input className={inp} placeholder="Street / Building / Floor" value={form.address} onChange={(e) => set("address", e.target.value)} />
          </div>

          {/* City / State / Locality / Pincode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>City <span className="text-red-500">*</span></label>
              <input className={inp} placeholder="Mumbai" value={form.city} onChange={(e) => set("city", e.target.value)} />
            </div>
            <div>
              <label className={lbl}>State <span className="text-red-500">*</span></label>
              <input className={inp} placeholder="Maharashtra" value={form.state} onChange={(e) => set("state", e.target.value)} />
            </div>
            <div>
              <label className={lbl}>Locality</label>
              <input className={inp} placeholder="Andheri East" value={form.locality} onChange={(e) => set("locality", e.target.value)} />
            </div>
            <div>
              <label className={lbl}>Pincode</label>
              <input className={inp} placeholder="400069" value={form.pincode} onChange={(e) => set("pincode", e.target.value)} />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Contact Name</label>
              <input className={inp} placeholder="Manager name" value={form.contactName} onChange={(e) => set("contactName", e.target.value)} />
            </div>
            <div>
              <label className={lbl}>Contact Phone</label>
              <input className={inp} placeholder="9XXXXXXXXX" value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} />
            </div>
          </div>

          {/* Timings */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Opening Time</label>
              <input type="time" className={inp} value={form.openingTime} onChange={(e) => set("openingTime", e.target.value)} />
            </div>
            <div>
              <label className={lbl}>Closing Time</label>
              <input type="time" className={inp} value={form.closingTime} onChange={(e) => set("closingTime", e.target.value)} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={lbl}>Description</label>
            <textarea className={`${inp} resize-none`} rows={2} placeholder="Optional center description" value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>

          {/* Google Map URL */}
          <div>
            <label className={lbl}>Google Maps URL</label>
            <input className={inp} placeholder="https://maps.google.com/…" value={form.googleMapUrl} onChange={(e) => set("googleMapUrl", e.target.value)} />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-[#E2E8F0] px-5 py-4 shrink-0">
          <button onClick={onClose} className="flex-1 rounded-xl border border-[#E2E8F0] py-2.5 text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 rounded-xl bg-[#2563EB] py-2.5 text-sm font-bold text-white hover:bg-[#1D4ED8] disabled:opacity-50 transition-colors">
            {saving ? "Creating…" : "Create Center"}
          </button>
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [globalRate, setGlobalRate] = useState<number | null>(null);
  const [editingCommissionId, setEditingCommissionId] = useState<string | null>(null);
  const [commissionEditValue, setCommissionEditValue] = useState("");
  const [savingCommissionId, setSavingCommissionId] = useState<string | null>(null);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    apiGet<{ rate_percent: string }>("/admin/commission-config", token)
      .then((r) => setGlobalRate(Number(r.rate_percent)))
      .catch(console.error);
  }, []);

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

  function startEditCommission(center: ApiCenter) {
    setEditingCommissionId(center.id);
    setCommissionEditValue(center.commission_percent != null ? String(center.commission_percent) : "");
  }

  async function handleSaveCommission(centerId: string) {
    const token = getAdminToken();
    if (!token) return;
    const trimmed = commissionEditValue.trim();
    const commissionPercent = trimmed === "" ? null : Number(trimmed);
    if (commissionPercent !== null && (isNaN(commissionPercent) || commissionPercent < 0 || commissionPercent > 100)) {
      showToast("Enter a value between 0 and 100, or leave blank to clear", "error");
      return;
    }
    setSavingCommissionId(centerId);
    try {
      await apiPatch(`/admin/centers/${centerId}/commission`, { commissionPercent }, token);
      showToast("Commission rate updated", "success");
      setCenters((prev) => prev.map((c) => c.id === centerId ? { ...c, commission_percent: commissionPercent } : c));
      setEditingCommissionId(null);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to update commission", "error");
    } finally {
      setSavingCommissionId(null);
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
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
        >
          <Plus size={13} /> Add Center
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

              {/* Commission */}
              <div className="mt-2 flex items-center justify-between rounded-lg bg-[#F8FAFC] px-2.5 py-1.5">
                {editingCommissionId === c.id ? (
                  <div className="flex flex-1 items-center gap-1.5">
                    <input
                      type="number" min="0" max="100" autoFocus
                      placeholder="Platform default"
                      value={commissionEditValue}
                      onChange={(e) => setCommissionEditValue(e.target.value)}
                      className="h-7 w-full rounded-md border border-[#E2E8F0] px-2 text-xs outline-none focus:border-[#2563EB]"
                    />
                    <button onClick={() => handleSaveCommission(c.id)} disabled={savingCommissionId === c.id}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md hover:bg-[#DCFCE7] text-[#16A34A] disabled:opacity-50" title="Save">
                      <Check size={12} />
                    </button>
                    <button onClick={() => setEditingCommissionId(null)} disabled={savingCommissionId === c.id}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md hover:bg-[#F1F5F9] text-[#64748B] disabled:opacity-50" title="Cancel">
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="flex items-center gap-1.5 text-xs text-[#64748B]">
                      <Percent size={10} />
                      {(() => {
                        const { value, source } = resolveCommission(c, globalRate);
                        return value != null ? `${value}% (${source})` : "Platform default";
                      })()}
                    </span>
                    <button onClick={() => startEditCommission(c)}
                      className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-[#EFF6FF] text-[#2563EB]" title="Edit commission">
                      <Pencil size={11} />
                    </button>
                  </>
                )}
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

      {showAddModal && (
        <AddCenterModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false);
            load();
          }}
        />
      )}
    </AdminLayout>
  );
}
