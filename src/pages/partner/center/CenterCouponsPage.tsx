import { useState, useEffect } from "react";
import { Tag, Calendar, Hash, Loader2, Info } from "lucide-react";
import CenterLayout from "../../../components/partner/CenterLayout";
import { apiGet, getVendorToken } from "../../../lib/api";

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
  vendor_business_name?: string | null;
}

export default function CenterCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getVendorToken() ?? undefined;
    apiGet<Coupon[]>("/vendor/center/coupons", token)
      .then((data) => setCoupons(data ?? []))
      .catch((err) => setError((err as Error).message ?? "Failed to load coupons"))
      .finally(() => setLoading(false));
  }, []);

  const activeCount = coupons.filter((c) => {
    const expired = c.valid_to ? new Date(c.valid_to) < new Date() : false;
    return c.is_active && !expired;
  }).length;

  return (
    <CenterLayout title="Coupons" subtitle="Discount coupons active for your center">
      {/* Read-only notice */}
      <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
        <Info size={15} className="mt-0.5 shrink-0 text-blue-500" />
        <p className="text-xs text-blue-700">
          Coupons are managed by your vendor. Contact your partner admin to create or modify coupons.
        </p>
      </div>

      <div className="mb-5 flex items-center gap-3">
        <h2 className="text-sm font-semibold text-[#0F172A]">
          All Coupons{" "}
          <span className="ml-1 rounded-full bg-[#E2E8F0] px-2 py-0.5 text-xs text-[#64748B]">{coupons.length}</span>
        </h2>
        {activeCount > 0 && (
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">{activeCount} active</span>
        )}
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      {loading ? (
        <div className="py-16 text-center text-sm text-[#94A3B8]">
          <Loader2 size={20} className="mx-auto mb-2 animate-spin" />
          Loading coupons…
        </div>
      ) : coupons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E2E8F0] p-12 text-center">
          <Tag size={32} className="mx-auto text-[#E2E8F0]" />
          <p className="mt-3 text-sm font-semibold text-[#0F172A]">No coupons yet</p>
          <p className="mt-1 text-xs text-[#94A3B8]">Your vendor admin hasn't created any coupons.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map((coupon) => {
            const isExpired = coupon.valid_to ? new Date(coupon.valid_to) < new Date() : false;
            const status = isExpired ? "Expired" : coupon.is_active ? "Active" : "Paused";
            return (
              <div key={coupon.id}
                className={`rounded-2xl border bg-white shadow-sm overflow-hidden ${
                  coupon.is_active && !isExpired ? "border-[#E2E8F0]" : "border-[#E2E8F0] opacity-65"
                }`}>
                {/* Header */}
                <div className={`px-5 py-4 ${coupon.is_active && !isExpired
                  ? "bg-gradient-to-br from-[#7C3AED] to-[#2563EB]"
                  : "bg-gradient-to-br from-slate-400 to-slate-500"}`}>
                  <div className="flex items-start justify-between">
                    <code className="text-lg font-black tracking-widest text-white">{coupon.code}</code>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      isExpired ? "bg-white/20 text-white/70"
                      : coupon.is_active ? "bg-white/20 text-white"
                      : "bg-white/20 text-white/70"
                    }`}>
                      {status}
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-black text-white">
                    {coupon.discount_type === "PERCENT"
                      ? `${coupon.discount_value}% OFF`
                      : `₹${coupon.discount_value} OFF`}
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </CenterLayout>
  );
}
