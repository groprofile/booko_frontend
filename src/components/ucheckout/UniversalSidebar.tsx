import { useState } from "react";
import { ChevronDown, Sparkles, Tag, CheckCircle2, Shield, Clock, Star, FileText, Headphones } from "lucide-react";
import { universalCoupons } from "../../data/universalCheckout";
import type { UCoupon } from "../../data/universalCheckout";

interface PriceRow {
  label: string;
  value: number;
  isDiscount?: boolean;
  muted?: boolean;
}

interface UniversalSidebarProps {
  productLabel: string;
  workspaceName: string;
  cityName: string;
  bookingMeta: string;
  image: string;
  basePrice: number;
  addOnsTotal: number;
  taxes: number;
  convenienceFee: number;
  autoDiscount: number;
  couponSavings: number;
  totalAmount: number;
  totalSaved: number;
  appliedCoupon: UCoupon | null;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
  canProceed: boolean;
  submitting: boolean;
  ctaLabel: string;
  onProceed: () => void;
  currentStep: number;
}

export default function UniversalSidebar({
  productLabel, workspaceName, cityName, bookingMeta, image,
  basePrice, addOnsTotal, taxes, convenienceFee, autoDiscount, couponSavings,
  totalAmount, totalSaved, appliedCoupon, onApplyCoupon, onRemoveCoupon,
  canProceed, submitting, ctaLabel, onProceed, currentStep,
}: UniversalSidebarProps) {
  const [breakdownOpen, setBreakdownOpen] = useState(true);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [offersOpen, setOffersOpen] = useState(false);

  function handleApply() {
    const matched = universalCoupons.find((c) => c.code.toLowerCase() === couponInput.trim().toLowerCase());
    if (matched) {
      onApplyCoupon(matched.code);
      setCouponError("");
    } else {
      setCouponError("Invalid coupon code. Try BOKKO10 or CORP25.");
    }
  }

  const rows: PriceRow[] = [
    { label: "Base Price", value: basePrice },
    ...(addOnsTotal > 0 ? [{ label: "Add-ons", value: addOnsTotal }] : []),
    { label: "Taxes & GST", value: taxes, muted: true },
    { label: "Convenience Fee", value: convenienceFee, muted: true },
    ...(autoDiscount > 0 ? [{ label: "Bokko Discount", value: autoDiscount, isDiscount: true }] : []),
    ...(couponSavings > 0 ? [{ label: `Coupon (${appliedCoupon?.code})`, value: couponSavings, isDiscount: true }] : []),
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Booking summary card */}
      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="flex gap-3 p-4">
          <img src={image} alt={workspaceName} className="h-20 w-24 shrink-0 rounded-xl object-cover" />
          <div className="flex min-w-0 flex-col justify-center gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">{productLabel}</span>
            <p className="text-sm font-bold leading-snug text-[#0F172A]">{workspaceName}</p>
            <p className="text-xs text-[#64748B]">{cityName}</p>
            <p className="mt-0.5 text-xs font-semibold text-[#334155]">{bookingMeta}</p>
          </div>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setBreakdownOpen((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-bold text-[#2563EB]"
        >
          Price Breakdown
          <ChevronDown size={16} className={breakdownOpen ? "rotate-180 transition-transform" : "transition-transform"} />
        </button>

        {breakdownOpen && (
          <div className="flex flex-col gap-2 border-t border-[#E2E8F0] px-4 py-3">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between text-sm">
                <span className={row.muted ? "text-[#94A3B8]" : row.isDiscount ? "text-[#16A34A]" : "text-[#64748B]"}>
                  {row.label}
                </span>
                <span className={row.isDiscount ? "font-semibold text-[#16A34A]" : row.muted ? "text-[#94A3B8]" : "font-medium text-[#0F172A]"}>
                  {row.isDiscount ? "−" : ""}₹{row.value.toLocaleString()}
                </span>
              </div>
            ))}

            <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-3 text-base font-extrabold text-[#0F172A]">
              <span>Total Payable</span>
              <span>₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        )}

        {totalSaved > 0 && (
          <div className="flex items-center gap-2 border-t border-[#DCFCE7] bg-[#F0FDF4] px-4 py-2.5">
            <Sparkles size={14} className="shrink-0 text-[#16A34A]" />
            <p className="text-xs font-bold text-[#16A34A]">You Saved ₹{totalSaved.toLocaleString()} with Bokko!</p>
          </div>
        )}
      </div>

      {/* Coupon section — show only on steps 1-3 */}
      {currentStep < 4 && (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
          <p className="mb-2 text-sm font-bold text-[#0F172A]">Offers & Coupons</p>
          {appliedCoupon ? (
            <div className="flex items-center justify-between rounded-xl bg-[#F0FDF4] px-3 py-2">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-[#16A34A]">
                <CheckCircle2 size={14} />
                {appliedCoupon.code} — {appliedCoupon.discountPercent}% off
              </span>
              <button type="button" onClick={onRemoveCoupon} className="text-xs font-semibold text-[#DC2626]">Remove</button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleApply()}
                  placeholder="Enter coupon code"
                  className="h-9 flex-1 rounded-xl border border-[#D1D5DB] px-3 text-sm font-medium text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
                />
                <button
                  type="button"
                  onClick={handleApply}
                  className="h-9 shrink-0 rounded-xl bg-[#0F172A] px-4 text-sm font-semibold text-white hover:bg-black"
                >
                  Apply
                </button>
              </div>
              {couponError && <p className="mt-1 text-xs font-medium text-[#DC2626]">{couponError}</p>}

              <button
                type="button"
                onClick={() => setOffersOpen((v) => !v)}
                className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#2563EB]"
              >
                <Tag size={12} />
                View available offers
                <ChevronDown size={12} className={offersOpen ? "rotate-180 transition-transform" : "transition-transform"} />
              </button>

              {offersOpen && (
                <div className="mt-2 flex flex-col gap-1.5">
                  {universalCoupons.map((coupon) => (
                    <button
                      key={coupon.code}
                      type="button"
                      onClick={() => { onApplyCoupon(coupon.code); setOffersOpen(false); setCouponError(""); }}
                      className="flex items-center justify-between rounded-xl border border-dashed border-[#2563EB]/40 bg-[#EFF6FF] px-3 py-2 text-left"
                    >
                      <span className="text-xs">
                        <span className="font-bold text-[#2563EB]">{coupon.code}</span>
                        <span className="ml-1.5 text-[#64748B]">— {coupon.description}</span>
                      </span>
                      <span className="ml-2 shrink-0 text-xs font-bold text-[#2563EB]">{coupon.discountPercent}%</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* CTA button — desktop */}
      {currentStep < 4 && (
        <button
          type="button"
          disabled={!canProceed || submitting}
          onClick={onProceed}
          className="w-full rounded-xl bg-[#2563EB] py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Processing…" : ctaLabel}
        </button>
      )}

      {/* Trust block */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Why Book With Bokko</p>
        {[
          { icon: Shield, label: "Secure Payments", sub: "256-bit SSL encrypted" },
          { icon: CheckCircle2, label: "Instant Confirmation", sub: "Booking confirmed in seconds" },
          { icon: Star, label: "Verified Partner", sub: "100% verified workspaces" },
          { icon: Headphones, label: "24×7 Support", sub: "Always here to help" },
          { icon: FileText, label: "GST Invoice", sub: "Compliant tax invoice" },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex items-start gap-2.5 py-1.5">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF]">
              <Icon size={12} className="text-[#2563EB]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#0F172A]">{label}</p>
              <p className="text-[11px] text-[#94A3B8]">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bokko Expert */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
        <p className="mb-0.5 text-sm font-bold text-[#0F172A]">Need Help?</p>
        <p className="mb-3 flex items-center gap-1 text-xs text-[#16A34A]">
          <Clock size={11} />
          Response within 2 minutes
        </p>
        <div className="flex flex-col gap-2">
          <a href="tel:+918008008000" className="flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] py-2.5 text-sm font-semibold text-[#0F172A] hover:border-[#94A3B8]">
            📞 Call Expert
          </a>
          <a href="https://wa.me/918008008000" target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 text-sm font-semibold text-white hover:bg-[#1ebe5d]">
            💬 WhatsApp
          </a>
          <button type="button"
            className="rounded-xl border border-[#2563EB] py-2.5 text-sm font-semibold text-[#2563EB] hover:bg-[#EFF6FF]">
            📅 Request Callback
          </button>
        </div>
      </div>
    </div>
  );
}
