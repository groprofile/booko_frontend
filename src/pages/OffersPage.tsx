import { useEffect } from "react";
import { BadgePercent } from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import OfferCard from "../components/offers/OfferCard";
import { useActiveOffers } from "../hooks/useActiveOffers";

export default function OffersPage() {
  // The Offers page is a banner wall — only image-bearing offers appear here.
  const offers = useActiveOffers().filter((o) => o.image_url);

  useEffect(() => {
    document.title = "Offers & Deals | Bokko";
  }, []);

  return (
    <MainLayout>
      <section className="w-full py-10 sm:py-14">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EFF6FF]">
              <BadgePercent size={22} className="text-primary-blue" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold text-primary-text sm:text-3xl">Offers &amp; Deals</h1>
              <p className="mt-1 text-secondary-text">
                Discounts are applied automatically at checkout — no code needed.
              </p>
            </div>
          </div>

          {offers.length === 0 ? (
            <div className="mt-16 rounded-2xl border border-border bg-card py-16 text-center">
              <p className="text-sm text-muted-text">No active offers right now. Check back soon.</p>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {offers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} width="full" />
              ))}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
