import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CalendarClock, MessageCircle } from "lucide-react";
import type { MembershipType, BillingTier } from "../../data/monthlyPassDetails";
import type { MonthlyPassListing } from "../../data/monthlyPassListings";
import { CITY_NAMES } from "../../data/dayPassListings";
import CenterOffersButton from "../offers/CenterOffersButton";

interface BookingCardProps {
  membershipTypes: MembershipType[];
  billingTiers: BillingTier[];
  listing: MonthlyPassListing;
}

function cityLabel(slug: string) {
  return CITY_NAMES[slug] ?? slug.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

export default function BookingCard({ membershipTypes, billingTiers, listing }: BookingCardProps) {
  const [selectedTypeKey, setSelectedTypeKey] = useState(membershipTypes[1]?.key ?? membershipTypes[0].key);
  const [selectedBillingKey, setSelectedBillingKey] = useState<BillingTier["key"]>("monthly");
  const [visitScheduled, setVisitScheduled] = useState(false);
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const navigate = useNavigate();
  const params = useParams<{ city: string }>();

  const selectedType = membershipTypes.find((type) => type.key === selectedTypeKey) ?? membershipTypes[0];
  const selectedBilling = billingTiers.find((tier) => tier.key === selectedBillingKey) ?? billingTiers[0];
  const total = Math.round(selectedType.price * selectedBilling.multiplier);
  const citySlug = params.city ?? listing.city;
  const cityName = cityLabel(citySlug);

  function goToCheckout() {
    navigate("/checkout", {
      state: {
        productType: "monthly-pass",
        listingId: listing.id,
        workspaceName: listing.name,
        brand: listing.brand,
        citySlug,
        cityName,
        locality: listing.locality,
        image: listing.images[0],
        rating: listing.rating,
        reviews: listing.reviews,
        membershipTypes,
        selectedMembershipKey: selectedTypeKey,
        billingKey: selectedBillingKey,
        seats: 1,
      },
    });
  }

  return (
    <div className="rounded-sm border border-border bg-card p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">Membership Type</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {membershipTypes.map((type) => {
          const selected = type.key === selectedTypeKey;
          return (
            <button
              key={type.key}
              type="button"
              onClick={() => setSelectedTypeKey(type.key)}
              className={
                "flex flex-col items-start rounded-sm border px-3 py-2.5 text-left transition-colors " +
                (selected
                  ? "border-[#2563EB] bg-[#2563EB] text-white"
                  : "border-[#E2E8F0] bg-white text-[#0F172A] hover:border-[#94A3B8]")
              }
            >
              <span className="text-sm font-bold">{type.name}</span>
              <span className={"text-[11px] font-medium " + (selected ? "text-white/80" : "text-[#64748B]")}>
                ₹{type.price.toLocaleString()}/mo
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <CenterOffersButton vertical="monthly-pass" centerId={listing.id} centerName={listing.name} />
      </div>

      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-[#94A3B8]">Billing Cycle</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {billingTiers.map((tier) => {
          const selected = tier.key === selectedBillingKey;
          return (
            <button
              key={tier.key}
              type="button"
              onClick={() => setSelectedBillingKey(tier.key)}
              className={
                "rounded-sm border px-2 py-2 text-center text-xs font-bold transition-colors " +
                (selected
                  ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                  : "border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#94A3B8]")
              }
            >
              {tier.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-sm bg-[#F8FAFC] p-4">
        <p className="text-xs text-[#94A3B8]">{selectedBilling.label} Total</p>
        <p className="text-[28px] font-extrabold leading-none text-[#0F172A]">₹{total.toLocaleString()}</p>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <button type="button" onClick={goToCheckout}
          className="cta-gradient flex h-12 items-center justify-center rounded-sm text-sm font-bold text-white">
          Start Membership
        </button>
        <button type="button" onClick={goToCheckout}
          className="flex h-12 items-center justify-center rounded-sm border border-[#2563EB] text-sm font-bold text-[#2563EB] hover:bg-[#EFF6FF]">
          Book Workspace
        </button>

        {/* Schedule Visit lead gen */}
        {!visitScheduled ? (
          <div className="mt-1 rounded-sm border border-[#E2E8F0] bg-[#F8FAFC] p-3">
            <p className="flex items-center gap-1.5 text-xs font-bold text-[#334155]">
              <CalendarClock size={13} />
              Schedule a Free Site Visit
            </p>
            <div className="mt-2 flex flex-col gap-2">
              <input type="text" value={visitorName} onChange={(e) => setVisitorName(e.target.value)}
                placeholder="Your name" className="h-9 rounded-sm border border-[#D1D5DB] px-3 text-xs font-medium text-[#0F172A] outline-none focus:border-[#2563EB]" />
              <input type="tel" inputMode="numeric" value={visitorPhone}
                onChange={(e) => setVisitorPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="Mobile number" className="h-9 rounded-sm border border-[#D1D5DB] px-3 text-xs font-medium text-[#0F172A] outline-none focus:border-[#2563EB]" />
              <input type="email" value={visitorEmail} onChange={(e) => setVisitorEmail(e.target.value)}
                placeholder="Email address" className="h-9 rounded-sm border border-[#D1D5DB] px-3 text-xs font-medium text-[#0F172A] outline-none focus:border-[#2563EB]" />
              <button type="button"
                disabled={visitorName.trim().length < 2 || visitorPhone.length < 10 || !visitorEmail.includes("@")}
                onClick={() => setVisitScheduled(true)}
                className="flex h-9 items-center justify-center rounded-sm bg-[#0F172A] text-xs font-bold text-white disabled:opacity-50">
                Schedule Visit
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-1 rounded-sm bg-[#ECFDF5] px-3 py-2.5 text-xs font-semibold text-[#16A34A]">
            ✅ Visit scheduled! We'll confirm timing shortly.
          </div>
        )}

        <button type="button"
          className="flex h-12 items-center justify-center gap-2 rounded-sm border border-[#16A34A] text-sm font-bold text-[#16A34A] hover:bg-[#ECFDF5]">
          <MessageCircle size={15} />
          Talk To Bokko Expert
        </button>
      </div>
    </div>
  );
}
