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

export const titleOptions = ["Mr", "Mrs", "Ms", "Dr"];
