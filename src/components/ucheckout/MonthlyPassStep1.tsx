import { CheckCircle2, Minus, Plus } from "lucide-react";
import type { MonthlyPassCheckoutState } from "../../data/universalCheckout";
import { billingTierMultipliers } from "../../data/universalCheckout";

interface Props {
  booking: MonthlyPassCheckoutState;
  selectedMembershipKey: string;
  onMembershipChange: (key: string) => void;
  billingKey: "monthly" | "quarterly" | "yearly";
  onBillingChange: (key: "monthly" | "quarterly" | "yearly") => void;
  seats: number;
  onSeatsChange: (n: number) => void;
}

const billingOptions: { key: "monthly" | "quarterly" | "yearly"; label: string; badge?: string }[] = [
  { key: "monthly", label: "Monthly" },
  { key: "quarterly", label: "Quarterly", badge: "Save 10%" },
  { key: "yearly", label: "Yearly", badge: "Save 20%" },
];

export default function MonthlyPassStep1({
  booking, selectedMembershipKey, onMembershipChange,
  billingKey, onBillingChange, seats, onSeatsChange,
}: Props) {
  const selectedType = booking.membershipTypes.find((t) => t.key === selectedMembershipKey) ?? booking.membershipTypes[0];
  const multiplier = billingTierMultipliers[billingKey] ?? 1;
  const unitPrice = selectedType?.price ?? 0;
  const periodTotal = Math.round(unitPrice * multiplier * seats);

  return (
    <div className="flex flex-col gap-8">
      {/* Membership Type */}
      <div>
        <h3 className="text-base font-bold text-[#0F172A]">Choose Membership Type</h3>
        <p className="mt-0.5 text-sm text-[#64748B]">Select the workspace type that fits your work style</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {booking.membershipTypes.map((type) => {
            const selected = type.key === selectedMembershipKey;
            return (
              <button key={type.key} type="button" onClick={() => onMembershipChange(type.key)}
                className={"relative flex flex-col gap-1.5 rounded-2xl border-2 p-4 text-left transition-all " +
                  (selected ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E2E8F0] bg-white hover:border-[#94A3B8]")}>
                {selected && (
                  <CheckCircle2 size={16} className="absolute right-3 top-3 text-[#2563EB]" />
                )}
                <p className={"text-sm font-bold " + (selected ? "text-[#2563EB]" : "text-[#0F172A]")}>{type.name}</p>
                <p className="text-xl font-extrabold text-[#0F172A]">₹{type.price.toLocaleString()}<span className="text-xs font-medium text-[#94A3B8]">/seat/mo</span></p>
                <div className="mt-2 flex flex-col gap-1 text-xs text-[#475569]">
                  <span>⏰ {type.accessHours}</span>
                  <span>📅 {type.meetingRoomCredits}</span>
                  <span>👤 {type.guestsAllowed}</span>
                  <span>🗄️ {type.storage}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Seats */}
      <div>
        <h3 className="text-base font-bold text-[#0F172A]">Number of Seats</h3>
        <div className="mt-3 flex items-center gap-4">
          <button type="button" onClick={() => onSeatsChange(Math.max(1, seats - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E2E8F0] text-[#334155] hover:border-[#2563EB] hover:text-[#2563EB]">
            <Minus size={16} />
          </button>
          <span className="w-10 text-center text-2xl font-extrabold text-[#0F172A]">{seats}</span>
          <button type="button" onClick={() => onSeatsChange(Math.min(50, seats + 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E2E8F0] text-[#334155] hover:border-[#2563EB] hover:text-[#2563EB]">
            <Plus size={16} />
          </button>
          <span className="text-sm text-[#64748B]">seats</span>
        </div>
      </div>

      {/* Billing Cycle */}
      <div>
        <h3 className="text-base font-bold text-[#0F172A]">Billing Cycle</h3>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {billingOptions.map(({ key, label, badge }) => {
            const selected = key === billingKey;
            return (
              <button key={key} type="button" onClick={() => onBillingChange(key)}
                className={"relative flex flex-col items-center gap-1 rounded-2xl border-2 px-3 py-3 transition-all " +
                  (selected ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E2E8F0] bg-white hover:border-[#94A3B8]")}>
                {badge && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[#16A34A] px-2 py-0.5 text-[10px] font-bold text-white">
                    {badge}
                  </span>
                )}
                <span className={"text-sm font-bold " + (selected ? "text-[#2563EB]" : "text-[#0F172A]")}>{label}</span>
                <span className="text-[11px] text-[#64748B]">
                  ₹{Math.round(unitPrice * (billingTierMultipliers[key] ?? 1)).toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price summary */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#334155]">{selectedType?.name} × {seats} seat{seats > 1 ? "s" : ""}</p>
            <p className="text-xs text-[#64748B]">{billingKey.charAt(0).toUpperCase() + billingKey.slice(1)} billing</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold text-[#0F172A]">₹{periodTotal.toLocaleString()}</p>
            <p className="text-xs text-[#94A3B8]">+ taxes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
