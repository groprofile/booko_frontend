export default function ListingCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-[20px] border border-[#E2E8F0] bg-white sm:flex-row">
      <div className="aspect-[16/10] w-full shrink-0 animate-pulse bg-[#E2E8F0] sm:aspect-auto sm:h-auto sm:w-[280px]" />
      <div className="flex flex-1 flex-col justify-between gap-4 p-5 sm:flex-row sm:gap-6">
        <div className="flex-1 space-y-3">
          <div className="h-4 w-40 animate-pulse rounded-lg bg-[#E2E8F0]" />
          <div className="h-6 w-3/4 animate-pulse rounded-lg bg-[#E2E8F0]" />
          <div className="h-4 w-1/2 animate-pulse rounded-lg bg-[#E2E8F0]" />
          <div className="h-9 w-full max-w-xs animate-pulse rounded-lg bg-[#E2E8F0]" />
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2 sm:w-[200px] sm:items-end">
          <div className="h-5 w-24 animate-pulse rounded-full bg-[#E2E8F0]" />
          <div className="h-8 w-20 animate-pulse rounded-lg bg-[#E2E8F0]" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-[#E2E8F0]" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-[#E2E8F0]" />
        </div>
      </div>
    </div>
  );
}
