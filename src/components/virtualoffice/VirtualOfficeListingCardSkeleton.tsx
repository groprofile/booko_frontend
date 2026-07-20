import SharedListingCardSkeleton from "../common/ListingCardSkeleton";

export default function VirtualOfficeListingCardSkeleton({ layout }: { layout?: "row" | "grid" }) {
  return <SharedListingCardSkeleton layout={layout} />;
}
