import { useState } from "react";
import { Star } from "lucide-react";
import type { DayPassDetails } from "../../data/dayPassDetails";
import SectionLabel from "./SectionLabel";

interface ReviewsSectionProps {
  rating: number;
  reviews: number;
  brand: string;
  details: DayPassDetails;
}

export default function ReviewsSection({ rating, reviews, brand, details }: ReviewsSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleReviews = showAll ? details.reviews : details.reviews.slice(0, 2);

  return (
    <section>
      <SectionLabel title="Reviews & Ratings" />

      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1.5 text-3xl font-extrabold text-[#0F172A]">
          <Star size={26} className="fill-[#FBBF24] text-[#FBBF24]" />
          {rating.toFixed(2)}
        </span>
        <span className="text-sm text-[#64748B]">({reviews.toLocaleString()} Reviews)</span>
      </div>
      <p className="mt-1 text-sm text-[#94A3B8]">Average rating for all workspaces of {brand}</p>

      <div className="mt-4 flex flex-col gap-1.5">
        {details.ratingBreakdown.map((row) => (
          <div key={row.star} className="flex items-center gap-3 text-sm text-[#64748B]">
            <span className="flex w-8 shrink-0 items-center gap-1 font-semibold text-[#0F172A]">
              <Star size={13} className="fill-[#FBBF24] text-[#FBBF24]" />
              {row.star}
            </span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-[#F1F5F9]">
              <span
                className="block h-full rounded-full bg-[#2563EB]"
                style={{ width: `${row.percent}%` }}
              />
            </span>
            <span className="w-10 shrink-0 text-right font-semibold">{row.percent}%</span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {visibleReviews.map((review, index) => (
          <div key={`${review.name}-${index}`} className="rounded-[16px] border border-[#E2E8F0] bg-white p-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 font-bold text-[#0F172A]">
                <Star size={13} className="fill-[#FBBF24] text-[#FBBF24]" />
                {review.rating}
              </span>
              <span className="font-semibold text-[#334155]">{review.name}</span>
              <span className="text-[#94A3B8]">{review.date}</span>
              <span className="text-[#94A3B8]">|</span>
              <span className="text-[#94A3B8]">{review.tag}</span>
            </div>
            <p className="mt-2 text-sm text-[#64748B]">{review.comment}</p>
          </div>
        ))}
      </div>

      {!showAll && details.reviews.length > visibleReviews.length && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-4 text-sm font-semibold text-[#2563EB] hover:underline"
        >
          Read all reviews →
        </button>
      )}
    </section>
  );
}
