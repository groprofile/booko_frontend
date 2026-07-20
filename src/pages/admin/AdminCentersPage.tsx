import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, CheckCircle, X, MapPin, Building2, Clock, RefreshCw, Plus, Sparkles } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
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
  is_featured?: boolean;
  featured_rank?: number | null;
  vendors?: { business_name?: string; email?: string };
  categories?: { name?: string; commission_percent?: string | number | null };
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
  status?: string;
}

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

// Products an admin can attach while creating a center, keyed by category slug —
// mirrors the backend CATEGORY_PRODUCT_TYPES map. Without at least one product a
// center has no plans and is untappable on the customer side, so the modal
// requires one. `unit` matches the price-display unit ("/day", "/hour", …).
interface ProductChoice {
  productType: string;
  label: string;
  unit: string;
  defaultName: string;
  pricePrefix: string;
}

const PRODUCT_CATALOG: Record<string, ProductChoice[]> = {
  coworking: [
    { productType: "coworking_day_pass", label: "Day Pass", unit: "day", defaultName: "Day Pass", pricePrefix: "₹ / day" },
    { productType: "coworking_monthly_pass", label: "Monthly Pass", unit: "month", defaultName: "Monthly Pass", pricePrefix: "₹ / month" },
    { productType: "coworking_meeting_room", label: "Meeting Room", unit: "hour", defaultName: "Meeting Room", pricePrefix: "₹ / hour" },
  ],
  hotel: [{ productType: "hotel_room", label: "Hotel Room", unit: "night", defaultName: "Standard Room", pricePrefix: "₹ / night" }],
  work_stay: [{ productType: "hotel_room", label: "Room", unit: "night", defaultName: "Standard Room", pricePrefix: "₹ / night" }],
  gym: [{ productType: "gym_slot", label: "Gym Session", unit: "slot", defaultName: "Gym Session", pricePrefix: "₹ / session" }],
  turf: [{ productType: "turf_slot", label: "Turf Slot", unit: "slot", defaultName: "Turf Slot", pricePrefix: "₹ / slot" }],
};

function catalogForSlug(slug: string | undefined): ProductChoice[] {
  if (slug && PRODUCT_CATALOG[slug]) return PRODUCT_CATALOG[slug];
  return PRODUCT_CATALOG.coworking;
}

interface ProductState {
  enabled: boolean;
  name: string;
  price: string;
}

function AddCenterModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    vendorId: "", categoryId: "", centerName: "", address: "", city: "", state: "",
    locality: "", pincode: "", contactName: "", contactPhone: "",
    openingTime: "", closingTime: "", description: "", googleMapUrl: "",
  });
  const [products, setProducts] = useState<Record<string, ProductState>>({});

  const selectedCategory = categories.find((c) => c.id === form.categoryId);
  const productChoices = catalogForSlug(selectedCategory?.slug);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    // No status filter here — admin-created vendors that haven't finished
    // onboarding (status "pending") still need to be assignable to a center
    // right away. Only rejected/blocked vendors are excluded.
    apiGet<{ vendors: VendorOption[] }>("/admin/vendors?limit=200", token)
      .then((r) => setVendors((r.vendors ?? []).filter((v) => v.status !== "rejected" && v.status !== "blocked")))
      .catch(() => setVendors([]))
      .finally(() => setLoadingVendors(false));
    apiGet<CategoryOption[]>("/admin/categories", token)
      .then((r) => setCategories(r ?? []))
      .catch(() => setCategories([]));
  }, []);

  // Reset the product rows whenever the category changes — the valid products
  // depend on it, and a stale selection would send an invalid product type.
  useEffect(() => {
    const initial: Record<string, ProductState> = {};
    for (const pc of catalogForSlug(selectedCategory?.slug)) {
      initial[pc.productType] = { enabled: false, name: pc.defaultName, price: "" };
    }
    setProducts(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.categoryId]);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function setProduct(productType: string, patch: Partial<ProductState>) {
    setProducts((prev) => ({ ...prev, [productType]: { ...prev[productType], ...patch } }));
  }

  async function handleSubmit() {
    if (!form.vendorId) { setError("Please select a vendor"); return; }
    if (!form.categoryId) { setError("Please select a category"); return; }
    if (!form.centerName.trim()) { setError("Center name is required"); return; }
    if (!form.address.trim()) { setError("Address is required"); return; }
    if (!form.city.trim()) { setError("City is required"); return; }
    if (!form.state.trim()) { setError("State is required"); return; }

    // Build the products list from the enabled rows. At least one is required —
    // a center with no products has no plans and can't be opened by customers.
    const enabled = productChoices.filter((pc) => products[pc.productType]?.enabled);
    if (enabled.length === 0) { setError("Add at least one product (e.g. Day Pass) with a price"); return; }
    const plans: { name: string; productType: string; price: number; unit: string }[] = [];
    for (const pc of enabled) {
      const row = products[pc.productType];
      const price = Number(row.price);
      if (!row.price.trim() || !Number.isFinite(price) || price < 0) {
        setError(`Enter a valid price for ${pc.label}`);
        return;
      }
      plans.push({ name: row.name.trim() || pc.defaultName, productType: pc.productType, price, unit: pc.unit });
    }

    // Coordinates are resolved server-side from googleMapUrl (handles full
    // links, shortened maps.app.goo.gl links via redirect-follow, and a
    // Geocoding API fallback) — the frontend just passes the raw URL through.
    const token = getAdminToken();
    if (!token) return;
    setSaving(true);
    setError("");
    try {
      await apiPost("/admin/centers", {
        vendorId: form.vendorId,
        categoryId: form.categoryId,
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
        plans,
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
                <option value="">Select vendor…</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.business_name} — {v.owner_name}{v.city ? ` (${v.city})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Category */}
          <div>
            <label className={lbl}>Category <span className="text-red-500">*</span></label>
            <select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={inp}>
              <option value="">Select category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
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

          {/* Products — at least one required so the center is bookable/tappable */}
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
            <label className={lbl}>Products <span className="text-red-500">*</span></label>
            {!form.categoryId ? (
              <p className="text-xs text-[#94A3B8]">Select a category first to choose products.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {productChoices.map((pc) => {
                  const row = products[pc.productType] ?? { enabled: false, name: pc.defaultName, price: "" };
                  return (
                    <div key={pc.productType} className={`rounded-lg border p-2.5 transition-colors ${row.enabled ? "border-[#2563EB] bg-white" : "border-[#E2E8F0] bg-white"}`}>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={row.enabled}
                          onChange={(e) => setProduct(pc.productType, { enabled: e.target.checked })}
                          className="h-4 w-4 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
                        />
                        <span className="text-sm font-semibold text-[#0F172A]">{pc.label}</span>
                      </label>
                      {row.enabled && (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <input
                            className={inp}
                            placeholder="Plan name"
                            value={row.name}
                            onChange={(e) => setProduct(pc.productType, { name: e.target.value })}
                          />
                          <input
                            className={inp}
                            type="number"
                            min={0}
                            placeholder={pc.pricePrefix}
                            value={row.price}
                            onChange={(e) => setProduct(pc.productType, { price: e.target.value })}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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

// Numeric priority for a promoted center. Lower number = shown first across
// the "Bokko Recommended" / "Top Spaces" rails and listing default sorts.
// Commits on blur or Enter (not per keystroke) to avoid a PATCH per digit.
function PriorityInput({
  value,
  onCommit,
}: {
  value: number | null | undefined;
  onCommit: (rank: number | null) => void;
}) {
  const [draft, setDraft] = useState(value == null ? "" : String(value));

  // Keep the input in sync when the row's rank changes elsewhere (e.g. revert).
  useEffect(() => {
    setDraft(value == null ? "" : String(value));
  }, [value]);

  function commit() {
    const trimmed = draft.trim();
    const parsed = trimmed === "" ? null : Math.max(0, Math.floor(Number(trimmed)));
    onCommit(trimmed === "" ? null : Number.isFinite(parsed as number) ? parsed : null);
  }

  return (
    <label className="flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-2.5 py-2 text-xs text-[#64748B]">
      <span className="font-semibold text-[#0F172A]">Priority</span>
      <input
        type="number"
        min={0}
        inputMode="numeric"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          }
        }}
        placeholder="—"
        title="Lower number shows first. Leave blank for unranked."
        className="w-12 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-1.5 py-0.5 text-center text-xs font-bold text-[#2563EB] outline-none focus:border-[#2563EB]"
      />
    </label>
  );
}

export default function AdminCentersPage() {
  const [centers, setCenters] = useState<ApiCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [featuringId, setFeaturingId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<ApiCenter | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

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

  async function handleToggleFeatured(center: ApiCenter) {
    const token = getAdminToken();
    if (!token) return;
    setFeaturingId(center.id);
    setError(null);
    // Optimistic flip — reverted on failure so the toggle never lies.
    const next = !center.is_featured;
    // Preserve the admin's chosen priority when re-promoting; clear it when
    // un-promoting so a later re-promote doesn't inherit a stale rank.
    const nextRank = next ? center.featured_rank ?? null : null;
    setCenters((prev) =>
      prev.map((c) => (c.id === center.id ? { ...c, is_featured: next, featured_rank: nextRank } : c)),
    );
    try {
      await apiPatch(
        `/admin/centers/${center.id}/featured`,
        { isFeatured: next, featuredRank: nextRank },
        token,
      );
    } catch (err) {
      setCenters((prev) =>
        prev.map((c) =>
          c.id === center.id ? { ...c, is_featured: !next, featured_rank: center.featured_rank ?? null } : c,
        ),
      );
      setError(err instanceof ApiError ? err.message : "Failed to update promotion");
    } finally {
      setFeaturingId(null);
    }
  }

  // Persist the admin priority for an already-promoted center. Lower rank shows
  // first; a blank input clears the rank (center sorts after ranked ones).
  async function handleSetRank(center: ApiCenter, rank: number | null) {
    const token = getAdminToken();
    if (!token) return;
    if (rank === (center.featured_rank ?? null)) return; // no-op
    setError(null);
    const prevRank = center.featured_rank ?? null;
    setCenters((prev) => prev.map((c) => (c.id === center.id ? { ...c, featured_rank: rank } : c)));
    try {
      await apiPatch(
        `/admin/centers/${center.id}/featured`,
        { isFeatured: true, featuredRank: rank },
        token,
      );
    } catch (err) {
      setCenters((prev) => prev.map((c) => (c.id === center.id ? { ...c, featured_rank: prevRank } : c)));
      setError(err instanceof ApiError ? err.message : "Failed to update priority");
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
            { label: "Promoted", count: centers.filter((c) => c.is_featured).length, color: "text-[#2563EB]" },
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
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-[#0F172A] truncate">{c.center_name}</p>
                    {c.is_featured && (
                      <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-[#2563EB] px-1.5 py-0.5 text-[9px] font-semibold text-white" title="Promoted — appears in Bokko Recommended">
                        <Sparkles size={9} /> Promoted{c.featured_rank != null ? ` #${c.featured_rank}` : ""}
                      </span>
                    )}
                  </div>
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

              {/* Commission — set per category on the Commissions page, not per center */}
              <div className="mt-2 flex items-center justify-between rounded-lg bg-[#F8FAFC] px-2.5 py-1.5 text-xs text-[#64748B]">
                <span>
                  Commission:{" "}
                  {c.categories?.commission_percent != null
                    ? `${c.categories.commission_percent}% (${c.categories.name})`
                    : "Platform default"}
                </span>
                <Link to="/admin/commissions" className="font-semibold text-[#2563EB] hover:underline">
                  Manage
                </Link>
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
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex flex-1 items-center justify-center rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] px-3 py-2 text-xs text-emerald-700 text-center font-semibold">
                    ✓ Live
                  </div>
                  {/* Priority appears once promoted — controls ordering among
                      promoted centers on the customer rails. */}
                  {c.is_featured && (
                    <PriorityInput value={c.featured_rank} onCommit={(rank) => handleSetRank(c, rank)} />
                  )}
                  <button
                    onClick={() => handleToggleFeatured(c)}
                    disabled={featuringId === c.id}
                    aria-pressed={Boolean(c.is_featured)}
                    title={c.is_featured ? "Remove from Bokko Recommended" : "Promote to Bokko Recommended"}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-colors disabled:opacity-50 ${
                      c.is_featured
                        ? "border-[#2563EB] bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                        : "border-[#E2E8F0] text-[#2563EB] hover:bg-[#EFF6FF]"
                    }`}
                  >
                    <Sparkles size={12} />
                    {featuringId === c.id
                      ? "Saving…"
                      : c.is_featured
                      ? "Promoted"
                      : "Promote"}
                  </button>
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
