import SharedListingCardSkeleton from "../common/ListingCardSkeleton";

export default function ListingCardSkeleton({ layout }: { layout?: "row" | "grid" }) {
  return <SharedListingCardSkeleton layout={layout} />;
}
