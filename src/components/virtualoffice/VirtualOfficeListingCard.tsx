import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingCart,
  Star,
  Train,
} from "lucide-react";
import type { VirtualOfficeListing } from "../../data/virtualOfficeListings";
import { CITY_NAMES } from "../../data/dayPassListings";
import { useCart } from "../../context/CartContext";
import RecommendedBadge from "../RecommendedBadge";

interface VirtualOfficeListingCardProps {
  listing: VirtualOfficeListing;
}

function cityLabel(slug: string) {
  return CITY_NAMES[slug] ?? slug.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

export default function VirtualOfficeListingCard({ listing }: VirtualOfficeListingCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedPlanKey, setSelectedPlanKey] = useState(listing.plans[0].key);
  const selectedPlan = listing.plans.find((plan) => plan.key === selectedPlanKey) ?? listing.plans[0];
  const navigate = useNavigate();
  const params = useParams<{ city: string }>();
  const { addItem } = useCart();
  const citySlug = params.city ?? listing.city;
  const cityName = cityLabel(citySlug);

  const showPrev = () => setImageIndex((i) => (i === 0 ? listing.images.length - 1 : i - 1));
  const showNext = () => setImageIndex((i) => (i === listing.images.length - 1 ? 0 : i + 1));

  function buildCheckoutState() {
    return {
      productType: "virtual-office" as const,
      listingId: listing.id,
      centerName: listing.centerName,
      brand: listing.brand,
      citySlug,
      cityName,
      area: listing.area,
      address: listing.address,
      image: listing.images[0],
      rating: listing.rating,
      reviews: listing.reviews,
      gstEligible: listing.gstEligible,
      businessAddressAvailable: listing.businessAddressAvailable,
      servicesIncluded: listing.servicesIncluded,
      plans: listing.plans,
      selectedPlanKey,
      billingKey: "monthly" as const,
    };
  }

  function handleBookNow() {
    navigate("/checkout", { state: buildCheckoutState() });
  }

  function handleAddToCart() {
    const state = buildCheckoutState();
    addItem({
      id: listing.id,
      productType: "virtual-office",
      workspaceName: listing.centerName,
      cityName,
      locality: listing.area,
      image: listing.images[0],
      price: selectedPlan.price,
      checkoutState: state,
    });
  }

  return (
    <div className="group overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-transform duration-300 hover:-translate-y-1">
      <div className="flex flex-col sm:flex-row">
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden sm:aspect-auto sm:w-[300px]">
          <img
            src={listing.images[imageIndex]}
            alt={listing.centerName}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {listing.isFeatured && <RecommendedBadge size="sm" />}
            {listing.premier && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#2563EB] shadow-soft">
                Premium
              </span>
            )}
          </div>

          {listing.images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={showPrev}
                className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#0F172A] shadow-soft hover:bg-white"
              >
                <ChevronLeft size={16} strokeWidth={1.75} />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={showNext}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#0F172A] shadow-soft hover:bg-white"
              >
                <ChevronRight size={16} strokeWidth={1.75} />
              </button>
            </>
          )}
        </div>

        <div className="flex-1 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-[#0F172A] px-2.5 py-1 text-[11px] font-bold text-white">
              <Star size={11} strokeWidth={1.75} className="fill-[#FBBF24] text-[#FBBF24]" />
              {listing.rating.toFixed(1)} ({listing.reviews})
            </span>
            {listing.popularTags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-bold text-[#2563EB]"
              >
                {tag}
              </span>
            ))}
          </div>

          <h3 className="mt-2 text-lg font-bold text-[#0F172A] sm:text-[20px]">{listing.centerName}</h3>
          <p className="flex items-center gap-1.5 text-sm text-[#64748B]">
            <MapPin size={14} strokeWidth={1.75} />
            {listing.address}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-[#475569]">
            <span className="inline-flex items-center gap-1">
              <Building2 size={13} strokeWidth={1.75} className="text-[#64748B]" />
              {listing.buildingType}
            </span>
            {listing.metroConnectivity && (
              <span className="inline-flex items-center gap-1">
                <Train size={13} strokeWidth={1.75} className="text-[#64748B]" />
                Metro Connectivity
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {listing.businessAddressAvailable && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-semibold text-[#16A34A]">
                <ShieldCheck size={12} strokeWidth={1.75} />
                Business Address Available
              </span>
            )}
            {listing.gstEligible && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-semibold text-[#16A34A]">
                <ShieldCheck size={12} strokeWidth={1.75} />
                GST Eligible
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-[#E2E8F0] p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Choose a Plan</p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {listing.plans.map((plan) => {
            const selected = plan.key === selectedPlanKey;
            return (
              <button
                key={plan.key}
                type="button"
                onClick={() => setSelectedPlanKey(plan.key)}
                className={
                  "flex flex-col items-start rounded-2xl border px-3.5 py-3 text-left transition-colors " +
                  (selected
                    ? "border-[#2563EB] bg-[#2563EB] text-white"
                    : "border-[#E2E8F0] bg-white text-[#0F172A] hover:border-[#94A3B8]")
                }
              >
                <span className="text-sm font-bold">₹{plan.price.toLocaleString()}/mo</span>
                <span className={"mt-0.5 text-[11px] font-medium " + (selected ? "text-white/80" : "text-[#64748B]")}>
                  {plan.name}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-[#64748B]">{selectedPlan.description}</p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[28px] font-extrabold leading-none text-[#0F172A]">
            ₹{selectedPlan.price.toLocaleString()}
            <span className="text-sm font-medium text-[#94A3B8]">/month</span>
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              to={`/virtual-office/${listing.id}`}
              className="rounded-xl border border-[#E2E8F0] bg-white px-5 py-2.5 text-center text-sm font-semibold text-[#334155] transition-colors hover:border-[#94A3B8]"
            >
              View Details
            </Link>
            <button type="button" onClick={handleBookNow}
              className="rounded-xl bg-[#111111] px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-black">
              Book Now
            </button>
            <button type="button" onClick={handleAddToCart}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#2563EB] px-4 py-2.5 text-sm font-semibold text-[#2563EB] transition-colors hover:bg-[#EFF6FF]">
              <ShoppingCart size={14} strokeWidth={1.75} />
              Cart
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-[#334155] transition-colors hover:border-[#94A3B8]"
            >
              <Phone size={14} strokeWidth={1.75} />
              Call Expert
            </button>
            <Link
              to={`/virtual-office/${listing.id}`}
              className="rounded-xl bg-[#9333EA] px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[#7e22ce]"
            >
              Get Consultation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
