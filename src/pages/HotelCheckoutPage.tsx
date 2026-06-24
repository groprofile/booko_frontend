import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LoginModal from "../components/LoginModal";
import TrustStrip from "../components/checkout/TrustStrip";
import BookingSummaryCard from "../components/checkout/BookingSummaryCard";
import UrgencySection from "../components/checkout/UrgencySection";
import GuestDetailsSection from "../components/checkout/GuestDetailsSection";
import type { AdditionalGuest, PrimaryGuest } from "../components/checkout/GuestDetailsSection";
import SpecialRequestsSection from "../components/checkout/SpecialRequestsSection";
import AddOnsSection from "../components/checkout/AddOnsSection";
import AiRecommendationSection from "../components/checkout/AiRecommendationSection";
import TravelProtectionSection from "../components/checkout/TravelProtectionSection";
import PaymentMethodsSection from "../components/checkout/PaymentMethodsSection";
import OffersCouponSection from "../components/checkout/OffersCouponSection";
import WhyBookSection from "../components/checkout/WhyBookSection";
import LoginBenefitsSection from "../components/checkout/LoginBenefitsSection";
import ConfidenceBar from "../components/checkout/ConfidenceBar";
import BookingSidebar from "../components/checkout/BookingSidebar";
import BokkoExpertWidget from "../components/checkout/BokkoExpertWidget";
import MobileContinueBar from "../components/checkout/MobileContinueBar";
import type { Coupon } from "../data/hotelDetails";
import {
  autoDiscountPercent,
  convenienceFee,
  extraAddOns,
  getUrgencySignals,
  mealAddOns,
  taxRate,
  travelProtectionPlan,
} from "../data/checkoutConfig";
import type { CheckoutBookingState } from "../data/checkoutConfig";

let guestIdCounter = 0;

export default function HotelCheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = (location.state as CheckoutBookingState | undefined) ?? null;

  const [primaryGuest, setPrimaryGuest] = useState<PrimaryGuest>({ title: "Mr", firstName: "", lastName: "", email: "", mobile: "" });
  const [additionalGuests, setAdditionalGuests] = useState<AdditionalGuest[]>([]);
  const [isBusinessBooking, setIsBusinessBooking] = useState(false);
  const [gstNumber, setGstNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [specialRequests, setSpecialRequests] = useState<string[]>([]);
  const [mealAddOnKey, setMealAddOnKey] = useState<string | null>(null);
  const [extraAddOnKeys, setExtraAddOnKeys] = useState<string[]>([]);
  const [protectionSelected, setProtectionSelected] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");

  const urgencySignals = useMemo(() => (booking ? getUrgencySignals(booking.hotelId) : null), [booking]);

  useEffect(() => {
    document.title = booking ? `Checkout - ${booking.hotelName} | Bokko` : "Checkout | Bokko";
  }, [booking]);

  function toggleSpecialRequest(request: string) {
    setSpecialRequests((current) => (current.includes(request) ? current.filter((r) => r !== request) : [...current, request]));
  }

  function toggleExtraAddOn(key: string) {
    setExtraAddOnKeys((current) => (current.includes(key) ? current.filter((k) => k !== key) : [...current, key]));
  }

  function addGuest(type: AdditionalGuest["type"]) {
    guestIdCounter += 1;
    setAdditionalGuests((current) => [...current, { id: `guest-${guestIdCounter}`, type }]);
  }

  function removeGuest(id: string) {
    setAdditionalGuests((current) => current.filter((guest) => guest.id !== id));
  }

  function applyCouponByCode(code: string) {
    if (!booking) return;
    const matched = booking.coupons.find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
    if (matched) setAppliedCoupon(matched);
  }

  function autoApplyBestCoupon() {
    if (!booking || booking.coupons.length === 0) return;
    const best = [...booking.coupons].sort((a, b) => b.discountPercent - a.discountPercent)[0];
    setAppliedCoupon(best);
  }

  const selectedMealAddOn = mealAddOns.find((addOn) => addOn.key === mealAddOnKey) ?? null;
  const selectedExtraAddOns = extraAddOns.filter((addOn) => extraAddOnKeys.includes(addOn.key));
  const selectedAddOnLabels = [...(selectedMealAddOn ? [selectedMealAddOn.label] : []), ...selectedExtraAddOns.map((addOn) => addOn.label)];

  const roomCost = booking ? booking.stayPrice * booking.roomCount : 0;
  const addOnsTotal = (selectedMealAddOn?.price ?? 0) + selectedExtraAddOns.reduce((sum, addOn) => sum + addOn.price, 0);
  const protectionTotal = protectionSelected ? travelProtectionPlan.price : 0;
  const taxes = Math.round(roomCost * taxRate);
  const autoDiscount = Math.round(roomCost * (autoDiscountPercent / 100));
  const preCouponTotal = roomCost + taxes + convenienceFee + addOnsTotal + protectionTotal - autoDiscount;
  const couponSavings = appliedCoupon ? Math.round((preCouponTotal * appliedCoupon.discountPercent) / 100) : 0;
  const totalAmount = preCouponTotal - couponSavings;
  const totalSaved = autoDiscount + couponSavings;

  const guestDetailsValid = Boolean(
    primaryGuest.firstName.trim() && primaryGuest.lastName.trim() && primaryGuest.email.trim() && primaryGuest.mobile.trim().length >= 10,
  );
  const canContinue = guestDetailsValid && Boolean(paymentMethod);

  const aiInsights = useMemo(() => {
    if (!booking) return [];
    const insights: string[] = [];
    if (/hr|hour/i.test(booking.stayLabel)) {
      insights.push(`Guests staying for ${booking.stayLabel} often add Breakfast.`);
    }
    if (booking.category === "Business") {
      insights.push("Guests travelling for Business often choose Airport Pickup.");
    }
    if (booking.guests > 2) {
      insights.push("Guests travelling with Family often add Dinner.");
    }
    return insights;
  }, [booking]);

  function handleContinue() {
    if (!booking) return;
    if (!canContinue) {
      setValidationMessage("Please fill all guest details and select a payment method.");
      return;
    }
    setValidationMessage("");
    setSubmitting(true);
    setTimeout(() => {
      navigate("/booking-confirmed", {
        state: {
          hotelName: booking.hotelName,
          cityName: booking.cityName,
          roomName: booking.roomName,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          guestName: `${primaryGuest.title} ${primaryGuest.firstName} ${primaryGuest.lastName}`.trim(),
          email: primaryGuest.email,
          totalAmount,
          totalSaved,
          paymentMethod,
        },
      });
    }, 1400);
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
              {urgencySignals && <UrgencySection signals={urgencySignals} />}
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
              <AddOnsSection
                mealAddOnKey={mealAddOnKey}
                onSelectMealAddOn={setMealAddOnKey}
                extraAddOnKeys={extraAddOnKeys}
                onToggleExtraAddOn={toggleExtraAddOn}
              />
              <AiRecommendationSection insights={aiInsights} />
              <TravelProtectionSection selected={protectionSelected} onToggle={() => setProtectionSelected((v) => !v)} />
              <PaymentMethodsSection selected={paymentMethod} onSelect={setPaymentMethod} />
              <OffersCouponSection
                coupons={booking.coupons}
                appliedCoupon={appliedCoupon}
                onApply={applyCouponByCode}
                onAutoApplyBest={autoApplyBestCoupon}
                couponSavings={couponSavings}
              />
              <WhyBookSection />
              <LoginBenefitsSection onSignIn={() => setLoginOpen(true)} />
              <ConfidenceBar freeCancellation={isFreeCancellation} />
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <BookingSidebar
                  roomName={booking.roomName}
                  roomCost={roomCost}
                  taxes={taxes}
                  convenienceFee={convenienceFee}
                  addOnsTotal={addOnsTotal}
                  protectionTotal={protectionTotal}
                  autoDiscount={autoDiscount}
                  couponSavings={couponSavings}
                  totalAmount={totalAmount}
                  totalSaved={totalSaved}
                  selectedAddOnLabels={selectedAddOnLabels}
                  protectionSelected={protectionSelected}
                  canContinue={canContinue}
                  submitting={submitting}
                  onContinue={handleContinue}
                />
                {validationMessage && (
                  <p className="mt-2 text-center text-xs font-semibold text-[#DC2626]">{validationMessage}</p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
      <BokkoExpertWidget />
      <MobileContinueBar totalAmount={totalAmount} canContinue={canContinue} submitting={submitting} onContinue={handleContinue} />
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}
