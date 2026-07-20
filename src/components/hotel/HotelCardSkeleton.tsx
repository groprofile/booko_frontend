import SharedListingCardSkeleton from "../common/ListingCardSkeleton";

export default function HotelCardSkeleton({ layout }: { layout?: "row" | "grid" }) {
  return <SharedListingCardSkeleton layout={layout} />;
}
