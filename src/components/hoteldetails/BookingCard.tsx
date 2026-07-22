import { useNavigate } from "react-router-dom";
import type { HotelDetails, RoomOption } from "../../data/hotelDetails";
import type { HotelListing } from "../../data/hotelListings";
import CenterOffersButton from "../offers/CenterOffersButton";

interface BookingCardProps {
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

export default function BookingCard({
  listing,
  citySlug,
  cityName,
  details,
  selectedRoom,
  checkIn,
  onCheckInChange,
  checkOut,
  onCheckOutChange,
  guests,
  onGuestsChange,
  roomCount,
  onRoomCountChange,
  selectedStayKey,
  onSelectStay,
  selectedMealKey,
  onSelectMeal,
}: BookingCardProps) {
  const navigate = useNavigate();

  const selectedStay = selectedRoom.pricing.find((tier) => tier.key === selectedStayKey) ?? selectedRoom.pricing[0];
  const selectedMeal = details.mealOptions.find((meal) => meal.key === selectedMealKey) ?? details.mealOptions[0];
  const subtotal = (selectedStay.price + selectedMeal.priceDelta) * roomCount;

  function navigateToCheckout() {
    navigate("/checkout", {
      state: {
        productType: "hotel",
        hotelId: listing.id,
        hotelName: listing.name,
        chain: listing.chain,
        citySlug,
        cityName,
        locality: listing.locality,
        image: listing.images[0],
        category: listing.category,
        guestRating: listing.rating,
        reviews: listing.reviews,
        roomName: selectedRoom.name,
        roomId: selectedRoom.id,
        stayLabel: selectedStay.label,
        stayPrice: selectedStay.price,
        checkIn,
        checkOut,
        guests,
        roomCount,
        cancellationPolicy: selectedRoom.cancellationPolicy,
        coupons: [],
      },
    });
  }

  return (
    <div className="rounded-sm border border-border bg-card p-4">
      <p className="text-sm font-bold text-[#0F172A]">Book {selectedRoom.name}</p>

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Check In</span>
          <input
            type="date"
            value={checkIn}
            onChange={(event) => onCheckInChange(event.target.value)}
            className="h-10 rounded-sm border border-[#D1D5DB] px-2.5 text-sm font-medium text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Check Out</span>
          <input
            type="date"
            value={checkOut}
            onChange={(event) => onCheckOutChange(event.target.value)}
            className="h-10 rounded-sm border border-[#D1D5DB] px-2.5 text-sm font-medium text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Guests</span>
          <select
            value={guests}
            onChange={(event) => onGuestsChange(Number(event.target.value))}
            className="h-10 rounded-sm border border-[#D1D5DB] bg-white px-2.5 text-sm font-medium text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "Guest" : "Guests"}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">Rooms</span>
          <select
            value={roomCount}
            onChange={(event) => onRoomCountChange(Number(event.target.value))}
            className="h-10 rounded-sm border border-[#D1D5DB] bg-white px-2.5 text-sm font-medium text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
          >
            {[1, 2, 3].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "Room" : "Rooms"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Stay Options</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {selectedRoom.pricing.map((tier) => {
          const selected = tier.key === selectedStayKey;
          if (!tier.available) {
            return (
              <span
                key={tier.key}
                className="flex min-w-[80px] flex-col items-center rounded-sm border border-[#E2E8F0] px-3 py-2 text-[#CBD5E1]"
              >
                <span className="text-xs font-bold">N/A</span>
                <span className="text-[10px] font-medium">{tier.label}</span>
              </span>
            );
          }
          return (
            <button
              key={tier.key}
              type="button"
              onClick={() => onSelectStay(tier.key)}
              className={
                "flex min-w-[80px] flex-col items-center rounded-sm border px-3 py-2 transition-colors " +
                (selected ? "border-[#2563EB] bg-[#2563EB] text-white" : "border-[#E2E8F0] bg-white text-[#0F172A] hover:border-[#94A3B8]")
              }
            >
              <span className="text-sm font-extrabold">₹{tier.price.toLocaleString()}</span>
              <span className={"text-[10px] font-medium " + (selected ? "text-white/80" : "text-[#64748B]")}>{tier.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <CenterOffersButton vertical="hotel" centerId={listing.id} centerName={listing.name} />
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Meal Options</p>
      <div className="mt-2 flex flex-col gap-1.5">
        {details.mealOptions.map((meal) => (
          <label key={meal.key} className="flex cursor-pointer items-center justify-between gap-2 rounded-sm border border-[#E2E8F0] px-3 py-2 text-sm">
            <span className="flex items-center gap-2">
              <input
                type="radio"
                name="meal-option"
                checked={selectedMealKey === meal.key}
                onChange={() => onSelectMeal(meal.key)}
                className="h-4 w-4 border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
              />
              {meal.label}
            </span>
            <span className="text-xs font-semibold text-[#64748B]">
              {meal.priceDelta > 0 ? `+₹${meal.priceDelta}` : "Free"}
            </span>
          </label>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-1 border-t border-[#E2E8F0] pt-4">
        <div className="flex items-center justify-between text-sm text-[#64748B]">
          <span>Subtotal ({roomCount} {roomCount === 1 ? "room" : "rooms"})</span>
          <span>₹{subtotal.toLocaleString()}</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between border-t border-[#E2E8F0] pt-2 text-base font-extrabold text-[#0F172A]">
          <span>Total Amount</span>
          <span>₹{subtotal.toLocaleString()}</span>
        </div>
        <p className="text-[11px] text-[#94A3B8]">Bokko commission &amp; GST are confirmed at checkout.</p>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => navigateToCheckout()}
          className="cta-gradient w-full rounded-sm py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(37,99,235,0.28)] transition-all hover:brightness-[1.06]"
        >
          Reserve Now
        </button>
        <button
          type="button"
          onClick={() => navigateToCheckout()}
          className="w-full rounded-sm border border-[#2563EB] py-3.5 text-sm font-bold text-[#2563EB] transition-colors hover:bg-[#EFF6FF]"
        >
          Book Instantly · Pay at Hotel
        </button>
      </div>
    </div>
  );
}
