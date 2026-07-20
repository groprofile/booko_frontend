import ListingCardSkeleton from "../common/ListingCardSkeleton";

export default function WorkspaceCardSkeleton({ layout }: { layout?: "row" | "grid" }) {
  return <ListingCardSkeleton layout={layout} />;
}
