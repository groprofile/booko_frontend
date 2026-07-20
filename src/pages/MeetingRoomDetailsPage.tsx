import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import DetailGallery from "../components/common/DetailGallery";
import RoomDetailHeader from "../components/meetingroomdetails/RoomDetailHeader";
import BookingCard from "../components/meetingroomdetails/BookingCard";
import MeetingSuccessCalculator from "../components/meetingroomdetails/MeetingSuccessCalculator";
import WhyBookSection from "../components/meetingroomdetails/WhyBookSection";
import RoomConfigurationsSection from "../components/meetingroomdetails/RoomConfigurationsSection";
import EquipmentTechSection from "../components/meetingroomdetails/EquipmentTechSection";
import AddOnsSection from "../components/meetingroomdetails/AddOnsSection";
import LocationSection from "../components/meetingroomdetails/LocationSection";
import HostDetailsSection from "../components/meetingroomdetails/HostDetailsSection";
import HouseRulesSection from "../components/meetingroomdetails/HouseRulesSection";
import ReviewsSection from "../components/meetingroomdetails/ReviewsSection";
import SimilarRoomsSection from "../components/meetingroomdetails/SimilarRoomsSection";
import WorkspaceBundleSection from "../components/meetingroomdetails/WorkspaceBundleSection";
import CorporateEnquirySection from "../components/meetingroomdetails/CorporateEnquirySection";
import BokkoExpertWidget from "../components/meetingroomdetails/BokkoExpertWidget";
import MobileBottomBar from "../components/meetingroomdetails/MobileBottomBar";
import { CITY_NAMES } from "../data/meetingRoomListings";
import type { MeetingRoomListing } from "../data/meetingRoomListings";
import type { MeetingRoomDetails } from "../data/meetingRoomDetails";
import { apiGet } from "../lib/api";
import { apiToMeetingRoomListing, apiToMeetingRoomDetails, type CentreApiRow } from "../lib/centreAdapter";
import { fetchCenterReviews } from "../lib/reviews";
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

export default function MeetingRoomDetailsPage() {
  const params = useParams<{ city: string; roomSlug: string }>();
  const lockedCitySlug = params.city ? params.city.toLowerCase() : null;
  const citySlug = lockedCitySlug ?? "mumbai";
  const cityName = lockedCitySlug ? cityLabel(lockedCitySlug) : "India";

  const [listing, setListing] = useState<MeetingRoomListing | null>(null);
  const [details, setDetails] = useState<MeetingRoomDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("10:00");
  const [attendees, setAttendees] = useState(4);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedDurationKey, setSelectedDurationKey] = useState("");
  const [selectedAddOnKeys, setSelectedAddOnKeys] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    apiGet<CentreApiRow>(`/centers/${params.roomSlug}`)
      .then((raw) => {
        setListing(apiToMeetingRoomListing(raw));
        const d = apiToMeetingRoomDetails(raw);
        setDetails(d);
        setSelectedRoomId(d.siblingRoomTypes[0].id);
        setSelectedDurationKey(d.siblingRoomTypes[0].pricing[0].key);
        setAttendees(d.siblingRoomTypes[0].capacity > 4 ? 4 : d.siblingRoomTypes[0].capacity);
        fetchCenterReviews(raw.id)
          .then((r) => {
            setDetails((prev) => prev ? {
              ...prev,
              reviews: r.reviews.map((review) => ({ ...review, useCase: "General" })),
              ratingBreakdown: r.ratingBreakdown,
              reviewCount: r.totalReviews,
              rating: r.avgRating ?? prev.rating,
            } : prev);
          })
          .catch(() => {});
      })
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [params.roomSlug]);

  useEffect(() => {
    if (!listing) return;
    document.title = `${listing.name} | ${listing.workspaceName} | ${cityName} | Bokko`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute(
      "content",
      `Book ${listing.name} at ${listing.workspaceName} in ${listing.locality}, ${cityName}. Instant confirmation on Bokko.`,
    );
  }, [listing, cityName]);

  function toggleAddOn(key: string) {
    setSelectedAddOnKeys((current) => (current.includes(key) ? current.filter((k) => k !== key) : [...current, key]));
  }

  if (loading) {
    return <DetailPageSkeleton />;
  }

  if (!listing || !details) {
    return (
      <MainLayout>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
          <p className="text-xl font-bold text-primary-text">Meeting room not found</p>
          <p className="text-sm text-muted-text">This room may have moved or no longer exists.</p>
          <Link to={`/${citySlug}/meeting-rooms`} className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep">
            Browse Meeting Rooms in {cityName}
          </Link>
        </div>
      </MainLayout>
    );
  }

  const selectedRoom = details.siblingRoomTypes.find((room) => room.id === selectedRoomId) ?? details.siblingRoomTypes[0];
  const selectedTier = selectedRoom.pricing.find((tier) => tier.key === selectedDurationKey) ?? selectedRoom.pricing[0];
  const addOnsTotal = details.addOns
    .filter((addOn) => selectedAddOnKeys.includes(addOn.key))
    .reduce((sum, addOn) => sum + addOn.price, 0);
  const total = selectedTier.price + addOnsTotal;
  const costPerPerson = Math.round(total / Math.max(1, attendees));

  const bookingCardProps = {
    listing,
    citySlug,
    cityName,
    equipmentTech: details.equipmentTech,
    siblingRoomTypes: details.siblingRoomTypes,
    addOns: details.addOns,
    selectedRoomId,
    onSelectRoom: setSelectedRoomId,
    date,
    onDateChange: setDate,
    startTime,
    onStartTimeChange: setStartTime,
    selectedDurationKey,
    onSelectDuration: setSelectedDurationKey,
    attendees,
    onAttendeesChange: setAttendees,
    selectedAddOnKeys,
    onToggleAddOn: toggleAddOn,
  };

  return (
    <MainLayout>
      <div className="animate-fade-in-up pb-24 sm:pb-0">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-muted-text">
            <Link to="/" className="hover:text-brand">
              Home
            </Link>
            <ChevronRight size={14} />
            <Link to={`/${citySlug}/meeting-rooms`} className="hover:text-brand">
              Meeting Rooms
            </Link>
            <ChevronRight size={14} />
            <span>{cityName}</span>
            <ChevronRight size={14} />
            <span className="font-semibold text-primary-text">{listing.name}</span>
          </nav>

          <div className="mt-2">
            <DetailGallery images={details.galleryImages} name={listing.name} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="flex min-w-0 flex-col gap-6">
              <RoomDetailHeader listing={listing} details={details} cityName={cityName} />

              <WhyBookSection cards={details.whyBookCards} />

              <RoomConfigurationsSection configurations={details.roomConfigurations} />

              <EquipmentTechSection equipment={details.equipmentTech} />

              <AddOnsSection addOns={details.addOns} selectedKeys={selectedAddOnKeys} onToggle={toggleAddOn} />

              <LocationSection address={`${listing.workspaceName}, ${listing.locality}, ${cityName}`} details={details} />

              <HostDetailsSection host={details.host} />

              <HouseRulesSection rules={details.rules} />

              <ReviewsSection details={details} />

              <SimilarRoomsSection current={listing} />

              <WorkspaceBundleSection citySlug={citySlug} />

              <CorporateEnquirySection />
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <BookingCard {...bookingCardProps} />
                <MeetingSuccessCalculator
                  durationLabel={selectedTier.label}
                  attendees={attendees}
                  teaCoffeeIncluded={selectedAddOnKeys.includes("tea-coffee")}
                  wifiIncluded
                  projectorIncluded={details.equipmentTech.includes("Projector")}
                  costPerPerson={costPerPerson}
                />
              </div>
            </aside>
          </div>
        </div>
      </div>

      <BokkoExpertWidget />

      <MobileBottomBar {...bookingCardProps} />
    </MainLayout>
  );
}
