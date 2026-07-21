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

  if (reviews === 0) {
    return (
      <section className="m-0">
        <SectionLabel title="Reviews & Ratings" />
        <p className="text-sm text-muted-text">No reviews yet — be the first to book and review {brand}.</p>
      </section>
    );
  }

  return (
    <section className="m-0">
      <SectionLabel title="Reviews & Ratings" />

      <div className="flex flex-wrap items-center gap-4">
        <span className="flex items-center gap-2 text-4xl font-extrabold text-primary-text">
          <Star size={28} className="fill-yellow-400 text-yellow-400" />
          {rating.toFixed(2)}
        </span>
        <span className="text-sm text-secondary-text">({reviews.toLocaleString()} reviews)</span>
      </div>
      <p className="mt-2 text-sm text-muted-text">Average rating for all {brand} workspaces</p>

      <div className="mt-6 flex flex-col gap-2.5">
        {details.ratingBreakdown.map((row) => (
          <div key={row.star} className="flex items-center gap-3 text-sm">
            <span className="flex w-8 shrink-0 items-center gap-1.5 font-semibold text-primary-text">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              {row.star}
            </span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-bg">
              <span
                className="block h-full rounded-full bg-primary-blue"
                style={{ width: `${row.percent}%` }}
              />
            </span>
            <span className="w-12 shrink-0 text-right font-semibold text-secondary-text">{row.percent}%</span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {visibleReviews.map((review, index) => (
          <div key={`${review.name}-${index}`} className="rounded-sm border border-border bg-card p-5 shadow-soft">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 font-bold text-primary-text">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                {review.rating}
              </span>
              <span className="font-semibold text-primary-text">{review.name}</span>
              <span className="text-muted-text">{review.date}</span>
              <span className="text-muted-text">•</span>
              <span className="text-muted-text">{review.tag}</span>
            </div>
            <p className="mt-3 text-sm text-secondary-text leading-relaxed">{review.comment}</p>
          </div>
        ))}
      </div>

      {!showAll && details.reviews.length > visibleReviews.length && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-blue transition-colors hover:text-primary-blue/80"
        >
          Read all reviews
          <span>→</span>
        </button>
      )}
    </section>
  );
}
