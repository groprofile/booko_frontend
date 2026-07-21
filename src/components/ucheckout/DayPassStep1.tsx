import { CheckCircle2, Zap } from "lucide-react";
import type { DayPassCheckoutState } from "../../data/universalCheckout";
import { dayPassAddOns } from "../../data/universalCheckout";

interface DayPassStep1Props {
  booking: DayPassCheckoutState;
  date: string;
  onDateChange: (v: string) => void;
  passType: string;
  onPassTypeChange: (v: string) => void;
  members: number;
  onMembersChange: (v: number) => void;
  addOnKeys: string[];
  onToggleAddOn: (key: string) => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-[#E2E8F0] pb-2">
      <h2 className="text-base font-extrabold uppercase tracking-wider text-[#0F172A]">{children}</h2>
      <div className="mt-1 h-0.5 w-8 rounded-full bg-[#2563EB]" />
    </div>
  );
}

export default function DayPassStep1({
  booking, date, onDateChange, passType, onPassTypeChange, members, onMembersChange, addOnKeys, onToggleAddOn,
}: DayPassStep1Props) {
  const selectedOption = booking.seatingOptions.find((o) => o.type === passType) ?? booking.seatingOptions[0];

  return (
    <div className="flex flex-col gap-8">
      {/* Workspace Information */}
      <section className="flex flex-col gap-4">
        <SectionLabel>Workspace Information</SectionLabel>
        <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
          <img src={booking.image} alt={booking.workspaceName} className="h-44 w-full object-cover sm:h-56" />
          <div className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-lg font-extrabold text-[#0F172A]">{booking.workspaceName}</p>
                <p className="text-sm text-[#64748B]">{booking.locality} · {booking.cityName}</p>
              </div>
              <span className="rounded-xl bg-[#EFF6FF] px-3 py-1 text-xs font-bold text-[#2563EB]">{booking.spaceType}</span>
            </div>
            <div className="mt-3 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < Math.round(booking.rating) ? "text-[#F59E0B]" : "text-[#E2E8F0]"}>★</span>
              ))}
              <span className="ml-1.5 text-xs font-semibold text-[#64748B]">{booking.rating} ({booking.reviews} reviews)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Configuration */}
      <section className="flex flex-col gap-4">
        <SectionLabel>Booking Details</SectionLabel>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="h-11 rounded-xl border border-[#D1D5DB] px-3 text-sm font-medium text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Members</span>
            <select
              value={members}
              onChange={(e) => onMembersChange(Number(e.target.value))}
              className="h-11 rounded-xl border border-[#D1D5DB] bg-white px-3 text-sm font-medium text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
            >
              {[1, 2, 3, 4, 5, 10].map((v) => (
                <option key={v} value={v}>{v} {v === 1 ? "Member" : "Members"}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Seating Type</span>
            <select
              value={passType}
              onChange={(e) => onPassTypeChange(e.target.value)}
              className="h-11 rounded-xl border border-[#D1D5DB] bg-white px-3 text-sm font-medium text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
            >
              {booking.seatingOptions.map((o) => (
                <option key={o.type} value={o.type}>{o.type}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Pass type cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {booking.seatingOptions.map((option) => {
            const selected = option.type === passType;
            return (
              <button
                key={option.type}
                type="button"
                onClick={() => onPassTypeChange(option.type)}
                className={
                  "flex flex-col rounded-2xl border p-4 text-left transition-all " +
                  (selected ? "border-[#2563EB] bg-[#EFF6FF] shadow-md" : "border-[#E2E8F0] bg-white hover:border-[#94A3B8]")
                }
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-[#0F172A]">{option.type}</p>
                  {selected && <CheckCircle2 size={16} className="shrink-0 text-[#2563EB]" />}
                </div>
                <p className="mt-1 text-[11px] text-[#64748B]">{option.description}</p>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-lg font-extrabold text-[#0F172A]">₹{option.bestPrice}</span>
                  <span className="text-xs text-[#94A3B8] line-through">₹{option.price}</span>
                  <span className="text-[11px] text-[#64748B]">/ person</span>
                </div>
                {option.availability && (
                  <span className="mt-2 text-[11px] font-semibold text-[#16A34A]">{option.availability}</span>
                )}
              </button>
            );
          })}
        </div>

        {selectedOption && (
          <div className="flex items-center gap-2 rounded-xl bg-[#FFF7ED] px-4 py-2.5">
            <Zap size={14} className="shrink-0 text-[#F59E0B]" />
            <p className="text-xs font-semibold text-[#92400E]">
              {members} × ₹{selectedOption.price} = <span className="text-[#0F172A]">₹{(selectedOption.price * members).toLocaleString()}</span>
            </p>
          </div>
        )}
      </section>

      {/* Add-ons */}
      <section className="flex flex-col gap-4">
        <SectionLabel>Add-ons</SectionLabel>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {dayPassAddOns.map((addon) => {
            const selected = addOnKeys.includes(addon.key);
            return (
              <button
                key={addon.key}
                type="button"
                onClick={() => onToggleAddOn(addon.key)}
                className={
                  "flex flex-col rounded-2xl border p-4 text-left transition-all " +
                  (selected ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E2E8F0] bg-white hover:border-[#94A3B8]")
                }
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm font-bold text-[#0F172A]">{addon.label}</p>
                  {selected && <CheckCircle2 size={14} className="shrink-0 text-[#2563EB]" />}
                </div>
                <p className="mt-0.5 text-[11px] text-[#64748B]">{addon.description}</p>
                <p className="mt-2 text-sm font-extrabold text-[#2563EB]">+₹{addon.price}</p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
