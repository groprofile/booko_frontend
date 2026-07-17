import { apiGet } from "./api";

export interface ReviewItemData {
  name: string;
  date: string;
  rating: number;
  comment: string;
}

export interface RatingBreakdownRow {
  star: number;
  percent: number;
}

export interface CenterReviewsResult {
  reviews: ReviewItemData[];
  ratingBreakdown: RatingBreakdownRow[];
  avgRating: number | null;
  totalReviews: number;
}

interface ReviewRow {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  users: { full_name: string | null } | null;
}

interface ReviewStatsRow {
  avg_rating: string | null;
  total: string;
  five_star: string;
  four_star: string;
  three_star: string;
  two_star: string;
  one_star: string;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export async function fetchCenterReviews(centerId: string): Promise<CenterReviewsResult> {
  const res = await apiGet<{ stats: ReviewStatsRow | null; reviews: ReviewRow[] }>(
    `/centers/${centerId}/reviews?limit=20`,
  );
  const total = Number(res.stats?.total ?? 0);
  const starCounts: Record<number, number> = {
    5: Number(res.stats?.five_star ?? 0),
    4: Number(res.stats?.four_star ?? 0),
    3: Number(res.stats?.three_star ?? 0),
    2: Number(res.stats?.two_star ?? 0),
    1: Number(res.stats?.one_star ?? 0),
  };
  const ratingBreakdown: RatingBreakdownRow[] = [5, 4, 3, 2, 1].map((star) => ({
    star,
    percent: total > 0 ? Math.round((starCounts[star] / total) * 100) : 0,
  }));

  const reviews: ReviewItemData[] = (res.reviews ?? []).map((r) => ({
    name: r.users?.full_name || "Bokko Guest",
    date: formatDate(r.created_at),
    rating: r.rating,
    comment: r.review_text ?? "",
  }));

  return {
    reviews,
    ratingBreakdown,
    avgRating: res.stats?.avg_rating ? Number(res.stats.avg_rating) : null,
    totalReviews: total,
  };
}
