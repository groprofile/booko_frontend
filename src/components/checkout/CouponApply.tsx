import { useState } from "react";
import { BadgePercent, Check, ChevronDown, Loader2, Tag, X } from "lucide-react";
import type { AvailableCoupon } from "../../lib/offers";

interface CouponApplyProps {
  /** Server-computed list for this exact booking (from the quote). */
  available: AvailableCoupon[];
  /** Code of the currently applied offer (from the quote), if any. */
  appliedCode?: string | null;
  /** Discount in rupees of the applied offer. */
  appliedDiscount?: number;
  loading?: boolean;
  error?: string | null;
  onApply: (code: string) => void;
  onClear: () => void;
}

function CouponRow({
  coupon,
  applied,
  loading,
  onApply,
}: {
  coupon: AvailableCoupon;
  applied: boolean;
  loading?: boolean;
  onApply: (code: string) => void;
}) {
  const [showTerms, setShowTerms] = useState(false);
  return (
    <div className={"rounded-xl border px-3 py-2.5 " + (applied ? "border-[#BBF7D0] bg-[#F0FDF4]" : "border-[#E2E8F0] bg-white")}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF]">
            <BadgePercent size={15} className="text-[#2563EB]" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-extrabold text-[#0F172A]">{coupon.code}</span>
              {coupon.best && (
                <span className="rounded bg-[#FEF3C7] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#B45309]">Best offer</span>
              )}
            </div>
            <p className="truncate text-[11px] font-semibold text-[#334155]">{coupon.headline}</p>
            {coupon.description && <p className="truncate text-[11px] text-[#94A3B8]">{coupon.description}</p>}
            {!coupon.eligible && coupon.reason && (
              <p className="mt-0.5 text-[11px] font-medium text-[#DC2626]">{coupon.reason}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          disabled={applied || !coupon.eligible || loading}
          onClick={() => onApply(coupon.code)}
          className={
            "shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors " +
            (applied
              ? "bg-[#DCFCE7] text-[#15803D]"
              : coupon.eligible
                ? "border border-[#2563EB] text-[#2563EB] hover:bg-[#EFF6FF]"
                : "cursor-not-allowed border border-[#E2E8F0] text-[#CBD5E1]")
          }
        >
          {applied ? "Applied" : "Apply"}
        </button>
      </div>

      {coupon.terms && (
        <div className="mt-1.5">
          <button type="button" onClick={() => setShowTerms((v) => !v)} className="flex items-center gap-0.5 text-[10px] font-semibold text-[#64748B]">
            Terms & conditions
            <ChevronDown size={11} className={showTerms ? "rotate-180 transition-transform" : "transition-transform"} />
          </button>
          {showTerms && <p className="mt-1 text-[10px] leading-relaxed text-[#94A3B8]">{coupon.terms}</p>}
        </div>
      )}
    </div>
  );
}

/**
 * Checkout "Coupons & Offers" section (MakeMyTrip/Goibibo style). The best
 * eligible coupon is auto-applied; the customer can switch to another, remove it,
 * or type a code. Every row's savings + eligibility come from the server.
 */
export default function CouponApply({ available, appliedCode, appliedDiscount = 0, loading, error, onApply, onClear }: CouponApplyProps) {
  const [code, setCode] = useState("");
  const isApplied = !!appliedCode;

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF6FF]">
          <Tag size={15} className="text-[#2563EB]" />
        </span>
        <h3 className="text-sm font-bold text-[#0F172A]">Coupons &amp; Offers</h3>
      </div>

      {isApplied && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#16A34A]">
              <Check size={13} className="text-white" />
            </span>
            <div>
              <p className="font-mono text-xs font-bold text-[#15803D]">{appliedCode}</p>
              {appliedDiscount > 0 && <p className="text-[11px] text-[#16A34A]">You saved ₹{appliedDiscount.toLocaleString()}</p>}
            </div>
          </div>
          <button type="button" onClick={onClear} className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-[#64748B] hover:bg-[#F1F5F9]">
            <X size={12} /> Remove
          </button>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter coupon code"
          className="h-10 flex-1 rounded-xl border border-[#E2E8F0] px-3 text-sm uppercase outline-none focus:border-[#2563EB]"
        />
        <button
          type="button"
          disabled={!code.trim() || loading}
          onClick={() => onApply(code.trim())}
          className="flex h-10 items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 text-sm font-bold text-white hover:bg-[#1d4ed8] disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          Apply
        </button>
      </div>

      {error && <p className="mt-2 text-xs font-medium text-[#DC2626]">{error}</p>}

      {available.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Available coupons</p>
          <div className="flex flex-col gap-2">
            {available.map((coupon) => (
              <CouponRow key={coupon.couponId} coupon={coupon} applied={appliedCode === coupon.code} loading={loading} onApply={onApply} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
