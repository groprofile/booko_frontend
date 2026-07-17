import Header from "../Header";
import Footer from "../Footer";
import Skeleton from "./Skeleton";

export default function DetailPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
          <Skeleton className="h-4 w-64" />

          <div className="mt-4">
            <Skeleton className="h-[320px] w-full rounded-[24px] sm:h-[420px]" />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="flex min-w-0 flex-col gap-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-9 rounded-lg" />
                ))}
              </div>
              <Skeleton className="h-40 w-full rounded-2xl" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>

            <aside className="hidden lg:block">
              <Skeleton className="h-[420px] w-full rounded-[24px]" />
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
