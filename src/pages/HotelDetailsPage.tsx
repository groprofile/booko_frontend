import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import GalleryHero from "../components/hoteldetails/GalleryHero";
import HotelDetailHeader from "../components/hoteldetails/HotelDetailHeader";
import BookingCard from "../components/hoteldetails/BookingCard";
import WhyBookSection from "../components/hoteldetails/WhyBookSection";
import RoomOptionsSection from "../components/hoteldetails/RoomOptionsSection";
import AmenitiesGrid from "../components/hoteldetails/AmenitiesGrid";
import AboutPropertySection from "../components/hoteldetails/AboutPropertySection";
import LocationSection from "../components/hoteldetails/LocationSection";
import PropertyRulesSection from "../components/hoteldetails/PropertyRulesSection";
import ReviewsSection from "../components/hoteldetails/ReviewsSection";
import SimilarPropertiesSection from "../components/hoteldetails/SimilarPropertiesSection";
import NearbyExperiencesSection from "../components/hoteldetails/NearbyExperiencesSection";
import TrustSection from "../components/hoteldetails/TrustSection";
import BokkoExpertWidget from "../components/hoteldetails/BokkoExpertWidget";
import MobileBottomBar from "../components/hoteldetails/MobileBottomBar";
import { CITY_NAMES } from "../data/hotelListings";
import type { HotelListing } from "../data/hotelListings";
import type { HotelDetails } from "../data/hotelDetails";
import { apiGet } from "../lib/api";
import { apiToHotelListing, apiToHotelDetails, type CentreApiRow } from "../lib/centreAdapter";

function cityLabel(slug: string) {
  return (
    CITY_NAMES[slug] ??
    slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

export default function HotelDetailsPage() {
  const params = useParams<{ city: string; hotelSlug: string }>();
  const citySlug = (params.city ?? "mumbai").toLowerCase();
  const cityName = cityLabel(citySlug);

  const [listing, setListing] = useState<HotelListing | null>(null);
  const [details, setDetails] = useState<HotelDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const [checkIn, setCheckIn] = useState(() => new Date().toISOString().slice(0, 10));
  const [checkOut, setCheckOut] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [guests, setGuests] = useState(2);
  const [roomCount, setRoomCount] = useState(1);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedStayKey, setSelectedStayKey] = useState("");
  const [selectedMealKey, setSelectedMealKey] = useState("");

  useEffect(() => {
    setLoading(true);
    apiGet<CentreApiRow>(`/centers/${params.hotelSlug}`)
      .then((raw) => {
        setListing(apiToHotelListing(raw));
        const d = apiToHotelDetails(raw);
        setDetails(d);
        setSelectedRoomId(d.rooms[0].id);
        const firstAvailable = d.rooms[0].pricing.find((tier) => tier.available) ?? d.rooms[0].pricing[0];
        setSelectedStayKey(firstAvailable.key);
        setSelectedMealKey(d.mealOptions[0].key);
      })
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [params.hotelSlug]);

  useEffect(() => {
    if (!listing) return;
    document.title = `${listing.name} | Hotels in ${cityName} | Bokko`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute(
      "content",
      `Book ${listing.name} in ${listing.locality}, ${cityName}. Compare room options, hourly stays and pricing on Bokko.`,
    );
  }, [listing, cityName]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-[#64748B]">Loading…</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!listing || !details) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
          <p className="text-xl font-bold text-[#0F172A]">Hotel not found</p>
          <p className="text-sm text-[#64748B]">This property may have moved or no longer exists.</p>
          <Link to={`/${citySlug}/hotels`} className="rounded-xl bg-[#111111] px-5 py-2.5 text-sm font-semibold text-white hover:bg-black">
            Browse Hotels in {cityName}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const selectedRoom = details.rooms.find((room) => room.id === selectedRoomId) ?? details.rooms[0];

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
            <Link to={`/${citySlug}/hotels`} className="hover:text-[#2563EB]">
              Hotels
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
              <HotelDetailHeader listing={listing} details={details} cityName={cityName} />

              <WhyBookSection cards={details.whyBookCards} />

              <RoomOptionsSection rooms={details.rooms} selectedRoomId={selectedRoomId} onSelectRoom={setSelectedRoomId} />

              <AmenitiesGrid categories={details.amenityCategories} />

              <AboutPropertySection details={details} />

              <LocationSection address={`${listing.name}, ${listing.locality}, ${cityName}`} details={details} />

              <PropertyRulesSection details={details} />

              <ReviewsSection rating={listing.rating} reviewCount={listing.reviews} details={details} />

              <SimilarPropertiesSection current={listing} citySlug={citySlug} allListings={[]} />

              <NearbyExperiencesSection citySlug={citySlug} />

              <TrustSection />
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <BookingCard
                  listing={listing}
                  citySlug={citySlug}
                  cityName={cityName}
                  details={details}
                  selectedRoom={selectedRoom}
                  checkIn={checkIn}
                  onCheckInChange={setCheckIn}
                  checkOut={checkOut}
                  onCheckOutChange={setCheckOut}
                  guests={guests}
                  onGuestsChange={setGuests}
                  roomCount={roomCount}
                  onRoomCountChange={setRoomCount}
                  selectedStayKey={selectedStayKey}
                  onSelectStay={setSelectedStayKey}
                  selectedMealKey={selectedMealKey}
                  onSelectMeal={setSelectedMealKey}
                />
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />

      <BokkoExpertWidget />

      <MobileBottomBar
        listing={listing}
        citySlug={citySlug}
        cityName={cityName}
        details={details}
        selectedRoom={selectedRoom}
        checkIn={checkIn}
        onCheckInChange={setCheckIn}
        checkOut={checkOut}
        onCheckOutChange={setCheckOut}
        guests={guests}
        onGuestsChange={setGuests}
        roomCount={roomCount}
        onRoomCountChange={setRoomCount}
        selectedStayKey={selectedStayKey}
        onSelectStay={setSelectedStayKey}
        selectedMealKey={selectedMealKey}
        onSelectMeal={setSelectedMealKey}
      />
    </div>
  );
}
