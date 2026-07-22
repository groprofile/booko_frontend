import { useState } from "react";
import { ChevronDown, CheckCircle2, Shield, Clock, Star, FileText, Headphones } from "lucide-react";

interface PriceRow {
  label: string;
  value: number;
  muted?: boolean;
}

interface UniversalSidebarProps {
  productLabel: string;
  workspaceName: string;
  cityName: string;
  bookingMeta: string;
  image: string;
  /** Vendor centre price (base) in rupees. */
  centerPrice: number;
  /** Bokko commission in rupees — only shown when > 0 (backend-provided). */
  commission: number;
  /** GST in rupees — only shown when > 0 (backend-provided). */
  gst: number;
  /** Authoritative total the user is charged (centre price + commission + GST − discount). */
  totalAmount: number;
  /** Auto-applied offer discount in rupees — only shown when > 0. */
  discount?: number;
  /** Code of the auto-applied offer, for display. */
  couponCode?: string | null;
  /** True while the backend quote is being fetched. */
  priceLoading?: boolean;
  canProceed: boolean;
  submitting: boolean;
  ctaLabel: string;
  onProceed: () => void;
  currentStep: number;
}

export default function UniversalSidebar({
  productLabel, workspaceName, cityName, bookingMeta, image,
  centerPrice, commission, gst, totalAmount, discount = 0, couponCode, priceLoading,
  canProceed, submitting, ctaLabel, onProceed, currentStep,
}: UniversalSidebarProps) {
  const [breakdownOpen, setBreakdownOpen] = useState(true);

  const rows: PriceRow[] = [
    { label: "Centre price", value: centerPrice },
    ...(commission > 0 ? [{ label: "Bokko commission", value: commission }] : []),
    ...(gst > 0 ? [{ label: "GST", value: gst, muted: true }] : []),
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

        <div
          className={
            "grid transition-[grid-template-rows] duration-300 ease-out " +
            (breakdownOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")
          }
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-2 border-t border-[#E2E8F0] px-4 py-3">
              {rows.map((row) => (
                <div key={row.label} className="flex items-center justify-between text-sm">
                  <span className={row.muted ? "text-[#94A3B8]" : "text-[#64748B]"}>{row.label}</span>
                  <span className={row.muted ? "text-[#94A3B8]" : "font-medium text-[#0F172A]"}>
                    ₹{row.value.toLocaleString()}
                  </span>
                </div>
              ))}

              {discount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-[#15803D]">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-bold text-[#15803D]">
                      OFFER
                    </span>
                    {couponCode ? `"${couponCode}" applied` : "applied"}
                  </span>
                  <span className="font-semibold text-[#16A34A]">− ₹{discount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-3 text-base font-extrabold text-[#0F172A]">
                <span>Total Payable</span>
                <span>{priceLoading ? "…" : `₹${totalAmount.toLocaleString()}`}</span>
              </div>
              {discount > 0 && (
                <div className="rounded-lg bg-[#16A34A] px-3 py-1.5 text-center text-xs font-bold text-white">
                  🎉 You saved ₹{discount.toLocaleString()} on this booking
                </div>
              )}
              <p className="text-[11px] text-[#94A3B8]">Inclusive of all taxes. No hidden charges.</p>
            </div>
          </div>
        </div>
      </div>

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
