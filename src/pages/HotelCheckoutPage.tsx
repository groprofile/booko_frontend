import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LoginModal from "../components/LoginModal";
import TrustStrip from "../components/checkout/TrustStrip";
import BookingSummaryCard from "../components/checkout/BookingSummaryCard";
import GuestDetailsSection from "../components/checkout/GuestDetailsSection";
import type { AdditionalGuest, PrimaryGuest } from "../components/checkout/GuestDetailsSection";
import SpecialRequestsSection from "../components/checkout/SpecialRequestsSection";
import WhyBookSection from "../components/checkout/WhyBookSection";
import LoginBenefitsSection from "../components/checkout/LoginBenefitsSection";
import ConfidenceBar from "../components/checkout/ConfidenceBar";
import BookingSidebar from "../components/checkout/BookingSidebar";
import CouponApply from "../components/checkout/CouponApply";
import type { AvailableCoupon } from "../lib/offers";
import { bestOfferForListing } from "../lib/offers";
import { useActiveOffers } from "../hooks/useActiveOffers";
import BokkoExpertWidget from "../components/checkout/BokkoExpertWidget";
import MobileContinueBar from "../components/checkout/MobileContinueBar";
import { ShieldCheck } from "lucide-react";
import { apiPost, getUserToken } from "../lib/api";
import { submitPayuForm } from "../lib/payu";
import type { CheckoutBookingState } from "../data/checkoutConfig";

interface HotelQuote {
  nights: number;
  totalRupees: number;
  finalTotalRupees?: number;
  centerPriceRupees?: number;
  commissionRupees?: number;
  gstRupees?: number;
  couponCode?: string;
  couponDiscountRupees?: number;
  availableCoupons?: AvailableCoupon[];
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
}

export default function HotelCheckoutPage() {
  const location = useLocation();
  const booking = (location.state as CheckoutBookingState | undefined) ?? null;

  const [primaryGuest, setPrimaryGuest] = useState<PrimaryGuest>({ title: "Mr", firstName: "", lastName: "", email: "", mobile: "" });
  const [additionalGuests, setAdditionalGuests] = useState<AdditionalGuest[]>([]);
  const [isBusinessBooking, setIsBusinessBooking] = useState(false);
  const [gstNumber, setGstNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [specialRequests, setSpecialRequests] = useState<string[]>([]);
  const [loginOpen, setLoginOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [quote, setQuote] = useState<HotelQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  // Coupon state: a chosen code, or "cleared" (suppress auto-apply). undefined =
  // let the backend auto-apply the best eligible offer.
  const [couponCode, setCouponCode] = useState<string | undefined>(undefined);
  const [couponCleared, setCouponCleared] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    document.title = booking ? `Checkout - ${booking.hotelName} | Bokko` : "Checkout | Bokko";
  }, [booking]);

  const nights = useMemo(() => (booking ? nightsBetween(booking.checkIn, booking.checkOut) : 1), [booking]);

  useEffect(() => {
    if (!booking) return;
    const token = getUserToken();
    if (!token) {
      setQuote(null);
      return;
    }
    let cancelled = false;
    setQuoteLoading(true);
    setQuoteError("");
    apiPost<HotelQuote>("/bookings/quote", {
      centerId: booking.hotelId,
      productType: "hotel_room",
      planId: booking.roomId,
      bookingDate: booking.checkIn,
      checkoutDate: booking.checkOut,
      roomCount: booking.roomCount,
      guestCount: booking.guests,
      ...(couponCode ? { couponCode } : {}),
      ...(couponCleared ? { applyBestOffer: false } : {}),
    }, token)
      .then((result) => {
        if (!cancelled) {
          setQuote(result);
          setCouponError(null);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = (err as Error).message ?? "Could not calculate the price. Please try again.";
        if (couponCode) {
          // The entered/chosen coupon isn't valid — surface it and revert to auto.
          setCouponError(msg);
          setCouponCode(undefined);
        } else {
          setQuote(null);
          setQuoteError(msg);
        }
      })
      .finally(() => {
        if (!cancelled) setQuoteLoading(false);
      });
    return () => { cancelled = true; };
  }, [booking, couponCode, couponCleared]);

  function toggleSpecialRequest(request: string) {
    setSpecialRequests((current) => (current.includes(request) ? current.filter((r) => r !== request) : [...current, request]));
  }

  function addGuest(type: AdditionalGuest["type"]) {
    setAdditionalGuests((current) => [...current, { id: `guest-${current.length}-${Date.now()}`, type }]);
  }

  function removeGuest(id: string) {
    setAdditionalGuests((current) => current.filter((guest) => guest.id !== id));
  }

  const offers = useActiveOffers();
  const roomCost = booking ? booking.stayPrice * booking.roomCount * nights : 0;
  
  const estimatedOffer = useMemo(() => {
    if (quote || !booking) return null;
    return bestOfferForListing(offers, "hotel", roomCost, booking.hotelId);
  }, [offers, quote, roomCost, booking]);

  const discount = quote ? (quote.couponDiscountRupees ?? 0) : (estimatedOffer?.discountRupees ?? 0);
  const totalAmount = quote 
    ? (quote.finalTotalRupees ?? (quote.totalRupees - discount)) 
    : (estimatedOffer?.finalRupees ?? roomCost);
  const centerPrice = quote?.centerPriceRupees ?? roomCost;
  const commission = quote?.commissionRupees ?? 0;
  const gst = quote?.gstRupees ?? 0;

  const guestDetailsValid = Boolean(
    primaryGuest.firstName.trim() && primaryGuest.lastName.trim() && primaryGuest.email.trim() && primaryGuest.mobile.trim().length >= 10,
  );
  const canContinue = guestDetailsValid;

  async function handleContinue() {
    if (!booking) return;
    if (!canContinue) {
      setValidationMessage("Please fill in all guest details to continue.");
      return;
    }
    const token = getUserToken();
    if (!token) {
      setValidationMessage("Please sign in to complete your booking.");
      setLoginOpen(true);
      return;
    }
    setValidationMessage("");
    setSubmitting(true);
    try {
      const created = await apiPost<{ bookingId?: string; booking?: { id?: string }; payment?: { bookingId?: string } }>("/bookings", {
        centerId: booking.hotelId,
        productType: "hotel_room",
        planId: booking.roomId,
        bookingDate: booking.checkIn,
        checkoutDate: booking.checkOut,
        roomCount: booking.roomCount,
        guestCount: booking.guests,
        ...(couponCode ? { couponCode } : {}),
        ...(couponCleared ? { applyBestOffer: false } : {}),
      }, token);
      const newBookingId = created.payment?.bookingId ?? created.booking?.id ?? created.bookingId;
      if (!newBookingId) throw new Error("Booking created but its ID was missing. Please contact support.");
      const payuParams = await apiPost<Record<string, string>>(
        `/payments/booking/${newBookingId}/initiate-web`,
        {},
        token,
      );
      submitPayuForm(payuParams);
    } catch (err) {
      setValidationMessage((err as Error).message ?? "Booking failed. Please try again.");
      setSubmitting(false);
    }
  }

  if (!booking) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
          <p className="text-xl font-bold text-[#0F172A]">No booking selected</p>
          <p className="text-sm text-[#64748B]">Please select a room from a hotel's details page to continue.</p>
          <Link to="/" className="rounded-xl bg-[#111111] px-5 py-2.5 text-sm font-semibold text-white hover:bg-black">
            Browse Hotels
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const isFreeCancellation = booking.cancellationPolicy.toLowerCase().includes("free");

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Header />

      <main className="flex-1 pb-28 sm:pb-0">
        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-[#64748B]">
            <Link to="/" className="hover:text-[#2563EB]">Home</Link>
            <ChevronRight size={14} />
            <Link to={`/${booking.citySlug}/hotels`} className="hover:text-[#2563EB]">Hotels</Link>
            <ChevronRight size={14} />
            <span className="font-semibold text-[#0F172A]">Checkout</span>
          </nav>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-3xl">Confirm & Pay</h1>

          <div className="mt-5">
            <TrustStrip freeCancellation={isFreeCancellation} />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="flex min-w-0 flex-col gap-10">
              <BookingSummaryCard booking={booking} />
              <GuestDetailsSection
                primaryGuest={primaryGuest}
                onChangePrimaryGuest={(patch) => setPrimaryGuest((current) => ({ ...current, ...patch }))}
                additionalGuests={additionalGuests}
                onAddGuest={addGuest}
                onRemoveGuest={removeGuest}
                isBusinessBooking={isBusinessBooking}
                onToggleBusinessBooking={() => setIsBusinessBooking((v) => !v)}
                gstNumber={gstNumber}
                onGstNumberChange={setGstNumber}
                companyName={companyName}
                onCompanyNameChange={setCompanyName}
                billingAddress={billingAddress}
                onBillingAddressChange={setBillingAddress}
              />
              <SpecialRequestsSection selected={specialRequests} onToggle={toggleSpecialRequest} />
              {getUserToken() && (
                <CouponApply
                  available={quote?.availableCoupons ?? []}
                  appliedCode={quote?.couponCode ?? null}
                  appliedDiscount={quote?.couponDiscountRupees ?? 0}
                  loading={quoteLoading}
                  error={couponError}
                  onApply={(code) => { setCouponCleared(false); setCouponError(null); setCouponCode(code); }}
                  onClear={() => { setCouponError(null); setCouponCode(undefined); setCouponCleared(true); }}
                />
              )}
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">Payment</h2>
                <div className="mt-3 flex items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4">
                  <ShieldCheck size={22} strokeWidth={1.75} className="mt-0.5 shrink-0 text-[#16A34A]" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#0F172A]">Secure payment via PayU</p>
                    <p className="mt-0.5 text-[13px] leading-snug text-[#64748B]">
                      Tap Confirm &amp; Pay to continue to PayU, where you can pay by UPI, card, net banking or wallet. Your booking is confirmed the moment payment succeeds.
                    </p>
                  </div>
                </div>
              </div>
              <WhyBookSection />
              {!getUserToken() && <LoginBenefitsSection onSignIn={() => setLoginOpen(true)} />}
              <ConfidenceBar freeCancellation={isFreeCancellation} />
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <BookingSidebar
                  roomName={booking.roomName}
                  nights={nights}
                  centerPrice={centerPrice}
                  commission={commission}
                  gst={gst}
                  totalAmount={totalAmount}
                  discount={discount}
                  couponCode={quote?.couponCode}
                  isEstimate={!quote}
                  quoteLoading={quoteLoading}
                  canContinue={canContinue}
                  submitting={submitting}
                  onContinue={handleContinue}
                />
                {(validationMessage || quoteError) && (
                  <p className="mt-2 text-center text-xs font-semibold text-[#DC2626]">{validationMessage || quoteError}</p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
      <BokkoExpertWidget />
      <MobileContinueBar totalAmount={totalAmount} canContinue={canContinue} submitting={submitting} onContinue={handleContinue} />
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} onSuccess={handleContinue} />
    </div>
  );
}
