import type { SeatingOptionDetail } from "./dayPassDetails";
import type { AddOn, SiblingRoom } from "./meetingRoomDetails";
import type { VOPlan } from "./virtualOfficeListings";
import type { MembershipType } from "./monthlyPassDetails";

export type ProductType = "hotel" | "day-pass" | "meeting-room" | "virtual-office";

export interface DayPassCheckoutState {
  productType: "day-pass";
  listingId: string;
  workspaceName: string;
  brand: string;
  citySlug: string;
  cityName: string;
  locality: string;
  image: string;
  spaceType: string;
  rating: number;
  reviews: number;
  date: string;
  passType: string;
  members: number;
  seatingOptions: SeatingOptionDetail[];
}

export interface MeetingRoomCheckoutState {
  productType: "meeting-room";
  listingId: string;
  roomName: string;
  workspaceName: string;
  citySlug: string;
  cityName: string;
  locality: string;
  image: string;
  rating: number;
  reviews: number;
  date: string;
  startTime: string;
  selectedRoomId: string;
  selectedDurationKey: string;
  attendees: number;
  selectedAddOnKeys: string[];
  siblingRoomTypes: SiblingRoom[];
  addOns: AddOn[];
  equipmentTech: string[];
}

export interface VirtualOfficeCheckoutState {
  productType: "virtual-office";
  listingId: string;
  centerName: string;
  brand: string;
  citySlug: string;
  cityName: string;
  area: string;
  address: string;
  image: string;
  rating: number;
  reviews: number;
  gstEligible: boolean;
  businessAddressAvailable: boolean;
  servicesIncluded: string[];
  plans: VOPlan[];
  selectedPlanKey: string;
  billingKey: "monthly" | "quarterly" | "yearly";
}

export interface MonthlyPassCheckoutState {
  productType: "monthly-pass";
  listingId: string;
  workspaceName: string;
  brand: string;
  citySlug: string;
  cityName: string;
  locality: string;
  image: string;
  rating: number;
  reviews: number;
  membershipTypes: MembershipType[];
  selectedMembershipKey: string;
  billingKey: "monthly" | "quarterly" | "yearly";
  seats: number;
}

export type UniversalCheckoutState =
  | DayPassCheckoutState
  | MeetingRoomCheckoutState
  | VirtualOfficeCheckoutState
  | MonthlyPassCheckoutState;

export interface UCoupon {
  code: string;
  description: string;
  discountPercent: number;
  kind: "general" | "referral" | "corporate";
}

export const universalCoupons: UCoupon[] = [
  { code: "BOKKO10", description: "10% off your booking", discountPercent: 10, kind: "general" },
  { code: "FIRSTBOOK15", description: "15% off — first-time Bokko user", discountPercent: 15, kind: "general" },
  { code: "REFER20", description: "Referral reward — 20% off", discountPercent: 20, kind: "referral" },
  { code: "CORP25", description: "Corporate rate — 25% off", discountPercent: 25, kind: "corporate" },
];

export interface UAddOn {
  key: string;
  label: string;
  price: number;
  description: string;
}

export const dayPassAddOns: UAddOn[] = [
  { key: "locker", label: "Locker", price: 49, description: "Secure locker for your valuables" },
  { key: "parking", label: "Parking", price: 99, description: "Reserved parking space for the day" },
  { key: "printing", label: "Printing Credits", price: 49, description: "50-page printing bundle" },
  { key: "tea-coffee", label: "Tea/Coffee Package", price: 99, description: "Unlimited tea & coffee all day" },
  { key: "meeting-credits", label: "Meeting Room Credits", price: 299, description: "1 hour meeting room access" },
  { key: "food", label: "Food Package", price: 249, description: "Lunch + evening snacks included" },
];

export const meetingRoomCateringAddOns: UAddOn[] = [
  { key: "tea", label: "Tea", price: 39, description: "Hot tea for all attendees" },
  { key: "coffee", label: "Coffee", price: 49, description: "Coffee & milk for all attendees" },
  { key: "lunch", label: "Lunch", price: 299, description: "Full lunch buffet per person" },
  { key: "snacks", label: "Snacks Platter", price: 149, description: "Assorted evening snacks" },
  { key: "reception", label: "Reception Support", price: 199, description: "Dedicated host for your meeting" },
];

export const meetingRequirementOptions = [
  "Whiteboard",
  "TV Screen",
  "Projector",
  "Video Conference",
  "Speakerphone",
  "Recording Setup",
];

export const universalPaymentMethods = [
  { key: "upi", label: "UPI", description: "GPay · PhonePe · Paytm · BHIM" },
  { key: "card", label: "Credit / Debit Card", description: "Visa · Mastercard · RuPay · Amex" },
  { key: "netbanking", label: "Net Banking", description: "All major Indian banks" },
  { key: "wallet", label: "Wallets", description: "Paytm · Amazon Pay · Mobikwik" },
  { key: "emi", label: "EMI", description: "No-cost EMI on select cards" },
  { key: "corporate", label: "Corporate Billing", description: "Invoice-based for enterprises" },
];

export const businessTypes = [
  "Sole Proprietorship",
  "Partnership",
  "Private Limited",
  "LLP",
  "One Person Company",
  "Other",
];

export const U_TAX_RATE = 0.18;
export const U_CONVENIENCE_FEE = 99;
export const U_AUTO_DISCOUNT = 8;

export const billingTierLabels: Record<string, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

export const billingTierMultipliers: Record<string, number> = {
  monthly: 1,
  quarterly: 3 * 0.9,
  yearly: 12 * 0.8,
};
