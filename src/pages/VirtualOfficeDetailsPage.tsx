import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HeroSection from "../components/virtualofficedetails/HeroSection";
import TrustScoreSection from "../components/virtualofficedetails/TrustScoreSection";
import WhyThisOfficeSection from "../components/virtualofficedetails/WhyThisOfficeSection";
import BookingCard from "../components/virtualofficedetails/BookingCard";
import PlanComparisonTable from "../components/virtualofficedetails/PlanComparisonTable";
import DocumentRequirementsSection from "../components/virtualofficedetails/DocumentRequirementsSection";
import HowItWorksSection from "../components/virtualofficedetails/HowItWorksSection";
import LocationSection from "../components/virtualofficedetails/LocationSection";
import OfficeFacilitiesSection from "../components/virtualofficedetails/OfficeFacilitiesSection";
import TrustSection from "../components/virtualofficedetails/TrustSection";
import ReviewsSection from "../components/virtualofficedetails/ReviewsSection";
import FaqSection from "../components/virtualofficedetails/FaqSection";
import SimilarOfficesSection from "../components/virtualofficedetails/SimilarOfficesSection";
import BusinessSolutionsSection from "../components/virtualofficedetails/BusinessSolutionsSection";
import CorporateEnquirySection from "../components/virtualofficedetails/CorporateEnquirySection";
import BokkoExpertWidget from "../components/virtualofficedetails/BokkoExpertWidget";
import TrustBanner from "../components/virtualofficedetails/TrustBanner";
import MobileBottomBar from "../components/virtualofficedetails/MobileBottomBar";
import { CITY_NAMES } from "../data/virtualOfficeListings";
import type { VirtualOfficeListing } from "../data/virtualOfficeListings";
import type { VirtualOfficeDetails } from "../data/virtualOfficeDetails";
import { apiGet } from "../lib/api";
import { apiToVirtualOfficeListing, apiToVirtualOfficeDetails, type CentreApiRow } from "../lib/centreAdapter";
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

interface VirtualOfficeDetailsPageProps {
  officeSlug: string;
}

export default function VirtualOfficeDetailsPage({ officeSlug }: VirtualOfficeDetailsPageProps) {
  const params = useParams<{ city: string }>();
  const lockedCitySlug = params.city ? params.city.toLowerCase() : null;
  const citySlug = lockedCitySlug ?? "mumbai";
  const cityName = lockedCitySlug ? cityLabel(lockedCitySlug) : "India";

  const [listing, setListing] = useState<VirtualOfficeListing | null>(null);
  const [details, setDetails] = useState<VirtualOfficeDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiGet<CentreApiRow>(`/centers/${officeSlug}`)
      .then((raw) => {
        setListing(apiToVirtualOfficeListing(raw));
        setDetails(apiToVirtualOfficeDetails(raw));
      })
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [officeSlug]);

  useEffect(() => {
    if (!listing) return;
    document.title = `${listing.centerName} | Virtual Office in ${cityName} | Bokko`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute(
      "content",
      `Book a virtual office at ${listing.centerName} in ${listing.area}, ${cityName}. GST registration, business address and compliance support on Bokko.`,
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
          <p className="text-xl font-bold text-[#0F172A]">Virtual office not found</p>
          <p className="text-sm text-[#64748B]">This listing may have moved or no longer exists.</p>
          <Link to={`/${citySlug}/virtual-office`} className="rounded-xl bg-[#111111] px-5 py-2.5 text-sm font-semibold text-white hover:bg-black">
            Browse Virtual Offices in {cityName}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const sameCityListings: VirtualOfficeListing[] = [];

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
            <Link to={`/${citySlug}/virtual-office`} className="hover:text-[#2563EB]">
              Virtual Office
            </Link>
            <ChevronRight size={14} />
            <span>{cityName}</span>
            <ChevronRight size={14} />
            <span className="font-semibold text-[#0F172A]">{listing.centerName}</span>
          </nav>

          <div className="mt-4">
            <HeroSection listing={listing} details={details} cityName={cityName} />
          </div>

          <div className="mt-6">
            <TrustScoreSection trustScore={details.trustScore} items={details.trustScoreItems} />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="flex min-w-0 flex-col gap-12">
              <WhyThisOfficeSection items={details.whyThisOffice} />

              <PlanComparisonTable rows={details.planComparison} />

              <DocumentRequirementsSection documents={details.documentRequirements} approvalWindow={details.approvalWindow} />

              <HowItWorksSection steps={details.howItWorks} />

              <LocationSection address={`${listing.centerName}, ${listing.area}, ${cityName}`} details={details} />

              <OfficeFacilitiesSection facilities={details.facilities} />

              <TrustSection />

              <ReviewsSection details={details} />

              <FaqSection faqs={details.faqs} />

              <SimilarOfficesSection current={listing} allListings={sameCityListings} />

              <BusinessSolutionsSection citySlug={citySlug} />

              <CorporateEnquirySection />
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <BookingCard listing={listing} citySlug={citySlug} cityName={cityName} plans={listing.plans} />
              </div>
            </aside>
          </div>
        </div>

        <TrustBanner />
      </main>

      <Footer />

      <BokkoExpertWidget />

      <MobileBottomBar listing={listing} citySlug={citySlug} cityName={cityName} plans={listing.plans} />
    </div>
  );
}
