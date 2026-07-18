import { Link } from "react-router-dom";
import { Heart, MapPin, Star } from "lucide-react";
import RecommendedBadge from "./RecommendedBadge";

export interface RecommendedSpaceCardData {
  id: string;
  title: string;
  location: string;
  image: string;
  rating: number;
  reviews: number;
  price: number;
  priceUnit: string;
  href: string;
  // True when the center is admin-promoted. Only then do we show the
  // "Bokko Recommended" badge — otherwise the badge would be meaningless.
  isFeatured?: boolean;
}

interface RecommendedSpaceCardProps {
  space: RecommendedSpaceCardData;
}

export default function RecommendedSpaceCard({ space }: RecommendedSpaceCardProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg">
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden">
        <img src={space.image} alt={space.title} className="h-full w-full object-cover" />

        {space.isFeatured && <RecommendedBadge className="absolute left-3 top-3" />}

        <button
          type="button"
          aria-label="Add to wishlist"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#64748B] shadow-soft transition-colors hover:text-[#EF4444]"
        >
          <Heart size={16} />
        </button>

        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-[#0F172A]/90 px-2.5 py-1 text-[11px] font-semibold text-white">
          <Star size={12} className="fill-[#FBBF24] text-[#FBBF24]" />
          {space.rating.toFixed(1)}
          {space.reviews > 0 && <span className="font-normal text-white/70">({space.reviews})</span>}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 min-h-[56px] text-xl font-bold leading-snug text-[#0F172A]">
          {space.title}
        </h3>

        <p className="mt-2 flex items-center gap-1.5 truncate text-sm text-[#64748B]">
          <MapPin size={14} className="shrink-0" />
          <span className="truncate">{space.location}</span>
        </p>

        <div className="mt-auto border-t border-[#E2E8F0] pt-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">
            Starting from
          </p>
          <p className="text-lg font-extrabold text-[#0F172A]">
            ₹{space.price.toLocaleString()}
            <span className="text-sm font-semibold text-[#64748B]">{space.priceUnit}</span>
          </p>

          <div className="mt-3 flex gap-2">
            <Link
              to={space.href}
              className="flex-1 rounded-lg bg-[#111111] px-3 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[#222222]"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
