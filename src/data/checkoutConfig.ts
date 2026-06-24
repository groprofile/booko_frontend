import type { Coupon } from "./hotelDetails";

export interface CheckoutBookingState {
  hotelId: string;
  hotelName: string;
  chain: string;
  citySlug: string;
  cityName: string;
  locality: string;
  image: string;
  category: string;
  guestRating: number;
  reviews: number;
  roomName: string;
  roomId: string;
  stayLabel: string;
  stayPrice: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomCount: number;
  cancellationPolicy: string;
  coupons: Coupon[];
}

const categoryStarMap: Record<string, number> = {
  Budget: 3,
  Business: 4,
  Premium: 4,
  Boutique: 4,
  Luxury: 5,
};

export function starRatingForCategory(category: string): number {
  return categoryStarMap[category] ?? 4;
}

export interface AddOnOption {
  key: string;
  label: string;
  price: number;
  description: string;
}

export const mealAddOns: AddOnOption[] = [
  { key: "breakfast", label: "Breakfast", price: 300, description: "Start your day with a hearty breakfast" },
  { key: "breakfast-lunch", label: "Breakfast + Lunch", price: 550, description: "Two meals a day, sorted" },
  { key: "breakfast-dinner", label: "Breakfast + Dinner", price: 600, description: "Perfect for a relaxed evening stay" },
  { key: "all-meals", label: "All Meals", price: 850, description: "Breakfast, lunch and dinner included" },
];

export const extraAddOns: AddOnOption[] = [
  { key: "airport-transfer", label: "Airport Transfer", price: 799, description: "Comfortable pickup or drop to the airport" },
  { key: "travel-insurance", label: "Travel Insurance", price: 199, description: "Stay protected throughout your trip" },
  { key: "room-decoration", label: "Room Decoration", price: 999, description: "Make your stay extra special" },
  { key: "extra-bed", label: "Extra Bed", price: 500, description: "Additional comfortable bedding" },
];

export const specialRequestOptions: string[] = [
  "Early Check-in",
  "Late Check-out",
  "High Floor",
  "Smoking Room",
  "Non-Smoking Room",
  "Extra Bed",
  "Airport Pickup",
  "Anniversary Setup",
  "Birthday Decoration",
];

export const travelProtectionPlan = {
  price: 249,
  items: ["Medical Support", "Trip Cancellation", "Refund Protection", "Emergency Assistance", "Lost Luggage", "Accident Cover"],
};

export interface PaymentMethodOption {
  key: string;
  label: string;
  note?: string;
}

export const paymentMethods: PaymentMethodOption[] = [
  { key: "upi", label: "UPI" },
  { key: "credit-card", label: "Credit Card" },
  { key: "debit-card", label: "Debit Card" },
  { key: "net-banking", label: "Net Banking" },
  { key: "wallets", label: "Wallets" },
  { key: "emi", label: "EMI", note: "Available above ₹3,000" },
  { key: "pay-later", label: "Pay Later", note: "Reserve now, pay at the hotel" },
];

export const convenienceFee = 149;
export const taxRate = 0.12;
export const autoDiscountPercent = 8;

export const titleOptions = ["Mr", "Mrs", "Ms", "Dr"];

function hashSeed(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 100000;
  }
  return hash || 1;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export interface UrgencySignals {
  roomsLeft: number;
  bookedToday: number;
  viewedBy: number;
  lastBookingMinutesAgo: number;
}

export function getUrgencySignals(hotelId: string): UrgencySignals {
  const seed = hashSeed(hotelId);
  const r1 = seededRandom(seed);
  const r2 = seededRandom(seed * 2.13);
  const r3 = seededRandom(seed * 3.7);
  const r4 = seededRandom(seed * 4.9);
  return {
    roomsLeft: 1 + Math.floor(r1 * 4),
    bookedToday: 4 + Math.floor(r2 * 20),
    viewedBy: 12 + Math.floor(r3 * 60),
    lastBookingMinutesAgo: 2 + Math.floor(r4 * 40),
  };
}
