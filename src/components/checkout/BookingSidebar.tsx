import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";

interface BookingSidebarProps {
  roomName: string;
  nights: number;
  roomCost: number;
  couponSavings: number;
  totalAmount: number;
  isEstimate: boolean;
  quoteLoading: boolean;
  canContinue: boolean;
  submitting: boolean;
  onContinue: () => void;
}

function Row({ label, value, isDiscount = false }: { label: string; value: number; isDiscount?: boolean }) {
  if (value === 0) return null;
  return (
    <div className={"flex items-center justify-between text-sm " + (isDiscount ? "text-[#16A34A]" : "text-[#64748B]")}>
      <span>{label}</span>
      <span>
        {isDiscount ? "- " : ""}₹{value.toLocaleString()}
      </span>
    </div>
  );
}

export default function BookingSidebar({
  roomName,
  nights,
  roomCost,
  couponSavings,
  totalAmount,
  isEstimate,
  quoteLoading,
  canContinue,
  submitting,
  onContinue,
}: BookingSidebarProps) {
  const [breakdownOpen, setBreakdownOpen] = useState(true);

  return (
    <div className="rounded-[24px] border border-[#E2E8F0] bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
      <p className="text-sm font-bold text-[#0F172A]">Booking Summary</p>
      <p className="mt-1 text-xs text-[#64748B]">
        {roomName} · {nights} night{nights > 1 ? "s" : ""}
      </p>

      <button
        type="button"
        onClick={() => setBreakdownOpen((v) => !v)}
        className="mt-3 flex w-full items-center justify-between text-xs font-semibold text-[#2563EB]"
      >
        Price Breakdown
        <ChevronDown size={14} className={breakdownOpen ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>

      <div
        className={
          "grid transition-[grid-template-rows] duration-300 ease-out " +
          (breakdownOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")
        }
      >
        <div className="overflow-hidden">
          <div className="mt-2 flex flex-col gap-1.5 border-b border-[#E2E8F0] pb-3">
            <Row label={`Room Cost (${nights} night${nights > 1 ? "s" : ""})`} value={roomCost} />
            <Row label="Coupon Savings" value={couponSavings} isDiscount />
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-lg font-extrabold text-[#0F172A]">
        <span>Total Amount</span>
        <span>{quoteLoading ? "…" : `₹${totalAmount.toLocaleString()}`}</span>
      </div>
      {isEstimate && (
        <p className="mt-1 text-xs text-[#94A3B8]">Estimated — taxes and fees are confirmed after sign-in.</p>
      )}

      {couponSavings > 0 && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#ECFDF5] px-3.5 py-2.5 text-sm font-bold text-[#16A34A]">
          <Sparkles size={15} />
          You Saved ₹{couponSavings.toLocaleString()} with Bokko
        </div>
      )}

      <button
        type="button"
        disabled={!canContinue || submitting}
        onClick={onContinue}
        className="cta-gradient mt-4 flex h-12 w-full items-center justify-center rounded-xl text-sm font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Processing..." : "Continue To Payment"}
      </button>
      {!canContinue && !submitting && (
        <p className="mt-2 text-center text-xs text-[#94A3B8]">Fill guest details and select a payment method to continue.</p>
      )}
    </div>
  );
}
