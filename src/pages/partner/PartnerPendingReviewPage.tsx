import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock, FileSearch, Building2, ShieldCheck, LayoutDashboard, Mail, Phone, ArrowRight, RefreshCw } from "lucide-react";
import { usePartner } from "../../context/PartnerContext";
import { apiGet, getVendorToken } from "../../lib/api";

interface MyCenter {
  id: string;
  center_name: string;
  approval_status: string;
  city: string | null;
}

const timeline = [
  { icon: CheckCircle2, label: "Submitted", desc: "Your application has been received.", done: true },
  { icon: FileSearch, label: "Document Verification", desc: "Our team is reviewing your KYC documents.", done: false, active: true },
  { icon: Building2, label: "Center Verification", desc: "We'll verify your center details and photos.", done: false },
  { icon: ShieldCheck, label: "Admin Approval", desc: "Final review by the Bokko partner team.", done: false },
  { icon: LayoutDashboard, label: "Dashboard Activated", desc: "Your partner dashboard goes live!", done: false },
];

export default function PartnerPendingReviewPage() {
  const { partner, refreshStatus } = usePartner();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [centers, setCenters] = useState<MyCenter[]>([]);

  // Once approved, send the vendor straight to the dashboard.
  useEffect(() => {
    if (partner?.status === "approved") navigate("/partner/dashboard", { replace: true });
  }, [partner?.status, navigate]);

  // Poll the backend periodically so approval reflects without a manual refresh.
  useEffect(() => {
    const id = setInterval(() => { refreshStatus(); }, 15000);
    return () => clearInterval(id);
  }, [refreshStatus]);

  // Centers created during onboarding are visible immediately, regardless of
  // vendor approval status — show them so the vendor knows they were received.
  useEffect(() => {
    const token = getVendorToken();
    if (!token) return;
    apiGet<MyCenter[]>("/vendor/centers", token)
      .then((rows) => setCenters(rows ?? []))
      .catch(() => setCenters([]));
  }, []);

  async function handleCheckNow() {
    setChecking(true);
    const status = await refreshStatus();
    setChecking(false);
    if (status === "approved") navigate("/partner/dashboard", { replace: true });
  }

  const isRejected = partner?.status === "rejected";
  const isBlocked = partner?.status === "blocked";

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      {/* Header */}
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src="/bokko-logo.webp" alt="Bokko" style={{ height: 32, width: "auto" }} />
            <span className="hidden text-xs font-semibold text-[#64748B] sm:block">Partner Central</span>
          </Link>
          <Link to="/" className="text-sm font-medium text-[#64748B] hover:text-[#0F172A]">← Back to Bokko</Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-[600px]">
          {/* Hero */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FEF3C7]">
              <Clock size={36} className="text-[#D97706]" />
            </div>
            <h1 className="mt-5 text-2xl font-extrabold text-[#0F172A] sm:text-3xl">
              Your Partner Account Is Under Review
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#64748B]">
              Our team will verify your business details, documents and center information. Once approved, your dashboard will be activated and you can start receiving bookings.
            </p>

            {partner && (
              <div className="mt-5 grid grid-cols-2 gap-3 text-left sm:grid-cols-3">
                <div className="rounded-xl bg-[#F8FAFC] p-3">
                  <p className="text-[11px] text-[#94A3B8]">Application ID</p>
                  <p className="mt-0.5 text-xs font-bold text-[#0F172A] truncate">{partner.id.slice(-12).toUpperCase()}</p>
                </div>
                <div className="rounded-xl bg-[#F8FAFC] p-3">
                  <p className="text-[11px] text-[#94A3B8]">Business</p>
                  <p className="mt-0.5 text-xs font-bold text-[#0F172A] truncate">{partner.businessName}</p>
                </div>
                <div className="col-span-2 rounded-xl bg-[#F8FAFC] p-3 sm:col-span-1">
                  <p className="text-[11px] text-[#94A3B8]">Submitted</p>
                  <p className="mt-0.5 text-xs font-bold text-[#0F172A]">
                    {new Date(partner.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-5 rounded-xl bg-[#FFFBEB] px-4 py-3 text-left">
              <p className="text-xs font-semibold text-[#D97706]">⏱ Typical review time: 24–48 hours</p>
              <p className="mt-0.5 text-xs text-[#92400E]">You'll receive an email notification at your business email once approved.</p>
            </div>

            {isRejected && (
              <div className="mt-4 rounded-xl bg-[#FEF2F2] px-4 py-3 text-left">
                <p className="text-xs font-semibold text-[#DC2626]">Your application was not approved.</p>
                <p className="mt-0.5 text-xs text-[#991B1B]">Please contact our partner team for details on the next steps.</p>
              </div>
            )}

            {isBlocked && (
              <div className="mt-4 rounded-xl bg-[#FEF2F2] px-4 py-3 text-left">
                <p className="text-xs font-semibold text-[#DC2626]">Your partner account has been blocked.</p>
                <p className="mt-0.5 text-xs text-[#991B1B]">Please contact our partner team to resolve this.</p>
              </div>
            )}

            <button
              onClick={handleCheckNow}
              disabled={checking}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-60"
            >
              <RefreshCw size={15} className={checking ? "animate-spin" : ""} />
              {checking ? "Checking…" : "Check approval status"}
            </button>
            <p className="mt-2 text-[11px] text-[#94A3B8]">Status refreshes automatically every 15 seconds.</p>
          </div>

          {/* Centers submitted during onboarding */}
          {centers.length > 0 && (
            <div className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-[#0F172A]">Your Centers</h2>
              <div className="flex flex-col gap-3">
                {centers.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF]">
                      <Building2 size={16} className="text-[#2563EB]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#0F172A]">{c.center_name}</p>
                      {c.city && <p className="text-xs text-[#94A3B8]">{c.city}</p>}
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        c.approval_status === "approved"
                          ? "bg-[#DCFCE7] text-[#15803D]"
                          : c.approval_status === "rejected"
                            ? "bg-[#FEE2E2] text-[#B91C1C]"
                            : "bg-[#FEF3C7] text-[#D97706]"
                      }`}
                    >
                      {c.approval_status === "approved" ? "Approved" : c.approval_status === "rejected" ? "Rejected" : "Pending Review"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-base font-bold text-[#0F172A]">Verification Progress</h2>
            <div className="flex flex-col gap-0">
              {timeline.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.label} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${
                        step.done ? "border-[#16A34A] bg-[#DCFCE7] text-[#16A34A]"
                        : step.active ? "border-[#D97706] bg-[#FEF3C7] text-[#D97706]"
                        : "border-[#E2E8F0] bg-[#F8FAFC] text-[#94A3B8]"
                      }`}>
                        {step.done ? <CheckCircle2 size={16} /> : step.active ? <Clock size={16} className="animate-pulse" /> : <Icon size={16} />}
                      </div>
                      {i < timeline.length - 1 && (
                        <div className={`my-1 w-0.5 flex-1 rounded-full ${step.done ? "bg-[#16A34A]" : "bg-[#E2E8F0]"}`} style={{ minHeight: 24 }} />
                      )}
                    </div>
                    <div className={`pb-5 ${i === timeline.length - 1 ? "pb-0" : ""}`}>
                      <p className={`text-sm font-bold ${step.done ? "text-[#16A34A]" : step.active ? "text-[#D97706]" : "text-[#94A3B8]"}`}>
                        {step.label}
                        {step.active && <span className="ml-2 text-[10px] font-bold uppercase tracking-wide bg-[#FEF3C7] text-[#D97706] px-1.5 py-0.5 rounded-full">In Progress</span>}
                      </p>
                      <p className="mt-0.5 text-xs text-[#64748B]">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* What happens next */}
          <div className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-[#0F172A]">What happens after approval?</h2>
            <ul className="flex flex-col gap-3">
              {[
                "Your partner dashboard will be activated",
                "You can add, edit and manage all your centers",
                "Verified bookings start coming in from Day 1",
                "Weekly payouts directly to your bank account",
                "Access to performance analytics and insights",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-[#475569]">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#16A34A]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-[#0F172A]">Need help?</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <a href="mailto:partners@bokkoapp.com"
                className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] p-4 hover:border-[#2563EB] hover:bg-[#EFF6FF] transition-colors group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] group-hover:bg-[#DBEAFE]">
                  <Mail size={18} className="text-[#2563EB]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">Email Support</p>
                  <p className="text-xs text-[#64748B]">partners@bokkoapp.com</p>
                </div>
                <ArrowRight size={14} className="ml-auto text-[#94A3B8]" />
              </a>
              <a href="tel:+918008008000"
                className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] p-4 hover:border-[#2563EB] hover:bg-[#EFF6FF] transition-colors group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] group-hover:bg-[#DBEAFE]">
                  <Phone size={18} className="text-[#2563EB]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">Call Us</p>
                  <p className="text-xs text-[#64748B]">+91 80080 08000</p>
                </div>
                <ArrowRight size={14} className="ml-auto text-[#94A3B8]" />
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
