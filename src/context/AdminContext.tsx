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
  notes?: string;
  // "admin_created" vendors were set up directly by admin with a system-
  // generated password (see CreateVendorPayload); "self_signup" went through
  // the normal signup + email verification flow.
  source: "admin_created" | "self_signup";
  // Only meaningful for admin_created vendors — true until they log in and
  // set their own password. Regenerating a password only makes sense while
  // this is still true; once they've set their own, it's their password to
  // manage (via Settings → Security), not admin's to reset.
  mustChangePassword: boolean;
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
  finance_admin: ["dashboard", "revenue", "settlements", "bookings", "commissions"],
  support_admin: ["dashboard", "users", "bookings", "support"],
  sales_admin: ["dashboard", "vendors", "vendor_approvals"],
  content_admin: ["dashboard", "centers", "coupons"],
};

export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin", operations_admin: "Operations", finance_admin: "Finance",
  support_admin: "Support", sales_admin: "Sales", content_admin: "Content",
};

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
    notes: raw.rejection_reason ?? undefined,
    source: raw.source === "admin_created" ? "admin_created" : "self_signup",
    mustChangePassword: !!raw.must_change_password,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeUser(raw: any): AppUser {
  const spendPaise = typeof raw.total_spend_paise === "string" ? parseInt(raw.total_spend_paise, 10) : (raw.total_spend_paise ?? 0);
  return {
    id: raw.id,
    name: raw.full_name ?? "",
    email: raw.email ?? "",
    mobile: raw.phone ?? "",
    totalBookings: raw.total_bookings ?? 0,
    totalSpend: Math.round(spendPaise / 100),
    lastBookingDate: undefined,
    signupDate: raw.created_at?.slice(0, 10) ?? "",
    status: (raw.status === "blocked" ? "blocked" : "active") as UserStatus,
    city: raw.location_label ?? "—",
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

export interface CreateVendorPayload {
  ownerName: string; email: string; phone: string;
  businessName?: string; businessType?: string; city?: string; state?: string;
  centerType?: "single" | "multiple"; gstin?: string;
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AdminContextType {
  admin: AdminUser | null;
  dashboardStats: DashboardStats | null;
  vendors: Vendor[];
  centers: Center[];
  bookings: Booking[];
  users: AppUser[];
  usersLoading: boolean;
  settlements: Settlement[];
  login: (email: string, password: string, otp?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (section: string) => boolean;
  approveVendor: (id: string) => Promise<void>;
  rejectVendor: (id: string, reason: string) => Promise<void>;
  blockVendor: (id: string) => Promise<void>;
  unblockVendor: (id: string) => Promise<void>;
  createVendor: (data: CreateVendorPayload) => Promise<{ success: boolean; email?: string; password?: string; error?: string }>;
  regenerateVendorPassword: (id: string) => Promise<{ success: boolean; password?: string; error?: string }>;
  updateVendor: (id: string, data: Partial<Vendor>) => void;
  cancelBooking: (id: string) => void;
  refundBooking: (id: string) => void;
  blockUser: (id: string) => void;
  unblockUser: (id: string) => void;
  markSettlementPaid: (id: string) => void;
  approveCenterLive: (id: string) => Promise<void>;
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
  const [users, setUsers] = useState<AppUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [settlements, setSettlements] = useState<Settlement[]>([]);

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

    setUsersLoading(true);
    apiGet<{ users: unknown[] }>("/admin/users?limit=100", token)
      .then(r => setUsers((r.users ?? []).map(normalizeUser)))
      .catch(console.error)
      .finally(() => setUsersLoading(false));
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
    setUsers([]);
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
    if (token) await apiPost(`/admin/vendors/${id}/approve`, {}, token);
    setVendors(vs => vs.map(v => v.id === id ? { ...v, status: "approved" as VendorStatus, approvedAt: new Date().toISOString().slice(0, 10) } : v));
  }

  async function rejectVendor(id: string, reason?: string) {
    if (!reason?.trim()) throw new Error("A rejection reason is required.");
    const token = getAdminToken();
    if (token) await apiPost(`/admin/vendors/${id}/reject`, { reason }, token);
    setVendors(vs => vs.map(v => v.id === id ? { ...v, status: "rejected" as VendorStatus, notes: reason } : v));
  }

  async function blockVendor(id: string) {
    const token = getAdminToken();
    if (token) await apiPost(`/admin/vendors/${id}/block`, {}, token);
    setVendors(vs => vs.map(v => v.id === id ? { ...v, status: "blocked" as VendorStatus } : v));
  }

  async function unblockVendor(id: string) {
    const token = getAdminToken();
    if (token) await apiPost(`/admin/vendors/${id}/unblock`, {}, token);
    setVendors(vs => vs.map(v => v.id === id ? { ...v, status: "approved" as VendorStatus } : v));
  }

  async function createVendor(data: CreateVendorPayload) {
    const token = getAdminToken();
    if (!token) return { success: false, error: "Not signed in" };
    try {
      const res = await apiPost<{ vendorId: string; email: string; password: string }>(
        "/admin/vendors", data, token,
      );
      const r = await apiGet<{ vendors: unknown[] }>("/admin/vendors?limit=100", token);
      setVendors((r.vendors ?? []).map(normalizeVendor));
      return { success: true, email: res.email, password: res.password };
    } catch (err) {
      return { success: false, error: (err as Error).message ?? "Failed to create vendor" };
    }
  }

  async function regenerateVendorPassword(id: string) {
    const token = getAdminToken();
    if (!token) return { success: false, error: "Not signed in" };
    try {
      const res = await apiPost<{ password: string }>(
        `/admin/vendors/${id}/regenerate-password`, {}, token,
      );
      setVendors(vs => vs.map(v => v.id === id ? { ...v, mustChangePassword: true } : v));
      return { success: true, password: res.password };
    } catch (err) {
      return { success: false, error: (err as Error).message ?? "Failed to regenerate password" };
    }
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

  async function blockUser(id: string) {
    const token = getAdminToken();
    if (token) await apiPost(`/admin/users/${id}/block`, {}, token);
    setUsers(us => us.map(u => u.id === id ? { ...u, status: "blocked" as UserStatus } : u));
  }

  async function unblockUser(id: string) {
    const token = getAdminToken();
    if (token) await apiPost(`/admin/users/${id}/unblock`, {}, token);
    setUsers(us => us.map(u => u.id === id ? { ...u, status: "active" as UserStatus } : u));
  }

  async function markSettlementPaid(id: string) {
    const token = getAdminToken();
    if (token) await apiPost(`/admin/settlements/${id}/approve`, {}, token).catch(console.error);
    setSettlements(ss => ss.map(s => s.id === id ? { ...s, status: "paid" as SettlementStatus, paidAt: new Date().toISOString().slice(0, 10) } : s));
  }

  async function approveCenterLive(id: string) {
    const token = getAdminToken();
    if (token) await apiPost(`/admin/centers/${id}/approve`, {}, token);
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
      admin, dashboardStats, vendors, centers, bookings, users, usersLoading, settlements,
      login, logout, hasPermission, approveVendor, rejectVendor, blockVendor, unblockVendor,
      createVendor, regenerateVendorPassword, updateVendor, cancelBooking, refundBooking, blockUser, unblockUser,
      markSettlementPaid, approveCenterLive, addCenter,
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
