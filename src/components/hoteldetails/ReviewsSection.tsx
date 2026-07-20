import { useState } from "react";
import { Sparkles, Star } from "lucide-react";
import type { HotelDetails } from "../../data/hotelDetails";
import SectionLabel from "./SectionLabel";

interface ReviewsSectionProps {
  rating: number;
  reviewCount: number;
  details: HotelDetails;
}

const travelerFilters = ["All", "Family", "Couples", "Business", "Solo", "Friends"];

export default function ReviewsSection({ rating, reviewCount, details }: ReviewsSectionProps) {
  const [filter, setFilter] = useState("All");
  const [showAll, setShowAll] = useState(false);

  const filteredReviews = details.reviews.filter((review) => filter === "All" || review.travelerType === filter);
  const visibleReviews = showAll ? filteredReviews : filteredReviews.slice(0, 3);

  return (
    <section className="m-0">
      <SectionLabel title="User Reviews" />

      <div className="flex flex-wrap items-center gap-4">
        <span className="flex items-center gap-2 text-4xl font-extrabold text-primary-text">
          <Star size={28} className="fill-yellow-400 text-yellow-400" />
          {rating.toFixed(1)}
        </span>
        <span className="text-sm text-secondary-text">({reviewCount.toLocaleString()} reviews)</span>
      </div>

      <div className="mt-6 flex flex-col gap-2.5">
        {details.ratingBreakdown.map((row) => (
          <div key={row.star} className="flex items-center gap-3 text-sm">
            <span className="flex w-8 shrink-0 items-center gap-1.5 font-semibold text-primary-text">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              {row.star}
            </span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-bg">
              <span className="block h-full rounded-full bg-primary-blue" style={{ width: `${row.percent}%` }} />
            </span>
            <span className="w-12 shrink-0 text-right font-semibold text-secondary-text">{row.percent}%</span>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-sm border border-border bg-blue-50/50 p-5">
        <p className="flex items-center gap-2 text-sm font-bold text-primary-text">
          <Sparkles size={16} className="text-primary-blue" />
          AI Review Summary
        </p>
        <p className="mt-2 text-sm text-secondary-text font-medium">Guests loved:</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {details.aiReviewSummary.map((point) => (
            <span key={point} className="rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-secondary-text shadow-soft border border-border">
              {point}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {travelerFilters.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              setFilter(type);
              setShowAll(false);
            }}
            className={
              "rounded-full px-4 py-2 text-xs font-semibold transition-all " +
              (filter === type ? "bg-primary-blue text-white shadow-soft" : "border border-border text-secondary-text hover:border-muted-text")
            }
          >
            {type}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {visibleReviews.length === 0 ? (
          <p className="text-sm text-muted-text">No reviews yet for this traveler type.</p>
        ) : (
          visibleReviews.map((review, index) => (
            <div key={`${review.name}-${index}`} className="rounded-sm border border-border bg-card p-5 shadow-soft">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-1 font-bold text-primary-text">
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  {review.rating}
                </span>
                <span className="font-semibold text-primary-text">{review.name}</span>
                <span className="text-muted-text">{review.date}</span>
                <span className="text-muted-text">•</span>
                <span className="text-muted-text">{review.travelerType}</span>
              </div>
              <p className="mt-3 text-sm text-secondary-text leading-relaxed">{review.comment}</p>
            </div>
          ))
        )}
      </div>

      {!showAll && filteredReviews.length > visibleReviews.length && (
        <button type="button" onClick={() => setShowAll(true)} className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-blue transition-colors hover:text-primary-blue/80">
          Read all reviews
          <span>→</span>
        </button>
      )}
    </section>
  );
}
