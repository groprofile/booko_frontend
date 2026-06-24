import { Check } from "lucide-react";
import type { UniversalCheckoutState } from "../../data/universalCheckout";
import { universalPaymentMethods } from "../../data/universalCheckout";

interface ReviewStepProps {
  booking: UniversalCheckoutState;
  guestInfo: Record<string, string>;
  addOnLabels: string[];
  paymentMethod: string | null;
  onSelectPayment: (key: string) => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-[#E2E8F0] pb-2">
      <h2 className="text-base font-extrabold uppercase tracking-wider text-[#0F172A]">{children}</h2>
      <div className="mt-1 h-0.5 w-8 rounded-full bg-[#2563EB]" />
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-sm text-[#64748B]">{label}</span>
      <span className="text-right text-sm font-semibold text-[#0F172A]">{value}</span>
    </div>
  );
}

export default function ReviewStep({ booking, guestInfo, addOnLabels, paymentMethod, onSelectPayment }: ReviewStepProps) {
  const paymentIcons: Record<string, string> = {
    upi: "📱", card: "💳", netbanking: "🏦", wallet: "👛", emi: "📅", corporate: "🏢",
  };

  function bookingRows(): { label: string; value: string }[] {
    if (booking.productType === "day-pass") {
      return [
        { label: "Workspace", value: booking.workspaceName },
        { label: "Location", value: `${booking.locality}, ${booking.cityName}` },
        { label: "Date", value: booking.date },
        { label: "Pass Type", value: booking.passType },
        { label: "Members", value: `${booking.members}` },
      ];
    }
    if (booking.productType === "meeting-room") {
      const room = booking.siblingRoomTypes.find((r) => r.id === booking.selectedRoomId) ?? booking.siblingRoomTypes[0];
      const tier = room.pricing.find((t) => t.key === booking.selectedDurationKey) ?? room.pricing[0];
      return [
        { label: "Room", value: booking.roomName },
        { label: "Workspace", value: booking.workspaceName },
        { label: "Location", value: `${booking.locality}, ${booking.cityName}` },
        { label: "Date", value: booking.date },
        { label: "Time", value: booking.startTime },
        { label: "Duration", value: tier.label },
        { label: "Room Type", value: room.roomType },
        { label: "Attendees", value: `${booking.attendees}` },
      ];
    }
    if (booking.productType === "virtual-office") {
      const plan = booking.plans.find((p) => p.key === booking.selectedPlanKey) ?? booking.plans[0];
      return [
        { label: "Centre", value: booking.centerName },
        { label: "Location", value: `${booking.area}, ${booking.cityName}` },
        { label: "Business Address", value: booking.address },
        { label: "Plan", value: plan.name },
        { label: "Billing", value: booking.billingKey.charAt(0).toUpperCase() + booking.billingKey.slice(1) },
        { label: "GST Eligible", value: booking.gstEligible ? "Yes" : "No" },
      ];
    }
    return [];
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Booking Summary */}
      <section className="flex flex-col gap-4">
        <SectionLabel>Booking Summary</SectionLabel>
        <div className="divide-y divide-[#F1F5F9] rounded-2xl border border-[#E2E8F0] bg-white px-4">
          {bookingRows().map(({ label, value }) => (
            <ReviewRow key={label} label={label} value={value} />
          ))}
        </div>
      </section>

      {/* Guest / Company Info */}
      <section className="flex flex-col gap-4">
        <SectionLabel>
          {booking.productType === "virtual-office" ? "Company Information" : "Guest Information"}
        </SectionLabel>
        <div className="divide-y divide-[#F1F5F9] rounded-2xl border border-[#E2E8F0] bg-white px-4">
          {Object.entries(guestInfo).filter(([, v]) => v).map(([label, value]) => (
            <ReviewRow key={label} label={label} value={value} />
          ))}
        </div>
      </section>

      {/* Add-ons */}
      {addOnLabels.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionLabel>Selected Add-ons</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {addOnLabels.map((label) => (
              <span key={label} className="flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-3 py-1 text-sm font-semibold text-[#2563EB]">
                <Check size={12} />
                {label}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Payment Methods */}
      <section className="flex flex-col gap-4">
        <SectionLabel>Payment Method</SectionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {universalPaymentMethods.map((method) => {
            const selected = paymentMethod === method.key;
            return (
              <button key={method.key} type="button" onClick={() => onSelectPayment(method.key)}
                className={
                  "flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all " +
                  (selected ? "border-[#2563EB] bg-[#EFF6FF] shadow-sm" : "border-[#E2E8F0] bg-white hover:border-[#94A3B8]")
                }>
                <span className="text-xl">{paymentIcons[method.key]}</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#0F172A]">{method.label}</p>
                  <p className="text-[11px] text-[#94A3B8]">{method.description}</p>
                </div>
                {selected && (
                  <div className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2563EB]">
                    <Check size={11} className="text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* AI Recommendation */}
      <section className="rounded-2xl border border-[#E2E8F0] bg-[#FFFBEB] px-4 py-4">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#92400E]">💡 Bokko Recommends</p>
        <p className="text-sm text-[#78350F]">
          {booking.productType === "day-pass" && "Most day pass users also add a Locker and Tea/Coffee package for a comfortable workday."}
          {booking.productType === "meeting-room" && "Teams with 5+ attendees typically add Lunch and Reception Support for smoother meetings."}
          {booking.productType === "virtual-office" && "New businesses using virtual offices find GST Registration + Mail Handling essential for compliance."}
        </p>
      </section>
    </div>
  );
}
