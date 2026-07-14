import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { apiGet, apiPost, getAdminToken } from "../lib/api";

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

export interface DashboardStats {
  totalUsers: number; totalVendors: number; totalCenters: number;
  todayBookings: number; monthlyBookings: number;
  pendingKyc: number; pendingSettlements: number; totalRevenue: number;
}

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

// ─── Static chart data (no backend aggregate endpoint yet) ───────────────────

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

// ─── Mock data for sections without backend endpoints ─────────────────────────

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

// ─── Data normalization ───────────────────────────────────────────────────────

function normalizeVendorStatus(s: string): VendorStatus {
  if (s === "suspended") return "blocked";
  if (s === "kyc_submitted") return "under_review";
  const valid: VendorStatus[] = ["approved", "pending", "under_review", "rejected", "blocked", "draft"];
  return valid.includes(s as VendorStatus) ? (s as VendorStatus) : "pending";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeVendor(raw: any): Vendor {
  return {
    id: raw.id,
    businessName: raw.business_name ?? "",
    ownerName: raw.owner_name ?? "",
    email: raw.email ?? "",
    businessEmail: raw.email ?? "",
    mobile: raw.phone ?? "",
    businessType: raw.business_type ?? "",
    city: raw.city ?? "",
    state: raw.state ?? "",
    gstin: raw.gstin ?? "",
    centerType: "single",
    status: normalizeVendorStatus(raw.status ?? "pending"),
    kycStatus: (raw.kyc_status ?? "not_submitted") as KycStatus,
    bankStatus: "not_submitted",
    joinedAt: raw.created_at?.slice(0, 10) ?? "",
    approvedAt: raw.approved_at?.slice(0, 10),
    totalRevenue: 0,
    totalBookings: 0,
    totalCenters: 0,
    commissionRate: 10,
    notes: raw.rejection_reason ?? undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeBooking(raw: any): Booking {
  const paise = typeof raw.total_paise === "string" ? parseInt(raw.total_paise, 10) : (raw.total_paise ?? 0);
  const commPaise = typeof raw.commission_amount === "string" ? parseInt(raw.commission_amount, 10) : (raw.commission_amount ?? 0);
  return {
    id: raw.id,
    customerId: raw.user_id ?? "",
    customerName: raw.users?.full_name ?? "",
    customerMobile: raw.users?.phone ?? "",
    customerEmail: "",
    vendorId: "",
    vendorName: raw.centers?.vendors?.business_name ?? "",
    centerId: raw.center_id ?? "",
    centerName: raw.centers?.center_name ?? "",
    city: "",
    product: (raw.product_type ?? "Day Pass") as ProductType,
    date: raw.created_at?.slice(0, 10) ?? "",
    time: raw.created_at?.slice(11, 16) ?? "",
    amount: paise ? Math.round(paise / 100) : 0,
    commission: commPaise ? Math.round(commPaise / 100) : 0,
    paymentStatus: (raw.payment_status ?? "pending") as PaymentStatus,
    bookingStatus: (raw.status ?? "pending") as BookingStatus,
    checkinOtp: raw.otp ?? "",
    invoiceGenerated: false,
    refundStatus: null,
    createdAt: raw.created_at ?? "",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeSettlement(raw: any): Settlement {
  const toRupees = (v: unknown) => {
    if (typeof v === "string") return Math.round(parseInt(v, 10) / 100);
    if (typeof v === "number") return Math.round(v / 100);
    return 0;
  };
  const period = raw.period ?? (raw.period_start ? String(raw.period_start).slice(0, 7) : "");
  return {
    id: raw.id,
    vendorId: raw.vendor_id ?? "",
    vendorName: raw.vendors?.business_name ?? "",
    period,
    grossAmount: toRupees(raw.gross_amount_paise),
    commission: toRupees(raw.commission_paise),
    gst: 0,
    tds: 0,
    netPayable: toRupees(raw.net_amount_paise),
    status: (raw.status ?? "pending") as SettlementStatus,
    bankAccount: "",
    ifsc: "",
    generatedAt: raw.created_at?.slice(0, 10) ?? "",
    paidAt: raw.paid_at?.slice(0, 10),
    bookingsCount: 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeCenter(raw: any): Center {
  const approvalStatus = raw.approval_status ?? "";
  const status: CenterStatus =
    approvalStatus === "approved" ? "live" :
    approvalStatus === "rejected" ? "rejected" :
    approvalStatus === "pending" ? "pending_approval" : "inactive";
  return {
    id: raw.id,
    vendorId: raw.vendor_id ?? "",
    vendorName: raw.vendors?.business_name ?? "",
    name: raw.center_name ?? "",
    businessType: raw.categories?.name ?? "",
    city: raw.city ?? "",
    area: raw.area ?? "",
    state: raw.state ?? "",
    address: raw.address ?? "",
    status,
    services: [],
    totalBookings: 0,
    totalRevenue: 0,
    rating: 0,
    addedAt: raw.created_at?.slice(0, 10) ?? "",
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AdminContextType {
  admin: AdminUser | null;
  dashboardStats: DashboardStats | null;
  vendors: Vendor[];
  centers: Center[];
  bookings: Booking[];
  users: AppUser[];
  settlements: Settlement[];
  coupons: Coupon[];
  tickets: SupportTicket[];
  activity: ActivityLog[];
  login: (email: string, password: string, otp?: string) => Promise<{ success: boolean; error?: string }>;
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
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    try {
      const stored = sessionStorage.getItem("bokko_admin");
      return stored ? (JSON.parse(stored) as AdminUser) : null;
    } catch {
      return null;
    }
  });
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<AppUser[]>(INIT_USERS);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>(INIT_COUPONS);
  const [tickets, setTickets] = useState<SupportTicket[]>(INIT_TICKETS);
  const [activity] = useState<ActivityLog[]>(INIT_ACTIVITY);

  const ROLE_MAP: Record<string, AdminRole> = {
    SUPER_ADMIN: "super_admin",
    VENDOR_APPROVAL_TEAM: "operations_admin",
    FINANCE_TEAM: "finance_admin",
    SUPPORT_TEAM: "support_admin",
    OPERATIONS_TEAM: "operations_admin",
    CONTENT_MANAGER: "content_admin",
    CITY_MANAGER: "content_admin",
  };

  // Fetch all admin data after login
  useEffect(() => {
    if (!admin) return;
    const token = getAdminToken();
    if (!token) return;

    apiGet<DashboardStats>("/admin/dashboard", token)
      .then(setDashboardStats)
      .catch(console.error);

    apiGet<{ vendors: unknown[] }>("/admin/vendors?limit=100", token)
      .then(r => setVendors((r.vendors ?? []).map(normalizeVendor)))
      .catch(console.error);

    apiGet<unknown[]>("/admin/centers/pending", token)
      .then(r => setCenters(Array.isArray(r) ? r.map(normalizeCenter) : []))
      .catch(console.error);

    apiGet<{ bookings: unknown[] }>("/admin/bookings?limit=50", token)
      .then(r => setBookings((r.bookings ?? []).map(normalizeBooking)))
      .catch(console.error);

    apiGet<unknown[]>("/admin/settlements", token)
      .then(r => setSettlements(Array.isArray(r) ? r.map(normalizeSettlement) : []))
      .catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin?.id]);

  async function login(email: string, password: string, _otp?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const data = await apiPost<{
        admin: { id: string; name: string; email: string; role: string };
        accessToken: string;
        refreshToken: string;
      }>("/auth/admin/login", { email, password });

      const adminUser: AdminUser = {
        id: data.admin.id,
        name: data.admin.name,
        email: data.admin.email,
        role: ROLE_MAP[data.admin.role] ?? "support_admin",
        joinedAt: new Date().toISOString().slice(0, 10),
      };

      setAdmin(adminUser);
      sessionStorage.setItem("bokko_admin", JSON.stringify(adminUser));
      sessionStorage.setItem("bokko_admin_token", data.accessToken);
      sessionStorage.setItem("bokko_admin_refresh", data.refreshToken);
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message ?? "Login failed" };
    }
  }

  function logout() {
    setAdmin(null);
    setDashboardStats(null);
    setVendors([]);
    setCenters([]);
    setBookings([]);
    setSettlements([]);
    sessionStorage.removeItem("bokko_admin");
    sessionStorage.removeItem("bokko_admin_token");
    sessionStorage.removeItem("bokko_admin_refresh");
  }

  function hasPermission(section: string) {
    if (!admin) return false;
    const perms = ROLE_PERMISSIONS[admin.role];
    return perms.includes("*") || perms.includes(section);
  }

  async function approveVendor(id: string) {
    const token = getAdminToken();
    if (token) await apiPost(`/admin/vendors/${id}/approve`, {}, token).catch(console.error);
    setVendors(vs => vs.map(v => v.id === id ? { ...v, status: "approved" as VendorStatus, approvedAt: new Date().toISOString().slice(0, 10) } : v));
  }

  async function rejectVendor(id: string, reason?: string) {
    const token = getAdminToken();
    if (token && reason) await apiPost(`/admin/vendors/${id}/reject`, { reason }, token).catch(console.error);
    setVendors(vs => vs.map(v => v.id === id ? { ...v, status: "rejected" as VendorStatus, notes: reason ?? v.notes } : v));
  }

  async function blockVendor(id: string) {
    const token = getAdminToken();
    if (token) await apiPost(`/admin/vendors/${id}/block`, {}, token).catch(console.error);
    setVendors(vs => vs.map(v => v.id === id ? { ...v, status: "blocked" as VendorStatus } : v));
  }

  async function unblockVendor(id: string) {
    const token = getAdminToken();
    if (token) await apiPost(`/admin/vendors/${id}/unblock`, {}, token).catch(console.error);
    setVendors(vs => vs.map(v => v.id === id ? { ...v, status: "approved" as VendorStatus } : v));
  }

  function addVendor(data: Partial<Vendor>): Vendor {
    const v: Vendor = {
      id: `v${Date.now()}`, businessName: "", ownerName: "", email: "", businessEmail: "",
      mobile: "", businessType: "", city: "", state: "", gstin: "",
      centerType: "single", status: "draft", kycStatus: "not_submitted", bankStatus: "not_submitted",
      joinedAt: new Date().toISOString().slice(0, 10), totalRevenue: 0, totalBookings: 0,
      totalCenters: 0, commissionRate: 10, ...data,
    };
    setVendors(vs => [v, ...vs]);
    return v;
  }

  function updateVendor(id: string, data: Partial<Vendor>) {
    setVendors(vs => vs.map(v => v.id === id ? { ...v, ...data } : v));
  }

  function cancelBooking(id: string) {
    setBookings(bs => bs.map(b => b.id === id ? { ...b, bookingStatus: "cancelled" as BookingStatus } : b));
  }

  function refundBooking(id: string) {
    setBookings(bs => bs.map(b => b.id === id ? { ...b, paymentStatus: "refunded" as PaymentStatus, refundStatus: "processed" } : b));
  }

  function blockUser(id: string) { setUsers(us => us.map(u => u.id === id ? { ...u, status: "blocked" as UserStatus } : u)); }
  function unblockUser(id: string) { setUsers(us => us.map(u => u.id === id ? { ...u, status: "active" as UserStatus } : u)); }

  async function markSettlementPaid(id: string) {
    const token = getAdminToken();
    if (token) await apiPost(`/admin/settlements/${id}/approve`, {}, token).catch(console.error);
    setSettlements(ss => ss.map(s => s.id === id ? { ...s, status: "paid" as SettlementStatus, paidAt: new Date().toISOString().slice(0, 10) } : s));
  }

  function createCoupon(data: Omit<Coupon, "id" | "usageCount" | "createdAt">) {
    const c: Coupon = { ...data, id: `cp${Date.now()}`, usageCount: 0, createdAt: new Date().toISOString().slice(0, 10) };
    setCoupons(cs => [c, ...cs]);
  }

  function disableCoupon(id: string) { setCoupons(cs => cs.map(c => c.id === id ? { ...c, active: false } : c)); }

  function closeTicket(id: string) { setTickets(ts => ts.map(t => t.id === id ? { ...t, status: "closed" as TicketStatus } : t)); }

  function assignTicket(id: string, name: string) { setTickets(ts => ts.map(t => t.id === id ? { ...t, status: "in_progress" as TicketStatus, assignedTo: name } : t)); }

  async function approveCenterLive(id: string) {
    const token = getAdminToken();
    if (token) await apiPost(`/admin/centers/${id}/approve`, {}, token).catch(console.error);
    setCenters(cs => cs.map(c => c.id === id ? { ...c, status: "live" as CenterStatus } : c));
  }

  function addCenter(data: Partial<Center>) {
    const c: Center = {
      id: `c${Date.now()}`, vendorId: "", vendorName: "", name: "", businessType: "",
      city: "", area: "", state: "", address: "", status: "pending_approval", services: [],
      totalBookings: 0, totalRevenue: 0, rating: 0, addedAt: new Date().toISOString().slice(0, 10), ...data,
    };
    setCenters(cs => [c, ...cs]);
  }

  return (
    <AdminContext.Provider value={{
      admin, dashboardStats, vendors, centers, bookings, users, settlements, coupons, tickets, activity,
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
