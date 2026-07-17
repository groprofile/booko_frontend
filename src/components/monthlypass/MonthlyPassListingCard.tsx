import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, MapPin, ShieldCheck, ShoppingCart, Star, Timer, Train } from "lucide-react";
import type { MonthlyPassListing } from "../../data/monthlyPassListings";
import { CITY_NAMES } from "../../data/dayPassListings";
import { apiGet } from "../../lib/api";
import { apiToMonthlyPassDetails, type CentreApiRow } from "../../lib/centreAdapter";
import { useCart } from "../../context/CartContext";

interface MonthlyPassListingCardProps {
  listing: MonthlyPassListing;
}

function cityLabel(slug: string) {
  return CITY_NAMES[slug] ?? slug.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

export default function MonthlyPassListingCard({ listing }: MonthlyPassListingCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);
  const navigate = useNavigate();
  const params = useParams<{ city: string }>();
  const { addItem } = useCart();
  const citySlug = params.city ?? listing.city;
  const cityName = cityLabel(citySlug);

  async function buildCheckoutState() {
    const raw = await apiGet<CentreApiRow>(`/centers/${listing.id}`);
    const details = apiToMonthlyPassDetails(raw);
    return {
      productType: "monthly-pass" as const,
      listingId: listing.id,
      workspaceName: listing.name,
      brand: listing.brand,
      citySlug,
      cityName,
      locality: listing.locality,
      image: listing.images[0],
      rating: listing.rating,
      reviews: listing.reviews,
      membershipTypes: details.membershipTypes,
      selectedMembershipKey: details.membershipTypes[1]?.key ?? details.membershipTypes[0].key,
      billingKey: "monthly" as const,
      seats: 1,
    };
  }

  async function handleBookNow() {
    setBookingLoading(true);
    try {
      const state = await buildCheckoutState();
      navigate("/checkout", { state });
    } catch {
      alert("Couldn't load this workspace right now. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  }

  async function handleAddToCart() {
    setBookingLoading(true);
    try {
      const state = await buildCheckoutState();
      addItem({
        id: listing.id,
        productType: "monthly-pass",
        workspaceName: listing.name,
        cityName,
        locality: listing.locality,
        image: listing.images[0],
        price: listing.price,
        checkoutState: state,
      });
    } catch {
      alert("Couldn't load this workspace right now. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  }

  const showPrev = () => setImageIndex((i) => (i === 0 ? listing.images.length - 1 : i - 1));
  const showNext = () => setImageIndex((i) => (i === listing.images.length - 1 ? 0 : i + 1));

  return (
    <div className="group flex flex-col overflow-hidden rounded-[20px] border border-[#E2E8F0] bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)] transition-transform duration-300 hover:-translate-y-[3px] sm:flex-row">
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden sm:aspect-auto sm:h-auto sm:w-[280px]">
        <img src={listing.images[imageIndex]} alt={listing.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />

        {listing.popular && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#F97316] shadow-soft">
            <Star size={11} strokeWidth={1.75} className="fill-[#F97316] text-[#F97316]" />
            Popular
          </span>
        )}

        {listing.images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={showPrev}
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#0F172A] shadow-soft transition-colors hover:bg-white"
            >
              <ChevronLeft size={16} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={showNext}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#0F172A] shadow-soft transition-colors hover:bg-white"
            >
              <ChevronRight size={16} strokeWidth={1.75} />
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              {listing.images.map((_, i) => (
                <span
                  key={i}
                  className={"h-1.5 w-1.5 rounded-full transition-colors " + (i === imageIndex ? "bg-white" : "bg-white/50")}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-4 p-5 sm:flex-row sm:gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {listing.premier && (
              <span className="rounded-md bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-bold text-[#2563EB]">
                Premier
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-sm font-bold text-[#0F172A]">
              <Star size={14} strokeWidth={1.75} className="fill-[#FBBF24] text-[#FBBF24]" />
              {listing.rating.toFixed(2)}
            </span>
            <span className="text-xs text-[#94A3B8]">({listing.reviews.toLocaleString()} Brand Reviews)</span>
          </div>

          <h3 className="mt-1.5 text-lg font-bold text-[#0F172A]">{listing.name}</h3>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">{listing.spaceType}</p>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-[#64748B]">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} strokeWidth={1.75} className="shrink-0" />
              {listing.locality}
            </span>
            <span>{listing.distanceKm} Kms away</span>
            <span className="inline-flex items-center gap-1.5">
              <Timer size={14} strokeWidth={1.75} className="shrink-0" />
              {listing.lockIn} lock-in
            </span>
          </div>

          {listing.accessibility.length > 0 && (
            <div className="mt-1.5 flex items-center gap-1.5 text-sm text-[#64748B]">
              <Train size={14} strokeWidth={1.75} className="shrink-0" />
              {listing.accessibility.join(" • ")}
            </div>
          )}

          <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#F8FAFC] px-3 py-2 text-sm text-[#334155]">
            <ShieldCheck size={14} strokeWidth={1.75} className="shrink-0 text-[#64748B]" />
            <span className="font-semibold">Seating Types:</span>
            {listing.seatingTypes.join(" • ")}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-3 sm:w-[180px] sm:items-end sm:text-right">
          <span className="inline-flex items-center gap-1 self-start rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-semibold text-[#16A34A] sm:self-end">
            {listing.offerCount} workspace {listing.offerCount === 1 ? "offer" : "offers"}
          </span>

          <div>
            <p className="text-xs text-[#94A3B8]">Price (per seat/month)</p>
            <p className="text-xl font-extrabold text-[#0F172A]">₹{listing.price.toLocaleString()}</p>
            <p className="text-sm font-bold text-[#16A34A]">
              ₹{listing.bestPrice.toLocaleString()} Best Price
              <span className="block text-xs font-medium text-[#64748B]">Use {listing.offerCode}</span>
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:items-end">
            <button type="button" onClick={handleBookNow} disabled={bookingLoading}
              className="w-full rounded-xl bg-[#111111] px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
              {bookingLoading ? "Loading…" : "Book Monthly Pass"}
            </button>
            <Link to={`/monthly-pass/${listing.id}`}
              className="w-full rounded-xl border border-[#E2E8F0] bg-white px-5 py-2.5 text-center text-sm font-semibold text-[#334155] transition-colors hover:border-[#94A3B8] sm:w-auto">
              View Details
            </Link>
            <button type="button" onClick={handleAddToCart} disabled={bookingLoading}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#2563EB] bg-white px-5 py-2 text-sm font-semibold text-[#2563EB] transition-colors hover:bg-[#EFF6FF] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
              <ShoppingCart size={14} strokeWidth={1.75} />
              {bookingLoading ? "Loading…" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
