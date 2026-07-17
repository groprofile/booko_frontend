import { Check, Lightbulb, ShieldCheck } from "lucide-react";
import type { UniversalCheckoutState } from "../../data/universalCheckout";

interface ReviewStepProps {
  booking: UniversalCheckoutState;
  guestInfo: Record<string, string>;
  addOnLabels: string[];
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

export default function ReviewStep({ booking, guestInfo, addOnLabels }: ReviewStepProps) {
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

      {/* Payment */}
      <section className="flex flex-col gap-4">
        <SectionLabel>Payment</SectionLabel>
        <div className="flex items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4">
          <ShieldCheck size={22} strokeWidth={1.75} className="mt-0.5 shrink-0 text-[#16A34A]" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#0F172A]">Secure payment via PayU</p>
            <p className="mt-0.5 text-[13px] leading-snug text-[#64748B]">
              Tap Confirm &amp; Pay to continue to PayU, where you can pay by UPI, card, net banking or wallet. Your booking is confirmed the moment payment succeeds.
            </p>
          </div>
        </div>
      </section>

      {/* AI Recommendation */}
      <section className="rounded-2xl border border-[#E2E8F0] bg-[#FFFBEB] px-4 py-4">
        <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#92400E]">
          <Lightbulb size={13} strokeWidth={2} />
          Bokko Recommends
        </p>
        <p className="text-sm text-[#78350F]">
          {booking.productType === "day-pass" && "Most day pass users also add a Locker and Tea/Coffee package for a comfortable workday."}
          {booking.productType === "meeting-room" && "Teams with 5+ attendees typically add Lunch and Reception Support for smoother meetings."}
          {booking.productType === "virtual-office" && "New businesses using virtual offices find GST Registration + Mail Handling essential for compliance."}
        </p>
      </section>
    </div>
  );
}
