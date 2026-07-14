import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Building2, CheckCircle2, Gift, MapPin, X, Zap } from "lucide-react";
import { useUser } from "../context/UserAuthContext";
import { ApiError } from "../lib/api";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Step = "phone" | "otp" | "success";

const benefits = [
  {
    icon: Zap,
    bg: "#EFF6FF",
    color: "#2563EB",
    title: "Instant Confirmation",
    description: "Book verified spaces in seconds.",
  },
  {
    icon: Building2,
    bg: "#ECFDF5",
    color: "#16A34A",
    title: "Verified Spaces",
    description: "Premium partners across India.",
  },
  {
    icon: Gift,
    bg: "#FFF7ED",
    color: "#F97316",
    title: "Exclusive Offers",
    description: "Members-only deals and discounts.",
  },
  {
    icon: MapPin,
    bg: "#FEF2F2",
    color: "#EF4444",
    title: "Multi-City Access",
    description: "Book spaces across major Indian cities.",
  },
];

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const { sendOtp, verifyOtp } = useUser();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(4).fill(""));
  const [resendIn, setResendIn] = useState(30);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setStep("phone");
    setPhone("");
    setOtp(Array(4).fill(""));
    setError(null);
    document.body.style.overflow = "hidden";

    const raf = requestAnimationFrame(() => setVisible(true));
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (step !== "otp") return;
    setResendIn(30);
    const id = window.setInterval(() => {
      setResendIn((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [step]);

  useEffect(() => {
    if (step !== "success") return;
    const timeout = window.setTimeout(() => handleClose(), 1600);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function handleClose() {
    setVisible(false);
    window.setTimeout(onClose, 200);
  }

  function handlePhoneChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPhone(event.target.value.replace(/\D/g, "").slice(0, 10));
    setError(null);
  }

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtp((current) => {
      const next = [...current];
      next[index] = digit;
      return next;
    });
    setError(null);
    if (digit && index < 3) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  async function handleSendOtp() {
    setLoading(true);
    setError(null);
    try {
      await sendOtp(phone);
      setStep("otp");
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setLoading(true);
    setError(null);
    try {
      await verifyOtp(phone, otp.join(""));
      setStep("success");
      onSuccess?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid OTP. Please try again.");
      setOtp(Array(4).fill(""));
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendIn > 0) return;
    setLoading(true);
    setError(null);
    try {
      await sendOtp(phone);
      setOtp(Array(4).fill(""));
      setResendIn(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const isPhoneValid = phone.length === 10;
  const isOtpValid = otp.every((digit) => digit !== "");

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <div
        onClick={handleClose}
        aria-hidden="true"
        className={
          "absolute inset-0 bg-[#0F172A]/55 transition-opacity duration-300 " +
          (visible ? "opacity-100" : "opacity-0")
        }
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-heading"
        className={
          "relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] transition-all duration-300 sm:max-h-[85vh] sm:w-[950px] sm:flex-row sm:rounded-[28px] " +
          (visible
            ? "translate-y-0 opacity-100 sm:scale-100"
            : "translate-y-full opacity-0 sm:translate-y-6 sm:scale-95")
        }
      >
        <span className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-[#E2E8F0] sm:hidden" />

        <button
          type="button"
          onClick={handleClose}
          aria-label="Close login dialog"
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#64748B] shadow-soft transition-colors hover:bg-white hover:text-[#111111] sm:right-5 sm:top-5"
        >
          <X size={18} />
        </button>

        <div
          className="hidden w-full shrink-0 flex-col p-10 sm:flex sm:w-[40%]"
          style={{ backgroundImage: "linear-gradient(180deg, #EFF6FF 0%, #F8FAFC 100%)" }}
        >
          <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-[#111111]">
            Welcome to Bokko
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#475569]">
            Book coworking spaces, day passes, meeting rooms, hotels and virtual offices
            instantly.
          </p>

          <div className="mt-8 flex flex-col gap-5">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex items-start gap-3.5">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-soft"
                  style={{ backgroundColor: benefit.bg, color: benefit.color }}
                >
                  <benefit.icon size={20} strokeWidth={1.9} />
                </span>
                <div>
                  <p className="text-sm font-bold text-[#111111]">{benefit.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#64748B]">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex w-full flex-1 flex-col overflow-y-auto px-6 py-7 sm:w-[60%] sm:px-10 sm:py-10">
          {step === "phone" && (
            <div className="flex flex-1 flex-col">
              <h2 id="login-modal-heading" className="text-2xl font-extrabold tracking-tight text-[#111111] sm:text-[28px]">
                Login / Signup
              </h2>
              <p className="mt-2 text-sm text-[#64748B] sm:text-base">
                Enter your mobile number to continue.
              </p>

              <label className="mt-7 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Mobile Number
              </label>
              <div className="mt-2 flex h-[60px] items-center gap-2 rounded-[14px] border border-[#D1D5DB] px-4 transition-colors focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/15">
                <span className="flex shrink-0 items-center gap-1.5 border-r border-[#E2E8F0] pr-3 text-sm font-semibold text-[#111111]">
                  <span aria-hidden="true">🇮🇳</span>
                  +91
                </span>
                <input
                  ref={phoneInputRef}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                  value={phone}
                  onChange={handlePhoneChange}
                  onKeyDown={(e) => { if (e.key === 'Enter' && isPhoneValid && !loading) handleSendOtp(); }}
                  placeholder="Enter Mobile Number"
                  className="h-full w-full bg-transparent text-base font-semibold text-[#111111] outline-none placeholder:font-normal placeholder:text-[#94A3B8]"
                />
              </div>

              {error && (
                <p className="mt-3 text-sm font-medium text-[#DC2626]">{error}</p>
              )}

              <p className="mt-4 text-sm text-[#475569]">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => phoneInputRef.current?.focus()}
                  className="font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
                  style={{ fontWeight: 600 }}
                >
                  Sign Up
                </button>
              </p>

              <div className="mt-auto pt-8 sm:static sm:pt-10">
                <button
                  type="button"
                  disabled={!isPhoneValid || loading}
                  onClick={handleSendOtp}
                  className="h-14 w-full rounded-[14px] bg-[#111111] text-base font-bold text-white transition-colors hover:bg-[#222222] disabled:cursor-not-allowed disabled:bg-[#E5E7EB] disabled:text-[#94A3B8]"
                >
                  {loading ? "Sending…" : "Continue"}
                </button>
                <p className="mt-4 text-center text-xs leading-relaxed text-[#94A3B8]">
                  By continuing, you agree to Bokko&apos;s{" "}
                  <a href="#terms" className="font-semibold text-[#475569] hover:text-[#111111]">
                    Terms &amp; Conditions
                  </a>{" "}
                  and{" "}
                  <a href="#privacy" className="font-semibold text-[#475569] hover:text-[#111111]">
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </div>
          )}

          {step === "otp" && (
            <div className="flex flex-1 flex-col">
              <h2 id="login-modal-heading" className="text-2xl font-extrabold tracking-tight text-[#111111] sm:text-[28px]">
                Verify OTP
              </h2>
              <p className="mt-2 text-sm text-[#64748B] sm:text-base">
                Enter the 4-digit code sent to{" "}
                <span className="font-semibold text-[#111111]">+91 {phone}</span>
              </p>

              <div className="mt-7 flex justify-center gap-4 sm:gap-5">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpRefs.current[index] = el;
                    }}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(event) => handleOtpChange(index, event.target.value)}
                    onKeyDown={(event) => {
                      handleOtpKeyDown(index, event);
                      if (event.key === 'Enter' && isOtpValid && !loading) handleVerifyOtp();
                    }}
                    className="h-16 w-16 rounded-[14px] border border-[#D1D5DB] text-center text-2xl font-bold text-[#111111] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
                  />
                ))}
              </div>

              {error && (
                <p className="mt-4 text-center text-sm font-medium text-[#DC2626]">{error}</p>
              )}

              <div className="mt-5 flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => { setStep("phone"); setError(null); }}
                  className="font-semibold text-[#475569] hover:text-[#111111]"
                >
                  Change Number
                </button>
                <span className="text-[#64748B]">
                  Didn&apos;t receive it?{" "}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendIn > 0 || loading}
                    className="font-semibold text-[#2563EB] hover:text-[#1D4ED8] disabled:cursor-not-allowed disabled:text-[#94A3B8]"
                    style={{ fontWeight: 600 }}
                  >
                    {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
                  </button>
                </span>
              </div>

              <div className="mt-auto pt-8 sm:static sm:pt-10">
                <button
                  type="button"
                  disabled={!isOtpValid || loading}
                  onClick={handleVerifyOtp}
                  className="h-14 w-full rounded-[14px] bg-[#111111] text-base font-bold text-white transition-colors hover:bg-[#222222] disabled:cursor-not-allowed disabled:bg-[#E5E7EB] disabled:text-[#94A3B8]"
                >
                  {loading ? "Verifying…" : "Verify & Continue"}
                </button>
                <p className="mt-4 text-center text-xs leading-relaxed text-[#94A3B8]">
                  By continuing, you agree to Bokko&apos;s{" "}
                  <a href="#terms" className="font-semibold text-[#475569] hover:text-[#111111]">
                    Terms &amp; Conditions
                  </a>{" "}
                  and{" "}
                  <a href="#privacy" className="font-semibold text-[#475569] hover:text-[#111111]">
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ECFDF5] text-[#16A34A]">
                <CheckCircle2 size={36} strokeWidth={1.8} />
              </span>
              <h2 id="login-modal-heading" className="mt-5 text-2xl font-extrabold tracking-tight text-[#111111]">
                You&apos;re all set!
              </h2>
              <p className="mt-2 max-w-xs text-sm text-[#64748B]">
                Welcome to Bokko. Taking you back to your booking now.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
