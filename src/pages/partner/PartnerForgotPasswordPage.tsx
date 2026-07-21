import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { apiPost, ApiError } from "../../lib/api";

export default function PartnerForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await apiPost("/auth/vendor/forgot-password", { email: email.trim() });
      // Backend always returns a generic success message regardless of
      // whether the email matched, to prevent account enumeration.
      setSent(true);
    } catch (err) {
      setError((err as ApiError).message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="w-full max-w-[440px]">
        <Link to="/partner/signin" className="mb-8 inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0F172A]">
          <ArrowLeft size={14} />
          Back to sign in
        </Link>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-sm">
          {sent ? (
            <>
              <div className="flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EFF6FF]">
                  <CheckCircle2 size={36} className="text-[#2563EB]" />
                </div>
              </div>
              <h1 className="mt-6 text-center text-2xl font-extrabold text-[#0F172A]">Check your email</h1>
              <p className="mt-2 text-center text-sm leading-relaxed text-[#64748B]">
                If an account exists for <span className="font-semibold text-[#0F172A]">{email}</span>, we've sent a
                password reset link. It expires in 30 minutes.
              </p>
              <Link
                to="/partner/signin"
                className="mt-6 block w-full rounded-xl bg-[#2563EB] py-3.5 text-center text-sm font-bold text-white shadow-sm hover:bg-[#1d4ed8]"
              >
                Back to Sign In
              </Link>
            </>
          ) : (
            <>
              <div className="flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EFF6FF]">
                  <Mail size={36} className="text-[#2563EB]" />
                </div>
              </div>
              <h1 className="mt-6 text-center text-2xl font-extrabold text-[#0F172A]">Forgot your password?</h1>
              <p className="mt-2 text-center text-sm leading-relaxed text-[#64748B]">
                Enter your account email and we'll send you a link to reset it.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-[#0F172A]">Email</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@business.com"
                    className="h-11 rounded-xl border border-[#D1D5DB] px-3.5 text-sm font-medium text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
                  />
                </label>

                {error && <p className="text-xs font-medium text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#1d4ed8] disabled:opacity-50"
                >
                  {submitting ? <><Loader2 size={14} className="animate-spin" />Sending…</> : "Send Reset Link"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
