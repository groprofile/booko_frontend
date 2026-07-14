import { useState, useEffect } from "react";
import { Plus, Tag, X, Building2, ShieldCheck, Loader2 } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { useAdmin } from "../../context/AdminContext";
import { apiGet, apiPost, apiPatch } from "../../lib/api";

interface Coupon {
  id: string;
  code: string;
  discount_type: "PERCENT" | "FLAT";
  discount_value: number;
  min_booking_paise: number;
  max_discount_paise?: number;
  usage_limit: number | null;
  used_count: number;
  valid_from: string;
  valid_to: string | null;
  is_active: boolean;
  description?: string | null;
  vendor_id?: string | null;
  vendor_owner_name?: string | null;
  vendor_business_name?: string | null;
  vendor_email?: string | null;
  created_at: string;
}

const INPUT_CLS = "h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#2563EB] bg-white";

function getAdminToken() {
  return sessionStorage.getItem("bokko_admin_token") ?? localStorage.getItem("bokko_admin_token") ?? undefined;
}

export default function AdminCouponsPage() {
  const { admin } = useAdmin();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<"all" | "admin" | "vendor">("all");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: "", discountType: "PERCENT" as "PERCENT" | "FLAT", discountValue: "",
    maxDiscountPaise: "", minBookingPaise: "0", usageLimit: "100",
    validFrom: "", validTo: "", description: "",
  });

  function load() {
    const token = getAdminToken();
    apiGet<{ coupons: Coupon[] }>("/admin/coupons", token as string)
      .then((data) => setCoupons(data?.coupons ?? []))
      .catch((err) => setError((err as Error).message ?? "Failed to load coupons"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleCreate() {
    if (!form.code || !form.discountValue || !form.validFrom || !form.validTo) return;
    setSaving(true);
    setError(null);
    try {
      const token = getAdminToken();
      await apiPost("/admin/coupons", {
        code: form.code.toUpperCase(),
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        maxDiscountPaise: form.maxDiscountPaise ? Math.round(parseFloat(form.maxDiscountPaise) * 100) : undefined,
        minBookingPaise: Math.round(parseFloat(form.minBookingPaise || "0") * 100),
        usageLimit: parseInt(form.usageLimit),
        validFrom: form.validFrom,
        validTo: form.validTo,
        description: form.description.trim() || undefined,
      }, token as string);
      setShowCreate(false);
      setForm({ code: "", discountType: "PERCENT", discountValue: "", maxDiscountPaise: "", minBookingPaise: "0", usageLimit: "100", validFrom: "", validTo: "", description: "" });
      load();
    } catch (err) {
      setError((err as Error).message ?? "Failed to create coupon");
    } finally {
      setSaving(false);
    }
  }

  async function handleDisable(couponId: string) {
    const token = getAdminToken();
    await apiPatch(`/admin/coupons/${couponId}/deactivate`, {}, token as string).catch(() => null);
    load();
  }

  const filtered = coupons.filter((c) => {
    if (filter === "admin") return !c.vendor_id;
    if (filter === "vendor") return !!c.vendor_id;
    return true;
  });
  const active = filtered.filter((c) => c.is_active);
  const inactive = filtered.filter((c) => !c.is_active);

  function CouponCard({ coupon }: { coupon: Coupon }) {
    const isVendorCoupon = !!coupon.vendor_id;
    const expired = coupon.valid_to ? new Date(coupon.valid_to) < new Date() : false;
    const usagePct = coupon.usage_limit ? (coupon.used_count / coupon.usage_limit) * 100 : 0;

    return (
      <div className={`rounded-2xl border p-5 shadow-sm ${coupon.is_active && !expired ? "border-[#E2E8F0] bg-white" : "border-[#F1F5F9] bg-[#F8FAFC]"}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isVendorCoupon ? "bg-[#F3E8FF]" : "bg-[#EFF6FF]"}`}>
              <Tag size={16} className={isVendorCoupon ? "text-[#7C3AED]" : "text-[#2563EB]"} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-mono text-sm font-extrabold text-[#0F172A]">{coupon.code}</p>
                {isVendorCoupon ? (
                  <span className="flex items-center gap-0.5 rounded-full bg-[#F3E8FF] px-1.5 py-0.5 text-[9px] font-bold text-[#7C3AED]">
                    <Building2 size={8} /> Vendor
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 rounded-full bg-[#EFF6FF] px-1.5 py-0.5 text-[9px] font-bold text-[#2563EB]">
                    <ShieldCheck size={8} /> Admin
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#94A3B8]">
                {coupon.discount_type === "PERCENT" ? `${coupon.discount_value}% off` : `₹${coupon.discount_value} off`}
                {coupon.max_discount_paise ? ` (max ₹${coupon.max_discount_paise / 100})` : ""}
              </p>
            </div>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${coupon.is_active && !expired ? "bg-[#DCFCE7] text-[#15803D]" : expired ? "bg-[#FEE2E2] text-[#B91C1C]" : "bg-[#F1F5F9] text-[#64748B]"}`}>
            {expired ? "Expired" : coupon.is_active ? "Active" : "Disabled"}
          </span>
        </div>

        {/* Vendor info row */}
        {isVendorCoupon && (
          <div className="mt-2.5 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] px-3 py-2">
            <p className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-wider mb-0.5">Vendor</p>
            <p className="text-xs font-semibold text-[#0F172A]">{coupon.vendor_business_name ?? "—"}</p>
            {coupon.vendor_owner_name && (
              <p className="text-[10px] text-[#64748B]">{coupon.vendor_owner_name} · {coupon.vendor_email}</p>
            )}
          </div>
        )}

        {coupon.description && (
          <p className="mt-2 text-[11px] text-[#64748B] italic">{coupon.description}</p>
        )}

        <div className="mt-3">
          <div className="flex justify-between text-[11px] text-[#94A3B8] mb-1">
            <span>Usage: {coupon.used_count}/{coupon.usage_limit ?? "∞"}</span>
            <span>
              {coupon.valid_from ? new Date(coupon.valid_from).toLocaleDateString("en-IN") : "—"}
              {" → "}
              {coupon.valid_to ? new Date(coupon.valid_to).toLocaleDateString("en-IN") : "No expiry"}
            </span>
          </div>
          {coupon.usage_limit && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F1F5F9]">
              <div className="h-full rounded-full bg-[#2563EB]" style={{ width: `${Math.min(usagePct, 100)}%` }} />
            </div>
          )}
        </div>

        {coupon.min_booking_paise > 0 && (
          <p className="mt-2 text-[10px] text-[#94A3B8]">Min booking ₹{coupon.min_booking_paise / 100}</p>
        )}

        {coupon.is_active && !expired && (
          <button onClick={() => handleDisable(coupon.id)}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] py-2 text-xs text-[#DC2626] hover:bg-[#FEE2E2]">
            <X size={12} /> Disable Coupon
          </button>
        )}
      </div>
    );
  }

  const adminCount = coupons.filter((c) => !c.vendor_id).length;
  const vendorCount = coupons.filter((c) => !!c.vendor_id).length;

  return (
    <AdminLayout title="Coupon Management" subtitle={`${coupons.length} total · ${adminCount} admin · ${vendorCount} vendor`}>
      <div className="mb-5 flex items-center justify-between gap-3">
        {/* Filter tabs */}
        <div className="flex gap-2">
          {(["all", "admin", "vendor"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                filter === f ? "bg-[#0F172A] text-white" : "border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#0F172A]"
              }`}>
              {f === "all" ? `All (${coupons.length})` : f === "admin" ? `Admin (${adminCount})` : `Vendor (${vendorCount})`}
            </button>
          ))}
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-bold text-white hover:bg-[#1d4ed8]">
          <Plus size={15} /> Create Coupon
        </button>
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      {loading ? (
        <div className="py-16 text-center text-sm text-[#94A3B8]">
          <Loader2 size={20} className="mx-auto mb-2 animate-spin" />
          Loading coupons…
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#64748B]">Active Coupons</p>
              <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {active.map((c) => <CouponCard key={c.id} coupon={c} />)}
              </div>
            </>
          )}
          {inactive.length > 0 && (
            <>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Inactive / Expired</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {inactive.map((c) => <CouponCard key={c.id} coupon={c} />)}
              </div>
            </>
          )}
          {filtered.length === 0 && (
            <div className="py-16 text-center text-sm text-[#94A3B8]">No coupons found</div>
          )}
        </>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[500px] rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-[#F1F5F9] px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-[#0F172A]">Create Admin Coupon</h3>
              <button onClick={() => setShowCreate(false)} className="text-[#94A3B8] hover:text-[#0F172A]"><X size={16} /></button>
            </div>
            <div className="max-h-[75vh] overflow-y-auto grid grid-cols-2 gap-4 p-6">
              {error && <p className="col-span-2 rounded-xl bg-red-50 px-4 py-2.5 text-xs text-red-600">{error}</p>}
              <div className="col-span-2">
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">Coupon Code *</label>
                <input type="text" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="BOKKO20" className={INPUT_CLS} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">Discount Type *</label>
                <select value={form.discountType} onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value as "PERCENT" | "FLAT" }))}
                  className={INPUT_CLS}>
                  <option value="PERCENT">Percentage (%)</option>
                  <option value="FLAT">Flat (₹)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">Discount Value *</label>
                <input type="number" value={form.discountValue} onChange={(e) => setForm((p) => ({ ...p, discountValue: e.target.value }))}
                  placeholder={form.discountType === "PERCENT" ? "20" : "150"} className={INPUT_CLS} />
              </div>
              {form.discountType === "PERCENT" && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#0F172A]">Max Discount (₹)</label>
                  <input type="number" value={form.maxDiscountPaise} onChange={(e) => setForm((p) => ({ ...p, maxDiscountPaise: e.target.value }))}
                    placeholder="200" className={INPUT_CLS} />
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">Min Booking Amount (₹)</label>
                <input type="number" value={form.minBookingPaise} onChange={(e) => setForm((p) => ({ ...p, minBookingPaise: e.target.value }))}
                  placeholder="500" className={INPUT_CLS} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">Usage Limit</label>
                <input type="number" value={form.usageLimit} onChange={(e) => setForm((p) => ({ ...p, usageLimit: e.target.value }))}
                  placeholder="100" className={INPUT_CLS} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">Valid From *</label>
                <input type="date" value={form.validFrom} onChange={(e) => setForm((p) => ({ ...p, validFrom: e.target.value }))} className={INPUT_CLS} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">Valid Until *</label>
                <input type="date" value={form.validTo} onChange={(e) => setForm((p) => ({ ...p, validTo: e.target.value }))} className={INPUT_CLS} />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">Description</label>
                <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Internal note" className={INPUT_CLS} />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#F1F5F9] px-6 py-4">
              <button onClick={() => setShowCreate(false)} className="rounded-xl border border-[#E2E8F0] px-4 py-2 text-sm text-[#64748B]">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.code || !form.discountValue || !form.validFrom || !form.validTo}
                className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2 text-sm font-bold text-white hover:bg-[#1d4ed8] disabled:opacity-50">
                {saving ? <Loader2 size={13} className="animate-spin" /> : null}
                {saving ? "Creating…" : "Create Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
