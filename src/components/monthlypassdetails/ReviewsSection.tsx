import { Sparkles, Star } from "lucide-react";
import SectionLabel from "./SectionLabel";
import type { AiLovedTag, RatingBucket, ReviewItem } from "../../data/monthlyPassDetails";

interface ReviewsSectionProps {
  rating: number;
  reviewCount: number;
  ratingBreakdown: RatingBucket[];
  aiLovedTags: AiLovedTag[];
  reviews: ReviewItem[];
}

export default function ReviewsSection({ rating, reviewCount, ratingBreakdown, aiLovedTags, reviews }: ReviewsSectionProps) {
  return (
    <section>
      <SectionLabel title="Reviews & Ratings" />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[200px_1fr]">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white p-5 text-center">
          <p className="text-4xl font-extrabold text-[#0F172A]">{rating.toFixed(1)}</p>
          <div className="mt-1 flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={14} className="fill-[#FBBF24] text-[#FBBF24]" />
            ))}
          </div>
          <p className="mt-1 text-xs text-[#64748B]">{reviewCount.toLocaleString()} Reviews</p>
        </div>

        <div className="flex flex-col gap-2">
          {ratingBreakdown.map((bucket) => (
            <div key={bucket.stars} className="flex items-center gap-3">
              <span className="w-10 shrink-0 text-xs font-semibold text-[#64748B]">{bucket.stars} star</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F1F5F9]">
                <div className="h-full rounded-full bg-[#FBBF24]" style={{ width: `${bucket.percent}%` }} />
              </div>
              <span className="w-10 shrink-0 text-right text-xs font-semibold text-[#64748B]">{bucket.percent}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-[#2563EB]/20 bg-[#EFF6FF] p-5">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-[#2563EB]" />
          <p className="text-sm font-bold text-[#0F172A]">AI Review Summary — Members Loved</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {aiLovedTags.map((tag) => (
            <span key={tag.tag} className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#2563EB] shadow-soft">
              {tag.tag} <span className="text-[#94A3B8]">({tag.mentions})</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0F172A] text-sm font-bold text-white">
                {review.authorInitial}
              </span>
              <div>
                <p className="text-sm font-bold text-[#0F172A]">{review.authorType}</p>
                <p className="text-xs text-[#94A3B8]">{review.date}</p>
              </div>
              <span className="ml-auto inline-flex items-center gap-1 text-sm font-bold text-[#0F172A]">
                <Star size={13} className="fill-[#FBBF24] text-[#FBBF24]" />
                {review.rating.toFixed(1)}
              </span>
            </div>
            <p className="mt-2.5 text-sm text-[#475569]">{review.comment}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
