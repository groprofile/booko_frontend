import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { apiPost, apiGet, ApiError } from "../lib/api";

export type PartnerStatus =
  | "email_unverified"
  | "onboarding_started"
  | "documents_pending"
  | "submitted_for_review"
  | "under_review"
  | "approved"
  | "rejected";

export interface CenterData {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  locality: string;
  landmark: string;
  googleMapUrl: string;
  contactPerson: string;
  phone: string;
  services: string[];
  amenities: string[];
  photoNames: string[];
}

export interface BusinessDetails {
  businessName: string;
  businessType: string;
  businessEmail: string;
  registeredAddress: string;
  city: string;
  state: string;
  pincode: string;
  contactPerson: string;
  mobile: string;
  website: string;
  instagram: string;
  linkedin: string;
}

export interface KycDocumentRecord {
  docType: string;
  label: string;
  fileName: string;
  fileKey?: string;
  status: "pending" | "uploaded" | "verified" | "rejected";
  required: boolean;
}

export interface GstBankDetails {
  gstin: string;
  legalBusinessName: string;
  gstAddress: string;
  gstState: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  branch: string;
  cancelledChequeName: string;
}

export interface PartnerDraft {
  id: string;
  name: string;
  email: string;
  mobile: string;
  businessEmail: string;
  businessName: string;
  city: string;
  state: string;
  businessType: string;
  centerType: "single" | "multiple";
  status: PartnerStatus;
  emailVerified: boolean;
  completedSteps: number[];
  business: Partial<BusinessDetails>;
  centers: CenterData[];
  kyc: KycDocumentRecord[];
  gstBank: Partial<GstBankDetails>;
  createdAt: string;
}

export const ONBOARDING_STEPS = [
  { num: 1, label: "Business Details", path: "business" },
  { num: 2, label: "Center Setup", path: "centers" },
  { num: 3, label: "KYC Documents", path: "kyc" },
  { num: 4, label: "GST & Bank Details", path: "bank" },
  { num: 5, label: "Review & Submit", path: "review" },
];

const STORAGE_KEY = "bokko_partner_v1";
const TOKEN_KEY = "bokko_vendor_token";
const REFRESH_KEY = "bokko_vendor_refresh";

// Maps the backend vendor.status to the frontend PartnerStatus.
const STATUS_MAP: Record<string, PartnerStatus> = {
  pending:        'onboarding_started',
  kyc_submitted:  'submitted_for_review',
  under_review:   'under_review',
  approved:       'approved',
  rejected:       'rejected',
};

export function defaultKycDocs(): KycDocumentRecord[] {
  return [
    { docType: "company_pan", label: "Company PAN", fileName: "", status: "pending", required: true },
    { docType: "owner_aadhaar", label: "Owner / Director Aadhaar", fileName: "", status: "pending", required: true },
    { docType: "shop_establishment", label: "Shop Establishment Certificate", fileName: "", status: "pending", required: true },
    { docType: "gst_certificate", label: "GST Certificate", fileName: "", status: "pending", required: true },
    { docType: "business_registration", label: "Business Registration Certificate", fileName: "", status: "pending", required: true },
    { docType: "address_proof", label: "Address Proof", fileName: "", status: "pending", required: true },
    { docType: "cancelled_cheque", label: "Cancelled Cheque", fileName: "", status: "pending", required: true },
    { docType: "fssai", label: "FSSAI Certificate (Food Service)", fileName: "", status: "pending", required: false },
    { docType: "trade_license", label: "Trade License", fileName: "", status: "pending", required: false },
    { docType: "fire_noc", label: "Fire NOC", fileName: "", status: "pending", required: false },
    { docType: "hotel_license", label: "Hotel License", fileName: "", status: "pending", required: false },
  ];
}

interface SignupData {
  name: string;
  email: string;
  mobile: string;
  businessEmail: string;
  businessName: string;
  city: string;
  state: string;
  businessType: string;
  centerType: "single" | "multiple";
}

interface PartnerCtx {
  partner: PartnerDraft | null;
  isAuthenticated: boolean;
  signup: (data: SignupData, password: string) => Promise<{ success: boolean; error?: string }>;
  signin: (email: string, password: string) => Promise<{ success: boolean; error?: string; status?: PartnerStatus; centerType?: "single" | "multiple" }>;
  signout: () => void;
  updatePartner: (updates: Partial<PartnerDraft>) => void;
  verifyEmail: () => void;
  markStepComplete: (step: number) => void;
  submitForReview: () => void;
  refreshStatus: () => Promise<PartnerStatus | null>;
}

const PartnerContext = createContext<PartnerCtx | null>(null);

export function PartnerProvider({ children }: { children: ReactNode }) {
  const [partner, setPartner] = useState<PartnerDraft | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as PartnerDraft) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (partner) localStorage.setItem(STORAGE_KEY, JSON.stringify(partner));
  }, [partner]);

  async function signup(data: SignupData, password: string) {
    try {
      await apiPost<{ message: string; vendorId: string }>('/auth/vendor/signup', {
        businessName: data.businessName,
        ownerName: data.name,
        email: data.businessEmail,
        phone: data.mobile,
        password,
        category: data.businessType,
        centerType: data.centerType,
      });

      const draft: PartnerDraft = {
        id: '',
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        businessEmail: data.businessEmail,
        businessName: data.businessName,
        city: data.city,
        state: data.state,
        businessType: data.businessType,
        centerType: data.centerType,
        status: 'email_unverified',
        emailVerified: false,
        completedSteps: [],
        business: {
          businessName: data.businessName,
          businessType: data.businessType,
          businessEmail: data.businessEmail,
          city: data.city,
          state: data.state,
          contactPerson: data.name,
          mobile: data.mobile,
          registeredAddress: '',
          pincode: '',
          website: '',
          instagram: '',
          linkedin: '',
        },
        centers: [],
        kyc: defaultKycDocs(),
        gstBank: {},
        createdAt: new Date().toISOString(),
      };
      setPartner(draft);
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message ?? 'Signup failed' };
    }
  }

  async function signin(email: string, password: string) {
    try {
      const data = await apiPost<{
        vendor: { id: string; ownerName: string; businessName: string; status: string; dashboardLocked: boolean; centerType: "single" | "multiple" };
        accessToken: string;
        refreshToken: string;
      }>('/auth/vendor/login', { email, password });

      const status: PartnerStatus = STATUS_MAP[data.vendor.status] ?? 'onboarding_started';

      const centerType = data.vendor.centerType ?? 'single';

      const draft: PartnerDraft = {
        id: data.vendor.id,
        name: data.vendor.ownerName,
        email,
        mobile: '',
        businessEmail: email,
        businessName: data.vendor.businessName,
        city: '',
        state: '',
        businessType: '',
        centerType,
        status,
        emailVerified: true,
        completedSteps: [],
        business: { businessName: data.vendor.businessName, contactPerson: data.vendor.ownerName },
        centers: [],
        kyc: defaultKycDocs(),
        gstBank: {},
        createdAt: new Date().toISOString(),
      };

      setPartner(draft);
      sessionStorage.setItem(TOKEN_KEY, data.accessToken);
      sessionStorage.setItem(REFRESH_KEY, data.refreshToken);
      return { success: true, status, centerType };
    } catch (err) {
      if (err instanceof ApiError && err.code === 'EMAIL_NOT_VERIFIED') {
        return { success: true as const, status: 'email_unverified' as PartnerStatus };
      }
      return { success: false, error: (err as Error).message ?? 'Sign in failed' };
    }
  }

  function signout() {
    setPartner(null);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
  }

  function updatePartner(updates: Partial<PartnerDraft>) {
    setPartner((prev) => (prev ? { ...prev, ...updates } : prev));
  }

  function verifyEmail() {
    setPartner((prev) => prev ? { ...prev, emailVerified: true, status: "onboarding_started" } : prev);
  }

  function markStepComplete(step: number) {
    setPartner((prev) => {
      if (!prev) return prev;
      const steps = Array.from(new Set([...prev.completedSteps, step]));
      return { ...prev, completedSteps: steps };
    });
  }

  function submitForReview() {
    setPartner((prev) => prev ? { ...prev, status: "submitted_for_review" } : prev);
  }

  // Re-fetch the vendor's live status from the backend and sync it into state.
  // Returns the resolved PartnerStatus, or null if there's no active session.
  async function refreshStatus(): Promise<PartnerStatus | null> {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      const vendor = await apiGet<{
        status: string;
        business_name?: string;
        owner_name?: string;
      }>('/vendor/profile', token);
      const status: PartnerStatus = STATUS_MAP[vendor.status] ?? 'onboarding_started';
      setPartner((prev) =>
        prev
          ? {
              ...prev,
              status,
              businessName: vendor.business_name ?? prev.businessName,
              name: vendor.owner_name ?? prev.name,
            }
          : prev,
      );
      return status;
    } catch (err) {
      // If the session is no longer valid (e.g. vendor deleted/blocked), drop it
      // so the UI doesn't keep showing a stale "approved" state.
      if (err instanceof ApiError && (err.status === 401 || err.status === 404)) {
        signout();
      }
      return null;
    }
  }

  // On load (and whenever the tab regains focus), sync the live status so an
  // admin approval/rejection reflects without forcing the vendor to re-login.
  useEffect(() => {
    refreshStatus();
    const onFocus = () => refreshStatus();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PartnerContext.Provider value={{ partner, isAuthenticated: !!partner, signup, signin, signout, updatePartner, verifyEmail, markStepComplete, submitForReview, refreshStatus }}>
      {children}
    </PartnerContext.Provider>
  );
}

export function usePartner() {
  const ctx = useContext(PartnerContext);
  if (!ctx) throw new Error("usePartner must be used within PartnerProvider");
  return ctx;
}
