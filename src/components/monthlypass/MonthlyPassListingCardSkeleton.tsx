import SharedListingCardSkeleton from "../common/ListingCardSkeleton";

export default function MonthlyPassListingCardSkeleton({ layout }: { layout?: "row" | "grid" }) {
  return <SharedListingCardSkeleton layout={layout} />;
}
