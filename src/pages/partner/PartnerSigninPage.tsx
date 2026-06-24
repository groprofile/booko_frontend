import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import PartnerAuthLayout from "../../components/partner/PartnerAuthLayout";
import { usePartner } from "../../context/PartnerContext";

const INPUT = "w-full rounded-xl border px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] transition-colors focus:outline-none focus:ring-2";
const INPUT_NORMAL = `${INPUT} border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]/15`;
const INPUT_ERROR = `${INPUT} border-red-400 focus:border-red-400 focus:ring-red-400/15`;

export default function PartnerSigninPage() {
  const { signin } = usePartner();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const e: { email?: string; password?: string } = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address";
    if (!password || password.length < 4) e.password = "Enter your password";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setApiError("");
    const result = signin(email.toLowerCase(), password);
    setSubmitting(false);
    if (!result.success) { setApiError(result.error ?? "Sign in failed"); return; }
    const status = result.status;
    if (status === "email_unverified") navigate("/partner/verify-email");
    else if (status === "submitted_for_review" || status === "under_review") navigate("/partner/pending-review");
    else if (status === "approved") navigate("/partner/dashboard");
    else navigate("/partner/onboarding");
  }

  return (
    <PartnerAuthLayout
      headline="Welcome Back to\nBokko Partners"
      subheadline="Sign in to your partner account to manage your listings, track bookings and access your dashboard."
    >
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-7 shadow-sm">
        <h2 className="text-2xl font-extrabold text-[#0F172A]">Partner Sign In</h2>
        <p className="mt-1 text-sm text-[#64748B]">Access your Bokko partner account</p>

        {apiError && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#0F172A]">Email / Business Email</label>
            <input type="email" value={email} onChange={(e: ChangeEvent<HTMLInputElement>) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
              className={errors.email ? INPUT_ERROR : INPUT_NORMAL} placeholder="you@company.com" autoComplete="email" />
            {errors.email && <p className="mt-1 flex items-center gap-1 text-xs text-red-500"><AlertCircle size={11} />{errors.email}</p>}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-medium text-[#0F172A]">Password</label>
              <Link to="/partner/forgot-password" className="text-xs font-semibold text-[#2563EB] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input type={showPwd ? "text" : "password"} value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                className={`${errors.password ? INPUT_ERROR : INPUT_NORMAL} pr-11`} placeholder="Enter your password" autoComplete="current-password" />
              <button type="button" onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]">
                {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 flex items-center gap-1 text-xs text-red-500"><AlertCircle size={11} />{errors.password}</p>}
          </div>

          <button type="submit" disabled={submitting}
            className="mt-2 w-full rounded-xl bg-[#2563EB] py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#1d4ed8] disabled:opacity-60">
            {submitting ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#64748B]">
          New partner?{" "}
          <Link to="/partner/signup" className="font-semibold text-[#2563EB] hover:underline">Create account</Link>
        </p>
      </div>
    </PartnerAuthLayout>
  );
}
