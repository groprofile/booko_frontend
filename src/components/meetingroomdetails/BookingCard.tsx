import { useNavigate } from "react-router-dom";
import type { AddOn, SiblingRoom } from "../../data/meetingRoomDetails";
import type { MeetingRoomListing } from "../../data/meetingRoomListings";
import CenterOffersButton from "../offers/CenterOffersButton";

interface BookingCardProps {
  listing: MeetingRoomListing;
  citySlug: string;
  cityName: string;
  equipmentTech: string[];
  siblingRoomTypes: SiblingRoom[];
  addOns: AddOn[];
  selectedRoomId: string;
  onSelectRoom: (id: string) => void;
  date: string;
  onDateChange: (value: string) => void;
  startTime: string;
  onStartTimeChange: (value: string) => void;
  selectedDurationKey: string;
  onSelectDuration: (key: string) => void;
  attendees: number;
  onAttendeesChange: (value: number) => void;
  selectedAddOnKeys: string[];
  onToggleAddOn: (key: string) => void;
}

export default function BookingCard({
  listing,
  citySlug,
  cityName,
  equipmentTech,
  siblingRoomTypes,
  addOns,
  selectedRoomId,
  onSelectRoom,
  date,
  onDateChange,
  startTime,
  onStartTimeChange,
  selectedDurationKey,
  onSelectDuration,
  attendees,
  onAttendeesChange,
  selectedAddOnKeys,
  onToggleAddOn,
}: BookingCardProps) {
  const navigate = useNavigate();

  const selectedRoom = siblingRoomTypes.find((room) => room.id === selectedRoomId) ?? siblingRoomTypes[0];
  const selectedTier = selectedRoom.pricing.find((tier) => tier.key === selectedDurationKey) ?? selectedRoom.pricing[0];
  const addOnsTotal = addOns
    .filter((addOn) => selectedAddOnKeys.includes(addOn.key))
    .reduce((sum, addOn) => sum + addOn.price, 0);
  const total = selectedTier.price + addOnsTotal;

  function goToCheckout() {
    navigate("/checkout", {
      state: {
        productType: "meeting-room",
        listingId: listing.id,
        roomName: listing.name,
        workspaceName: listing.workspaceName,
        citySlug,
        cityName,
        locality: listing.locality,
        image: listing.images[0],
        rating: ((listing as unknown) as Record<string, number>)["rating"] ?? 4.5,
        reviews: ((listing as unknown) as Record<string, number>)["reviews"] ?? 0,
        date,
        startTime,
        selectedRoomId,
        selectedDurationKey,
        attendees,
        selectedAddOnKeys,
        siblingRoomTypes,
        addOns,
        equipmentTech,
      },
    });
  }

  return (
    <div className="rounded-sm border border-white/60 bg-white/85 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl ring-1 ring-[#2563EB]/5">
      <p className="text-sm font-bold text-[#0F172A]">Book {selectedRoom.roomType}</p>

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Date</span>
          <input
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            className="h-10 rounded-sm border border-[#D1D5DB] px-2.5 text-sm font-medium text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Start Time</span>
          <input
            type="time"
            value={startTime}
            onChange={(event) => onStartTimeChange(event.target.value)}
            className="h-10 rounded-sm border border-[#D1D5DB] px-2.5 text-sm font-medium text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
          />
        </label>
        <label className="col-span-2 flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Attendees</span>
          <input
            type="number"
            min={1}
            max={selectedRoom.capacity}
            value={attendees}
            onChange={(event) => onAttendeesChange(Math.max(1, Number(event.target.value) || 1))}
            className="h-10 rounded-sm border border-[#D1D5DB] px-2.5 text-sm font-medium text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
          />
        </label>
        <label className="col-span-2 flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Meeting Room Type</span>
          <select
            value={selectedRoomId}
            onChange={(event) => onSelectRoom(event.target.value)}
            className="h-10 rounded-sm border border-[#D1D5DB] bg-white px-2.5 text-sm font-medium text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
          >
            {siblingRoomTypes.map((room) => (
              <option key={room.id} value={room.id}>
                {room.roomType} ({room.seatingCapacity})
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4">
        <CenterOffersButton vertical="meeting-room" centerId={listing.id} centerName={listing.workspaceName} />
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Duration</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {selectedRoom.pricing.map((tier) => {
          const sel = tier.key === selectedDurationKey;
          return (
            <button
              key={tier.key}
              type="button"
              onClick={() => onSelectDuration(tier.key)}
              className={
                "flex min-w-[76px] flex-col items-center rounded-sm border px-3 py-2 transition-colors " +
                (sel ? "border-[#2563EB] bg-[#2563EB] text-white" : "border-[#E2E8F0] bg-white text-[#0F172A] hover:border-[#94A3B8]")
              }
            >
              <span className="text-sm font-extrabold">₹{tier.price.toLocaleString()}</span>
              <span className={"text-[10px] font-medium " + (sel ? "text-white/80" : "text-[#64748B]")}>{tier.label}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Add-ons</p>
      <div className="mt-2 flex flex-col gap-1.5">
        {addOns.map((addOn) => (
          <label key={addOn.key} className="flex cursor-pointer items-center justify-between gap-2 rounded-sm border border-[#E2E8F0] px-3 py-2 text-sm">
            <span className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedAddOnKeys.includes(addOn.key)}
                onChange={() => onToggleAddOn(addOn.key)}
                className="h-4 w-4 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
              />
              {addOn.label}
            </span>
            <span className="text-xs font-semibold text-[#64748B]">+₹{addOn.price}</span>
          </label>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-1 border-t border-[#E2E8F0] pt-4">
        <div className="flex items-center justify-between text-sm text-[#64748B]">
          <span>Room ({selectedTier.label})</span>
          <span>₹{selectedTier.price.toLocaleString()}</span>
        </div>
        {addOnsTotal > 0 && (
          <div className="flex items-center justify-between text-sm text-[#64748B]">
            <span>Add-ons</span>
            <span>+₹{addOnsTotal.toLocaleString()}</span>
          </div>
        )}
        <div className="mt-1.5 flex items-center justify-between border-t border-[#E2E8F0] pt-2 text-base font-extrabold text-[#0F172A]">
          <span>Total Amount</span>
          <span>₹{total.toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <button type="button" onClick={goToCheckout}
          className="cta-gradient w-full rounded-sm py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(37,99,235,0.28)] transition-all hover:brightness-[1.06]">
          Book Now
        </button>
        <button type="button" onClick={goToCheckout}
          className="w-full rounded-sm border border-[#2563EB] py-3.5 text-sm font-bold text-[#2563EB] transition-colors hover:bg-[#EFF6FF]">
          Reserve Instantly
        </button>
        <button type="button" onClick={goToCheckout}
          className="w-full rounded-sm border border-[#E2E8F0] py-3.5 text-sm font-bold text-[#334155] transition-colors hover:border-[#94A3B8]">
          Get Corporate Quote
        </button>
      </div>
    </div>
  );
}
