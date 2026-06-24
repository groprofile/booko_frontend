import { BedDouble, CalendarDays, MapPin, ShieldCheck, Star, Users } from "lucide-react";
import type { CheckoutBookingState } from "../../data/checkoutConfig";
import { starRatingForCategory } from "../../data/checkoutConfig";

interface BookingSummaryCardProps {
  booking: CheckoutBookingState;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function BookingSummaryCard({ booking }: BookingSummaryCardProps) {
  const starRating = starRatingForCategory(booking.category);
  const isFreeCancellation = booking.cancellationPolicy.toLowerCase().includes("free");

  return (
    <div className="overflow-hidden rounded-[20px] border border-[#E2E8F0] bg-white">
      <div className="flex flex-col sm:flex-row">
        <div className="h-44 w-full shrink-0 overflow-hidden sm:h-auto sm:w-[220px]">
          <img src={booking.image} alt={booking.hotelName} className="h-full w-full object-cover" />
        </div>

        <div className="flex-1 p-5">
          <div className="flex flex-wrap items-center gap-1.5">
            {Array.from({ length: starRating }).map((_, i) => (
              <Star key={i} size={13} className="fill-[#FBBF24] text-[#FBBF24]" />
            ))}
            <span className="ml-1 text-xs font-semibold text-[#64748B]">{starRating} Star Property</span>
          </div>

          <h3 className="mt-1.5 text-lg font-bold text-[#0F172A] sm:text-xl">{booking.hotelName}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-[#64748B]">
            <MapPin size={14} />
            {booking.locality}, {booking.cityName}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-[#0F172A] px-2 py-1 text-[11px] font-bold text-white">
              <Star size={11} className="fill-[#FBBF24] text-[#FBBF24]" />
              {booking.guestRating.toFixed(1)}
            </span>
            <span className="text-xs text-[#64748B]">({booking.reviews.toLocaleString()} guest reviews)</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#E2E8F0] pt-4 sm:grid-cols-3">
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                <CalendarDays size={12} />
                Check-in
              </p>
              <p className="mt-0.5 text-sm font-bold text-[#0F172A]">{formatDate(booking.checkIn)}</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                <CalendarDays size={12} />
                Check-out
              </p>
              <p className="mt-0.5 text-sm font-bold text-[#0F172A]">{formatDate(booking.checkOut)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Duration</p>
              <p className="mt-0.5 text-sm font-bold text-[#0F172A]">{booking.stayLabel}</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                <Users size={12} />
                Guests
              </p>
              <p className="mt-0.5 text-sm font-bold text-[#0F172A]">{booking.guests} Guests</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                <BedDouble size={12} />
                Room
              </p>
              <p className="mt-0.5 text-sm font-bold text-[#0F172A]">
                {booking.roomCount} × {booking.roomName}
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                <ShieldCheck size={12} />
                Cancellation
              </p>
              <p className={"mt-0.5 text-sm font-bold " + (isFreeCancellation ? "text-[#16A34A]" : "text-[#0F172A]")}>
                {isFreeCancellation ? "Free Cancellation" : "Non-Refundable"}
              </p>
            </div>
          </div>

          <p className="mt-3 rounded-xl bg-[#F8FAFC] px-3 py-2 text-xs text-[#64748B]">{booking.cancellationPolicy}</p>
        </div>
      </div>
    </div>
  );
}
