import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, ArrowRight, ArrowLeft, CheckCircle2, User, Building2, ShieldCheck } from "lucide-react";
import PartnerAuthLayout from "../../components/partner/PartnerAuthLayout";
import { usePartner } from "../../context/PartnerContext";

const BUSINESS_TYPES = [
  "Coworking Space", "Hotel", "Meeting Room Provider",
  "Virtual Office Provider", "Managed Office", "Event Space",
];

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Chandigarh","Jammu & Kashmir","Ladakh",
];

interface FormData {
  name: string; email: string; mobile: string;
  businessEmail: string; businessName: string;
  city: string; state: string; businessType: string;
  centerType: "single" | "multiple" | "";
  password: string; confirmPassword: string; terms: boolean;
}

function passwordStrength(p: string) {
  if (!p) return { level: 0, label: "", color: "" };
  let s = 0;
  if (p.length >= 8) s++;
  if (p.length >= 12) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  if (s <= 1) return { level: 1, label: "Weak",   color: "#EF4444" };
  if (s === 2) return { level: 2, label: "Fair",   color: "#F59E0B" };
  if (s === 3) return { level: 3, label: "Good",   color: "#2563EB" };
  return           { level: 4, label: "Strong", color: "#16A34A" };
}

const inputBase = "w-full rounded-xl border px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-all bg-[#F8FAFC] focus:bg-white";
const inputOk  = `${inputBase} border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10`;
const inputErr = `${inputBase} border-red-400 bg-red-50/30 focus:border-red-400 focus:ring-2 focus:ring-red-400/10`;

function Field({ label, required, error, hint, children }: {
  label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-[#1E293B]">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-[#94A3B8]">{hint}</p>}
      {error && <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500"><AlertCircle size={11} />{error}</p>}
    </div>
  );
}

export default function PartnerSignupPage() {
  const { signup } = usePartner();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    name: "", email: "", mobile: "", businessEmail: "", businessName: "",
    city: "", state: "", businessType: "", centerType: "",
    password: "", confirmPassword: "", terms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const pwdStr = passwordStrength(form.password);

  function set(field: keyof FormData, value: string | boolean) {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => { const e = { ...p }; delete e[field]; return e; });
  }

  /* ── Step 1 validation ── */
  function validateStep1(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "Enter your full name";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.mobile || !/^[6-9]\d{9}$/.test(form.mobile)) e.mobile = "Valid 10-digit mobile required";
    if (!form.businessName.trim()) e.businessName = "Business name is required";
    if (!form.businessEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.businessEmail)) e.businessEmail = "Valid business email required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.state) e.state = "Select your state";
    if (!form.businessType) e.businessType = "Select business type";
    if (!form.centerType) e.centerType = "Select center count";
    return e;
  }

  /* ── Step 2 validation ── */
  function validateStep2(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!form.password || form.password.length < 8) e.password = "Min. 8 characters required";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!form.terms) e.terms = "Please agree to continue";
    return e;
  }

  function goNext() {
    const errs = validateStep1();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    const errs = validateStep2();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true); setApiError("");
    const result = await signup(
      { name: form.name.trim(), email: form.email.toLowerCase(), mobile: form.mobile,
        businessEmail: form.businessEmail.toLowerCase(), businessName: form.businessName.trim(),
        city: form.city.trim(), state: form.state, businessType: form.businessType,
        centerType: form.centerType as "single" | "multiple" },
      form.password,
    );
    setSubmitting(false);
    if (!result.success) { setApiError(result.error ?? "Signup failed"); return; }
    navigate("/partner/verify-email");
  }

  /* ── Step Indicator ── */
  const STEPS = [
    { n: 1, label: "Your Details",  icon: User },
    { n: 2, label: "Set Password",  icon: ShieldCheck },
  ];

  return (
    <PartnerAuthLayout>
      {/* Step progress */}
      <div className="mb-6 flex items-center justify-center gap-0">
        {STEPS.map((s, i) => {
          const done = step > s.n;
          const active = step === s.n;
          return (
            <div key={s.n} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all
                  ${done   ? "border-[#2563EB] bg-[#2563EB] text-white"
                  : active ? "border-[#2563EB] bg-white text-[#2563EB]"
                           : "border-[#E2E8F0] bg-white text-[#94A3B8]"}`}>
                  {done ? <CheckCircle2 size={18} /> : <s.icon size={16} />}
                </div>
                <p className={`mt-1.5 text-xs font-semibold ${active ? "text-[#2563EB]" : done ? "text-[#16A34A]" : "text-[#94A3B8]"}`}>
                  {s.label}
                </p>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mb-5 mx-3 h-0.5 w-20 rounded-full transition-colors ${done ? "bg-[#2563EB]" : "bg-[#E2E8F0]"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Card */}
      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-lg shadow-slate-100">
        {/* Header */}
        <div className="border-b border-[#F1F5F9] bg-[#F8FAFC] px-7 py-5">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${step === 1 ? "bg-[#2563EB]" : "bg-[#7C3AED]"}`}>
              {step === 1 ? <Building2 size={18} className="text-white" /> : <ShieldCheck size={18} className="text-white" />}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#94A3B8]">
                Step {step} of 2
              </p>
              <h2 className="text-xl font-extrabold text-[#0F172A]">
                {step === 1 ? "Your & Business Details" : "Create Your Password"}
              </h2>
            </div>
          </div>
          {step === 1 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {[{ v: "2,000+", l: "Active Partners" }, { v: "50K+", l: "Monthly Bookings" }, { v: "48 hrs", l: "Go Live" }].map((s) => (
                <span key={s.l} className="flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs shadow-sm">
                  <span className="font-extrabold text-[#2563EB]">{s.v}</span>
                  <span className="text-[#64748B]">{s.l}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-7 py-7">
          {apiError && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              <AlertCircle size={16} className="mt-0.5 shrink-0" /> {apiError}
            </div>
          )}

          {/* ──── STEP 1 ──── */}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              {/* Personal section */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <User size={14} className="text-[#2563EB]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">Personal Info</span>
                  <div className="flex-1 border-t border-[#E2E8F0]" />
                </div>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Full Name" required error={errors.name}>
                      <input type="text" value={form.name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => set("name", e.target.value)}
                        className={errors.name ? inputErr : inputOk} placeholder="Rahul Sharma" />
                    </Field>
                    <Field label="Mobile Number" required error={errors.mobile}>
                      <input type="tel" value={form.mobile}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => set("mobile", e.target.value)}
                        className={errors.mobile ? inputErr : inputOk} placeholder="9876543210" maxLength={10} />
                    </Field>
                  </div>
                  <Field label="Personal Email" required error={errors.email}>
                    <input type="email" value={form.email}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => set("email", e.target.value)}
                      className={errors.email ? inputErr : inputOk} placeholder="rahul@gmail.com" />
                  </Field>
                </div>
              </div>

              {/* Business section */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Building2 size={14} className="text-[#7C3AED]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#7C3AED]">Business Details</span>
                  <div className="flex-1 border-t border-[#E2E8F0]" />
                </div>
                <div className="flex flex-col gap-4">
                  <Field label="Business / Company Name" required error={errors.businessName}>
                    <input type="text" value={form.businessName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => set("businessName", e.target.value)}
                      className={errors.businessName ? inputErr : inputOk} placeholder="WorkHub Spaces Pvt. Ltd." />
                  </Field>
                  <Field label="Business Email" required error={errors.businessEmail} hint="Verification link will be sent here">
                    <input type="email" value={form.businessEmail}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => set("businessEmail", e.target.value)}
                      className={errors.businessEmail ? inputErr : inputOk} placeholder="info@yourcompany.com" />
                  </Field>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="City" required error={errors.city}>
                      <input type="text" value={form.city}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => set("city", e.target.value)}
                        className={errors.city ? inputErr : inputOk} placeholder="Mumbai" />
                    </Field>
                    <Field label="State" required error={errors.state}>
                      <select value={form.state}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => set("state", e.target.value)}
                        className={`${errors.state ? inputErr : inputOk} cursor-pointer`}>
                        <option value="">Select state</option>
                        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Business Type" required error={errors.businessType}>
                      <select value={form.businessType}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => set("businessType", e.target.value)}
                        className={`${errors.businessType ? inputErr : inputOk} cursor-pointer`}>
                        <option value="">Select type</option>
                        {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </Field>
                    <Field label="No. of Centers" required error={errors.centerType}>
                      <select value={form.centerType}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => set("centerType", e.target.value)}
                        className={`${errors.centerType ? inputErr : inputOk} cursor-pointer`}>
                        <option value="">Select</option>
                        <option value="single">Single Center</option>
                        <option value="multiple">Multiple Centers</option>
                      </select>
                    </Field>
                  </div>
                </div>
              </div>

              <button type="button" onClick={goNext}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] py-3.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition-all hover:bg-[#1d4ed8] active:scale-[0.985]">
                Continue to Step 2 <ArrowRight size={16} />
              </button>

              <p className="text-center text-sm text-[#64748B]">
                Already have an account?{" "}
                <Link to="/partner/signin" className="font-semibold text-[#2563EB] hover:underline">Sign in</Link>
              </p>
            </div>
          )}

          {/* ──── STEP 2 ──── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              {/* Summary pill */}
              <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-sm font-extrabold text-white">
                  {form.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[#0F172A]">{form.name}</p>
                  <p className="truncate text-xs text-[#64748B]">{form.businessName} · {form.city}</p>
                </div>
                <button type="button" onClick={() => setStep(1)}
                  className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline">
                  <ArrowLeft size={12} /> Edit
                </button>
              </div>

              {/* Password */}
              <Field label="Create Password" required error={errors.password}>
                <div className="relative">
                  <input type={showPwd ? "text" : "password"} value={form.password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => set("password", e.target.value)}
                    className={`${errors.password ? inputErr : inputOk} pr-11`}
                    placeholder="Min. 8 characters" />
                  <button type="button" onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#2563EB]">
                    {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {form.password.length > 0 && (
                  <div className="mt-2.5 flex items-center gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-1.5 flex-1 rounded-full transition-all"
                        style={{ backgroundColor: i <= pwdStr.level ? pwdStr.color : "#E2E8F0" }} />
                    ))}
                    <span className="text-xs font-bold" style={{ color: pwdStr.color }}>{pwdStr.label}</span>
                  </div>
                )}
              </Field>

              {/* Confirm */}
              <Field label="Confirm Password" required error={errors.confirmPassword}>
                <div className="relative">
                  <input type={showConfirm ? "text" : "password"} value={form.confirmPassword}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => set("confirmPassword", e.target.value)}
                    className={`${errors.confirmPassword ? inputErr : inputOk} pr-11`}
                    placeholder="Re-enter password" />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#2563EB]">
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </Field>

              {/* Terms */}
              <div>
                <label className="flex cursor-pointer items-start gap-3">
                  <input type="checkbox" checked={form.terms}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => set("terms", e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#2563EB]" />
                  <span className="text-sm leading-relaxed text-[#475569]">
                    I agree to Bokko's{" "}
                    <Link to="/partner-terms" className="font-semibold text-[#2563EB] hover:underline">Partner Terms</Link>{" "}
                    and{" "}
                    <Link to="/privacy-policy" className="font-semibold text-[#2563EB] hover:underline">Privacy Policy</Link>
                  </span>
                </label>
                {errors.terms && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500"><AlertCircle size={11} />{errors.terms}</p>
                )}
              </div>

              <button type="submit" disabled={submitting}
                className="w-full rounded-xl bg-[#2563EB] py-3.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition-all hover:bg-[#1d4ed8] active:scale-[0.985] disabled:opacity-60">
                {submitting ? "Creating Account…" : "Create Partner Account →"}
              </button>

              <button type="button" onClick={() => setStep(1)}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] py-3 text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC]">
                <ArrowLeft size={14} /> Back to Step 1
              </button>
            </form>
          )}
        </div>
      </div>
    </PartnerAuthLayout>
  );
}
