import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProgressBar from "../components/ucheckout/ProgressBar";
import UniversalSidebar from "../components/ucheckout/UniversalSidebar";
import UniversalMobileCTA from "../components/ucheckout/UniversalMobileCTA";
import DayPassStep1 from "../components/ucheckout/DayPassStep1";
import DayPassStep2 from "../components/ucheckout/DayPassStep2";
import type { DPTeamMember } from "../components/ucheckout/DayPassStep2";
import MeetingRoomStep1 from "../components/ucheckout/MeetingRoomStep1";
import MeetingRoomStep2 from "../components/ucheckout/MeetingRoomStep2";
import VirtualOfficeStep1 from "../components/ucheckout/VirtualOfficeStep1";
import VirtualOfficeStep2 from "../components/ucheckout/VirtualOfficeStep2";
import MonthlyPassStep1 from "../components/ucheckout/MonthlyPassStep1";
import ReviewStep from "../components/ucheckout/ReviewStep";
import ConfirmationStep from "../components/ucheckout/ConfirmationStep";
import {
  U_TAX_RATE, U_CONVENIENCE_FEE, U_AUTO_DISCOUNT,
  universalCoupons, dayPassAddOns, meetingRoomCateringAddOns,
  billingTierMultipliers,
} from "../data/universalCheckout";
import type { UniversalCheckoutState, UCoupon } from "../data/universalCheckout";

interface Props { booking: UniversalCheckoutState; }

let memberIdCounter = 0;

const PRODUCT_LABELS: Record<string, string> = {
  "day-pass": "Day Pass",
  "meeting-room": "Meeting Room",
  "virtual-office": "Virtual Office",
  "monthly-pass": "Monthly Pass",
};

const BREADCRUMB_PATHS: Record<string, { label: string; path: string }> = {
  "day-pass": { label: "Day Pass", path: "day-pass" },
  "meeting-room": { label: "Meeting Rooms", path: "meeting-rooms" },
  "virtual-office": { label: "Virtual Office", path: "virtual-office" },
  "monthly-pass": { label: "Monthly Pass", path: "monthly-pass" },
};

export default function UniversalCheckoutPage({ booking }: Props) {
  useEffect(() => {
    const label = PRODUCT_LABELS[booking.productType] ?? "Checkout";
    document.title = `${label} Checkout | Bokko`;
  }, [booking.productType]);

  // Step machine
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // ─── Day Pass form state ───
  const [dpDate, setDpDate] = useState(booking.productType === "day-pass" ? booking.date : "");
  const [dpPassType, setDpPassType] = useState(booking.productType === "day-pass" ? booking.passType : "");
  const [dpMembers, setDpMembers] = useState(booking.productType === "day-pass" ? booking.members : 1);
  const [dpAddOnKeys, setDpAddOnKeys] = useState<string[]>([]);
  // Step 2
  const [dpPrimaryName, setDpPrimaryName] = useState("");
  const [dpPrimaryEmail, setDpPrimaryEmail] = useState("");
  const [dpPrimaryPhone, setDpPrimaryPhone] = useState("");
  const [dpTeamMembers, setDpTeamMembers] = useState<DPTeamMember[]>([]);
  const [dpIsBusinessBooking, setDpIsBusinessBooking] = useState(false);
  const [dpCompanyName, setDpCompanyName] = useState("");
  const [dpGst, setDpGst] = useState("");
  const [dpBillingAddress, setDpBillingAddress] = useState("");
  const [dpCostCenter, setDpCostCenter] = useState("");

  // ─── Meeting Room form state ───
  const [mrDate, setMrDate] = useState(booking.productType === "meeting-room" ? booking.date : "");
  const [mrStartTime, setMrStartTime] = useState(booking.productType === "meeting-room" ? booking.startTime : "09:00");
  const [mrRoomId, setMrRoomId] = useState(booking.productType === "meeting-room" ? booking.selectedRoomId : "");
  const [mrDurationKey, setMrDurationKey] = useState(booking.productType === "meeting-room" ? booking.selectedDurationKey : "");
  const [mrAttendees, setMrAttendees] = useState(booking.productType === "meeting-room" ? booking.attendees : 1);
  const [mrRequirements, setMrRequirements] = useState<string[]>([]);
  const [mrCateringKeys, setMrCateringKeys] = useState<string[]>([]);
  // Step 2
  const [mrOrgName, setMrOrgName] = useState("");
  const [mrOrgEmail, setMrOrgEmail] = useState("");
  const [mrOrgPhone, setMrOrgPhone] = useState("");
  const [mrInvitedEmails, setMrInvitedEmails] = useState<string[]>([]);

  // ─── Monthly Pass form state ───
  const [mpMembershipKey, setMpMembershipKey] = useState(booking.productType === "monthly-pass" ? booking.selectedMembershipKey : "");
  const [mpBillingKey, setMpBillingKey] = useState<"monthly" | "quarterly" | "yearly">(
    booking.productType === "monthly-pass" ? booking.billingKey : "monthly"
  );
  const [mpSeats, setMpSeats] = useState(booking.productType === "monthly-pass" ? booking.seats : 1);

  // ─── Virtual Office form state ───
  const [voPlanKey, setVoPlanKey] = useState(booking.productType === "virtual-office" ? booking.selectedPlanKey : "");
  const [voBillingKey, setVoBillingKey] = useState<"monthly" | "quarterly" | "yearly">(
    booking.productType === "virtual-office" ? booking.billingKey : "monthly"
  );
  const [voDocuments, setVoDocuments] = useState<Record<string, File | null>>({
    pan: null, gst: null, aadhaar: null, companyReg: null,
  });
  // Step 2
  const [voBusinessName, setVoBusinessName] = useState("");
  const [voFounderName, setVoFounderName] = useState("");
  const [voGst, setVoGst] = useState("");
  const [voPan, setVoPan] = useState("");
  const [voBusinessType, setVoBusinessType] = useState("");
  const [voContactEmail, setVoContactEmail] = useState("");
  const [voContactPhone, setVoContactPhone] = useState("");

  // ─── Shared state ───
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<UCoupon | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingId] = useState(() => {
    const prefix = { "day-pass": "DP", "meeting-room": "MR", "virtual-office": "VO", "monthly-pass": "MP" }[booking.productType] ?? "BK";
    return `BOKK${prefix}${Date.now() % 100000}`;
  });

  // ─── Price calculation ───
  const prices = useMemo(() => {
    let basePrice = 0;
    let addOnsTotal = 0;

    if (booking.productType === "day-pass") {
      const opt = booking.seatingOptions.find((o) => o.type === dpPassType) ?? booking.seatingOptions[0];
      basePrice = (opt?.bestPrice ?? 0) * dpMembers;
      addOnsTotal = dayPassAddOns.filter((a) => dpAddOnKeys.includes(a.key)).reduce((s, a) => s + a.price, 0);
    } else if (booking.productType === "meeting-room") {
      const room = booking.siblingRoomTypes.find((r) => r.id === mrRoomId) ?? booking.siblingRoomTypes[0];
      const tier = room?.pricing.find((t) => t.key === mrDurationKey) ?? room?.pricing[0];
      basePrice = tier?.price ?? 0;
      addOnsTotal = meetingRoomCateringAddOns.filter((a) => mrCateringKeys.includes(a.key)).reduce((s, a) => s + a.price, 0);
    } else if (booking.productType === "virtual-office") {
      const plan = booking.plans.find((p) => p.key === voPlanKey) ?? booking.plans[0];
      basePrice = Math.round((plan?.price ?? 0) * (billingTierMultipliers[voBillingKey] ?? 1));
    } else if (booking.productType === "monthly-pass") {
      const mp = booking.membershipTypes.find((t) => t.key === mpMembershipKey) ?? booking.membershipTypes[0];
      basePrice = Math.round((mp?.price ?? 0) * (billingTierMultipliers[mpBillingKey] ?? 1) * mpSeats);
    }

    const autoDiscount = Math.round(basePrice * (U_AUTO_DISCOUNT / 100));
    const taxes = Math.round((basePrice + addOnsTotal) * U_TAX_RATE);
    const preCoupon = basePrice + addOnsTotal - autoDiscount + taxes + U_CONVENIENCE_FEE;
    const couponSavings = appliedCoupon ? Math.round((preCoupon * appliedCoupon.discountPercent) / 100) : 0;
    const totalAmount = preCoupon - couponSavings;
    const totalSaved = autoDiscount + couponSavings;
    return { basePrice, addOnsTotal, autoDiscount, taxes, convenienceFee: U_CONVENIENCE_FEE, couponSavings, totalAmount, totalSaved };
  }, [booking, dpPassType, dpMembers, dpAddOnKeys, mrRoomId, mrDurationKey, mrCateringKeys, voPlanKey, voBillingKey, mpMembershipKey, mpBillingKey, mpSeats, appliedCoupon]);

  // ─── Step validation ───
  const canAdvance = useMemo(() => {
    if (step === 1) return true;
    if (step === 2) {
      if (booking.productType === "day-pass") {
        return Boolean(dpPrimaryName.trim() && dpPrimaryEmail.trim() && dpPrimaryPhone.trim().length >= 10);
      }
      if (booking.productType === "meeting-room") {
        return Boolean(mrOrgName.trim() && mrOrgEmail.trim() && mrOrgPhone.trim().length >= 10);
      }
      if (booking.productType === "virtual-office") {
        return Boolean(voBusinessName.trim() && voFounderName.trim() && voBusinessType && voContactEmail.trim() && voContactPhone.trim().length >= 10);
      }
      if (booking.productType === "monthly-pass") {
        return Boolean(dpPrimaryName.trim() && dpPrimaryEmail.trim() && dpPrimaryPhone.trim().length >= 10);
      }
    }
    if (step === 3) return Boolean(paymentMethod);
    return false;
  }, [step, booking.productType, dpPrimaryName, dpPrimaryEmail, dpPrimaryPhone, mrOrgName, mrOrgEmail, mrOrgPhone, voBusinessName, voFounderName, voBusinessType, voContactEmail, voContactPhone, paymentMethod]);

  function handleNext() {
    if (!canAdvance || step >= 4) return;
    if (step === 3) {
      setSubmitting(true);
      setTimeout(() => {
        setSubmitting(false);
        setStep(4);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 1200);
    } else {
      setStep((s) => (s + 1) as 1 | 2 | 3 | 4);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleBack() {
    if (step > 1) { setStep((s) => (s - 1) as 1 | 2 | 3 | 4); window.scrollTo({ top: 0, behavior: "smooth" }); }
  }

  // ─── Derived display helpers ───
  const workspaceName = booking.productType === "virtual-office" ? booking.centerName : booking.workspaceName;
  const image = booking.image;

  function bookingMeta(): string {
    if (booking.productType === "day-pass") return `${dpDate || booking.date} · ${dpMembers} member${dpMembers > 1 ? "s" : ""}`;
    if (booking.productType === "meeting-room") {
      const room = booking.siblingRoomTypes.find((r) => r.id === mrRoomId) ?? booking.siblingRoomTypes[0];
      const tier = room?.pricing.find((t) => t.key === mrDurationKey) ?? room?.pricing[0];
      return `${mrDate || booking.date} · ${tier?.label ?? ""}`;
    }
    if (booking.productType === "virtual-office") {
      const plan = booking.plans.find((p) => p.key === voPlanKey) ?? booking.plans[0];
      return `${plan?.name ?? ""} · ${voBillingKey}`;
    }
    if (booking.productType === "monthly-pass") {
      const mp = booking.membershipTypes.find((t) => t.key === mpMembershipKey) ?? booking.membershipTypes[0];
      return `${mp?.name ?? ""} · ${mpSeats} seat${mpSeats > 1 ? "s" : ""} · ${mpBillingKey}`;
    }
    return "";
  }

  function addOnLabels(): string[] {
    if (booking.productType === "day-pass") return dayPassAddOns.filter((a) => dpAddOnKeys.includes(a.key)).map((a) => a.label);
    if (booking.productType === "meeting-room") return meetingRoomCateringAddOns.filter((a) => mrCateringKeys.includes(a.key)).map((a) => a.label);
    return [];
  }

  function guestInfoForReview(): Record<string, string> {
    if (booking.productType === "day-pass") {
      return {
        "Name": dpPrimaryName,
        "Email": dpPrimaryEmail,
        "Mobile": dpPrimaryPhone,
        ...(dpIsBusinessBooking ? { "Company": dpCompanyName, "GST": dpGst } : {}),
        ...(dpTeamMembers.length ? { "Team Members": `${dpTeamMembers.length} added` } : {}),
      };
    }
    if (booking.productType === "meeting-room") {
      return {
        "Organizer": mrOrgName,
        "Email": mrOrgEmail,
        "Mobile": mrOrgPhone,
        ...(mrInvitedEmails.length ? { "Invited Guests": mrInvitedEmails.join(", ") } : {}),
      };
    }
    if (booking.productType === "virtual-office") {
      return {
        "Business Name": voBusinessName,
        "Founder": voFounderName,
        "Business Type": voBusinessType,
        "Email": voContactEmail,
        "Mobile": voContactPhone,
        ...(voGst ? { "GST Number": voGst } : {}),
      };
    }
    if (booking.productType === "monthly-pass") {
      return {
        "Name": dpPrimaryName,
        "Email": dpPrimaryEmail,
        "Mobile": dpPrimaryPhone,
        "Membership": (booking.membershipTypes.find((t) => t.key === mpMembershipKey) ?? booking.membershipTypes[0])?.name ?? "",
        "Seats": String(mpSeats),
        "Billing": mpBillingKey,
        ...(dpTeamMembers.length ? { "Team Members": `${dpTeamMembers.length} added` } : {}),
      };
    }
    return {};
  }

  const guestDisplayName = booking.productType === "virtual-office" ? voFounderName
    : (booking.productType === "day-pass" || booking.productType === "monthly-pass") ? dpPrimaryName
    : mrOrgName;
  const guestDisplayEmail = booking.productType === "virtual-office" ? voContactEmail
    : (booking.productType === "day-pass" || booking.productType === "monthly-pass") ? dpPrimaryEmail
    : mrOrgEmail;

  const ctaLabel = step === 3 ? "Confirm & Pay" : "Continue";
  const breadcrumb = BREADCRUMB_PATHS[booking.productType];

  const stepContent = () => {
    if (step === 1) {
      if (booking.productType === "day-pass") return (
        <DayPassStep1 booking={booking} date={dpDate} onDateChange={setDpDate}
          passType={dpPassType} onPassTypeChange={setDpPassType}
          members={dpMembers} onMembersChange={setDpMembers}
          addOnKeys={dpAddOnKeys} onToggleAddOn={(key) => setDpAddOnKeys((v) => v.includes(key) ? v.filter((k) => k !== key) : [...v, key])} />
      );
      if (booking.productType === "meeting-room") return (
        <MeetingRoomStep1 booking={booking} date={mrDate} onDateChange={setMrDate}
          startTime={mrStartTime} onStartTimeChange={setMrStartTime}
          selectedRoomId={mrRoomId} onSelectRoom={setMrRoomId}
          selectedDurationKey={mrDurationKey} onSelectDuration={setMrDurationKey}
          attendees={mrAttendees} onAttendeesChange={setMrAttendees}
          requirements={mrRequirements} onToggleRequirement={(r) => setMrRequirements((v) => v.includes(r) ? v.filter((x) => x !== r) : [...v, r])}
          cateringKeys={mrCateringKeys} onToggleCatering={(key) => setMrCateringKeys((v) => v.includes(key) ? v.filter((k) => k !== key) : [...v, key])} />
      );
      if (booking.productType === "virtual-office") return (
        <VirtualOfficeStep1 booking={booking} planKey={voPlanKey} onPlanChange={setVoPlanKey}
          billingKey={voBillingKey} onBillingChange={setVoBillingKey}
          documents={voDocuments}
          onDocumentChange={(key, file) => setVoDocuments((d) => ({ ...d, [key]: file }))} />
      );
      if (booking.productType === "monthly-pass") return (
        <MonthlyPassStep1 booking={booking}
          selectedMembershipKey={mpMembershipKey} onMembershipChange={setMpMembershipKey}
          billingKey={mpBillingKey} onBillingChange={setMpBillingKey}
          seats={mpSeats} onSeatsChange={setMpSeats} />
      );
    }
    if (step === 2) {
      if (booking.productType === "day-pass") return (
        <DayPassStep2
          primaryName={dpPrimaryName} onPrimaryNameChange={setDpPrimaryName}
          primaryEmail={dpPrimaryEmail} onPrimaryEmailChange={setDpPrimaryEmail}
          primaryPhone={dpPrimaryPhone} onPrimaryPhoneChange={setDpPrimaryPhone}
          teamMembers={dpTeamMembers}
          onAddTeamMember={() => { memberIdCounter += 1; setDpTeamMembers((v) => [...v, { id: `m-${memberIdCounter}`, name: "", email: "" }]); }}
          onRemoveTeamMember={(id) => setDpTeamMembers((v) => v.filter((m) => m.id !== id))}
          onUpdateTeamMember={(id, field, value) => setDpTeamMembers((v) => v.map((m) => m.id === id ? { ...m, [field]: value } : m))}
          isBusinessBooking={dpIsBusinessBooking} onToggleBusinessBooking={() => setDpIsBusinessBooking((v) => !v)}
          companyName={dpCompanyName} onCompanyNameChange={setDpCompanyName}
          gstNumber={dpGst} onGstNumberChange={setDpGst}
          billingAddress={dpBillingAddress} onBillingAddressChange={setDpBillingAddress}
          costCenter={dpCostCenter} onCostCenterChange={setDpCostCenter}
          onCsvImport={(members) => setDpTeamMembers((v) => [...v, ...members])} />
      );
      if (booking.productType === "meeting-room") return (
        <MeetingRoomStep2
          organizerName={mrOrgName} onOrganizerNameChange={setMrOrgName}
          organizerEmail={mrOrgEmail} onOrganizerEmailChange={setMrOrgEmail}
          organizerPhone={mrOrgPhone} onOrganizerPhoneChange={setMrOrgPhone}
          attendeeCount={mrAttendees}
          invitedEmails={mrInvitedEmails}
          onAddEmail={(email) => setMrInvitedEmails((v) => [...v, email])}
          onRemoveEmail={(email) => setMrInvitedEmails((v) => v.filter((e) => e !== email))} />
      );
      if (booking.productType === "virtual-office") return (
        <VirtualOfficeStep2
          businessName={voBusinessName} onBusinessNameChange={setVoBusinessName}
          founderName={voFounderName} onFounderNameChange={setVoFounderName}
          gstNumber={voGst} onGstNumberChange={setVoGst}
          panNumber={voPan} onPanNumberChange={setVoPan}
          businessType={voBusinessType} onBusinessTypeChange={setVoBusinessType}
          contactEmail={voContactEmail} onContactEmailChange={setVoContactEmail}
          contactPhone={voContactPhone} onContactPhoneChange={setVoContactPhone} />
      );
      if (booking.productType === "monthly-pass") return (
        <DayPassStep2
          primaryName={dpPrimaryName} onPrimaryNameChange={setDpPrimaryName}
          primaryEmail={dpPrimaryEmail} onPrimaryEmailChange={setDpPrimaryEmail}
          primaryPhone={dpPrimaryPhone} onPrimaryPhoneChange={setDpPrimaryPhone}
          teamMembers={dpTeamMembers}
          onAddTeamMember={() => { memberIdCounter += 1; setDpTeamMembers((v) => [...v, { id: `m-${memberIdCounter}`, name: "", email: "" }]); }}
          onRemoveTeamMember={(id) => setDpTeamMembers((v) => v.filter((m) => m.id !== id))}
          onUpdateTeamMember={(id, field, value) => setDpTeamMembers((v) => v.map((m) => m.id === id ? { ...m, [field]: value } : m))}
          isBusinessBooking={dpIsBusinessBooking} onToggleBusinessBooking={() => setDpIsBusinessBooking((v) => !v)}
          companyName={dpCompanyName} onCompanyNameChange={setDpCompanyName}
          gstNumber={dpGst} onGstNumberChange={setDpGst}
          billingAddress={dpBillingAddress} onBillingAddressChange={setDpBillingAddress}
          costCenter={dpCostCenter} onCostCenterChange={setDpCostCenter}
          onCsvImport={(members) => setDpTeamMembers((v) => [...v, ...members])} />
      );
    }
    if (step === 3) return (
      <ReviewStep booking={booking} guestInfo={guestInfoForReview()} addOnLabels={addOnLabels()}
        paymentMethod={paymentMethod} onSelectPayment={setPaymentMethod} />
    );
    if (step === 4) return (
      <ConfirmationStep booking={booking} bookingId={bookingId}
        totalAmount={prices.totalAmount} totalSaved={prices.totalSaved}
        guestName={guestDisplayName || "Guest"} guestEmail={guestDisplayEmail}
        paymentMethod={paymentMethod ?? "upi"} />
    );
    return null;
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Header />

      <main className="flex-1 pb-28 lg:pb-0">
        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex flex-wrap items-center gap-1.5 text-sm text-[#64748B]">
            <Link to="/" className="hover:text-[#2563EB]">Home</Link>
            <ChevronRight size={14} />
            {breadcrumb && (
              <>
                <Link to={`/${booking.citySlug}/${breadcrumb.path}`} className="hover:text-[#2563EB]">{breadcrumb.label}</Link>
                <ChevronRight size={14} />
                <span>{workspaceName}</span>
                <ChevronRight size={14} />
              </>
            )}
            <span className="font-semibold text-[#0F172A]">Checkout</span>
          </nav>

          {/* Progress bar */}
          <div className="mt-6">
            <ProgressBar currentStep={step} />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
            {/* Left content */}
            <div className="flex min-w-0 flex-col gap-6">
              {/* Step header */}
              {step < 4 && (
                <div className="flex items-center justify-between">
                  {step > 1 ? (
                    <button type="button" onClick={handleBack}
                      className="flex items-center gap-1 text-sm font-semibold text-[#64748B] hover:text-[#0F172A]">
                      <ChevronLeft size={16} />
                      Back
                    </button>
                  ) : <div />}
                  <span className="text-xs font-semibold text-[#94A3B8]">Step {step} of 3</span>
                </div>
              )}

              {/* Step content */}
              {stepContent()}

              {/* Navigation buttons (bottom) */}
              {step < 4 && (
                <div className="hidden lg:flex lg:justify-end">
                  <button
                    type="button"
                    disabled={!canAdvance || submitting}
                    onClick={handleNext}
                    className="rounded-xl bg-[#2563EB] px-8 py-3.5 text-sm font-bold text-white hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? "Processing…" : step === 3 ? "Confirm & Pay" : "Continue"}
                  </button>
                </div>
              )}
            </div>

            {/* Right sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <UniversalSidebar
                  productLabel={PRODUCT_LABELS[booking.productType]}
                  workspaceName={workspaceName}
                  cityName={booking.cityName}
                  bookingMeta={bookingMeta()}
                  image={image}
                  basePrice={prices.basePrice}
                  addOnsTotal={prices.addOnsTotal}
                  taxes={prices.taxes}
                  convenienceFee={prices.convenienceFee}
                  autoDiscount={prices.autoDiscount}
                  couponSavings={prices.couponSavings}
                  totalAmount={prices.totalAmount}
                  totalSaved={prices.totalSaved}
                  appliedCoupon={appliedCoupon}
                  onApplyCoupon={(code) => {
                    const c = universalCoupons.find((x) => x.code === code);
                    if (c) setAppliedCoupon(c);
                  }}
                  onRemoveCoupon={() => setAppliedCoupon(null)}
                  canProceed={canAdvance}
                  submitting={submitting}
                  ctaLabel={ctaLabel}
                  onProceed={handleNext}
                  currentStep={step}
                />
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />

      {step < 4 && (
        <UniversalMobileCTA
          totalAmount={prices.totalAmount}
          label={ctaLabel}
          disabled={!canAdvance}
          submitting={submitting}
          onClick={handleNext}
        />
      )}
    </div>
  );
}
