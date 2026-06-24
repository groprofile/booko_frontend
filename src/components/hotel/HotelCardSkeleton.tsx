export default function HotelCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-white">
      <div className="flex flex-col sm:flex-row">
        <div className="aspect-[16/10] w-full shrink-0 animate-pulse bg-[#E2E8F0] sm:aspect-auto sm:h-[220px] sm:w-[300px]" />
        <div className="flex-1 space-y-3 p-5">
          <div className="h-5 w-24 animate-pulse rounded-full bg-[#E2E8F0]" />
          <div className="h-6 w-3/4 animate-pulse rounded-lg bg-[#E2E8F0]" />
          <div className="h-4 w-1/2 animate-pulse rounded-lg bg-[#E2E8F0]" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-9 w-9 animate-pulse rounded-lg bg-[#E2E8F0]" />
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-[#E2E8F0] p-5">
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 w-[88px] animate-pulse rounded-2xl bg-[#E2E8F0]" />
          ))}
        </div>
      </div>
    </div>
  );
}
