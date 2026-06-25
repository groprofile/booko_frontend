import { createContext, useContext, useState, type ReactNode } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

export type AdminRole =
  | "super_admin" | "operations_admin" | "finance_admin"
  | "support_admin" | "sales_admin" | "content_admin";

export interface AdminUser {
  id: string; name: string; email: string; role: AdminRole; joinedAt: string;
}

export type VendorStatus = "approved" | "pending" | "under_review" | "rejected" | "blocked" | "draft";
export type KycStatus = "not_submitted" | "submitted" | "approved" | "rejected";
export type BankStatus = "not_submitted" | "submitted" | "verified";

export interface Vendor {
  id: string; businessName: string; ownerName: string;
  email: string; businessEmail: string; mobile: string;
  businessType: string; city: string; state: string; gstin: string;
  centerType: "single" | "multiple"; status: VendorStatus;
  kycStatus: KycStatus; bankStatus: BankStatus;
  joinedAt: string; approvedAt?: string;
  totalRevenue: number; totalBookings: number; totalCenters: number;
  commissionRate: number; notes?: string;
}

export type CenterStatus = "live" | "inactive" | "pending_approval" | "rejected";

export interface Center {
  id: string; vendorId: string; vendorName: string; name: string;
  businessType: string; city: string; area: string; state: string;
  address: string; status: CenterStatus; services: string[];
  totalBookings: number; totalRevenue: number; rating: number; addedAt: string;
}

export type ProductType = "Day Pass" | "Meeting Room" | "Monthly Pass" | "Virtual Office" | "Hotel Room" | "Hourly Stay" | "Full Day Stay";
export type BookingStatus = "confirmed" | "completed" | "cancelled" | "pending" | "no_show";
export type PaymentStatus = "paid" | "pending" | "refunded" | "failed" | "partial_refund";

export interface Booking {
  id: string; customerId: string; customerName: string;
  customerMobile: string; customerEmail: string;
  vendorId: string; vendorName: string; centerId: string; centerName: string;
  city: string; product: ProductType; date: string; time: string;
  amount: number; commission: number; paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus; checkinOtp: string;
  invoiceGenerated: boolean; refundStatus: "requested" | "approved" | "processed" | null;
  createdAt: string;
}

export type UserStatus = "active" | "blocked";

export interface AppUser {
  id: string; name: string; email: string; mobile: string;
  totalBookings: number; totalSpend: number; lastBookingDate?: string;
  signupDate: string; status: UserStatus; city: string;
}

export type SettlementStatus = "pending" | "processing" | "paid" | "failed";

export interface Settlement {
  id: string; vendorId: string; vendorName: string; period: string;
  grossAmount: number; commission: number; gst: number; tds: number;
  netPayable: number; status: SettlementStatus; bankAccount: string;
  ifsc: string; generatedAt: string; paidAt?: string; bookingsCount: number;
}

export type CouponDiscountType = "percentage" | "flat";

export interface Coupon {
  id: string; code: string; discountType: CouponDiscountType;
  value: number; maxDiscount?: number; minBooking: number;
  city?: string; category?: string; vendorId?: string;
  startDate: string; endDate: string; usageLimit: number;
  usageCount: number; active: boolean; createdAt: string;
}

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketType = "booking_issue" | "payment_issue" | "refund_issue" | "vendor_issue" | "kyc_issue" | "complaint" | "general";

export interface SupportTicket {
  id: string; customerId: string; customerName: string;
  customerEmail: string; customerMobile: string;
  type: TicketType; priority: TicketPriority; status: TicketStatus;
  subject: string; description: string; bookingId?: string;
  assignedTo?: string; createdAt: string; updatedAt: string;
}

export interface ActivityLog {
  id: string;
  type: "booking" | "vendor" | "payment" | "refund" | "user" | "center" | "approval" | "kyc";
  description: string; meta?: string; timestamp: string;
}

export interface MonthlyPoint { month: string; value: number; }

// ─── Permissions ─────────────────────────────────────────────────────────────

export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  super_admin: ["*"],
  operations_admin: ["dashboard", "vendors", "vendor_approvals", "centers", "bookings"],
  finance_admin: ["dashboard", "revenue", "settlements", "bookings"],
  support_admin: ["dashboard", "users", "bookings", "support"],
  sales_admin: ["dashboard", "vendors", "vendor_approvals"],
  content_admin: ["dashboard", "centers", "coupons"],
};

export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin", operations_admin: "Operations", finance_admin: "Finance",
  support_admin: "Support", sales_admin: "Sales", content_admin: "Content",
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_ADMINS = [
  { id: "a001", name: "Arjun Mehta", email: "admin@bokkoapp.com", role: "super_admin" as AdminRole, password: "Admin@2024", otp: "123456", joinedAt: "2024-01-01" },
  { id: "a002", name: "Priya Sharma", email: "finance@bokkoapp.com", role: "finance_admin" as AdminRole, password: "Finance@2024", otp: "234567", joinedAt: "2024-02-01" },
  { id: "a003", name: "Rohit Kumar", email: "ops@bokkoapp.com", role: "operations_admin" as AdminRole, password: "Ops@2024", otp: "345678", joinedAt: "2024-02-15" },
  { id: "a004", name: "Anjali Singh", email: "support@bokkoapp.com", role: "support_admin" as AdminRole, password: "Support@2024", otp: "456789", joinedAt: "2024-03-01" },
  { id: "a005", name: "Varun Gupta", email: "sales@bokkoapp.com", role: "sales_admin" as AdminRole, password: "Sales@2024", otp: "567890", joinedAt: "2024-03-15" },
];

const INIT_VENDORS: Vendor[] = [
  { id: "v001", businessName: "WorkHub Spaces", ownerName: "Rahul Mehta", email: "rahul@workhub.in", businessEmail: "info@workhub.in", mobile: "9820123456", businessType: "Coworking Space", city: "Mumbai", state: "Maharashtra", gstin: "27AAPFU0939F1ZV", centerType: "multiple", status: "approved", kycStatus: "approved", bankStatus: "verified", joinedAt: "2025-08-15", approvedAt: "2025-08-20", totalRevenue: 485000, totalBookings: 312, totalCenters: 3, commissionRate: 10 },
  { id: "v002", businessName: "The Desk Factory", ownerName: "Sneha Patel", email: "sneha@deskfactory.in", businessEmail: "hello@deskfactory.in", mobile: "9845678901", businessType: "Coworking Space", city: "Bangalore", state: "Karnataka", gstin: "29BAAFD1234C1Z5", centerType: "multiple", status: "approved", kycStatus: "approved", bankStatus: "verified", joinedAt: "2025-07-10", approvedAt: "2025-07-15", totalRevenue: 362000, totalBookings: 241, totalCenters: 2, commissionRate: 10 },
  { id: "v003", businessName: "IndiCowork Delhi", ownerName: "Amit Sharma", email: "amit@indicowork.in", businessEmail: "delhi@indicowork.in", mobile: "9711234567", businessType: "Coworking Space", city: "New Delhi", state: "Delhi", gstin: "07AAACI0989C1ZQ", centerType: "single", status: "approved", kycStatus: "approved", bankStatus: "verified", joinedAt: "2025-09-05", approvedAt: "2025-09-12", totalRevenue: 198000, totalBookings: 143, totalCenters: 1, commissionRate: 10 },
  { id: "v004", businessName: "StayEasy Business Hotels", ownerName: "Vikram Nair", email: "vikram@stayeasy.in", businessEmail: "ops@stayeasy.in", mobile: "9820987654", businessType: "Hotel", city: "Mumbai", state: "Maharashtra", gstin: "27AAPSE0123B1ZK", centerType: "multiple", status: "approved", kycStatus: "approved", bankStatus: "verified", joinedAt: "2025-06-20", approvedAt: "2025-06-28", totalRevenue: 712000, totalBookings: 398, totalCenters: 4, commissionRate: 12 },
  { id: "v005", businessName: "Nexus Meeting Hub", ownerName: "Kavya Reddy", email: "kavya@nexushub.in", businessEmail: "rooms@nexushub.in", mobile: "9876543210", businessType: "Meeting Room Provider", city: "Pune", state: "Maharashtra", gstin: "27AANNM0567F1ZT", centerType: "multiple", status: "approved", kycStatus: "approved", bankStatus: "verified", joinedAt: "2025-10-01", approvedAt: "2025-10-08", totalRevenue: 156000, totalBookings: 187, totalCenters: 2, commissionRate: 10 },
  { id: "v006", businessName: "SmartStay Hotels Gurgaon", ownerName: "Rajesh Bansal", email: "rajesh@smartstay.in", businessEmail: "info@smartstay.in", mobile: "9810456789", businessType: "Hotel", city: "Gurgaon", state: "Haryana", gstin: "06AAABS0789G1ZM", centerType: "single", status: "approved", kycStatus: "approved", bankStatus: "verified", joinedAt: "2025-11-12", approvedAt: "2025-11-19", totalRevenue: 289000, totalBookings: 156, totalCenters: 1, commissionRate: 12 },
  { id: "v007", businessName: "VirtualDesk India", ownerName: "Ananya Iyer", email: "ananya@virtualdesk.in", businessEmail: "support@virtualdesk.in", mobile: "9845012345", businessType: "Virtual Office Provider", city: "Bangalore", state: "Karnataka", gstin: "29AAANV0234A1ZP", centerType: "single", status: "under_review", kycStatus: "submitted", bankStatus: "submitted", joinedAt: "2026-06-01", totalRevenue: 0, totalBookings: 0, totalCenters: 0, commissionRate: 8 },
  { id: "v008", businessName: "FlexiWork Hyderabad", ownerName: "Srinivas Rao", email: "srinivas@flexiwork.in", businessEmail: "hyd@flexiwork.in", mobile: "9848567890", businessType: "Coworking Space", city: "Hyderabad", state: "Telangana", gstin: "36AAAFH0456E1ZR", centerType: "multiple", status: "under_review", kycStatus: "submitted", bankStatus: "not_submitted", joinedAt: "2026-06-10", totalRevenue: 0, totalBookings: 0, totalCenters: 0, commissionRate: 10 },
  { id: "v009", businessName: "Premier Business Suites", ownerName: "Lakshmi Krishnan", email: "lakshmi@premierbiz.in", businessEmail: "info@premierbiz.in", mobile: "9841234567", businessType: "Managed Office", city: "Chennai", state: "Tamil Nadu", gstin: "33AAAPP0678D1ZS", centerType: "single", status: "pending", kycStatus: "not_submitted", bankStatus: "not_submitted", joinedAt: "2026-06-15", totalRevenue: 0, totalBookings: 0, totalCenters: 0, commissionRate: 10 },
  { id: "v010", businessName: "EventPro Venues Delhi", ownerName: "Karan Malhotra", email: "karan@eventpro.in", businessEmail: "delhi@eventpro.in", mobile: "9810234567", businessType: "Event Space", city: "New Delhi", state: "Delhi", gstin: "07AAAEP0890C1ZU", centerType: "single", status: "under_review", kycStatus: "submitted", bankStatus: "not_submitted", joinedAt: "2026-06-18", totalRevenue: 0, totalBookings: 0, totalCenters: 0, commissionRate: 10 },
  { id: "v011", businessName: "CoSpace India Mumbai", ownerName: "Nikhil Joshi", email: "nikhil@cospace.in", businessEmail: "mumbai@cospace.in", mobile: "9820789012", businessType: "Coworking Space", city: "Mumbai", state: "Maharashtra", gstin: "27AAACJ0123H1ZA", centerType: "multiple", status: "blocked", kycStatus: "approved", bankStatus: "verified", joinedAt: "2025-05-01", approvedAt: "2025-05-10", totalRevenue: 45000, totalBookings: 28, totalCenters: 2, commissionRate: 10, notes: "Blocked: repeated customer complaints and no-show violations." },
  { id: "v012", businessName: "HomeAway Hospitality", ownerName: "Divya Nair", email: "divya@homeaway.in", businessEmail: "info@homeaway.in", mobile: "9887654321", businessType: "Hotel", city: "Jaipur", state: "Rajasthan", gstin: "08AAADH0345I1ZB", centerType: "single", status: "rejected", kycStatus: "rejected", bankStatus: "not_submitted", joinedAt: "2026-04-20", totalRevenue: 0, totalBookings: 0, totalCenters: 0, commissionRate: 12, notes: "KYC rejected: GST not active, Aadhaar mismatch." },
];

const INIT_CENTERS: Center[] = [
  { id: "c001", vendorId: "v001", vendorName: "WorkHub Spaces", name: "WorkHub Lower Parel", businessType: "Coworking Space", city: "Mumbai", area: "Lower Parel", state: "Maharashtra", address: "Kamala Mills, Lower Parel, Mumbai 400013", status: "live", services: ["Day Pass", "Monthly Pass", "Meeting Room", "Private Cabin"], totalBookings: 145, totalRevenue: 218000, rating: 4.6, addedAt: "2025-08-22" },
  { id: "c002", vendorId: "v001", vendorName: "WorkHub Spaces", name: "WorkHub BKC", businessType: "Coworking Space", city: "Mumbai", area: "Bandra Kurla Complex", state: "Maharashtra", address: "G-Block, BKC, Mumbai 400051", status: "live", services: ["Day Pass", "Monthly Pass", "Meeting Room", "Managed Office"], totalBookings: 112, totalRevenue: 182000, rating: 4.8, addedAt: "2025-09-05" },
  { id: "c003", vendorId: "v001", vendorName: "WorkHub Spaces", name: "WorkHub Powai", businessType: "Coworking Space", city: "Mumbai", area: "Powai", state: "Maharashtra", address: "Hiranandani Business Park, Powai, Mumbai 400076", status: "live", services: ["Day Pass", "Monthly Pass", "Meeting Room"], totalBookings: 55, totalRevenue: 85000, rating: 4.4, addedAt: "2026-01-10" },
  { id: "c004", vendorId: "v002", vendorName: "The Desk Factory", name: "Desk Factory Koramangala", businessType: "Coworking Space", city: "Bangalore", area: "Koramangala", state: "Karnataka", address: "5th Block, Koramangala, Bangalore 560095", status: "live", services: ["Day Pass", "Monthly Pass", "Meeting Room", "Event Space"], totalBookings: 134, totalRevenue: 196000, rating: 4.7, addedAt: "2025-07-18" },
  { id: "c005", vendorId: "v002", vendorName: "The Desk Factory", name: "Desk Factory Indiranagar", businessType: "Coworking Space", city: "Bangalore", area: "Indiranagar", state: "Karnataka", address: "100 Feet Road, Indiranagar, Bangalore 560038", status: "live", services: ["Day Pass", "Monthly Pass", "Private Cabin"], totalBookings: 107, totalRevenue: 166000, rating: 4.5, addedAt: "2025-09-22" },
  { id: "c006", vendorId: "v003", vendorName: "IndiCowork Delhi", name: "IndiCowork Connaught Place", businessType: "Coworking Space", city: "New Delhi", area: "Connaught Place", state: "Delhi", address: "Block E, Connaught Place, New Delhi 110001", status: "live", services: ["Day Pass", "Monthly Pass", "Meeting Room", "Virtual Office"], totalBookings: 143, totalRevenue: 198000, rating: 4.3, addedAt: "2025-09-15" },
  { id: "c007", vendorId: "v004", vendorName: "StayEasy Business Hotels", name: "StayEasy Powai", businessType: "Hotel", city: "Mumbai", area: "Powai", state: "Maharashtra", address: "Hiranandani Gardens, Powai, Mumbai 400076", status: "live", services: ["Hotel Room", "Hourly Stay", "Full Day Stay"], totalBookings: 210, totalRevenue: 385000, rating: 4.2, addedAt: "2025-06-30" },
  { id: "c008", vendorId: "v005", vendorName: "Nexus Meeting Hub", name: "Nexus Hinjewadi", businessType: "Meeting Room Provider", city: "Pune", area: "Hinjewadi", state: "Maharashtra", address: "Phase 1, Hinjewadi, Pune 411057", status: "live", services: ["Meeting Room", "Day Pass", "Event Space"], totalBookings: 98, totalRevenue: 89000, rating: 4.6, addedAt: "2025-10-12" },
  { id: "c009", vendorId: "v007", vendorName: "VirtualDesk India", name: "VirtualDesk Whitefield", businessType: "Virtual Office Provider", city: "Bangalore", area: "Whitefield", state: "Karnataka", address: "EPIP Zone, Whitefield, Bangalore 560066", status: "pending_approval", services: ["Virtual Office"], totalBookings: 0, totalRevenue: 0, rating: 0, addedAt: "2026-06-05" },
  { id: "c010", vendorId: "v011", vendorName: "CoSpace India Mumbai", name: "CoSpace Andheri West", businessType: "Coworking Space", city: "Mumbai", area: "Andheri West", state: "Maharashtra", address: "Veera Desai Road, Andheri West, Mumbai 400053", status: "inactive", services: ["Day Pass", "Monthly Pass"], totalBookings: 28, totalRevenue: 45000, rating: 3.1, addedAt: "2025-05-05" },
];

const INIT_USERS: AppUser[] = [
  { id: "u001", name: "Ravi Khanna", email: "ravi.khanna@gmail.com", mobile: "9876543210", totalBookings: 18, totalSpend: 47500, lastBookingDate: "2026-06-20", signupDate: "2025-08-12", status: "active", city: "Mumbai" },
  { id: "u002", name: "Meera Joshi", email: "meera.joshi@gmail.com", mobile: "9867412345", totalBookings: 12, totalSpend: 31200, lastBookingDate: "2026-06-22", signupDate: "2025-09-05", status: "active", city: "Bangalore" },
  { id: "u003", name: "Suresh Nair", email: "suresh.nair@outlook.com", mobile: "9845671234", totalBookings: 7, totalSpend: 18900, lastBookingDate: "2026-06-15", signupDate: "2025-10-18", status: "active", city: "Pune" },
  { id: "u004", name: "Deepika Verma", email: "deepika.verma@gmail.com", mobile: "9811234567", totalBookings: 24, totalSpend: 64300, lastBookingDate: "2026-06-23", signupDate: "2025-07-22", status: "active", city: "New Delhi" },
  { id: "u005", name: "Aakash Patel", email: "aakash.patel@gmail.com", mobile: "9820345678", totalBookings: 3, totalSpend: 7800, lastBookingDate: "2026-05-30", signupDate: "2026-02-14", status: "active", city: "Mumbai" },
  { id: "u006", name: "Preethi Krishnan", email: "preethi.k@gmail.com", mobile: "9884123456", totalBookings: 9, totalSpend: 23400, lastBookingDate: "2026-06-19", signupDate: "2025-11-03", status: "active", city: "Chennai" },
  { id: "u007", name: "Mohit Sharma", email: "mohit.sharma@hotmail.com", mobile: "9813456789", totalBookings: 15, totalSpend: 39800, lastBookingDate: "2026-06-21", signupDate: "2025-08-30", status: "active", city: "Gurgaon" },
  { id: "u008", name: "Sunita Yadav", email: "sunita.yadav@gmail.com", mobile: "9849234567", totalBookings: 2, totalSpend: 4500, lastBookingDate: "2026-04-12", signupDate: "2026-03-25", status: "active", city: "Hyderabad" },
  { id: "u009", name: "Farhan Sheikh", email: "farhan.sheikh@gmail.com", mobile: "9823456789", totalBookings: 6, totalSpend: 15600, lastBookingDate: "2026-06-10", signupDate: "2025-12-18", status: "blocked", city: "Mumbai" },
  { id: "u010", name: "Anita Desai", email: "anita.desai@yahoo.com", mobile: "9876012345", totalBookings: 11, totalSpend: 28900, lastBookingDate: "2026-06-17", signupDate: "2025-09-14", status: "active", city: "Bangalore" },
  { id: "u011", name: "Rohan Gupta", email: "rohan.gupta@gmail.com", mobile: "9818765432", totalBookings: 19, totalSpend: 52100, lastBookingDate: "2026-06-23", signupDate: "2025-07-01", status: "active", city: "New Delhi" },
  { id: "u012", name: "Kavitha Menon", email: "kavitha.menon@gmail.com", mobile: "9847890123", totalBookings: 8, totalSpend: 21000, lastBookingDate: "2026-06-14", signupDate: "2025-10-07", status: "active", city: "Kochi" },
];

const INIT_BOOKINGS: Booking[] = [
  { id: "BK26061001", customerId: "u004", customerName: "Deepika Verma", customerMobile: "9811234567", customerEmail: "deepika.verma@gmail.com", vendorId: "v001", vendorName: "WorkHub Spaces", centerId: "c001", centerName: "WorkHub Lower Parel", city: "Mumbai", product: "Day Pass", date: "2026-06-23", time: "09:00", amount: 799, commission: 80, paymentStatus: "paid", bookingStatus: "confirmed", checkinOtp: "481923", invoiceGenerated: true, refundStatus: null, createdAt: "2026-06-23T07:45:00" },
  { id: "BK26061002", customerId: "u011", customerName: "Rohan Gupta", customerMobile: "9818765432", customerEmail: "rohan.gupta@gmail.com", vendorId: "v004", vendorName: "StayEasy Business Hotels", centerId: "c007", centerName: "StayEasy Powai", city: "Mumbai", product: "Hotel Room", date: "2026-06-23", time: "14:00", amount: 3499, commission: 420, paymentStatus: "paid", bookingStatus: "confirmed", checkinOtp: "932741", invoiceGenerated: true, refundStatus: null, createdAt: "2026-06-23T09:12:00" },
  { id: "BK26061003", customerId: "u001", customerName: "Ravi Khanna", customerMobile: "9876543210", customerEmail: "ravi.khanna@gmail.com", vendorId: "v001", vendorName: "WorkHub Spaces", centerId: "c002", centerName: "WorkHub BKC", city: "Mumbai", product: "Meeting Room", date: "2026-06-23", time: "11:00", amount: 1500, commission: 150, paymentStatus: "paid", bookingStatus: "confirmed", checkinOtp: "762134", invoiceGenerated: true, refundStatus: null, createdAt: "2026-06-23T08:30:00" },
  { id: "BK26061004", customerId: "u007", customerName: "Mohit Sharma", customerMobile: "9813456789", customerEmail: "mohit.sharma@hotmail.com", vendorId: "v006", vendorName: "SmartStay Hotels Gurgaon", centerId: "c005", centerName: "SmartStay Central", city: "Gurgaon", product: "Full Day Stay", date: "2026-06-22", time: "08:00", amount: 2199, commission: 264, paymentStatus: "paid", bookingStatus: "completed", checkinOtp: "543219", invoiceGenerated: true, refundStatus: null, createdAt: "2026-06-22T06:15:00" },
  { id: "BK26061005", customerId: "u002", customerName: "Meera Joshi", customerMobile: "9867412345", customerEmail: "meera.joshi@gmail.com", vendorId: "v002", vendorName: "The Desk Factory", centerId: "c004", centerName: "Desk Factory Koramangala", city: "Bangalore", product: "Monthly Pass", date: "2026-06-01", time: "09:00", amount: 8999, commission: 900, paymentStatus: "paid", bookingStatus: "confirmed", checkinOtp: "219843", invoiceGenerated: true, refundStatus: null, createdAt: "2026-05-28T14:00:00" },
  { id: "BK26061006", customerId: "u009", customerName: "Farhan Sheikh", customerMobile: "9823456789", customerEmail: "farhan.sheikh@gmail.com", vendorId: "v001", vendorName: "WorkHub Spaces", centerId: "c001", centerName: "WorkHub Lower Parel", city: "Mumbai", product: "Day Pass", date: "2026-06-10", time: "09:00", amount: 799, commission: 80, paymentStatus: "refunded", bookingStatus: "cancelled", checkinOtp: "000000", invoiceGenerated: false, refundStatus: "processed", createdAt: "2026-06-09T18:00:00" },
  { id: "BK26061007", customerId: "u003", customerName: "Suresh Nair", customerMobile: "9845671234", customerEmail: "suresh.nair@outlook.com", vendorId: "v005", vendorName: "Nexus Meeting Hub", centerId: "c008", centerName: "Nexus Hinjewadi", city: "Pune", product: "Meeting Room", date: "2026-06-20", time: "10:00", amount: 2400, commission: 240, paymentStatus: "paid", bookingStatus: "completed", checkinOtp: "381029", invoiceGenerated: true, refundStatus: null, createdAt: "2026-06-19T20:00:00" },
  { id: "BK26061008", customerId: "u010", customerName: "Anita Desai", customerMobile: "9876012345", customerEmail: "anita.desai@yahoo.com", vendorId: "v002", vendorName: "The Desk Factory", centerId: "c005", centerName: "Desk Factory Indiranagar", city: "Bangalore", product: "Day Pass", date: "2026-06-17", time: "09:00", amount: 699, commission: 70, paymentStatus: "paid", bookingStatus: "completed", checkinOtp: "482910", invoiceGenerated: true, refundStatus: null, createdAt: "2026-06-16T22:30:00" },
  { id: "BK26061009", customerId: "u004", customerName: "Deepika Verma", customerMobile: "9811234567", customerEmail: "deepika.verma@gmail.com", vendorId: "v003", vendorName: "IndiCowork Delhi", centerId: "c006", centerName: "IndiCowork Connaught Place", city: "New Delhi", product: "Virtual Office", date: "2026-06-01", time: "00:00", amount: 1999, commission: 200, paymentStatus: "paid", bookingStatus: "confirmed", checkinOtp: "000000", invoiceGenerated: true, refundStatus: null, createdAt: "2026-05-30T11:00:00" },
  { id: "BK26061010", customerId: "u005", customerName: "Aakash Patel", customerMobile: "9820345678", customerEmail: "aakash.patel@gmail.com", vendorId: "v004", vendorName: "StayEasy Business Hotels", centerId: "c007", centerName: "StayEasy Powai", city: "Mumbai", product: "Hourly Stay", date: "2026-05-30", time: "13:00", amount: 999, commission: 120, paymentStatus: "paid", bookingStatus: "completed", checkinOtp: "671823", invoiceGenerated: true, refundStatus: null, createdAt: "2026-05-30T11:30:00" },
  { id: "BK26061011", customerId: "u006", customerName: "Preethi Krishnan", customerMobile: "9884123456", customerEmail: "preethi.k@gmail.com", vendorId: "v004", vendorName: "StayEasy Business Hotels", centerId: "c007", centerName: "StayEasy Powai", city: "Mumbai", product: "Hotel Room", date: "2026-06-19", time: "12:00", amount: 3999, commission: 480, paymentStatus: "paid", bookingStatus: "completed", checkinOtp: "102938", invoiceGenerated: true, refundStatus: null, createdAt: "2026-06-18T16:00:00" },
  { id: "BK26061012", customerId: "u012", customerName: "Kavitha Menon", customerMobile: "9847890123", customerEmail: "kavitha.menon@gmail.com", vendorId: "v005", vendorName: "Nexus Meeting Hub", centerId: "c008", centerName: "Nexus Hinjewadi", city: "Pune", product: "Meeting Room", date: "2026-06-14", time: "14:00", amount: 1800, commission: 180, paymentStatus: "paid", bookingStatus: "completed", checkinOtp: "738291", invoiceGenerated: true, refundStatus: null, createdAt: "2026-06-14T12:00:00" },
  { id: "BK26061013", customerId: "u001", customerName: "Ravi Khanna", customerMobile: "9876543210", customerEmail: "ravi.khanna@gmail.com", vendorId: "v001", vendorName: "WorkHub Spaces", centerId: "c003", centerName: "WorkHub Powai", city: "Mumbai", product: "Day Pass", date: "2026-06-21", time: "09:00", amount: 799, commission: 80, paymentStatus: "paid", bookingStatus: "completed", checkinOtp: "291038", invoiceGenerated: true, refundStatus: null, createdAt: "2026-06-20T20:00:00" },
  { id: "BK26061014", customerId: "u008", customerName: "Sunita Yadav", customerMobile: "9849234567", customerEmail: "sunita.yadav@gmail.com", vendorId: "v002", vendorName: "The Desk Factory", centerId: "c004", centerName: "Desk Factory Koramangala", city: "Bangalore", product: "Day Pass", date: "2026-04-12", time: "09:00", amount: 699, commission: 70, paymentStatus: "refunded", bookingStatus: "cancelled", checkinOtp: "000000", invoiceGenerated: false, refundStatus: "requested", createdAt: "2026-04-11T19:00:00" },
  { id: "BK26061015", customerId: "u007", customerName: "Mohit Sharma", customerMobile: "9813456789", customerEmail: "mohit.sharma@hotmail.com", vendorId: "v003", vendorName: "IndiCowork Delhi", centerId: "c006", centerName: "IndiCowork Connaught Place", city: "New Delhi", product: "Day Pass", date: "2026-06-21", time: "09:00", amount: 899, commission: 90, paymentStatus: "paid", bookingStatus: "confirmed", checkinOtp: "481902", invoiceGenerated: true, refundStatus: null, createdAt: "2026-06-20T21:30:00" },
  { id: "BK26061016", customerId: "u011", customerName: "Rohan Gupta", customerMobile: "9818765432", customerEmail: "rohan.gupta@gmail.com", vendorId: "v006", vendorName: "SmartStay Hotels Gurgaon", centerId: "c005", centerName: "SmartStay Central", city: "Gurgaon", product: "Hotel Room", date: "2026-06-22", time: "15:00", amount: 4299, commission: 516, paymentStatus: "pending", bookingStatus: "pending", checkinOtp: "000000", invoiceGenerated: false, refundStatus: null, createdAt: "2026-06-22T14:00:00" },
  { id: "BK26061017", customerId: "u002", customerName: "Meera Joshi", customerMobile: "9867412345", customerEmail: "meera.joshi@gmail.com", vendorId: "v002", vendorName: "The Desk Factory", centerId: "c004", centerName: "Desk Factory Koramangala", city: "Bangalore", product: "Meeting Room", date: "2026-06-22", time: "10:00", amount: 2100, commission: 210, paymentStatus: "paid", bookingStatus: "confirmed", checkinOtp: "830192", invoiceGenerated: true, refundStatus: null, createdAt: "2026-06-21T22:00:00" },
  { id: "BK26061018", customerId: "u004", customerName: "Deepika Verma", customerMobile: "9811234567", customerEmail: "deepika.verma@gmail.com", vendorId: "v001", vendorName: "WorkHub Spaces", centerId: "c001", centerName: "WorkHub Lower Parel", city: "Mumbai", product: "Monthly Pass", date: "2026-06-01", time: "09:00", amount: 9999, commission: 1000, paymentStatus: "paid", bookingStatus: "confirmed", checkinOtp: "100293", invoiceGenerated: true, refundStatus: null, createdAt: "2026-05-29T10:00:00" },
  { id: "BK26061019", customerId: "u003", customerName: "Suresh Nair", customerMobile: "9845671234", customerEmail: "suresh.nair@outlook.com", vendorId: "v005", vendorName: "Nexus Meeting Hub", centerId: "c008", centerName: "Nexus Hinjewadi", city: "Pune", product: "Day Pass", date: "2026-06-15", time: "09:00", amount: 599, commission: 60, paymentStatus: "paid", bookingStatus: "completed", checkinOtp: "910284", invoiceGenerated: true, refundStatus: null, createdAt: "2026-06-14T18:00:00" },
  { id: "BK26061020", customerId: "u010", customerName: "Anita Desai", customerMobile: "9876012345", customerEmail: "anita.desai@yahoo.com", vendorId: "v004", vendorName: "StayEasy Business Hotels", centerId: "c007", centerName: "StayEasy Powai", city: "Mumbai", product: "Hourly Stay", date: "2026-06-17", time: "11:00", amount: 1199, commission: 144, paymentStatus: "paid", bookingStatus: "no_show", checkinOtp: "839201", invoiceGenerated: true, refundStatus: null, createdAt: "2026-06-17T09:00:00" },
];

const INIT_SETTLEMENTS: Settlement[] = [
  { id: "S001", vendorId: "v001", vendorName: "WorkHub Spaces", period: "May 2026", grossAmount: 218000, commission: 21800, gst: 3924, tds: 4360, netPayable: 187916, status: "paid", bankAccount: "XXXX9456", ifsc: "HDFC0001234", generatedAt: "2026-06-07", paidAt: "2026-06-08", bookingsCount: 145 },
  { id: "S002", vendorId: "v002", vendorName: "The Desk Factory", period: "May 2026", grossAmount: 196000, commission: 19600, gst: 3528, tds: 3920, netPayable: 168952, status: "paid", bankAccount: "XXXX7823", ifsc: "ICIC0002345", generatedAt: "2026-06-07", paidAt: "2026-06-09", bookingsCount: 134 },
  { id: "S003", vendorId: "v003", vendorName: "IndiCowork Delhi", period: "May 2026", grossAmount: 198000, commission: 19800, gst: 3564, tds: 3960, netPayable: 170676, status: "processing", bankAccount: "XXXX3312", ifsc: "AXIS0003456", generatedAt: "2026-06-07", bookingsCount: 143 },
  { id: "S004", vendorId: "v004", vendorName: "StayEasy Business Hotels", period: "May 2026", grossAmount: 385000, commission: 46200, gst: 8316, tds: 7700, netPayable: 322784, status: "paid", bankAccount: "XXXX6671", ifsc: "KOTAK0004567", generatedAt: "2026-06-07", paidAt: "2026-06-10", bookingsCount: 210 },
  { id: "S005", vendorId: "v005", vendorName: "Nexus Meeting Hub", period: "May 2026", grossAmount: 89000, commission: 8900, gst: 1602, tds: 1780, netPayable: 76718, status: "pending", bankAccount: "XXXX4490", ifsc: "SBI0005678", generatedAt: "2026-06-07", bookingsCount: 98 },
  { id: "S006", vendorId: "v006", vendorName: "SmartStay Hotels Gurgaon", period: "May 2026", grossAmount: 156000, commission: 18720, gst: 3370, tds: 3120, netPayable: 130790, status: "pending", bankAccount: "XXXX8821", ifsc: "PNB0006789", generatedAt: "2026-06-07", bookingsCount: 84 },
  { id: "S007", vendorId: "v001", vendorName: "WorkHub Spaces", period: "Apr 2026", grossAmount: 185000, commission: 18500, gst: 3330, tds: 3700, netPayable: 159470, status: "paid", bankAccount: "XXXX9456", ifsc: "HDFC0001234", generatedAt: "2026-05-07", paidAt: "2026-05-08", bookingsCount: 128 },
  { id: "S008", vendorId: "v004", vendorName: "StayEasy Business Hotels", period: "Apr 2026", grossAmount: 342000, commission: 41040, gst: 7387, tds: 6840, netPayable: 286733, status: "paid", bankAccount: "XXXX6671", ifsc: "KOTAK0004567", generatedAt: "2026-05-07", paidAt: "2026-05-09", bookingsCount: 189 },
];

const INIT_COUPONS: Coupon[] = [
  { id: "cp001", code: "BOKKO20", discountType: "percentage", value: 20, maxDiscount: 200, minBooking: 500, startDate: "2026-06-01", endDate: "2026-06-30", usageLimit: 500, usageCount: 312, active: true, createdAt: "2026-05-28" },
  { id: "cp002", code: "FLAT150", discountType: "flat", value: 150, minBooking: 800, city: "Mumbai", startDate: "2026-06-15", endDate: "2026-07-15", usageLimit: 200, usageCount: 87, active: true, createdAt: "2026-06-12" },
  { id: "cp003", code: "WORK10", discountType: "percentage", value: 10, maxDiscount: 100, minBooking: 400, category: "Day Pass", startDate: "2026-05-01", endDate: "2026-05-31", usageLimit: 300, usageCount: 300, active: false, createdAt: "2026-04-28" },
  { id: "cp004", code: "HOTEL25", discountType: "percentage", value: 25, maxDiscount: 500, minBooking: 1500, category: "Hotel Room", startDate: "2026-06-20", endDate: "2026-07-20", usageLimit: 150, usageCount: 42, active: true, createdAt: "2026-06-18" },
  { id: "cp005", code: "MEETFREE", discountType: "flat", value: 300, minBooking: 1200, category: "Meeting Room", startDate: "2026-07-01", endDate: "2026-07-31", usageLimit: 100, usageCount: 0, active: true, createdAt: "2026-06-22" },
  { id: "cp006", code: "BLRSPECIAL", discountType: "percentage", value: 15, maxDiscount: 250, minBooking: 600, city: "Bangalore", startDate: "2026-06-01", endDate: "2026-06-30", usageLimit: 400, usageCount: 198, active: true, createdAt: "2026-05-30" },
];

const INIT_TICKETS: SupportTicket[] = [
  { id: "TK001", customerId: "u009", customerName: "Farhan Sheikh", customerEmail: "farhan.sheikh@gmail.com", customerMobile: "9823456789", type: "refund_issue", priority: "high", status: "in_progress", subject: "Refund not received after 7 days", description: "I cancelled my Day Pass booking on June 10 and was promised a refund within 5-7 days. It has been 13 days and no refund.", bookingId: "BK26061006", assignedTo: "Anjali Singh", createdAt: "2026-06-23T08:00:00", updatedAt: "2026-06-23T10:30:00" },
  { id: "TK002", customerId: "u008", customerName: "Sunita Yadav", customerEmail: "sunita.yadav@gmail.com", customerMobile: "9849234567", type: "booking_issue", priority: "medium", status: "open", subject: "Could not check in despite confirmed booking", description: "The coworking space staff said they have no record of my booking even though I received a confirmation email.", bookingId: "BK26061014", createdAt: "2026-06-23T09:15:00", updatedAt: "2026-06-23T09:15:00" },
  { id: "TK003", customerId: "u005", customerName: "Aakash Patel", customerEmail: "aakash.patel@gmail.com", customerMobile: "9820345678", type: "payment_issue", priority: "urgent", status: "open", subject: "Payment deducted but booking not confirmed", description: "Amount of ₹999 was deducted from my account but the booking status shows failed.", bookingId: "BK26061010", createdAt: "2026-06-23T10:45:00", updatedAt: "2026-06-23T10:45:00" },
  { id: "TK004", customerId: "u002", customerName: "Meera Joshi", customerEmail: "meera.joshi@gmail.com", customerMobile: "9867412345", type: "general", priority: "low", status: "resolved", subject: "How to upgrade monthly pass mid-month?", description: "I want to upgrade from hot desk to dedicated desk for the remaining 15 days of my monthly pass.", createdAt: "2026-06-20T14:00:00", updatedAt: "2026-06-21T11:00:00" },
  { id: "TK005", customerId: "u007", customerName: "Mohit Sharma", customerEmail: "mohit.sharma@hotmail.com", customerMobile: "9813456789", type: "vendor_issue", priority: "high", status: "in_progress", subject: "Hotel room was not as advertised", description: "The SmartStay hotel room had dirty linen and the AC was not working. Very different from website photos.", bookingId: "BK26061004", assignedTo: "Anjali Singh", createdAt: "2026-06-23T07:00:00", updatedAt: "2026-06-23T09:00:00" },
  { id: "TK006", customerId: "u001", customerName: "Ravi Khanna", customerEmail: "ravi.khanna@gmail.com", customerMobile: "9876543210", type: "complaint", priority: "medium", status: "open", subject: "Parking not available as listed", description: "The listing says free parking is included but when I arrived there was no parking space available.", bookingId: "BK26061013", createdAt: "2026-06-22T16:30:00", updatedAt: "2026-06-22T16:30:00" },
  { id: "TK007", customerId: "u011", customerName: "Rohan Gupta", customerEmail: "rohan.gupta@gmail.com", customerMobile: "9818765432", type: "kyc_issue", priority: "low", status: "closed", subject: "Need GST invoice for corporate reimbursement", description: "I need a proper GST invoice for my hotel booking for reimbursement from my employer.", bookingId: "BK26061002", createdAt: "2026-06-23T11:00:00", updatedAt: "2026-06-23T12:00:00" },
  { id: "TK008", customerId: "u006", customerName: "Preethi Krishnan", customerEmail: "preethi.k@gmail.com", customerMobile: "9884123456", type: "refund_issue", priority: "medium", status: "open", subject: "Partial refund received instead of full refund", description: "I cancelled within the allowed window but only received a 50% refund instead of 100%.", bookingId: "BK26061011", createdAt: "2026-06-23T13:00:00", updatedAt: "2026-06-23T13:00:00" },
];

const INIT_ACTIVITY: ActivityLog[] = [
  { id: "act001", type: "booking", description: "New booking received", meta: "BK26061001 · WorkHub Lower Parel · ₹799", timestamp: "2026-06-23T07:45:00" },
  { id: "act002", type: "booking", description: "Hotel booking confirmed", meta: "BK26061002 · StayEasy Powai · ₹3,499", timestamp: "2026-06-23T09:12:00" },
  { id: "act003", type: "kyc", description: "KYC documents submitted", meta: "FlexiWork Hyderabad (v008)", timestamp: "2026-06-23T10:00:00" },
  { id: "act004", type: "payment", description: "Payment processed successfully", meta: "BK26061003 · ₹1,500 via UPI", timestamp: "2026-06-23T08:30:00" },
  { id: "act005", type: "refund", description: "Refund requested", meta: "TK001 · Farhan Sheikh · ₹799", timestamp: "2026-06-23T08:00:00" },
  { id: "act006", type: "user", description: "New user registered", meta: "Sunita Yadav · Hyderabad", timestamp: "2026-06-22T21:30:00" },
  { id: "act007", type: "vendor", description: "New partner signed up", meta: "EventPro Venues Delhi (v010)", timestamp: "2026-06-22T18:00:00" },
  { id: "act008", type: "center", description: "New center added", meta: "VirtualDesk Whitefield · Pending Approval", timestamp: "2026-06-22T15:00:00" },
  { id: "act009", type: "approval", description: "Vendor approved", meta: "SmartStay Hotels Gurgaon · Rohit Kumar", timestamp: "2025-11-19T14:00:00" },
  { id: "act010", type: "booking", description: "Monthly Pass purchased", meta: "BK26061018 · WorkHub Lower Parel · ₹9,999", timestamp: "2026-05-29T10:00:00" },
];

export const MONTHLY_REVENUE: MonthlyPoint[] = [
  { month: "Jul'25", value: 8.5 }, { month: "Aug'25", value: 9.8 }, { month: "Sep'25", value: 11.2 },
  { month: "Oct'25", value: 13.5 }, { month: "Nov'25", value: 15.1 }, { month: "Dec'25", value: 16.8 },
  { month: "Jan'26", value: 18.2 }, { month: "Feb'26", value: 21.5 }, { month: "Mar'26", value: 24.8 },
  { month: "Apr'26", value: 28.1 }, { month: "May'26", value: 31.4 }, { month: "Jun'26", value: 34.8 },
];

export const MONTHLY_BOOKINGS: MonthlyPoint[] = [
  { month: "Jul'25", value: 342 }, { month: "Aug'25", value: 421 }, { month: "Sep'25", value: 445 },
  { month: "Oct'25", value: 532 }, { month: "Nov'25", value: 641 }, { month: "Dec'25", value: 752 },
  { month: "Jan'26", value: 818 }, { month: "Feb'26", value: 924 }, { month: "Mar'26", value: 1034 },
  { month: "Apr'26", value: 1182 }, { month: "May'26", value: 1341 }, { month: "Jun'26", value: 1489 },
];

export const CATEGORY_REVENUE = [
  { label: "Hotels", value: 38, color: "#2563EB" },
  { label: "Coworking", value: 24, color: "#7C3AED" },
  { label: "Meeting Rooms", value: 18, color: "#059669" },
  { label: "Day Pass", value: 12, color: "#D97706" },
  { label: "Virtual Office", value: 5, color: "#DC2626" },
  { label: "Monthly Pass", value: 3, color: "#64748B" },
];

export const CITY_BOOKINGS = [
  { city: "Mumbai", pct: 34 },
  { city: "Bangalore", pct: 28 },
  { city: "New Delhi", pct: 18 },
  { city: "Hyderabad", pct: 10 },
  { city: "Pune", pct: 7 },
  { city: "Others", pct: 3 },
];

// ─── Context ──────────────────────────────────────────────────────────────────

interface AdminContextType {
  admin: AdminUser | null;
  vendors: Vendor[];
  centers: Center[];
  bookings: Booking[];
  users: AppUser[];
  settlements: Settlement[];
  coupons: Coupon[];
  tickets: SupportTicket[];
  activity: ActivityLog[];
  login: (email: string, password: string, otp?: string) => { success: boolean; error?: string };
  logout: () => void;
  hasPermission: (section: string) => boolean;
  approveVendor: (id: string) => void;
  rejectVendor: (id: string, reason?: string) => void;
  blockVendor: (id: string) => void;
  unblockVendor: (id: string) => void;
  addVendor: (data: Partial<Vendor>) => Vendor;
  updateVendor: (id: string, data: Partial<Vendor>) => void;
  cancelBooking: (id: string) => void;
  refundBooking: (id: string) => void;
  blockUser: (id: string) => void;
  unblockUser: (id: string) => void;
  markSettlementPaid: (id: string) => void;
  createCoupon: (data: Omit<Coupon, "id" | "usageCount" | "createdAt">) => void;
  disableCoupon: (id: string) => void;
  closeTicket: (id: string) => void;
  assignTicket: (id: string, name: string) => void;
  approveCenterLive: (id: string) => void;
  addCenter: (data: Partial<Center>) => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const stored = sessionStorage.getItem("bokko_admin");
  const [admin, setAdmin] = useState<AdminUser | null>(stored ? JSON.parse(stored) : null);
  const [vendors, setVendors] = useState<Vendor[]>(INIT_VENDORS);
  const [centers, setCenters] = useState<Center[]>(INIT_CENTERS);
  const [bookings, setBookings] = useState<Booking[]>(INIT_BOOKINGS);
  const [users, setUsers] = useState<AppUser[]>(INIT_USERS);
  const [settlements, setSettlements] = useState<Settlement[]>(INIT_SETTLEMENTS);
  const [coupons, setCoupons] = useState<Coupon[]>(INIT_COUPONS);
  const [tickets, setTickets] = useState<SupportTicket[]>(INIT_TICKETS);
  const [activity] = useState<ActivityLog[]>(INIT_ACTIVITY);

  function login(email: string, password: string, otp?: string) {
    const found = MOCK_ADMINS.find((a) => a.email === email && a.password === password);
    if (!found) return { success: false, error: "Invalid email or password" };
    if (otp && otp !== found.otp) return { success: false, error: "Invalid OTP code" };
    const { password: _, otp: __, ...adminUser } = found;
    setAdmin(adminUser);
    sessionStorage.setItem("bokko_admin", JSON.stringify(adminUser));
    return { success: true };
  }

  function logout() {
    setAdmin(null);
    sessionStorage.removeItem("bokko_admin");
  }

  function hasPermission(section: string) {
    if (!admin) return false;
    const perms = ROLE_PERMISSIONS[admin.role];
    return perms.includes("*") || perms.includes(section);
  }

  function approveVendor(id: string) {
    setVendors((vs) => vs.map((v) => v.id === id ? { ...v, status: "approved", approvedAt: new Date().toISOString().slice(0, 10) } : v));
  }

  function rejectVendor(id: string, reason?: string) {
    setVendors((vs) => vs.map((v) => v.id === id ? { ...v, status: "rejected", notes: reason ?? v.notes } : v));
  }

  function blockVendor(id: string) {
    setVendors((vs) => vs.map((v) => v.id === id ? { ...v, status: "blocked" } : v));
  }

  function unblockVendor(id: string) {
    setVendors((vs) => vs.map((v) => v.id === id ? { ...v, status: "approved" } : v));
  }

  function addVendor(data: Partial<Vendor>): Vendor {
    const v: Vendor = {
      id: `v${Date.now()}`, businessName: "", ownerName: "", email: "", businessEmail: "",
      mobile: "", businessType: "", city: "", state: "", gstin: "",
      centerType: "single", status: "draft", kycStatus: "not_submitted", bankStatus: "not_submitted",
      joinedAt: new Date().toISOString().slice(0, 10), totalRevenue: 0, totalBookings: 0,
      totalCenters: 0, commissionRate: 10, ...data,
    };
    setVendors((vs) => [v, ...vs]);
    return v;
  }

  function updateVendor(id: string, data: Partial<Vendor>) {
    setVendors((vs) => vs.map((v) => v.id === id ? { ...v, ...data } : v));
  }

  function cancelBooking(id: string) {
    setBookings((bs) => bs.map((b) => b.id === id ? { ...b, bookingStatus: "cancelled" } : b));
  }

  function refundBooking(id: string) {
    setBookings((bs) => bs.map((b) => b.id === id ? { ...b, paymentStatus: "refunded", refundStatus: "processed" } : b));
  }

  function blockUser(id: string) { setUsers((us) => us.map((u) => u.id === id ? { ...u, status: "blocked" } : u)); }
  function unblockUser(id: string) { setUsers((us) => us.map((u) => u.id === id ? { ...u, status: "active" } : u)); }

  function markSettlementPaid(id: string) {
    setSettlements((ss) => ss.map((s) => s.id === id ? { ...s, status: "paid", paidAt: new Date().toISOString().slice(0, 10) } : s));
  }

  function createCoupon(data: Omit<Coupon, "id" | "usageCount" | "createdAt">) {
    const c: Coupon = { ...data, id: `cp${Date.now()}`, usageCount: 0, createdAt: new Date().toISOString().slice(0, 10) };
    setCoupons((cs) => [c, ...cs]);
  }

  function disableCoupon(id: string) { setCoupons((cs) => cs.map((c) => c.id === id ? { ...c, active: false } : c)); }

  function closeTicket(id: string) { setTickets((ts) => ts.map((t) => t.id === id ? { ...t, status: "closed" } : t)); }

  function assignTicket(id: string, name: string) { setTickets((ts) => ts.map((t) => t.id === id ? { ...t, status: "in_progress", assignedTo: name } : t)); }

  function approveCenterLive(id: string) { setCenters((cs) => cs.map((c) => c.id === id ? { ...c, status: "live" } : c)); }

  function addCenter(data: Partial<Center>) {
    const c: Center = {
      id: `c${Date.now()}`, vendorId: "", vendorName: "", name: "", businessType: "",
      city: "", area: "", state: "", address: "", status: "pending_approval", services: [],
      totalBookings: 0, totalRevenue: 0, rating: 0, addedAt: new Date().toISOString().slice(0, 10), ...data,
    };
    setCenters((cs) => [c, ...cs]);
  }

  return (
    <AdminContext.Provider value={{
      admin, vendors, centers, bookings, users, settlements, coupons, tickets, activity,
      login, logout, hasPermission, approveVendor, rejectVendor, blockVendor, unblockVendor,
      addVendor, updateVendor, cancelBooking, refundBooking, blockUser, unblockUser,
      markSettlementPaid, createCoupon, disableCoupon, closeTicket, assignTicket,
      approveCenterLive, addCenter,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
