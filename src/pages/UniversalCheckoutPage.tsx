import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { apiPost, apiGet, getUserToken } from "../lib/api";
import { submitPayuForm } from "../lib/payu";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LoginModal from "../components/LoginModal";
import ProgressBar from "../components/ucheckout/ProgressBar";
import UniversalSidebar from "../components/ucheckout/UniversalSidebar";
import CouponApply from "../components/checkout/CouponApply";
import type { AvailableCoupon } from "../lib/offers";
import { bestOfferForListing } from "../lib/offers";
import { useActiveOffers } from "../hooks/useActiveOffers";
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
  dayPassAddOns, meetingRoomCateringAddOns,
  billingTierMultipliers,
} from "../data/universalCheckout";
import type { UniversalCheckoutState } from "../data/universalCheckout";

interface Props { booking: UniversalCheckoutState; }

/** Authoritative price breakdown from POST /bookings/quote. commission/GST
 * fields are optional so the UI degrades gracefully until the backend adds
 * them; `totalRupees` is the amount the user is actually charged. */
interface BookingQuote {
  centerPriceRupees?: number;
  commissionRupees?: number;
  gstRupees?: number;
  totalRupees: number;
  finalTotalRupees?: number;
  couponCode?: string;
  couponDiscountRupees?: number;
  availableCoupons?: AvailableCoupon[];
}

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
  const [quote, setQuote] = useState<BookingQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [couponCode, setCouponCode] = useState<string | undefined>(undefined);
  const [couponCleared, setCouponCleared] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [bookingId] = useState(() => {
    const prefix = { "day-pass": "DP", "meeting-room": "MR", "virtual-office": "VO", "monthly-pass": "MP" }[booking.productType] ?? "BK";
    return `BOKK${prefix}${Date.now() % 100000}`;
  });

  // ─── Price calculation ───
  // Vendor centre base price for the current selection. Commission, GST and the
  // authoritative total come from the backend quote (below) so the amount shown
  // always equals what PayU charges. Before the quote resolves we fall back to
  // showing the centre price alone (commission/GST rows stay hidden).
  const centerPrice = useMemo(() => {
    if (booking.productType === "day-pass") {
      const opt = booking.seatingOptions.find((o) => o.type === dpPassType) ?? booking.seatingOptions[0];
      return (opt?.price ?? opt?.bestPrice ?? 0) * dpMembers;
    }
    if (booking.productType === "meeting-room") {
      const room = booking.siblingRoomTypes.find((r) => r.id === mrRoomId) ?? booking.siblingRoomTypes[0];
      const tier = room?.pricing.find((t) => t.key === mrDurationKey) ?? room?.pricing[0];
      return tier?.price ?? 0;
    }
    if (booking.productType === "virtual-office") {
      const plan = booking.plans.find((p) => p.key === voPlanKey) ?? booking.plans[0];
      return Math.round((plan?.price ?? 0) * (billingTierMultipliers[voBillingKey] ?? 1));
    }
    if (booking.productType === "monthly-pass") {
      const mp = booking.membershipTypes.find((t) => t.key === mpMembershipKey) ?? booking.membershipTypes[0];
      return Math.round((mp?.price ?? 0) * (billingTierMultipliers[mpBillingKey] ?? 1) * mpSeats);
    }
    return 0;
  }, [booking, dpPassType, dpMembers, mrRoomId, mrDurationKey, voPlanKey, voBillingKey, mpMembershipKey, mpBillingKey, mpSeats]);

  const offers = useActiveOffers();
  const estimatedOffer = useMemo(() => {
    if (quote || !booking) return null;
    const vertical = booking.productType;
    return bestOfferForListing(offers, vertical, centerPrice, booking.listingId);
  }, [offers, quote, centerPrice, booking]);

  const displayCenterPrice = quote?.centerPriceRupees ?? centerPrice;
  const commission = quote?.commissionRupees ?? 0;
  const gst = quote?.gstRupees ?? 0;
  const discount = quote ? (quote.couponDiscountRupees ?? 0) : (estimatedOffer?.discountRupees ?? 0);
  const totalAmount = quote 
    ? (quote.finalTotalRupees ?? (quote.totalRupees - discount)) 
    : (estimatedOffer?.finalRupees ?? centerPrice);

  // Fetch the authoritative breakdown for plan-based products. Mirrors the
  // create-booking DTO exactly so quote == charge. Requires sign-in (like the
  // hotel checkout); fails silently and falls back to the centre price.
  // Meeting rooms price against selected slots (resolved at Confirm & Pay), so
  // they aren't quoted here.
  useEffect(() => {
    const token = getUserToken();
    if (!token) { setQuote(null); return; }

    const productTypeMap: Record<string, string> = {
      "day-pass": "coworking_day_pass",
      "monthly-pass": "coworking_monthly_pass",
      "virtual-office": "coworking_monthly_pass",
    };
    const backendProductType = productTypeMap[booking.productType];
    if (!backendProductType) { setQuote(null); return; }

    let planId: string | undefined;
    let extra: Record<string, unknown> = {};
    if (booking.productType === "day-pass") {
      const opt = booking.seatingOptions.find((o) => o.type === dpPassType) ?? booking.seatingOptions[0];
      planId = opt?.planId;
      extra = { bookingDate: dpDate, memberCount: dpMembers };
    } else if (booking.productType === "monthly-pass") {
      const mp = booking.membershipTypes.find((t) => t.key === mpMembershipKey) ?? booking.membershipTypes[0];
      planId = mp?.planId ?? mp?.key;
      extra = { bookingDate: new Date().toISOString().slice(0, 10), memberCount: mpSeats };
    } else if (booking.productType === "virtual-office") {
      const plan = booking.plans.find((p) => p.key === voPlanKey) ?? booking.plans[0];
      planId = plan?.planId ?? plan?.key;
      extra = { bookingDate: new Date().toISOString().slice(0, 10) };
    }
    if (!planId) { setQuote(null); return; }

    let cancelled = false;
    setQuoteLoading(true);
    apiPost<BookingQuote>("/bookings/quote", {
      centerId: booking.listingId,
      productType: backendProductType,
      planId,
      ...extra,
      ...(couponCode ? { couponCode } : {}),
      ...(couponCleared ? { applyBestOffer: false } : {}),
    }, token)
      .then((res) => { if (!cancelled) { setQuote(res); setCouponError(null); } })
      .catch((err) => {
        if (cancelled) return;
        if (couponCode) { setCouponError((err as Error).message ?? "Coupon could not be applied"); setCouponCode(undefined); }
        else setQuote(null);
      })
      .finally(() => { if (!cancelled) setQuoteLoading(false); });
    return () => { cancelled = true; };
  }, [booking, dpPassType, dpMembers, dpDate, mpMembershipKey, mpSeats, voPlanKey, couponCode, couponCleared]);

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
    if (step === 3) return true; // Review step — payment is handled by PayU after Confirm & Pay
    return false;
  }, [step, booking.productType, dpPrimaryName, dpPrimaryEmail, dpPrimaryPhone, mrOrgName, mrOrgEmail, mrOrgPhone, voBusinessName, voFounderName, voBusinessType, voContactEmail, voContactPhone]);

  async function handleNext() {
    if (!canAdvance || step >= 4) return;
    if (step === 3) {
      const token = getUserToken();
      if (!token) {
        setLoginOpen(true);
        return;
      }
      setSubmitting(true);
      try {
        const productTypeMap: Record<string, string> = {
          "day-pass": "coworking_day_pass",
          "meeting-room": "coworking_meeting_room",
          "monthly-pass": "coworking_monthly_pass",
          "virtual-office": "coworking_monthly_pass",
        };
        const backendProductType = productTypeMap[booking.productType] ?? "coworking_day_pass";

        let createDto: Record<string, unknown> = {
          centerId: booking.listingId,
          productType: backendProductType,
        };

        if (booking.productType === "day-pass") {
          const opt = booking.seatingOptions.find((o) => o.type === dpPassType) ?? booking.seatingOptions[0];
          createDto = { ...createDto, planId: opt?.planId, bookingDate: dpDate, memberCount: dpMembers };
        } else if (booking.productType === "monthly-pass") {
          const mp = booking.membershipTypes.find((t) => t.key === mpMembershipKey) ?? booking.membershipTypes[0];
          createDto = { ...createDto, planId: mp?.planId ?? mp?.key, bookingDate: new Date().toISOString().slice(0, 10), memberCount: mpSeats };
        } else if (booking.productType === "virtual-office") {
          const plan = booking.plans.find((p) => p.key === voPlanKey) ?? booking.plans[0];
          createDto = { ...createDto, planId: plan?.planId ?? plan?.key, bookingDate: new Date().toISOString().slice(0, 10) };
        } else if (booking.productType === "meeting-room") {
          // Fetch available slots for the selected date + plan, then pick matching time window
          const slots = await apiGet<Array<{ id: string; start_time: string; end_time: string }>>(
            `/slots/availability/${booking.listingId}?date=${mrDate}&planId=${mrRoomId}`,
          );
          const hours = parseInt(mrDurationKey) || 1;
          const [startH, startM] = mrStartTime.split(":").map(Number);
          const startMinutes = startH * 60 + startM;
          const endMinutes = startMinutes + hours * 60;
          const needed = slots.filter((s) => {
            const [sh, sm] = s.start_time.slice(0, 5).split(":").map(Number);
            const [eh, em] = s.end_time.slice(0, 5).split(":").map(Number);
            return sh * 60 + sm >= startMinutes && eh * 60 + em <= endMinutes;
          });
          if (!needed.length) throw new Error("No available slots for the selected time. Please choose a different time.");
          createDto = { ...createDto, slotIds: needed.map((s) => s.id), bookingDate: mrDate, guestCount: mrAttendees };
        }

        if (couponCode) createDto = { ...createDto, couponCode };
        if (couponCleared) createDto = { ...createDto, applyBestOffer: false };

        // The create-booking response shape differs by product: plan-based
        // (day pass / monthly / VO) returns { booking, payment: { bookingId } };
        // slot-based (meeting room) returns { bookingId } at the top level.
        const created = await apiPost<{ bookingId?: string; booking?: { id?: string }; payment?: { bookingId?: string } }>(
          "/bookings",
          createDto,
          token,
        );
        const newBookingId = created.payment?.bookingId ?? created.booking?.id ?? created.bookingId;
        if (!newBookingId) throw new Error("Booking created but its ID was missing. Please contact support.");

        const payuParams = await apiPost<Record<string, string>>(
          `/payments/booking/${newBookingId}/initiate-web`,
          {},
          token,
        );

        submitPayuForm(payuParams);
      } catch (err) {
        alert((err as Error).message ?? "Booking failed. Please try again.");
        setSubmitting(false);
      }
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
      <ReviewStep booking={booking} guestInfo={guestInfoForReview()} addOnLabels={addOnLabels()} />
    );
    if (step === 4) return (
      <ConfirmationStep booking={booking} bookingId={bookingId}
        totalAmount={totalAmount}
        guestName={guestDisplayName || "Guest"} guestEmail={guestDisplayEmail}
        paymentMethod="Online" />
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

              {/* Coupons & offers */}
              {step >= 2 && step < 4 && getUserToken() && (
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
                  centerPrice={displayCenterPrice}
                  commission={commission}
                  gst={gst}
                  totalAmount={totalAmount}
                  discount={discount}
                  couponCode={quote?.couponCode}
                  priceLoading={quoteLoading}
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
          totalAmount={totalAmount}
          label={ctaLabel}
          disabled={!canAdvance}
          submitting={submitting}
          onClick={handleNext}
        />
      )}

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} onSuccess={handleNext} />
    </div>
  );
}
