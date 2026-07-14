import { useState, useEffect } from "react";
import { Plus, Tag, X, Check, Loader2, ToggleLeft, ToggleRight, Calendar, Hash } from "lucide-react";
import SuperPartnerLayout from "../../../components/partner/SuperPartnerLayout";
import { apiGet, apiPost, apiPatch, getVendorToken } from "../../../lib/api";

interface Coupon {
  id: string;
  code: string;
  discount_type: "PERCENT" | "FLAT";
  discount_value: number;
  min_booking_paise: number;
  usage_limit: number | null;
  used_count: number;
  valid_from: string;
  valid_to: string | null;
  is_active: boolean;
  description?: string | null;
}

const INPUT_CLS = "bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl px-4 py-2.5 text-sm outline-none text-[#0F172A] placeholder:text-[#94A3B8] w-full";

interface CreateModalProps {
  onClose: () => void;
  onCreated: () => void;
}

function CreateCouponModal({ onClose, onCreated }: CreateModalProps) {
  const [form, setForm] = useState({
    code: "",
    discountType: "PERCENT" as "PERCENT" | "FLAT",
    discountValue: "",
    minBookingPaise: "",
    usageLimit: "",
    validFrom: "",
    validTo: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(key: keyof typeof form, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleCreate() {
    if (!form.code.trim() || !form.discountValue || !form.validFrom || !form.validTo) return;
    setSaving(true);
    setError("");
    try {
      const token = getVendorToken() ?? undefined;
      await apiPost("/vendor/coupons", {
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        minBookingPaise: form.minBookingPaise ? Math.round(parseFloat(form.minBookingPaise) * 100) : undefined,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : undefined,
        validFrom: form.validFrom,
        validTo: form.validTo,
        description: form.description.trim() || undefined,
      }, token);
      onCreated();
    } catch (err) {
      setError((err as Error).message ?? "Failed to create coupon");
    } finally {
      setSaving(false);
    }
  }

  const canSubmit = form.code.trim() && form.discountValue && form.validFrom && form.validTo && !saving;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[#E2E8F0] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Tag size={16} className="text-[#7C3AED]" />
            <h3 className="text-sm font-bold text-[#0F172A]">Create Coupon</h3>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#0F172A]"><X size={16} /></button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-6 space-y-4">
          {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-xs text-red-600">{error}</p>}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#0F172A]">Coupon Code *</label>
            <input value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())}
              placeholder="e.g. SUMMER20" className={INPUT_CLS} />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-[#0F172A]">Discount Type *</label>
            <div className="flex gap-2">
              {(["PERCENT", "FLAT"] as const).map((t) => (
                <button key={t} onClick={() => set("discountType", t)}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                    form.discountType === t ? "bg-[#7C3AED] text-white" : "border border-[#E2E8F0] text-[#64748B] hover:border-[#7C3AED]"
                  }`}>
                  {t === "PERCENT" ? "% Percentage" : "₹ Flat Amount"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">
                {form.discountType === "PERCENT" ? "Discount %" : "Discount ₹"} *
              </label>
              <input type="number" min="0" value={form.discountValue}
                onChange={(e) => set("discountValue", e.target.value)}
                placeholder={form.discountType === "PERCENT" ? "20" : "100"}
                className={INPUT_CLS} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">Min Booking (₹)</label>
              <input type="number" min="0" value={form.minBookingPaise}
                onChange={(e) => set("minBookingPaise", e.target.value)}
                placeholder="0" className={INPUT_CLS} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#0F172A]">Max Uses</label>
            <input type="number" min="1" value={form.usageLimit}
              onChange={(e) => set("usageLimit", e.target.value)}
              placeholder="Unlimited" className={INPUT_CLS} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">Valid From *</label>
              <input type="date" value={form.validFrom}
                onChange={(e) => set("validFrom", e.target.value)} className={INPUT_CLS} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">Valid Until *</label>
              <input type="date" value={form.validTo}
                onChange={(e) => set("validTo", e.target.value)} className={INPUT_CLS} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#0F172A]">Description</label>
            <input value={form.description} onChange={(e) => set("description", e.target.value)}
              placeholder="Internal note about this coupon" className={INPUT_CLS} />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose}
              className="flex-1 rounded-xl border border-[#E2E8F0] py-2.5 text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
              Cancel
            </button>
            <button onClick={handleCreate} disabled={!canSubmit}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#7C3AED] py-2.5 text-sm font-semibold text-white hover:bg-purple-700 transition-colors disabled:opacity-50">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              {saving ? "Creating…" : "Create Coupon"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuperPartnerCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  function load() {
    const token = getVendorToken() ?? undefined;
    apiGet<Coupon[]>("/vendor/coupons", token)
      .then((data) => setCoupons(data ?? []))
      .catch((err) => setError((err as Error).message ?? "Failed to load coupons"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleToggle(couponId: string) {
    setToggling(couponId);
    try {
      const token = getVendorToken() ?? undefined;
      await apiPatch(`/vendor/coupons/${couponId}/toggle`, {}, token);
      load();
    } catch (err) {
      setError((err as Error).message ?? "Failed to toggle coupon");
    } finally {
      setToggling(null);
    }
  }

  const activeCount = coupons.filter((c) => c.is_active).length;

  return (
    <SuperPartnerLayout title="Coupons" subtitle="Create and manage discount coupons for your centers">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-[#0F172A]">
            All Coupons{" "}
            <span className="ml-1 rounded-full bg-[#E2E8F0] px-2 py-0.5 text-xs text-[#64748B]">{coupons.length}</span>
          </h2>
          {activeCount > 0 && (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">{activeCount} active</span>
          )}
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition-colors">
          <Plus size={14} /> Create Coupon
        </button>
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      {loading ? (
        <div className="py-16 text-center text-sm text-[#94A3B8]">Loading coupons…</div>
      ) : coupons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E2E8F0] p-12 text-center">
          <Tag size={32} className="mx-auto text-[#E2E8F0]" />
          <p className="mt-3 text-sm font-semibold text-[#0F172A]">No coupons yet</p>
          <p className="mt-1 text-xs text-[#94A3B8]">Create your first discount coupon to attract more bookings.</p>
          <button onClick={() => setShowModal(true)}
            className="mt-4 mx-auto flex items-center gap-2 rounded-xl bg-[#7C3AED] px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition-colors">
            <Plus size={14} /> Create Coupon
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map((coupon) => {
            const isExpired = coupon.valid_to ? new Date(coupon.valid_to) < new Date() : false;
            return (
              <div key={coupon.id}
                className={`rounded-2xl border bg-white shadow-sm transition-all duration-200 overflow-hidden ${
                  coupon.is_active && !isExpired ? "border-[#E2E8F0] hover:-translate-y-0.5 hover:shadow-md" : "border-[#E2E8F0] opacity-70"
                }`}>
                {/* Gradient header */}
                <div className={`px-5 py-4 ${coupon.is_active && !isExpired ? "bg-gradient-to-br from-[#7C3AED] to-[#2563EB]" : "bg-gradient-to-br from-slate-400 to-slate-500"}`}>
                  <div className="flex items-start justify-between">
                    <code className="text-lg font-black tracking-widest text-white">{coupon.code}</code>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      isExpired ? "bg-white/20 text-white/70" : coupon.is_active ? "bg-white/20 text-white" : "bg-white/20 text-white/70"
                    }`}>
                      {isExpired ? "Expired" : coupon.is_active ? "Active" : "Paused"}
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-black text-white">
                    {coupon.discount_type === "PERCENT" ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                  </p>
                  {coupon.description && <p className="mt-0.5 text-xs text-white/70">{coupon.description}</p>}
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {coupon.valid_from ? new Date(coupon.valid_from).toLocaleDateString("en-IN") : "—"}
                      {" – "}
                      {coupon.valid_to ? new Date(coupon.valid_to).toLocaleDateString("en-IN") : "No expiry"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span className="flex items-center gap-1">
                      <Hash size={11} /> {coupon.used_count} / {coupon.usage_limit ?? "∞"} uses
                    </span>
                    {coupon.min_booking_paise > 0 && (
                      <span>Min ₹{coupon.min_booking_paise / 100}</span>
                    )}
                  </div>

                  {/* Usage bar */}
                  {coupon.usage_limit && (
                    <div className="mt-1">
                      <div className="h-1.5 w-full rounded-full bg-[#F1F5F9]">
                        <div
                          className="h-1.5 rounded-full bg-[#7C3AED]"
                          style={{ width: `${Math.min(100, (coupon.used_count / coupon.usage_limit) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleToggle(coupon.id)}
                    disabled={toggling === coupon.id || isExpired}
                    className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
                      coupon.is_active
                        ? "border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
                        : "bg-[#7C3AED] text-white hover:bg-purple-700"
                    }`}>
                    {toggling === coupon.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : coupon.is_active ? (
                      <><ToggleRight size={13} className="text-emerald-500" /> Pause Coupon</>
                    ) : (
                      <><ToggleLeft size={13} /> Activate Coupon</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <CreateCouponModal
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); load(); }}
        />
      )}
    </SuperPartnerLayout>
  );
}
