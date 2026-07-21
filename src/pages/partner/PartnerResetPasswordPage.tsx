import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Lock, ArrowLeft, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { apiPost, ApiError } from "../../lib/api";

export default function PartnerResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }

    setSubmitting(true);
    setError("");
    try {
      await apiPost("/auth/vendor/reset-password", { token, newPassword });
      setDone(true);
    } catch (err) {
      setError((err as ApiError).message ?? "Could not reset password. The link may have expired.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4 py-12">
        <div className="w-full max-w-[440px]">
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-sm text-center">
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FEE2E2]">
                <XCircle size={40} className="text-red-500" />
              </div>
            </div>
            <h1 className="mt-6 text-2xl font-extrabold text-[#0F172A]">Invalid Link</h1>
            <p className="mt-2 text-sm text-[#64748B]">This password reset link is missing its token.</p>
            <Link
              to="/partner/forgot-password"
              className="mt-6 block w-full rounded-xl bg-[#2563EB] py-3.5 text-center text-sm font-bold text-white shadow-sm hover:bg-[#1d4ed8]"
            >
              Request a New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="w-full max-w-[440px]">
        {!done && (
          <Link to="/partner/signin" className="mb-8 inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0F172A]">
            <ArrowLeft size={14} />
            Back to sign in
          </Link>
        )}

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-sm">
          {done ? (
            <div className="text-center">
              <div className="flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#DCFCE7]">
                  <CheckCircle2 size={40} className="text-[#16A34A]" />
                </div>
              </div>
              <h1 className="mt-6 text-2xl font-extrabold text-[#0F172A]">Password Reset!</h1>
              <p className="mt-2 text-sm text-[#64748B]">Your password has been updated. You can now sign in with it.</p>
              <button
                type="button"
                onClick={() => navigate("/partner/signin")}
                className="mt-6 w-full rounded-xl bg-[#2563EB] py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#1d4ed8]"
              >
                Continue to Sign In →
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EFF6FF]">
                  <Lock size={36} className="text-[#2563EB]" />
                </div>
              </div>
              <h1 className="mt-6 text-center text-2xl font-extrabold text-[#0F172A]">Set a new password</h1>
              <p className="mt-2 text-center text-sm leading-relaxed text-[#64748B]">
                Choose a new password for your Bokko vendor account.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-[#0F172A]">New Password</span>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="h-11 rounded-xl border border-[#D1D5DB] px-3.5 text-sm font-medium text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-[#0F172A]">Confirm Password</span>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="h-11 rounded-xl border border-[#D1D5DB] px-3.5 text-sm font-medium text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
                  />
                </label>

                {error && <p className="text-xs font-medium text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#1d4ed8] disabled:opacity-50"
                >
                  {submitting ? <><Loader2 size={14} className="animate-spin" />Resetting…</> : "Reset Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
