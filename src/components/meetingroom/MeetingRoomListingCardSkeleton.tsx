import SharedListingCardSkeleton from "../common/ListingCardSkeleton";

export default function MeetingRoomListingCardSkeleton({ layout }: { layout?: "row" | "grid" }) {
  return <SharedListingCardSkeleton layout={layout} />;
}
