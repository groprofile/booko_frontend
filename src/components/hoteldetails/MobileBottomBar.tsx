import { useState } from "react";
import { X } from "lucide-react";
import type { HotelDetails, RoomOption } from "../../data/hotelDetails";
import type { HotelListing } from "../../data/hotelListings";
import BookingCard from "./BookingCard";

interface MobileBottomBarProps {
  listing: HotelListing;
  citySlug: string;
  cityName: string;
  details: HotelDetails;
  selectedRoom: RoomOption;
  checkIn: string;
  onCheckInChange: (value: string) => void;
  checkOut: string;
  onCheckOutChange: (value: string) => void;
  guests: number;
  onGuestsChange: (value: number) => void;
  roomCount: number;
  onRoomCountChange: (value: number) => void;
  selectedStayKey: string;
  onSelectStay: (key: string) => void;
  selectedMealKey: string;
  onSelectMeal: (key: string) => void;
}

export default function MobileBottomBar(props: MobileBottomBarProps) {
  const [open, setOpen] = useState(false);
  const { selectedRoom, selectedStayKey } = props;
  const selectedStay = selectedRoom.pricing.find((tier) => tier.key === selectedStayKey) ?? selectedRoom.pricing[0];

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-[#E2E8F0] bg-white px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] sm:hidden">
        <div>
          <p className="text-xs text-[#94A3B8]">
            {selectedRoom.name} · {selectedStay.label}
          </p>
          <p className="text-lg font-extrabold text-[#0F172A]">₹{selectedStay.price.toLocaleString()}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex-1 rounded-xl bg-[#111111] py-3 text-center text-sm font-bold text-white"
        >
          Book Now
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:hidden">
          <div aria-hidden="true" className="absolute inset-0 bg-[#0F172A]/55" onClick={() => setOpen(false)} />
          <div className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-[24px] bg-[#F8FAFC] p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="mx-auto h-1.5 w-10 rounded-full bg-[#E2E8F0]" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close booking panel"
                className="absolute right-4 top-3 flex h-9 w-9 items-center justify-center rounded-full text-[#64748B] hover:bg-white"
              >
                <X size={18} />
              </button>
            </div>
            <BookingCard {...props} />
          </div>
        </div>
      )}
    </>
  );
}
