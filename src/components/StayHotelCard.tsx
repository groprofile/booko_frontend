import { MapPin, ShieldCheck, Star, Zap } from "lucide-react";
import type { StayHotel } from "../data/stayYourWay";

interface StayHotelCardProps {
  hotel: StayHotel;
}

export default function StayHotelCard({ hotel }: StayHotelCardProps) {
  return (
    <div className="flex h-full w-[260px] shrink-0 flex-col overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-white transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)] lg:w-full">
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden">
        <img src={hotel.image} alt={hotel.name} className="h-full w-full object-cover" />

        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-[#2563EB] shadow-soft">
          <ShieldCheck size={11} />
          Bokko Verified
        </span>

        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-[#16A34A] shadow-soft">
          <Zap size={11} />
          Instant
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h4 className="line-clamp-1 text-base font-bold text-[#0F172A]">{hotel.name}</h4>

        <p className="mt-1.5 flex items-center gap-1.5 truncate text-xs text-[#64748B]">
          <MapPin size={13} className="shrink-0" />
          <span className="truncate">{hotel.location}</span>
        </p>

        <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#111111]">
          <Star size={13} className="fill-[#FBBF24] text-[#FBBF24]" />
          {hotel.rating.toFixed(1)}
        </span>

        <div className="mt-auto border-t border-[#E2E8F0] pt-3">
          <p className="text-base font-extrabold text-[#0F172A]">
            {hotel.price}
            <span className="text-xs font-semibold text-[#64748B]"> {hotel.priceUnit}</span>
          </p>

          <div className="mt-3 flex gap-2">
            <a
              href="#"
              className="flex-1 rounded-lg bg-[#111111] px-2 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-[#222222]"
            >
              Book Now
            </a>
            <a
              href="#"
              className="flex-1 rounded-lg border border-[#E2E8F0] px-2 py-2 text-center text-xs font-semibold text-[#334155] transition-colors hover:border-[#94A3B8]"
            >
              View Details
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
