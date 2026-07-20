import { useState } from "react";
import { Sparkles, Star } from "lucide-react";
import type { MeetingRoomDetails } from "../../data/meetingRoomDetails";
import SectionLabel from "./SectionLabel";

interface ReviewsSectionProps {
  details: MeetingRoomDetails;
}

const useCaseFilters = ["All", "Corporate Teams", "Startups", "Interview Bookings", "Training Sessions", "Client Meetings", "Workshops"];

export default function ReviewsSection({ details }: ReviewsSectionProps) {
  const [filter, setFilter] = useState("All");
  const [showAll, setShowAll] = useState(false);

  const filteredReviews = details.reviews.filter((review) => filter === "All" || review.useCase === filter);
  const visibleReviews = showAll ? filteredReviews : filteredReviews.slice(0, 3);

  return (
    <section className="m-0">
      <SectionLabel title="User Reviews" />

      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1.5 text-3xl font-extrabold text-[#0F172A]">
          <Star size={26} className="fill-[#FBBF24] text-[#FBBF24]" />
          {details.rating.toFixed(1)}
        </span>
        <span className="text-sm text-[#64748B]">({details.reviewCount.toLocaleString()} Reviews)</span>
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        {details.ratingBreakdown.map((row) => (
          <div key={row.star} className="flex items-center gap-3 text-sm text-[#64748B]">
            <span className="flex w-8 shrink-0 items-center gap-1 font-semibold text-[#0F172A]">
              <Star size={13} className="fill-[#FBBF24] text-[#FBBF24]" />
              {row.star}
            </span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-[#F1F5F9]">
              <span className="block h-full rounded-full bg-[#2563EB]" style={{ width: `${row.percent}%` }} />
            </span>
            <span className="w-10 shrink-0 text-right font-semibold">{row.percent}%</span>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-sm border border-[#E2E8F0] bg-[#F8FAFC] p-4">
        <p className="flex items-center gap-1.5 text-sm font-bold text-[#0F172A]">
          <Sparkles size={15} className="text-[#2563EB]" />
          AI Review Summary
        </p>
        <p className="mt-1 text-sm text-[#64748B]">Guests loved:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {details.aiReviewSummary.map((point) => (
            <span key={point} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#334155] shadow-soft">
              {point}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {useCaseFilters.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              setFilter(type);
              setShowAll(false);
            }}
            className={
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors " +
              (filter === type ? "bg-[#2563EB] text-white" : "border border-[#E2E8F0] text-[#334155] hover:border-[#94A3B8]")
            }
          >
            {type}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {visibleReviews.length === 0 ? (
          <p className="text-sm text-[#64748B]">No reviews yet for this use case.</p>
        ) : (
          visibleReviews.map((review, index) => (
            <div key={`${review.name}-${index}`} className="rounded-sm border border-[#E2E8F0] bg-white p-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-1 font-bold text-[#0F172A]">
                  <Star size={13} className="fill-[#FBBF24] text-[#FBBF24]" />
                  {review.rating}
                </span>
                <span className="font-semibold text-[#334155]">{review.name}</span>
                <span className="text-[#94A3B8]">{review.date}</span>
                <span className="text-[#94A3B8]">|</span>
                <span className="text-[#94A3B8]">{review.useCase}</span>
              </div>
              <p className="mt-2 text-sm text-[#64748B]">{review.comment}</p>
            </div>
          ))
        )}
      </div>

      {!showAll && filteredReviews.length > visibleReviews.length && (
        <button type="button" onClick={() => setShowAll(true)} className="mt-4 text-sm font-semibold text-[#2563EB] hover:underline">
          Read all reviews →
        </button>
      )}
    </section>
  );
}
