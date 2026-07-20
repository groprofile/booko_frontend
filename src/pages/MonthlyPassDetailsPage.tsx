import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import GalleryHero from "../components/monthlypassdetails/GalleryHero";
import WorkspaceHeader from "../components/monthlypassdetails/WorkspaceHeader";
import BookingCard from "../components/monthlypassdetails/BookingCard";
import WorkspaceMatchScoreSection from "../components/monthlypassdetails/WorkspaceMatchScoreSection";
import AiRecommendationSection from "../components/monthlypassdetails/AiRecommendationSection";
import WhyChooseSection from "../components/monthlypassdetails/WhyChooseSection";
import MembershipPlansTable from "../components/monthlypassdetails/MembershipPlansTable";
import SeatingOptionsSection from "../components/monthlypassdetails/SeatingOptionsSection";
import AmenitiesGrid from "../components/monthlypassdetails/AmenitiesGrid";
import LocationSection from "../components/monthlypassdetails/LocationSection";
import WhoIsThisForSection from "../components/monthlypassdetails/WhoIsThisForSection";
import TeamScalabilitySection from "../components/monthlypassdetails/TeamScalabilitySection";
import CommunityBenefitsSection from "../components/monthlypassdetails/CommunityBenefitsSection";
import ReviewsSection from "../components/monthlypassdetails/ReviewsSection";
import NearbyWorkspacesSection from "../components/monthlypassdetails/NearbyWorkspacesSection";
import WorkspaceComparisonSection from "../components/monthlypassdetails/WorkspaceComparisonSection";
import BusinessSolutionsSection from "../components/monthlypassdetails/BusinessSolutionsSection";
import CorporateEnquirySection from "../components/monthlypassdetails/CorporateEnquirySection";
import BokkoExpertWidget from "../components/monthlypassdetails/BokkoExpertWidget";
import MobileBottomBar from "../components/monthlypassdetails/MobileBottomBar";
import { CITY_NAMES } from "../data/monthlyPassListings";
import type { MonthlyPassListing } from "../data/monthlyPassListings";
import { billingTiers } from "../data/monthlyPassDetails";
import type { MonthlyPassDetails } from "../data/monthlyPassDetails";
import { apiGet } from "../lib/api";
import { apiToMonthlyPassListing, apiToMonthlyPassDetails, type CentreApiRow } from "../lib/centreAdapter";
import DetailPageSkeleton from "../components/ui/DetailPageSkeleton";

function cityLabel(slug: string) {
  return (
    CITY_NAMES[slug] ??
    slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

export default function MonthlyPassDetailsPage() {
  const params = useParams<{ city: string; passSlug: string }>();
  const lockedCitySlug = params.city ? params.city.toLowerCase() : null;
  const citySlug = lockedCitySlug ?? "mumbai";
  const cityName = lockedCitySlug ? cityLabel(lockedCitySlug) : "India";

  const [listing, setListing] = useState<MonthlyPassListing | null>(null);
  const [details, setDetails] = useState<MonthlyPassDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiGet<CentreApiRow>(`/centers/${params.passSlug}`)
      .then((raw) => {
        setListing(apiToMonthlyPassListing(raw));
        setDetails(apiToMonthlyPassDetails(raw));
      })
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [params.passSlug]);

  useEffect(() => {
    if (!listing) return;
    document.title = `${listing.name} | Coworking Membership in ${cityName} | Bokko`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute(
      "content",
      `Book a coworking membership at ${listing.name} in ${listing.locality}, ${cityName}. Open desks, dedicated desks and private cabins on Bokko.`,
    );
  }, [listing, cityName]);

  if (loading) {
    return <DetailPageSkeleton />;
  }

  if (!listing || !details) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
          <p className="text-xl font-bold text-[#0F172A]">Workspace not found</p>
          <p className="text-sm text-[#64748B]">This listing may have moved or no longer exists.</p>
          <Link to={`/${citySlug}/monthly-pass`} className="rounded-xl bg-[#111111] px-5 py-2.5 text-sm font-semibold text-white hover:bg-black">
            Browse Monthly Pass Workspaces in {cityName}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const sameCityListings: MonthlyPassListing[] = [];
  const hasParking = listing.accessibility.includes("Parking (Free/Paid)");

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Header />

      <main className="flex-1 animate-fade-in-up pb-24 sm:pb-0">
        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-[#64748B]">
            <Link to="/" className="hover:text-[#2563EB]">
              Home
            </Link>
            <ChevronRight size={14} />
            <Link to={`/${citySlug}/monthly-pass`} className="hover:text-[#2563EB]">
              Monthly Pass
            </Link>
            <ChevronRight size={14} />
            <span>{cityName}</span>
            <ChevronRight size={14} />
            <span className="font-semibold text-[#0F172A]">{listing.name}</span>
          </nav>

          <div className="mt-4">
            <GalleryHero images={details.galleryImages} name={listing.name} />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="flex min-w-0 flex-col gap-12">
              <WorkspaceHeader listing={listing} badges={details.badges} cityName={cityName} />

              <WorkspaceMatchScoreSection items={details.matchScoreItems} score={details.matchScore} />

              <AiRecommendationSection items={details.aiRecommendedFor} />

              <WhyChooseSection features={details.whyChooseFeatures} />

              <MembershipPlansTable membershipTypes={details.membershipTypes} />

              <SeatingOptionsSection options={details.seatingOptions} />

              <AmenitiesGrid amenities={details.amenities} />

              <LocationSection
                address={`${listing.name}, ${listing.locality}, ${cityName}`}
                metroDistanceKm={details.metroDistanceKm}
                railwayDistanceKm={details.railwayDistanceKm}
                airportDistanceKm={details.airportDistanceKm}
                hasParking={hasParking}
                nearbyPlaces={details.nearbyPlaces}
              />

              <WhoIsThisForSection items={details.whoIsThisFor} />

              <TeamScalabilitySection seatTiers={details.seatTiers} />

              <CommunityBenefitsSection benefits={details.communityBenefits} />

              <ReviewsSection
                rating={listing.rating}
                reviewCount={listing.reviews}
                ratingBreakdown={details.ratingBreakdown}
                aiLovedTags={details.aiLovedTags}
                reviews={details.reviews}
              />

              <NearbyWorkspacesSection current={listing} />

              <WorkspaceComparisonSection current={listing} allListings={sameCityListings} />

              <BusinessSolutionsSection citySlug={citySlug} />

              <CorporateEnquirySection />
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <BookingCard membershipTypes={details.membershipTypes} billingTiers={billingTiers} listing={listing} />
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />

      <BokkoExpertWidget />

      <MobileBottomBar membershipTypes={details.membershipTypes} billingTiers={billingTiers} listing={listing} />
    </div>
  );
}
