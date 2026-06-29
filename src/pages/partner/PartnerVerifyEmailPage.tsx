import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Mail, CheckCircle2, XCircle, RefreshCw, ArrowLeft, Loader2 } from "lucide-react";
import { usePartner } from "../../context/PartnerContext";
import { apiPost, ApiError } from "../../lib/api";

export default function PartnerVerifyEmailPage() {
  const { partner, verifyEmail } = usePartner();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  // Token-in-URL states
  const [verifying, setVerifying] = useState(!!token);
  const [verifyError, setVerifyError] = useState("");
  const [verified, setVerified] = useState(false);

  // Resend states
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resendError, setResendError] = useState("");

  const email = partner?.businessEmail ?? partner?.email ?? "your business email";

  // Auto-verify when token is present in URL
  useEffect(() => {
    if (!token) return;

    (async () => {
      setVerifying(true);
      setVerifyError("");
      try {
        await apiPost("/auth/verify-email", { token });
        verifyEmail();
        setVerified(true);
      } catch (err) {
        setVerifyError((err as ApiError).message ?? "Verification failed. The link may have expired.");
      } finally {
        setVerifying(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleResend() {
    if (resending || cooldown > 0) return;
    setResending(true);
    setResendError("");
    try {
      await apiPost("/auth/vendor/resend-verification", { email });
      setResent(true);
      setCooldown(30);
      const t = setInterval(() => {
        setCooldown((v) => {
          if (v <= 1) { clearInterval(t); return 0; }
          return v - 1;
        });
      }, 1000);
    } catch (err) {
      setResendError((err as ApiError).message ?? "Could not resend. Try again.");
    } finally {
      setResending(false);
    }
  }

  // ─── Token in URL: show verification result ───────────────────────────────
  if (token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4 py-12">
        <div className="w-full max-w-[440px]">
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-sm text-center">
            {verifying && (
              <>
                <Loader2 size={48} className="mx-auto animate-spin text-[#2563EB]" />
                <h1 className="mt-6 text-xl font-extrabold text-[#0F172A]">Verifying your email…</h1>
                <p className="mt-2 text-sm text-[#64748B]">Please wait a moment.</p>
              </>
            )}

            {!verifying && verified && (
              <>
                <div className="flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#DCFCE7]">
                    <CheckCircle2 size={40} className="text-[#16A34A]" />
                  </div>
                </div>
                <h1 className="mt-6 text-2xl font-extrabold text-[#0F172A]">Email Verified!</h1>
                <p className="mt-2 text-sm text-[#64748B]">Your email has been verified. You can now log in and complete your onboarding.</p>
                <button
                  type="button"
                  onClick={() => navigate("/partner/signin")}
                  className="mt-6 w-full rounded-xl bg-[#2563EB] py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#1d4ed8]"
                >
                  Continue to Sign In →
                </button>
              </>
            )}

            {!verifying && verifyError && (
              <>
                <div className="flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FEE2E2]">
                    <XCircle size={40} className="text-red-500" />
                  </div>
                </div>
                <h1 className="mt-6 text-2xl font-extrabold text-[#0F172A]">Verification Failed</h1>
                <p className="mt-2 text-sm text-[#64748B]">{verifyError}</p>
                <p className="mt-1 text-xs text-[#94A3B8]">The link may have expired. Request a new one below.</p>
                <button
                  type="button"
                  onClick={() => navigate("/partner/verify-email")}
                  className="mt-6 w-full rounded-xl bg-[#2563EB] py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#1d4ed8]"
                >
                  Request New Verification Email
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── No token: "check your inbox" UI ─────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="w-full max-w-[440px]">
        <Link to="/partner/signup" className="mb-8 inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0F172A]">
          <ArrowLeft size={14} />
          Back to sign up
        </Link>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-sm">
          <div className="flex justify-center">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#EFF6FF]">
              <Mail size={36} className="text-[#2563EB]" />
              <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#16A34A] text-white">
                <CheckCircle2 size={15} />
              </span>
            </div>
          </div>

          <h1 className="mt-6 text-center text-2xl font-extrabold text-[#0F172A]">Verify Your Email</h1>
          <p className="mt-2 text-center text-sm leading-relaxed text-[#64748B]">We sent a verification link to</p>
          <p className="mt-1 text-center text-sm font-semibold text-[#0F172A]">{email}</p>
          <p className="mt-2 text-center text-xs text-[#94A3B8]">
            Click the link in the email to verify your account and continue onboarding.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <a
              href="https://mail.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-xl bg-[#2563EB] py-3 text-center text-sm font-bold text-white shadow-sm hover:bg-[#1d4ed8]"
            >
              Open Email App
            </a>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] py-3 text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-50"
            >
              {resending
                ? <><Loader2 size={14} className="animate-spin" />Sending…</>
                : <><RefreshCw size={14} className={cooldown > 0 ? "animate-spin" : ""} />
                   {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Verification Email"}</>
              }
            </button>
          </div>

          {resent && !resendError && (
            <p className="mt-3 text-center text-xs font-medium text-[#16A34A]">
              ✓ Verification email sent again
            </p>
          )}
          {resendError && (
            <p className="mt-3 text-center text-xs font-medium text-red-500">{resendError}</p>
          )}

          <div className="mt-6 border-t border-[#E2E8F0] pt-5">
            <p className="text-center text-xs text-[#94A3B8]">
              Already verified?{" "}
              <Link to="/partner/signin" className="font-semibold text-[#2563EB] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-5">
          <p className="text-[13px] font-semibold text-[#0F172A]">Didn't receive the email?</p>
          <ul className="mt-2 flex flex-col gap-1.5 text-xs text-[#64748B]">
            <li>• Check your spam or junk folder</li>
            <li>• Make sure you entered the correct business email</li>
            <li>• Wait a few minutes and check again</li>
            <li>• Contact <a href="mailto:support@bokkoapp.com" className="text-[#2563EB] hover:underline">support@bokkoapp.com</a> if the issue persists</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
