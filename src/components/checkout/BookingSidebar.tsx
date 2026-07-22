import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface BookingSidebarProps {
  roomName: string;
  nights: number;
  centerPrice: number;
  commission: number;
  gst: number;
  totalAmount: number;
  discount?: number;
  couponCode?: string | null;
  isEstimate: boolean;
  quoteLoading: boolean;
  canContinue: boolean;
  submitting: boolean;
  onContinue: () => void;
}

function Row({ label, value, muted = false }: { label: string; value: number; muted?: boolean }) {
  if (value === 0) return null;
  return (
    <div className={"flex items-center justify-between text-sm " + (muted ? "text-[#94A3B8]" : "text-[#64748B]")}>
      <span>{label}</span>
      <span className={muted ? "" : "font-medium text-[#0F172A]"}>₹{value.toLocaleString()}</span>
    </div>
  );
}

export default function BookingSidebar({
  roomName,
  nights,
  centerPrice,
  commission,
  gst,
  totalAmount,
  discount = 0,
  couponCode,
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
            <Row label={`Centre price (${nights} night${nights > 1 ? "s" : ""})`} value={centerPrice} />
            <Row label="Bokko commission" value={commission} />
            <Row label="GST" value={gst} muted />
          </div>
        </div>
      </div>

      {discount > 0 && (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-[#F0FDF4] px-3 py-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#15803D]">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-bold text-[#15803D]">
              OFFER
            </span>
            {couponCode ? `"${couponCode}" applied` : "applied automatically"}
          </span>
          <span className="text-sm font-bold text-[#16A34A]">− ₹{discount.toLocaleString()}</span>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-lg font-extrabold text-[#0F172A]">
        <span>Total Amount</span>
        <span>{quoteLoading ? "…" : `₹${totalAmount.toLocaleString()}`}</span>
      </div>
      {discount > 0 && (
        <div className="mt-2 rounded-lg bg-[#16A34A] px-3 py-1.5 text-center text-xs font-bold text-white">
          🎉 You saved ₹{discount.toLocaleString()} on this booking
        </div>
      )}
      <p className="mt-1 text-xs text-[#94A3B8]">
        {isEstimate ? "Estimated — commission & GST are confirmed after sign-in." : "Inclusive of all taxes. No hidden charges."}
      </p>

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
