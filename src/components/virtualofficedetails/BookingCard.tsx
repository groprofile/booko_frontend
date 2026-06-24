import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { VirtualOfficeListing, VOPlan } from "../../data/virtualOfficeListings";
import { billingTiers } from "../../data/virtualOfficeDetails";
import type { BillingTier } from "../../data/virtualOfficeDetails";

interface BookingCardProps {
  listing: VirtualOfficeListing;
  citySlug: string;
  cityName: string;
  plans: VOPlan[];
}

export default function BookingCard({ listing, citySlug, cityName, plans }: BookingCardProps) {
  const navigate = useNavigate();
  const [selectedPlanKey, setSelectedPlanKey] = useState(plans[0].key);
  const [billingKey, setBillingKey] = useState<BillingTier["key"]>("monthly");

  const selectedPlan = plans.find((plan) => plan.key === selectedPlanKey) ?? plans[0];
  const billingTier = billingTiers.find((tier) => tier.key === billingKey) ?? billingTiers[0];
  const totalPrice = Math.round(selectedPlan.price * billingTier.multiplier);

  function goToCheckout() {
    navigate("/checkout", {
      state: {
        productType: "virtual-office",
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
        plans,
        selectedPlanKey,
        billingKey,
      },
    });
  }

  return (
    <div className="rounded-[24px] border border-[#E2E8F0] bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
      <p className="text-sm font-bold text-[#0F172A]">Choose Your Plan</p>

      <div className="mt-3 flex flex-col gap-2">
        {plans.map((plan) => {
          const selected = plan.key === selectedPlanKey;
          return (
            <button
              key={plan.key}
              type="button"
              onClick={() => setSelectedPlanKey(plan.key)}
              className={
                "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors " +
                (selected ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E2E8F0] bg-white hover:border-[#94A3B8]")
              }
            >
              <span>
                <span className="block text-sm font-bold text-[#0F172A]">{plan.name}</span>
                <span className="block text-xs text-[#64748B]">{plan.description}</span>
              </span>
              <span className="shrink-0 text-sm font-extrabold text-[#0F172A]">₹{plan.price.toLocaleString()}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Billing Cycle</p>
      <div className="mt-2 flex gap-2">
        {billingTiers.map((tier) => {
          const selected = tier.key === billingKey;
          return (
            <button
              key={tier.key}
              type="button"
              onClick={() => setBillingKey(tier.key)}
              className={
                "flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors " +
                (selected ? "border-[#2563EB] bg-[#2563EB] text-white" : "border-[#E2E8F0] bg-white text-[#0F172A] hover:border-[#94A3B8]")
              }
            >
              {tier.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#E2E8F0] pt-4">
        <span className="text-sm font-semibold text-[#64748B]">Total ({billingTier.label})</span>
        <span className="text-2xl font-extrabold text-[#0F172A]">₹{totalPrice.toLocaleString()}</span>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <button type="button" onClick={goToCheckout}
          className="w-full rounded-xl bg-[#111111] py-3.5 text-sm font-bold text-white transition-colors hover:bg-black">
          Book Now
        </button>
        <button type="button" onClick={goToCheckout}
          className="w-full rounded-xl border border-[#2563EB] py-3.5 text-sm font-bold text-[#2563EB] transition-colors hover:bg-[#EFF6FF]">
          Talk To Bokko Expert
        </button>
      </div>
    </div>
  );
}
