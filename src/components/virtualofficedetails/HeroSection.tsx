import { useState } from "react";
import { BadgeCheck, MessageSquareText, ShieldCheck, Star } from "lucide-react";
import type { VirtualOfficeListing } from "../../data/virtualOfficeListings";
import { billingTiers } from "../../data/virtualOfficeDetails";
import type { VirtualOfficeDetails } from "../../data/virtualOfficeDetails";

interface HeroSectionProps {
  listing: VirtualOfficeListing;
  details: VirtualOfficeDetails;
  cityName: string;
}

export default function HeroSection({ listing, details, cityName }: HeroSectionProps) {
  const [expertRequested, setExpertRequested] = useState(false);
  const monthlyPlan = listing.plans[0];
  const yearlyMultiplier = billingTiers.find((tier) => tier.key === "yearly")?.multiplier ?? 10;

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-white shadow-soft-lg">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-4 p-6 sm:p-8">
          <div className="h-[200px] w-full overflow-hidden rounded-[18px] sm:h-[240px]">
            <img src={details.heroImage} alt={listing.centerName} className="h-full w-full object-cover" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {listing.gstEligible && (
              <span className="rounded-md bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-bold text-[#16A34A]">GST Eligible</span>
            )}
            {listing.premier && (
              <span className="rounded-md bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-bold text-[#2563EB]">Premium</span>
            )}
            <span className="inline-flex items-center gap-1 rounded-md bg-[#F5F3FF] px-2.5 py-1 text-[11px] font-bold text-[#7C3AED]">
              <ShieldCheck size={12} />
              Verified Location
            </span>
          </div>

          <div>
            <h1 className="text-[28px] font-extrabold tracking-tight text-[#0F172A] sm:text-[36px]">{listing.centerName}</h1>
            <p className="mt-1 text-sm font-semibold text-[#334155]">{listing.brand}</p>
            <p className="mt-2 text-sm text-[#64748B]">
              {listing.area}, {cityName} · {listing.buildingType}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-[#0F172A] px-2.5 py-1 text-xs font-bold text-white">
              <Star size={12} className="fill-[#FBBF24] text-[#FBBF24]" />
              {details.rating.toFixed(1)} Google Rating
            </span>
            <span className="text-xs text-[#94A3B8]">({details.reviewCount.toLocaleString()} reviews)</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-[#E2E8F0] bg-[#F8FAFC] p-6 sm:p-8 lg:border-l lg:border-t-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Starting Price</p>
          <p className="text-[40px] font-extrabold leading-none text-[#0F172A]">
            ₹{monthlyPlan.price.toLocaleString()}
            <span className="text-base font-medium text-[#94A3B8]">/month</span>
          </p>

          <div className="flex flex-col gap-2 rounded-[16px] border border-[#E2E8F0] bg-white p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#64748B]">Monthly</span>
              <span className="font-bold text-[#0F172A]">₹{monthlyPlan.price.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#64748B]">Yearly</span>
              <span className="font-bold text-[#0F172A]">₹{Math.round(monthlyPlan.price * yearlyMultiplier).toLocaleString()}</span>
            </div>
          </div>

          <button type="button" className="w-full rounded-xl bg-[#111111] py-3.5 text-sm font-bold text-white transition-colors hover:bg-black">
            Book Now
          </button>

          {expertRequested ? (
            <div className="flex items-center gap-2 rounded-xl bg-[#ECFDF5] px-4 py-3 text-sm font-semibold text-[#16A34A]">
              <BadgeCheck size={16} />
              We'll reach out to you shortly.
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setExpertRequested(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#2563EB] py-3.5 text-sm font-bold text-[#2563EB] transition-colors hover:bg-[#EFF6FF]"
            >
              <MessageSquareText size={16} />
              Talk To Bokko Expert
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
