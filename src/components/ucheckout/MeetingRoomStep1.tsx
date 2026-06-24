import { CheckCircle2 } from "lucide-react";
import type { MeetingRoomCheckoutState } from "../../data/universalCheckout";
import { meetingRoomCateringAddOns, meetingRequirementOptions } from "../../data/universalCheckout";

interface MeetingRoomStep1Props {
  booking: MeetingRoomCheckoutState;
  date: string; onDateChange: (v: string) => void;
  startTime: string; onStartTimeChange: (v: string) => void;
  selectedRoomId: string; onSelectRoom: (v: string) => void;
  selectedDurationKey: string; onSelectDuration: (v: string) => void;
  attendees: number; onAttendeesChange: (v: number) => void;
  requirements: string[]; onToggleRequirement: (v: string) => void;
  cateringKeys: string[]; onToggleCatering: (key: string) => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-[#E2E8F0] pb-2">
      <h2 className="text-base font-extrabold uppercase tracking-wider text-[#0F172A]">{children}</h2>
      <div className="mt-1 h-0.5 w-8 rounded-full bg-[#2563EB]" />
    </div>
  );
}

function addMinutes(time: string, hours: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + (m || 0) + Math.round(hours * 60);
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function parseDurationHours(label: string): number {
  const m = label.match(/(\d+(?:\.\d+)?)\s*hr/i) ?? label.match(/(\d+)\s*min/i);
  if (!m) return 1;
  return label.toLowerCase().includes("min") ? Number(m[1]) / 60 : Number(m[1]);
}

export default function MeetingRoomStep1({
  booking, date, onDateChange, startTime, onStartTimeChange,
  selectedRoomId, onSelectRoom, selectedDurationKey, onSelectDuration,
  attendees, onAttendeesChange, requirements, onToggleRequirement,
  cateringKeys, onToggleCatering,
}: MeetingRoomStep1Props) {
  const selectedRoom = booking.siblingRoomTypes.find((r) => r.id === selectedRoomId) ?? booking.siblingRoomTypes[0];
  const selectedTier = selectedRoom.pricing.find((t) => t.key === selectedDurationKey) ?? selectedRoom.pricing[0];
  const endTime = addMinutes(startTime || "09:00", parseDurationHours(selectedTier.label));

  return (
    <div className="flex flex-col gap-8">
      {/* Room Info */}
      <section className="flex flex-col gap-4">
        <SectionLabel>Meeting Room Details</SectionLabel>
        <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
          <img src={booking.image} alt={booking.workspaceName} className="h-44 w-full object-cover sm:h-52" />
          <div className="grid grid-cols-2 gap-px bg-[#E2E8F0] border-t border-[#E2E8F0]">
            {[
              { label: "Room", value: booking.roomName },
              { label: "Workspace", value: booking.workspaceName },
              { label: "Location", value: `${booking.locality}, ${booking.cityName}` },
              { label: "Rating", value: `⭐ ${booking.rating} (${booking.reviews} reviews)` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{label}</p>
                <p className="mt-0.5 text-sm font-semibold text-[#0F172A]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Config */}
      <section className="flex flex-col gap-4">
        <SectionLabel>Date & Time</SectionLabel>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Date</span>
            <input type="date" value={date} onChange={(e) => onDateChange(e.target.value)}
              className="h-11 rounded-xl border border-[#D1D5DB] px-3 text-sm font-medium text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Start Time</span>
            <input type="time" value={startTime} onChange={(e) => onStartTimeChange(e.target.value)}
              className="h-11 rounded-xl border border-[#D1D5DB] px-3 text-sm font-medium text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">End Time</span>
            <div className="flex h-11 items-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-sm font-semibold text-[#64748B]">
              {endTime}
            </div>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Attendees</span>
            <input type="number" min={1} max={selectedRoom.capacity} value={attendees}
              onChange={(e) => onAttendeesChange(Math.max(1, Math.min(selectedRoom.capacity, Number(e.target.value) || 1)))}
              className="h-11 rounded-xl border border-[#D1D5DB] px-3 text-sm font-medium text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15" />
          </label>
        </div>

        {/* Room type selector */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Room Type</span>
          <div className="flex flex-wrap gap-2">
            {booking.siblingRoomTypes.map((room) => {
              const sel = room.id === selectedRoomId;
              return (
                <button key={room.id} type="button" onClick={() => onSelectRoom(room.id)}
                  className={
                    "rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors " +
                    (sel ? "border-[#2563EB] bg-[#2563EB] text-white" : "border-[#E2E8F0] bg-white text-[#0F172A] hover:border-[#94A3B8]")
                  }>
                  {room.roomType} · {room.seatingCapacity}
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration pricing */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Duration</span>
          <div className="flex flex-wrap gap-2">
            {selectedRoom.pricing.map((tier) => {
              const sel = tier.key === selectedDurationKey;
              return (
                <button key={tier.key} type="button" onClick={() => onSelectDuration(tier.key)}
                  className={
                    "flex flex-col items-center rounded-xl border px-4 py-2.5 transition-colors " +
                    (sel ? "border-[#2563EB] bg-[#2563EB] text-white" : "border-[#E2E8F0] bg-white text-[#0F172A] hover:border-[#94A3B8]")
                  }>
                  <span className="text-sm font-extrabold">₹{tier.price.toLocaleString()}</span>
                  <span className={"text-[10px] " + (sel ? "text-white/80" : "text-[#64748B]")}>{tier.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Meeting Requirements */}
      <section className="flex flex-col gap-4">
        <SectionLabel>Meeting Requirements</SectionLabel>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {meetingRequirementOptions.map((req) => {
            const selected = requirements.includes(req);
            const included = booking.equipmentTech.includes(req);
            return (
              <button key={req} type="button" onClick={() => onToggleRequirement(req)}
                className={
                  "flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition-colors " +
                  (selected ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E2E8F0] bg-white hover:border-[#94A3B8]")
                }>
                <span className={selected ? "font-semibold text-[#2563EB]" : "font-medium text-[#0F172A]"}>{req}</span>
                {included ? (
                  <span className="ml-2 shrink-0 text-[10px] font-bold text-[#16A34A]">Included</span>
                ) : selected ? (
                  <CheckCircle2 size={14} className="shrink-0 text-[#2563EB]" />
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      {/* Catering Add-ons */}
      <section className="flex flex-col gap-4">
        <SectionLabel>Catering & Add-ons</SectionLabel>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {meetingRoomCateringAddOns.map((addon) => {
            const selected = cateringKeys.includes(addon.key);
            return (
              <button key={addon.key} type="button" onClick={() => onToggleCatering(addon.key)}
                className={
                  "flex flex-col rounded-2xl border p-4 text-left transition-all " +
                  (selected ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E2E8F0] bg-white hover:border-[#94A3B8]")
                }>
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
