import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ImageGallery from "../components/daypassdetails/ImageGallery";
import WorkspaceHeader from "../components/daypassdetails/WorkspaceHeader";
import SeatingOptionsSection from "../components/daypassdetails/SeatingOptionsSection";
import WhyBookWithBokko from "../components/daypassdetails/WhyBookWithBokko";
import LocationDetailsSection from "../components/daypassdetails/LocationDetailsSection";
import AmenitiesSection from "../components/daypassdetails/AmenitiesSection";
import AboutWorkspaceSection from "../components/daypassdetails/AboutWorkspaceSection";
import ReviewsSection from "../components/daypassdetails/ReviewsSection";
import SimilarWorkspacesSection from "../components/daypassdetails/SimilarWorkspacesSection";
import BookingCard from "../components/daypassdetails/BookingCard";
import MobileBookingBar from "../components/daypassdetails/MobileBookingBar";
import { CITY_NAMES } from "../data/dayPassListings";
import type { DayPassListing } from "../data/dayPassListings";
import type { DayPassDetails } from "../data/dayPassDetails";
import { apiGet } from "../lib/api";
import { apiToDayPassListing, apiToDayPassDetails, type CentreApiRow } from "../lib/centreAdapter";
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

export default function DayPassDetailsPage() {
  const params = useParams<{ city: string; listingId: string }>();
  const lockedCitySlug = params.city ? params.city.toLowerCase() : null;
  const citySlug = lockedCitySlug ?? "mumbai";
  const cityName = lockedCitySlug ? cityLabel(lockedCitySlug) : "India";

  const [listing, setListing] = useState<DayPassListing | null>(null);
  const [details, setDetails] = useState<DayPassDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [members, setMembers] = useState(1);
  const [selectedType, setSelectedType] = useState("");

  useEffect(() => {
    setLoading(true);
    apiGet<CentreApiRow>(`/centers/${params.listingId}`)
      .then((raw) => {
        const l = apiToDayPassListing(raw);
        setListing(l);
        setDetails(apiToDayPassDetails(raw));
        setSelectedType(l.seatingTypes[0] ?? "");
      })
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [params.listingId]);

  useEffect(() => {
    if (!listing) return;
    document.title = `${listing.name} | Day Pass in ${cityName} | Bokko`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute(
      "content",
      `Book a day pass at ${listing.name} in ${listing.locality}, ${cityName}. Compare seating options, amenities and pricing on Bokko.`,
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
          <p className="text-sm text-[#64748B]">This day pass listing may have moved or no longer exists.</p>
          <Link
            to={`/${citySlug}/day-pass`}
            className="rounded-xl bg-[#111111] px-5 py-2.5 text-sm font-semibold text-white hover:bg-black"
          >
            Browse Day Pass in {cityName}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

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
            <Link to={`/${citySlug}/day-pass`} className="hover:text-[#2563EB]">
              Day Pass
            </Link>
            <ChevronRight size={14} />
            <span>{cityName}</span>
            <ChevronRight size={14} />
            <span>{listing.locality}</span>
            <ChevronRight size={14} />
            <span className="font-semibold text-[#0F172A]">{listing.name}</span>
          </nav>

          <div className="mt-4">
            <ImageGallery images={details.galleryImages} name={listing.name} />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="flex min-w-0 flex-col gap-12">
              <WorkspaceHeader listing={listing} cityName={cityName} />

              <SeatingOptionsSection
                options={details.seatingOptions}
                selectedType={selectedType}
                onSelect={setSelectedType}
              />

              <WhyBookWithBokko />

              <LocationDetailsSection details={details} />

              <AmenitiesSection amenities={details.amenities} />

              <AboutWorkspaceSection
                details={details}
                openTime={listing.openTime}
                closeTime={listing.closeTime}
              />

              <ReviewsSection
                rating={listing.rating}
                reviews={listing.reviews}
                brand={listing.brand}
                details={details}
              />

              <SimilarWorkspacesSection current={listing} cityName={cityName} />
            </div>

            <aside className="hidden sm:block lg:sticky lg:top-24 lg:self-start">
              <BookingCard
                listing={listing}
                citySlug={citySlug}
                cityName={cityName}
                seatingOptions={details.seatingOptions}
                selectedType={selectedType}
                onSelectType={setSelectedType}
                date={date}
                onDateChange={setDate}
                members={members}
                onMembersChange={setMembers}
              />
            </aside>
          </div>
        </div>
      </main>

      <Footer />

      <MobileBookingBar
        listing={listing}
        citySlug={citySlug}
        cityName={cityName}
        seatingOptions={details.seatingOptions}
        selectedType={selectedType}
        onSelectType={setSelectedType}
        date={date}
        onDateChange={setDate}
        members={members}
        onMembersChange={setMembers}
      />
    </div>
  );
}
