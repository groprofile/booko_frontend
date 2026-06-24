import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import GalleryHero from "../components/meetingroomdetails/GalleryHero";
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
import { CITY_NAMES, meetingRoomListings } from "../data/meetingRoomListings";
import { getMeetingRoomDetails } from "../data/meetingRoomDetails";
import { slugify } from "../utils/slug";

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
  const citySlug = (params.city ?? "mumbai").toLowerCase();
  const cityName = cityLabel(citySlug);

  const listing = useMemo(
    () => meetingRoomListings.find((item) => item.city === citySlug && slugify(item.workspaceName) === params.roomSlug),
    [citySlug, params.roomSlug],
  );

  const details = useMemo(() => (listing ? getMeetingRoomDetails(listing) : null), [listing]);

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("10:00");
  const [attendees, setAttendees] = useState(4);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedDurationKey, setSelectedDurationKey] = useState("");
  const [selectedAddOnKeys, setSelectedAddOnKeys] = useState<string[]>([]);

  useEffect(() => {
    if (!details) return;
    setSelectedRoomId(details.siblingRoomTypes[0].id);
    setSelectedDurationKey(details.siblingRoomTypes[0].pricing[0].key);
    setAttendees(details.siblingRoomTypes[0].capacity > 4 ? 4 : details.siblingRoomTypes[0].capacity);
  }, [details]);

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

  if (!listing || !details) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
          <p className="text-xl font-bold text-[#0F172A]">Meeting room not found</p>
          <p className="text-sm text-[#64748B]">This room may have moved or no longer exists.</p>
          <Link to={`/${citySlug}/meeting-rooms`} className="rounded-xl bg-[#111111] px-5 py-2.5 text-sm font-semibold text-white hover:bg-black">
            Browse Meeting Rooms in {cityName}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const selectedRoom = details.siblingRoomTypes.find((room) => room.id === selectedRoomId) ?? details.siblingRoomTypes[0];
  const selectedTier = selectedRoom.pricing.find((tier) => tier.key === selectedDurationKey) ?? selectedRoom.pricing[0];
  const addOnsTotal = details.addOns
    .filter((addOn) => selectedAddOnKeys.includes(addOn.key))
    .reduce((sum, addOn) => sum + addOn.price, 0);
  const total = selectedTier.price + addOnsTotal;
  const costPerPerson = Math.round(total / Math.max(1, attendees));
  const sameCityListings = meetingRoomListings.filter((item) => item.city === citySlug);

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
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Header />

      <main className="flex-1 pb-24 sm:pb-0">
        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-[#64748B]">
            <Link to="/" className="hover:text-[#2563EB]">
              Home
            </Link>
            <ChevronRight size={14} />
            <Link to={`/${citySlug}/meeting-rooms`} className="hover:text-[#2563EB]">
              Meeting Rooms
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
              <RoomDetailHeader listing={listing} details={details} cityName={cityName} />

              <WhyBookSection cards={details.whyBookCards} />

              <RoomConfigurationsSection configurations={details.roomConfigurations} />

              <EquipmentTechSection equipment={details.equipmentTech} />

              <AddOnsSection addOns={details.addOns} selectedKeys={selectedAddOnKeys} onToggle={toggleAddOn} />

              <LocationSection address={`${listing.workspaceName}, ${listing.locality}, ${cityName}`} details={details} />

              <HostDetailsSection host={details.host} />

              <HouseRulesSection rules={details.rules} />

              <ReviewsSection details={details} />

              <SimilarRoomsSection current={listing} citySlug={citySlug} allListings={sameCityListings} />

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
      </main>

      <Footer />

      <BokkoExpertWidget />

      <MobileBottomBar {...bookingCardProps} />
    </div>
  );
}
