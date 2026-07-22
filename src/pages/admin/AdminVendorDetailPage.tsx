import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import {
  ArrowLeft, Building2, MapPin, Phone, Mail, CreditCard,
  CheckCircle, XCircle, ShieldOff, Shield, FileText,
  Eye, Loader2, X, ChevronLeft, ChevronRight, Users, KeyRound, Upload, Trash2,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import StatusBadge from "../../components/admin/StatusBadge";
import GeneratedCredentialsModal from "../../components/admin/GeneratedCredentialsModal";
import RejectReasonModal from "../../components/admin/RejectReasonModal";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import { showToast } from "../../components/admin/Toast";
import { useAdmin } from "../../context/AdminContext";
import { apiGet, apiPost, apiPatch, apiPut, apiDelete, apiUploadFile, getAdminToken, ApiError } from "../../lib/api";

const fmt = (n: number) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;

// Approve/Reject are only meaningful while a vendor is still under review.
const isAwaitingApproval = (s: string) => s === "pending" || s === "under_review" || s === "draft";

const DOC_TYPE_LABELS: Record<string, string> = {
  company_pan: "Company PAN",
  owner_aadhaar: "Aadhaar",
  gst_certificate: "GST Certificate",
  shop_establishment: "Shop Establishment",
  business_registration: "Business Registration",
  cancelled_cheque: "Cancelled Cheque",
  address_proof: "Address Proof",
  fssai: "FSSAI License",
  trade_license: "Trade License",
  fire_noc: "Fire NOC",
  hotel_license: "Hotel License",
};

const MANDATORY_DOC_TYPES = [
  "company_pan",
  "owner_aadhaar",
  "gst_certificate",
  "shop_establishment",
  "business_registration",
  "cancelled_cheque",
  "address_proof",
];

interface VendorDocument {
  doc_type: string;
  file_key: string;
  status: string;
}

interface CenterManager {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  center_name: string | null;
  created_at: string;
}

interface RealCenter {
  id: string;
  center_name: string;
  approval_status: string;
  is_active: boolean;
  city: string | null;
  locality: string | null;
  address: string | null;
  commission_percent: string | number | null;
  categories?: { name?: string };
}

interface BankDetail {
  account_holder_name?: string;
  account_number?: string;
  ifsc_code?: string;
  bank_name?: string;
  verification_status?: string;
}

interface RawVendorBooking {
  id: string;
  product_type?: string;
  total_paise?: number | string;
  payment_status?: string;
  created_at?: string;
  users?: { full_name?: string };
  centers?: { center_name?: string };
}

interface VendorBooking {
  id: string;
  customerName: string;
  product: string;
  centerName: string;
  date: string;
  amount: number;
  paymentStatus: string;
}

function normalizeVendorBooking(raw: RawVendorBooking): VendorBooking {
  const paise = typeof raw.total_paise === "string" ? parseInt(raw.total_paise, 10) : (raw.total_paise ?? 0);
  return {
    id: raw.id,
    customerName: raw.users?.full_name ?? "Guest",
    product: raw.product_type ?? "",
    centerName: raw.centers?.center_name ?? "",
    date: raw.created_at?.slice(0, 10) ?? "",
    amount: paise ? Math.round(paise / 100) : 0,
    paymentStatus: raw.payment_status ?? "pending",
  };
}

interface ViewerState {
  label: string;
  url: string;
  isPdf: boolean;
  index: number;         // index in the viewable docs list
}

// ── Document Viewer Modal ──────────────────────────────────────────────────────
function DocViewer({
  viewer,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  viewer: ViewerState;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  // Close on Escape, navigate with arrow keys
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && viewer.index > 0) onPrev();
      if (e.key === "ArrowRight" && viewer.index < total - 1) onNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onPrev, onNext, viewer.index, total]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Header bar */}
      <div
        className="flex shrink-0 items-center justify-between px-5 py-3 bg-[#0F172A]/90"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <FileText size={15} className="text-[#94A3B8]" />
          <span className="text-sm font-semibold text-white">{viewer.label}</span>
          <span className="text-xs text-[#64748B]">{viewer.index + 1} / {total}</span>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-white/10 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content area */}
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prev arrow */}
        {viewer.index > 0 && (
          <button
            onClick={onPrev}
            className="absolute left-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* Document display */}
        <div className="flex h-full w-full max-w-5xl items-center justify-center p-4">
          {viewer.isPdf ? (
            <iframe
              src={viewer.url}
              title={viewer.label}
              className="h-full w-full rounded-xl border-0 bg-white"
              style={{ minHeight: "70vh" }}
            />
          ) : (
            <img
              src={viewer.url}
              alt={viewer.label}
              className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
              style={{ maxHeight: "calc(100vh - 120px)" }}
            />
          )}
        </div>

        {/* Next arrow */}
        {viewer.index < total - 1 && (
          <button
            onClick={onNext}
            className="absolute right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      {/* Bottom hint */}
      <div className="shrink-0 py-2 text-center text-[11px] text-[#475569]">
        Press Esc to close · Arrow keys to navigate
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AdminVendorDetailPage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const { vendors, approveVendor, rejectVendor, blockVendor, unblockVendor, regenerateVendorPassword } = useAdmin();
  const [regenerating, setRegenerating] = useState(false);
  // `credentials` drives the persistent Login Info panel — once set, it stays
  // visible for the rest of this page visit (never re-fetched: the backend
  // never returns a plaintext password after initial creation, by design).
  // `credsModalOpen` only controls the transient confirmation popup on top of it.
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [credsModalOpen, setCredsModalOpen] = useState(false);

  const [vendorDocs, setVendorDocs] = useState<VendorDocument[]>([]);
  const [staff, setStaff] = useState<CenterManager[]>([]);
  const [realCenters, setRealCenters] = useState<RealCenter[]>([]);
  const [bank, setBank] = useState<BankDetail | null>(null);
  const [loadingViewKey, setLoadingViewKey] = useState<string | null>(null);
  const [viewer, setViewer] = useState<ViewerState | null>(null);
  const [viewError, setViewError] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectCenterTarget, setRejectCenterTarget] = useState<string | null>(null);
  const [centerActionId, setCenterActionId] = useState<string | null>(null);
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [deleteDocTarget, setDeleteDocTarget] = useState<{ docType: string; label: string } | null>(null);
  const [bankActionLoading, setBankActionLoading] = useState<"verified" | "rejected" | null>(null);
  const [bankFormOpen, setBankFormOpen] = useState(false);
  const [bankForm, setBankForm] = useState({ accountHolder: "", accountNumber: "", ifscCode: "", bankName: "" });
  const [savingBank, setSavingBank] = useState(false);
  const [bankFormError, setBankFormError] = useState("");

  const vendor = vendors.find((v) => v.id === vendorId);

  const loadDocuments = useCallback(() => {
    if (!vendorId) return;
    const token = getAdminToken();
    if (!token) return;
    apiGet<VendorDocument[]>(`/admin/vendors/${vendorId}/documents`, token)
      .then(setVendorDocs)
      .catch(() => {});
  }, [vendorId]);

  useEffect(() => { loadDocuments(); }, [loadDocuments]);

  const [vendorBookings, setVendorBookings] = useState<VendorBooking[]>([]);
  const [vendorBookingsTotal, setVendorBookingsTotal] = useState(0);
  const [vendorPaidRevenue, setVendorPaidRevenue] = useState(0);

  useEffect(() => {
    if (!vendorId) return;
    const token = getAdminToken();
    if (!token) return;
    apiGet<{ bookings: RawVendorBooking[]; total: number; paidTotalRupees: number }>(`/admin/vendors/${vendorId}/bookings`, token)
      .then((res) => {
        setVendorBookings((res.bookings ?? []).map(normalizeVendorBooking));
        setVendorBookingsTotal(res.total ?? 0);
        setVendorPaidRevenue(res.paidTotalRupees ?? 0);
      })
      .catch(() => { setVendorBookings([]); setVendorBookingsTotal(0); setVendorPaidRevenue(0); });
  }, [vendorId]);

  // Admin uploading/replacing a document on the vendor's behalf — e.g. when
  // the vendor can't upload it themselves. Same file-type/size rules as the
  // vendor's own upload (backend validates PDF/JPEG/PNG, max 5MB).
  async function handleUploadDoc(docType: string, file: File) {
    if (!vendorId) return;
    const token = getAdminToken();
    if (!token) return;
    setUploadingDocType(docType);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("docType", docType);
      await apiUploadFile(`/admin/vendors/${vendorId}/kyc/upload`, formData, token);
      loadDocuments();
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : "Failed to upload document");
    } finally {
      setUploadingDocType(null);
    }
  }

  async function handleDeleteDoc() {
    if (!vendorId || !deleteDocTarget) return;
    const token = getAdminToken();
    if (!token) return;
    try {
      await apiDelete(`/admin/vendors/${vendorId}/documents/${deleteDocTarget.docType}`, token);
      setDeleteDocTarget(null);
      loadDocuments();
      showToast("Document removed", "success");
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : "Failed to remove document");
      setDeleteDocTarget(null);
    }
  }

  function openBankForm() {
    setBankForm({
      accountHolder: bank?.account_holder_name ?? "",
      accountNumber: bank?.account_number ?? "",
      ifscCode: bank?.ifsc_code ?? "",
      bankName: bank?.bank_name ?? "",
    });
    setBankFormError("");
    setBankFormOpen(true);
  }

  async function handleSaveBank() {
    if (!vendorId) return;
    const token = getAdminToken();
    if (!token) return;
    const { accountHolder, accountNumber, ifscCode, bankName } = bankForm;
    if (!accountHolder.trim() || !accountNumber.trim() || !ifscCode.trim() || !bankName.trim()) {
      setBankFormError("All fields are required.");
      return;
    }
    setSavingBank(true);
    setBankFormError("");
    try {
      const saved = await apiPut<BankDetail>(`/admin/vendors/${vendorId}/bank`, {
        accountHolder: accountHolder.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
        bankName: bankName.trim(),
      }, token);
      setBank(saved);
      setBankFormOpen(false);
      showToast("Bank details saved", "success");
    } catch (err) {
      setBankFormError(err instanceof ApiError ? err.message : "Failed to save bank details");
    } finally {
      setSavingBank(false);
    }
  }

  async function handleVerifyBank(status: "verified" | "rejected") {
    if (!vendorId) return;
    const token = getAdminToken();
    if (!token) return;
    setBankActionLoading(status);
    try {
      await apiPatch(`/admin/vendors/${vendorId}/bank/verify`, { status }, token);
      setBank((prev) => (prev ? { ...prev, verification_status: status } : prev));
      showToast(status === "verified" ? "Bank details verified" : "Bank details rejected", "success");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to update bank details", "error");
    } finally {
      setBankActionLoading(null);
    }
  }

  useEffect(() => {
    if (!vendorId) return;
    const token = getAdminToken();
    if (!token) return;
    apiGet<CenterManager[]>(`/admin/vendors/${vendorId}/staff`, token)
      .then(setStaff)
      .catch(() => {});
  }, [vendorId]);

  // Real, complete data (all centers regardless of approval status, and real
  // bank details) — the vendor list-derived `centers` in AdminContext only
  // ever holds PENDING centers, and there's no bank data there at all.
  useEffect(() => {
    if (!vendorId) return;
    const token = getAdminToken();
    if (!token) return;
    apiGet<{ centers: RealCenter[]; bank: BankDetail | null }>(`/admin/vendors/${vendorId}`, token)
      .then((r) => {
        setRealCenters(r.centers ?? []);
        setBank(r.bank ?? null);
      })
      .catch(() => {});
  }, [vendorId]);

  // Build viewable docs list (only ones that have a file_key)
  const viewableDocs = vendorDocs.filter((d) => !!d.file_key);

  const openViewer = useCallback(
    async (fileKey: string, label: string) => {
      const token = getAdminToken();
      if (!token) return;
      setLoadingViewKey(fileKey);
      setViewError(null);
      try {
        const { url } = await apiGet<{ url: string }>(
          `/admin/vendors/${vendorId}/kyc/view-url?key=${encodeURIComponent(fileKey)}`,
          token,
        );
        const ext = fileKey.split(".").pop()?.toLowerCase() ?? "";
        const idx = viewableDocs.findIndex((d) => d.file_key === fileKey);
        setViewer({ label, url, isPdf: ext === "pdf", index: idx });
      } catch (err) {
        setViewError(err instanceof ApiError ? err.message : "Failed to load document");
      } finally {
        setLoadingViewKey(null);
      }
    },
    [vendorId, viewableDocs],
  );

  const navigateViewer = useCallback(
    async (newIndex: number) => {
      const doc = viewableDocs[newIndex];
      if (!doc) return;
      const label = DOC_TYPE_LABELS[doc.doc_type] ?? doc.doc_type;
      await openViewer(doc.file_key, label);
    },
    [viewableDocs, openViewer],
  );

  async function handleRegeneratePassword() {
    if (!vendor) return;
    setRegenerating(true);
    const result = await regenerateVendorPassword(vendor.id);
    setRegenerating(false);
    if (result.success && result.password) {
      setCredentials({ email: vendor.email, password: result.password });
      setCredsModalOpen(true);
    }
  }

  async function handleApprove() {
    if (!vendor) return;
    try {
      await approveVendor(vendor.id);
      showToast("Vendor approved", "success");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to approve vendor", "error");
    }
  }

  async function handleReject(reason: string) {
    if (!vendor) return;
    try {
      await rejectVendor(vendor.id, reason);
      showToast("Vendor rejected", "success");
      setShowRejectModal(false);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to reject vendor", "error");
    }
  }

  async function handleBlock() {
    if (!vendor) return;
    try {
      await blockVendor(vendor.id);
      showToast("Vendor blocked", "success");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to block vendor", "error");
    }
  }

  async function handleUnblock() {
    if (!vendor) return;
    try {
      await unblockVendor(vendor.id);
      showToast("Vendor unblocked", "success");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to unblock vendor", "error");
    }
  }

  async function handleCenterApprove(centerId: string) {
    const token = getAdminToken();
    if (!token) return;
    setCenterActionId(centerId);
    try {
      await apiPost(`/admin/centers/${centerId}/approve`, {}, token);
      setRealCenters((cs) => cs.map((c) => c.id === centerId ? { ...c, approval_status: "approved", is_active: true } : c));
      showToast("Center approved", "success");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to approve center", "error");
    } finally {
      setCenterActionId(null);
    }
  }

  async function handleCenterReject(centerId: string, reason: string) {
    const token = getAdminToken();
    if (!token) return;
    setCenterActionId(centerId);
    try {
      await apiPost(`/admin/centers/${centerId}/reject`, { reason }, token);
      setRealCenters((cs) => cs.map((c) => c.id === centerId ? { ...c, approval_status: "rejected" } : c));
      showToast("Center rejected", "success");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to reject center", "error");
    } finally {
      setCenterActionId(null);
    }
  }

  if (!vendor) return (
    <AdminLayout title="Vendor Detail">
      <div className="text-center py-24 text-[#94A3B8]">Vendor not found.</div>
    </AdminLayout>
  );


  const docMap = Object.fromEntries(vendorDocs.map((d) => [d.doc_type, d.file_key]));
  const extraDocTypes = vendorDocs.map((d) => d.doc_type).filter((t) => !MANDATORY_DOC_TYPES.includes(t));
  const allDocTypes = [...MANDATORY_DOC_TYPES, ...extraDocTypes];

  return (
    <>
      {/* Lightbox viewer — renders outside normal flow, covers entire screen */}
      {viewer && (
        <DocViewer
          viewer={viewer}
          total={viewableDocs.length}
          onClose={() => setViewer(null)}
          onPrev={() => navigateViewer(viewer.index - 1)}
          onNext={() => navigateViewer(viewer.index + 1)}
        />
      )}

      <AdminLayout title={vendor.businessName} subtitle={`${vendor.businessType} · ${vendor.city}`}>
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#0F172A]">
          <ArrowLeft size={14} /> Back to Vendors
        </button>

        {/* Header card */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm mb-5">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F172A] text-xl font-extrabold text-white">
              {vendor.businessName.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold text-[#0F172A]">{vendor.businessName}</h2>
                <StatusBadge status={vendor.status} />
              </div>
              <p className="mt-0.5 text-sm text-[#64748B]">{vendor.businessType} · {vendor.city}, {vendor.state}</p>
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-[#64748B]">
                <span className="flex items-center gap-1"><Mail size={11} />{vendor.businessEmail}</span>
                <span className="flex items-center gap-1"><Phone size={11} />{vendor.mobile}</span>
                <span className="flex items-center gap-1"><FileText size={11} />GSTIN: {vendor.gstin}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {/* Approve + Reject: only while the vendor is still under review. */}
              {isAwaitingApproval(vendor.status) && (
                <>
                  <button onClick={handleApprove} className="flex items-center gap-1.5 rounded-xl bg-[#DCFCE7] px-3 py-2 text-xs font-bold text-[#15803D] hover:bg-[#BBF7D0]">
                    <CheckCircle size={13} /> Approve vendor
                  </button>
                  <button onClick={() => setShowRejectModal(true)} className="flex items-center gap-1.5 rounded-xl bg-[#FEE2E2] px-3 py-2 text-xs font-bold text-[#B91C1C] hover:bg-[#FECACA]">
                    <XCircle size={13} /> Reject vendor
                  </button>
                </>
              )}
              {/* Rejected vendors are locked out — re-approve reinstates them. */}
              {vendor.status === "rejected" && (
                <button onClick={handleApprove} className="flex items-center gap-1.5 rounded-xl bg-[#DCFCE7] px-3 py-2 text-xs font-bold text-[#15803D] hover:bg-[#BBF7D0]">
                  <CheckCircle size={13} /> Re-approve vendor
                </button>
              )}
              {/* Enable/Disable: reversible operational switch once past review. */}
              {vendor.status === "approved" && (
                <button onClick={handleBlock} className="flex items-center gap-1.5 rounded-xl bg-[#F1F5F9] px-3 py-2 text-xs font-bold text-[#64748B] hover:bg-[#E2E8F0]">
                  <ShieldOff size={13} /> Disable vendor
                </button>
              )}
              {vendor.status === "blocked" && (
                <button onClick={handleUnblock} className="flex items-center gap-1.5 rounded-xl bg-[#EFF6FF] px-3 py-2 text-xs font-bold text-[#2563EB] hover:bg-[#DBEAFE]">
                  <Shield size={13} /> Enable vendor
                </button>
              )}
              {vendor.source === "admin_created" && vendor.mustChangePassword && (
                <button onClick={handleRegeneratePassword} disabled={regenerating}
                  className="flex items-center gap-1.5 rounded-xl bg-[#F1F5F9] px-3 py-2 text-xs font-bold text-[#64748B] hover:bg-[#E2E8F0] disabled:opacity-50">
                  {regenerating ? <Loader2 size={13} className="animate-spin" /> : <KeyRound size={13} />}
                  Regenerate Password
                </button>
              )}
            </div>
          </div>

          {vendor.source === "admin_created" && vendor.mustChangePassword && (
            <p className="mt-3 text-xs text-[#94A3B8]">
              Missed copying the login password when this vendor was created? Regenerating sets a new
              one-time password for their account — this covers every center they manage, since only
              the vendor (not individual centers) logs in. This option disappears once they've logged
              in and set their own password.
            </p>
          )}

          {/* Login Info — email is always shown; the password only appears
              right after Regenerate is used on this page visit (it's never
              stored or re-fetchable afterward, by design). */}
          <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">Login Info</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <span className="flex items-center gap-1.5 text-[#0F172A]">
                <Mail size={13} className="text-[#94A3B8]" />
                {vendor.email}
              </span>
              {credentials ? (
                <span className="flex items-center gap-2">
                  <span className="text-[#94A3B8]">Password:</span>
                  <code className="font-mono font-bold text-[#0F172A]">{credentials.password}</code>
                  <button
                    onClick={() => navigator.clipboard.writeText(credentials.password)}
                    className="rounded-lg border border-[#E2E8F0] bg-white px-2 py-1 text-[10px] font-semibold text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB]"
                  >
                    Copy
                  </button>
                </span>
              ) : (
                <span className="text-xs text-[#94A3B8]">
                  {vendor.source === "admin_created" && vendor.mustChangePassword
                    ? "Password not shown — use Regenerate Password above to issue a new one-time password."
                    : "Vendor has set their own password."}
                </span>
              )}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: "Total Revenue", value: fmt(vendorPaidRevenue) },
              { label: "Total Bookings", value: vendorBookingsTotal.toString() },
              { label: "Centers", value: realCenters.length.toString() },
            ].map((m) => (
              <div key={m.label} className="rounded-xl bg-[#F8FAFC] p-3 text-center">
                <p className="text-lg font-extrabold text-[#0F172A]">{m.value}</p>
                <p className="text-[11px] text-[#94A3B8]">{m.label}</p>
              </div>
            ))}
          </div>

          {vendor.notes && (
            <div className="mt-4 rounded-xl bg-[#FEF9C3] px-4 py-3 text-xs text-[#92400E]">
              <span className="font-bold">Note:</span> {vendor.notes}
            </div>
          )}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* KYC Documents */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-bold text-[#0F172A]">KYC Documents</p>
              <StatusBadge status={vendor.kycStatus} />
            </div>

            {(viewError || uploadError) && (
              <div className="mb-3 rounded-xl bg-[#FEE2E2] px-4 py-2.5 text-xs text-[#B91C1C]">
                {viewError || uploadError}
              </div>
            )}

            <div className="flex flex-col gap-2">
              {allDocTypes.map((docType) => {
                const fileKey = docMap[docType];
                const hasFile = !!fileKey;
                const approved = vendor.kycStatus === "approved";
                const submitted = hasFile || vendor.kycStatus === "submitted" || vendor.kycStatus === "approved";
                const label = DOC_TYPE_LABELS[docType] ?? docType;
                const isLoading = loadingViewKey === fileKey;

                return (
                  <div
                    key={docType}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                      approved
                        ? "border-[#DCFCE7] bg-[#F0FDF4]"
                        : submitted
                        ? "border-[#DBEAFE] bg-[#EFF6FF]"
                        : "border-[#E2E8F0] bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText
                        size={13}
                        className={approved ? "text-[#16A34A]" : submitted ? "text-[#2563EB]" : "text-[#94A3B8]"}
                      />
                      <span className="text-xs font-medium text-[#0F172A]">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        status={approved ? "approved" : submitted ? "submitted" : "not_submitted"}
                        size="sm"
                      />
                      {hasFile && (
                        <button
                          onClick={() => openViewer(fileKey, label)}
                          disabled={isLoading}
                          className="flex items-center gap-1 rounded-lg bg-[#0F172A] px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-[#1E293B] disabled:opacity-50 transition-colors"
                        >
                          {isLoading ? (
                            <Loader2 size={10} className="animate-spin" />
                          ) : (
                            <Eye size={10} />
                          )}
                          View
                        </button>
                      )}
                      <label className="flex cursor-pointer items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors">
                        {uploadingDocType === docType ? (
                          <Loader2 size={10} className="animate-spin" />
                        ) : (
                          <Upload size={10} />
                        )}
                        {hasFile ? "Replace" : "Upload"}
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          disabled={uploadingDocType === docType}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = "";
                            if (file) handleUploadDoc(docType, file);
                          }}
                        />
                      </label>
                      {hasFile && (
                        <button
                          onClick={() => setDeleteDocTarget({ docType, label })}
                          className="rounded-lg border border-[#E2E8F0] bg-white p-1.5 text-[#94A3B8] hover:border-red-300 hover:text-red-500 transition-colors"
                          title="Remove document"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bank Details */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-bold text-[#0F172A]">Bank Details</p>
              <div className="flex items-center gap-2">
                <StatusBadge status={bank ? (bank.verification_status ?? "pending") : "not_submitted"} />
                {!bankFormOpen && (
                  <button
                    onClick={openBankForm}
                    className="text-[11px] font-semibold text-[#2563EB] hover:underline"
                  >
                    {bank ? "Edit" : "Add Bank Details"}
                  </button>
                )}
              </div>
            </div>

            {bankFormOpen && (
              <div className="mb-4 flex flex-col gap-3 rounded-xl border border-[#2563EB]/30 bg-[#F8FAFF] p-4">
                <p className="text-xs text-[#64748B]">
                  {bank ? "Editing on the vendor's behalf resets verification to pending." : "Adding this on the vendor's behalf — they can still update it themselves later."}
                </p>
                {[
                  { key: "accountHolder" as const, label: "Account Holder Name" },
                  { key: "accountNumber" as const, label: "Account Number" },
                  { key: "ifscCode" as const, label: "IFSC Code" },
                  { key: "bankName" as const, label: "Bank Name" },
                ].map((f) => (
                  <label key={f.key} className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-[#475569]">{f.label}</span>
                    <input
                      type="text"
                      value={bankForm[f.key]}
                      onChange={(e) => setBankForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#2563EB]"
                    />
                  </label>
                ))}
                {bankFormError && <p className="text-xs font-medium text-red-500">{bankFormError}</p>}
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setBankFormOpen(false)}
                    disabled={savingBank}
                    className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-white disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBank}
                    disabled={savingBank}
                    className="flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-bold text-white hover:bg-[#1D4ED8] disabled:opacity-50"
                  >
                    {savingBank && <Loader2 size={12} className="animate-spin" />}
                    Save Bank Details
                  </button>
                </div>
              </div>
            )}

            {!bankFormOpen && (
              <div className="flex flex-col gap-3">
                {bank ? (
                  [
                    { label: "Account Holder", value: bank.account_holder_name ?? "—" },
                    { label: "Account Number", value: bank.account_number ? `••••${bank.account_number.slice(-4)}` : "—" },
                    { label: "IFSC Code", value: bank.ifsc_code ?? "—" },
                    { label: "Bank Name", value: bank.bank_name ?? "—" },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center justify-between border-b border-[#F8FAFC] pb-3">
                      <span className="text-xs text-[#64748B]">{r.label}</span>
                      <span className="text-xs font-semibold text-[#0F172A]">{r.value}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E2E8F0] py-6 text-center">
                    <CreditCard size={24} className="text-[#E2E8F0]" />
                    <p className="mt-2 text-xs text-[#94A3B8]">Account details not added yet — the proof document below can still be uploaded independently.</p>
                  </div>
                )}

                {/* Bank proof (cancelled cheque) — always uploadable, even
                    before the account fields above are filled in, same as
                    every other document in the KYC list. */}
                {(() => {
                  const docType = "cancelled_cheque";
                  const fileKey = docMap[docType];
                  const hasFile = !!fileKey;
                  const isLoading = loadingViewKey === fileKey;
                  return (
                    <div className="flex items-center justify-between border-b border-[#F8FAFC] pb-3 last:border-0 last:pb-0">
                      <div>
                        <span className="text-xs text-[#64748B]">Bank Proof (Cancelled Cheque)</span>
                        <div className="mt-1">
                          <StatusBadge status={hasFile ? "submitted" : "not_submitted"} size="sm" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {hasFile && (
                          <button
                            onClick={() => openViewer(fileKey, "Cancelled Cheque")}
                            disabled={isLoading}
                            className="flex items-center gap-1 rounded-lg bg-[#0F172A] px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-[#1E293B] disabled:opacity-50 transition-colors"
                          >
                            {isLoading ? <Loader2 size={10} className="animate-spin" /> : <Eye size={10} />}
                            View
                          </button>
                        )}
                        <label className="flex cursor-pointer items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors">
                          {uploadingDocType === docType ? <Loader2 size={10} className="animate-spin" /> : <Upload size={10} />}
                          {hasFile ? "Replace" : "Upload"}
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            disabled={uploadingDocType === docType}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              e.target.value = "";
                              if (file) handleUploadDoc(docType, file);
                            }}
                          />
                        </label>
                        {hasFile && (
                          <button
                            onClick={() => setDeleteDocTarget({ docType, label: "Cancelled Cheque" })}
                            className="rounded-lg border border-[#E2E8F0] bg-white p-1.5 text-[#94A3B8] hover:border-red-300 hover:text-red-500 transition-colors"
                            title="Remove document"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Verify / reject the account details — only meaningful once
                    there's an actual account record to verify. */}
                {bank && bank.verification_status !== "verified" && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleVerifyBank("verified")}
                      disabled={bankActionLoading !== null}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#DCFCE7] py-2 text-xs font-bold text-[#15803D] hover:bg-[#BBF7D0] disabled:opacity-50"
                    >
                      {bankActionLoading === "verified" ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                      Verify
                    </button>
                    {bank.verification_status !== "rejected" && (
                      <button
                        onClick={() => handleVerifyBank("rejected")}
                        disabled={bankActionLoading !== null}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#FEE2E2] py-2 text-xs font-bold text-[#B91C1C] hover:bg-[#FECACA] disabled:opacity-50"
                      >
                        {bankActionLoading === "rejected" ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                        Reject
                      </button>
                    )}
                  </div>
                )}
                {bank && bank.verification_status === "verified" && (
                  <button
                    onClick={() => handleVerifyBank("rejected")}
                    disabled={bankActionLoading !== null}
                    className="pt-1 text-left text-[11px] font-semibold text-[#DC2626] hover:underline disabled:opacity-50"
                  >
                    Revoke verification
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Centers */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <p className="font-bold text-[#0F172A]">Centers ({realCenters.length})</p>
            <p className="mb-4 mt-0.5 text-[11px] text-[#94A3B8]">
              Approve/Reject here affects only that single center. To hide every center from this vendor, reject or block the vendor above.
            </p>
            {realCenters.length === 0 ? (
              <p className="py-6 text-center text-sm text-[#94A3B8]">No centers added yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {realCenters.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF6FF]">
                      <Building2 size={14} className="text-[#2563EB]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-semibold text-[#0F172A]">{c.center_name}</p>
                      <p className="flex items-center gap-1 text-[11px] text-[#94A3B8]">
                        <MapPin size={9} />{c.locality ? `${c.locality}, ` : ""}{c.city ?? "—"}
                        {c.categories?.name ? ` · ${c.categories.name}` : ""}
                      </p>
                    </div>
                    <StatusBadge status={c.approval_status} size="sm" />
                    {/* Approve/Reject: only while the center is still under review —
                        once approved, "reject" reads as a punitive action even though
                        it's really just a visibility switch. Mirrors the vendor-level
                        isAwaitingApproval gating above. */}
                    {c.approval_status === "pending" && (
                      <>
                        <button
                          onClick={() => handleCenterApprove(c.id)}
                          disabled={centerActionId === c.id}
                          className="rounded-lg bg-[#DCFCE7] px-2.5 py-1.5 text-[11px] font-bold text-[#15803D] hover:bg-[#BBF7D0] disabled:opacity-50"
                        >
                          Approve center
                        </button>
                        <button
                          onClick={() => setRejectCenterTarget(c.id)}
                          disabled={centerActionId === c.id}
                          className="rounded-lg bg-[#FEE2E2] px-2.5 py-1.5 text-[11px] font-bold text-[#B91C1C] hover:bg-[#FECACA] disabled:opacity-50"
                        >
                          Reject center
                        </button>
                      </>
                    )}
                    {/* Once past review: a reversible visibility switch, not a
                        resubmit-for-review action. Same endpoints under the hood
                        (approved+active vs rejected+inactive = shown vs hidden). */}
                    {c.approval_status === "approved" && (
                      <button
                        onClick={() => setRejectCenterTarget(c.id)}
                        disabled={centerActionId === c.id}
                        className="rounded-lg bg-[#F1F5F9] px-2.5 py-1.5 text-[11px] font-bold text-[#64748B] hover:bg-[#E2E8F0] disabled:opacity-50"
                      >
                        Hide from customers
                      </button>
                    )}
                    {c.approval_status === "rejected" && (
                      <button
                        onClick={() => handleCenterApprove(c.id)}
                        disabled={centerActionId === c.id}
                        className="rounded-lg bg-[#DCFCE7] px-2.5 py-1.5 text-[11px] font-bold text-[#15803D] hover:bg-[#BBF7D0] disabled:opacity-50"
                      >
                        Show again
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Team / Center Managers */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <p className="mb-4 font-bold text-[#0F172A]">Center Managers ({staff.length})</p>
            {staff.length === 0 ? (
              <p className="py-6 text-center text-sm text-[#94A3B8]">No center managers added yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {staff.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF6FF]">
                      <Users size={14} className="text-[#2563EB]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-semibold text-[#0F172A]">{s.name}</p>
                      <p className="truncate text-[11px] text-[#94A3B8]">
                        {s.center_name ?? "—"} · {s.email}{s.phone ? ` · ${s.phone}` : ""}
                      </p>
                    </div>
                    <StatusBadge status={s.status} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Bookings */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <p className="mb-4 font-bold text-[#0F172A]">Recent Bookings ({vendorBookingsTotal})</p>
            {vendorBookings.length === 0 ? (
              <p className="py-6 text-center text-sm text-[#94A3B8]">No bookings yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {vendorBookings.slice(0, 6).map((b) => (
                  <div key={b.id} className="flex items-center justify-between rounded-xl border border-[#F1F5F9] bg-[#F8FAFC] px-3 py-2.5">
                    <div>
                      <p className="text-xs font-semibold text-[#0F172A]">{b.customerName}</p>
                      <p className="text-[11px] text-[#94A3B8]">{b.product}{b.centerName ? ` · ${b.centerName}` : ""} · {b.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#0F172A]">₹{b.amount}</p>
                      <StatusBadge status={b.paymentStatus} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AdminLayout>

      {credsModalOpen && credentials && (
        <GeneratedCredentialsModal
          email={credentials.email}
          password={credentials.password}
          onClose={() => setCredsModalOpen(false)}
        />
      )}

      <RejectReasonModal
        open={showRejectModal}
        title="Reject Vendor"
        description="This hides ALL of this vendor's centers from users and blocks their account. You can reverse it later by approving the vendor again."
        onCancel={() => setShowRejectModal(false)}
        onConfirm={handleReject}
      />

      <RejectReasonModal
        open={!!rejectCenterTarget}
        title={
          realCenters.find((c) => c.id === rejectCenterTarget)?.approval_status === "approved"
            ? "Hide This Center"
            : "Reject This Center"
        }
        description="This hides only this one center from users. The vendor and their other centers are unaffected. You can reverse it by approving this center again."
        onCancel={() => setRejectCenterTarget(null)}
        onConfirm={async (reason) => {
          if (rejectCenterTarget) await handleCenterReject(rejectCenterTarget, reason);
          setRejectCenterTarget(null);
        }}
      />

      <ConfirmDialog
        open={!!deleteDocTarget}
        title="Remove this document?"
        description={deleteDocTarget ? `"${deleteDocTarget.label}" will be removed and marked as not submitted. The vendor (or you) can upload it again anytime.` : undefined}
        confirmLabel="Remove Document"
        onCancel={() => setDeleteDocTarget(null)}
        onConfirm={handleDeleteDoc}
      />
    </>
  );
}
