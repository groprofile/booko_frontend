import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

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
const PWD_PREFIX = "bokko_partner_pwd_";

function makeId() {
  return `partner_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

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
  signup: (data: SignupData, password: string) => { success: boolean; error?: string };
  signin: (email: string, password: string) => { success: boolean; error?: string; status?: PartnerStatus };
  signout: () => void;
  updatePartner: (updates: Partial<PartnerDraft>) => void;
  verifyEmail: () => void;
  markStepComplete: (step: number) => void;
  submitForReview: () => void;
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

  function signup(data: SignupData, password: string) {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
      try {
        const p = JSON.parse(existing) as PartnerDraft;
        if (p.email === data.email)
          return { success: false, error: "An account with this email already exists." };
      } catch { /* ignore */ }
    }
    const id = makeId();
    const newPartner: PartnerDraft = {
      id,
      ...data,
      status: "email_unverified",
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
        registeredAddress: "",
        pincode: "",
        website: "",
        instagram: "",
        linkedin: "",
      },
      centers: [],
      kyc: defaultKycDocs(),
      gstBank: {},
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(`${PWD_PREFIX}${id}`, password);
    setPartner(newPartner);
    return { success: true };
  }

  function signin(email: string, password: string) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { success: false, error: "No account found. Please sign up first." };
      const p = JSON.parse(raw) as PartnerDraft;
      if (p.email !== email && p.businessEmail !== email)
        return { success: false, error: "Incorrect email or password." };
      const stored = localStorage.getItem(`${PWD_PREFIX}${p.id}`);
      if (stored !== password) return { success: false, error: "Incorrect email or password." };
      setPartner(p);
      return { success: true, status: p.status };
    } catch {
      return { success: false, error: "Something went wrong. Please try again." };
    }
  }

  function signout() { setPartner(null); }

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

  return (
    <PartnerContext.Provider value={{ partner, isAuthenticated: !!partner, signup, signin, signout, updatePartner, verifyEmail, markStepComplete, submitForReview }}>
      {children}
    </PartnerContext.Provider>
  );
}

export function usePartner() {
  const ctx = useContext(PartnerContext);
  if (!ctx) throw new Error("usePartner must be used within PartnerProvider");
  return ctx;
}
