import { useState } from "react";
import { CheckCircle2, Sparkles, Tag } from "lucide-react";
import type { Coupon } from "../../data/hotelDetails";
import SectionLabel from "./SectionLabel";

interface OffersCouponSectionProps {
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  onApply: (code: string) => void;
  onAutoApplyBest: () => void;
  couponSavings: number;
}

export default function OffersCouponSection({ coupons, appliedCoupon, onApply, onAutoApplyBest, couponSavings }: OffersCouponSectionProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function handleApply() {
    const matched = coupons.find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
    if (matched) {
      setError("");
      onApply(matched.code);
    } else {
      setError("Invalid coupon code");
    }
  }

  const bestCoupon = [...coupons].sort((a, b) => b.discountPercent - a.discountPercent)[0];

  return (
    <section>
      <SectionLabel title="Offers & Coupons" />

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Enter coupon code"
          className="h-11 flex-1 rounded-xl border border-[#D1D5DB] px-3 text-sm font-medium text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
        />
        <button type="button" onClick={handleApply} className="h-11 shrink-0 rounded-xl bg-[#0F172A] px-5 text-sm font-semibold text-white hover:bg-black">
          Apply
        </button>
        <button
          type="button"
          onClick={onAutoApplyBest}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[#2563EB] px-4 text-sm font-semibold text-[#2563EB] hover:bg-[#EFF6FF]"
        >
          <Sparkles size={14} />
          Auto Apply Best
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-[#DC2626]">{error}</p>}
      {appliedCoupon && (
        <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-[#16A34A]">
          <CheckCircle2 size={15} />
          {appliedCoupon.code} applied — you saved ₹{couponSavings.toLocaleString()}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2">
        {coupons.map((coupon) => {
          const isBest = coupon.code === bestCoupon?.code;
          const isApplied = appliedCoupon?.code === coupon.code;
          return (
            <button
              key={coupon.code}
              type="button"
              onClick={() => onApply(coupon.code)}
              className={
                "flex items-center justify-between rounded-xl border border-dashed px-3.5 py-2.5 text-left text-sm transition-colors " +
                (isApplied ? "border-[#16A34A] bg-[#ECFDF5]" : "border-[#2563EB]/40 bg-[#EFF6FF] hover:bg-[#DBEAFE]")
              }
            >
              <span className="flex items-center gap-2">
                <Tag size={14} className="text-[#2563EB]" />
                <span>
                  <span className="font-bold text-[#2563EB]">{coupon.code}</span> — {coupon.description}
                  {isBest && <span className="ml-2 rounded-full bg-[#F59E0B]/15 px-2 py-0.5 text-[10px] font-bold text-[#B45309]">Recommended</span>}
                </span>
              </span>
              <span className="font-bold text-[#2563EB]">{coupon.discountPercent}%</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
