import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import PartnerAuthLayout from "../../components/partner/PartnerAuthLayout";
import { usePartner } from "../../context/PartnerContext";

const BUSINESS_TYPES = [
  "Coworking Space",
  "Hotel",
  "Meeting Room Provider",
  "Virtual Office Provider",
  "Managed Office",
  "Event Space",
];

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Chandigarh","Jammu & Kashmir","Ladakh",
];

interface FormData {
  name: string;
  email: string;
  mobile: string;
  businessEmail: string;
  businessName: string;
  city: string;
  state: string;
  businessType: string;
  centerType: "single" | "multiple" | "";
  password: string;
  confirmPassword: string;
  terms: boolean;
}

interface Errors {
  [key: string]: string;
}

function passwordStrength(p: string): { level: number; label: string; color: string } {
  if (p.length === 0) return { level: 0, label: "", color: "" };
  let score = 0;
  if (p.length >= 8) score++;
  if (p.length >= 12) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  if (score <= 1) return { level: 1, label: "Weak", color: "#EF4444" };
  if (score === 2) return { level: 2, label: "Fair", color: "#F59E0B" };
  if (score === 3) return { level: 3, label: "Good", color: "#2563EB" };
  return { level: 4, label: "Strong", color: "#16A34A" };
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[#0F172A]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 flex items-center gap-1 text-xs text-red-500"><AlertCircle size={11} />{error}</p>}
    </div>
  );
}

const INPUT = "w-full rounded-xl border px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] transition-colors focus:outline-none focus:ring-2";
const INPUT_NORMAL = `${INPUT} border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]/15`;
const INPUT_ERROR = `${INPUT} border-red-400 focus:border-red-400 focus:ring-red-400/15`;

export default function PartnerSignupPage() {
  const { signup } = usePartner();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>({
    name: "", email: "", mobile: "", businessEmail: "", businessName: "",
    city: "", state: "", businessType: "", centerType: "", password: "", confirmPassword: "", terms: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const pwdStrength = passwordStrength(form.password);

  function set(field: keyof FormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const e = { ...prev }; delete e[field]; return e; });
  }

  function validate(): boolean {
    const e: Errors = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "Enter your full name (min 2 chars)";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!form.mobile || !/^[6-9]\d{9}$/.test(form.mobile)) e.mobile = "Enter a valid 10-digit Indian mobile number";
    if (!form.businessEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.businessEmail)) e.businessEmail = "Enter a valid business email";
    if (!form.businessName.trim()) e.businessName = "Business name is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.state) e.state = "Select your state";
    if (!form.businessType) e.businessType = "Select your business type";
    if (!form.centerType) e.centerType = "Select center type";
    if (!form.password || form.password.length < 8) e.password = "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!form.terms) e.terms = "You must agree to the terms";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setApiError("");
    const result = signup(
      {
        name: form.name.trim(),
        email: form.email.toLowerCase(),
        mobile: form.mobile,
        businessEmail: form.businessEmail.toLowerCase(),
        businessName: form.businessName.trim(),
        city: form.city.trim(),
        state: form.state,
        businessType: form.businessType,
        centerType: form.centerType as "single" | "multiple",
      },
      form.password,
    );
    setSubmitting(false);
    if (!result.success) { setApiError(result.error ?? "Signup failed"); return; }
    navigate("/partner/verify-email");
  }

  return (
    <PartnerAuthLayout>
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-7 shadow-sm">
        <h2 className="text-2xl font-extrabold text-[#0F172A]">Create Partner Account</h2>
        <p className="mt-1 text-sm text-[#64748B]">Join 2,000+ partners growing with Bokko</p>

        {apiError && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Owner / Contact Person Name" required error={errors.name}>
              <input type="text" value={form.name} onChange={(e: ChangeEvent<HTMLInputElement>) => set("name", e.target.value)}
                className={errors.name ? INPUT_ERROR : INPUT_NORMAL} placeholder="Rahul Sharma" />
            </Field>
            <Field label="Mobile Number" required error={errors.mobile}>
              <input type="tel" value={form.mobile} onChange={(e: ChangeEvent<HTMLInputElement>) => set("mobile", e.target.value)}
                className={errors.mobile ? INPUT_ERROR : INPUT_NORMAL} placeholder="9876543210" maxLength={10} />
            </Field>
          </div>

          <Field label="Personal Email" required error={errors.email}>
            <input type="email" value={form.email} onChange={(e: ChangeEvent<HTMLInputElement>) => set("email", e.target.value)}
              className={errors.email ? INPUT_ERROR : INPUT_NORMAL} placeholder="rahul@gmail.com" />
          </Field>

          <Field label="Business Email" required error={errors.businessEmail}>
            <input type="email" value={form.businessEmail} onChange={(e: ChangeEvent<HTMLInputElement>) => set("businessEmail", e.target.value)}
              className={errors.businessEmail ? INPUT_ERROR : INPUT_NORMAL} placeholder="info@yourcompany.com" />
            <p className="mt-1 text-[11px] text-[#94A3B8]">Verification link will be sent to this email</p>
          </Field>

          <Field label="Business Name" required error={errors.businessName}>
            <input type="text" value={form.businessName} onChange={(e: ChangeEvent<HTMLInputElement>) => set("businessName", e.target.value)}
              className={errors.businessName ? INPUT_ERROR : INPUT_NORMAL} placeholder="WorkHub Spaces Pvt. Ltd." />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="City" required error={errors.city}>
              <input type="text" value={form.city} onChange={(e: ChangeEvent<HTMLInputElement>) => set("city", e.target.value)}
                className={errors.city ? INPUT_ERROR : INPUT_NORMAL} placeholder="Mumbai" />
            </Field>
            <Field label="State" required error={errors.state}>
              <select value={form.state} onChange={(e: ChangeEvent<HTMLSelectElement>) => set("state", e.target.value)}
                className={`${errors.state ? INPUT_ERROR : INPUT_NORMAL} bg-white`}>
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Business Type" required error={errors.businessType}>
              <select value={form.businessType} onChange={(e: ChangeEvent<HTMLSelectElement>) => set("businessType", e.target.value)}
                className={`${errors.businessType ? INPUT_ERROR : INPUT_NORMAL} bg-white`}>
                <option value="">Select type</option>
                {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Center Type" required error={errors.centerType}>
              <select value={form.centerType} onChange={(e: ChangeEvent<HTMLSelectElement>) => set("centerType", e.target.value)}
                className={`${errors.centerType ? INPUT_ERROR : INPUT_NORMAL} bg-white`}>
                <option value="">Select type</option>
                <option value="single">Single Center</option>
                <option value="multiple">Multiple Centers</option>
              </select>
            </Field>
          </div>

          <Field label="Password" required error={errors.password}>
            <div className="relative">
              <input type={showPwd ? "text" : "password"} value={form.password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => set("password", e.target.value)}
                className={`${errors.password ? INPUT_ERROR : INPUT_NORMAL} pr-11`} placeholder="Min. 8 characters" />
              <button type="button" onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]">
                {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {form.password.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-1 flex-1 rounded-full transition-colors"
                    style={{ backgroundColor: i <= pwdStrength.level ? pwdStrength.color : "#E2E8F0" }} />
                ))}
                <span className="text-[11px] font-semibold" style={{ color: pwdStrength.color }}>{pwdStrength.label}</span>
              </div>
            )}
          </Field>

          <Field label="Confirm Password" required error={errors.confirmPassword}>
            <div className="relative">
              <input type={showConfirm ? "text" : "password"} value={form.confirmPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) => set("confirmPassword", e.target.value)}
                className={`${errors.confirmPassword ? INPUT_ERROR : INPUT_NORMAL} pr-11`} placeholder="Re-enter password" />
              <button type="button" onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]">
                {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </Field>

          <div>
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={form.terms} onChange={(e: ChangeEvent<HTMLInputElement>) => set("terms", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded accent-[#2563EB]" />
              <span className="text-sm text-[#475569]">
                I agree to Bokko&apos;s{" "}
                <Link to="/partner-terms" className="font-semibold text-[#2563EB] hover:underline">Partner Terms</Link>
                {" "}and{" "}
                <Link to="/privacy-policy" className="font-semibold text-[#2563EB] hover:underline">Privacy Policy</Link>
              </span>
            </label>
            {errors.terms && <p className="mt-1 flex items-center gap-1 text-xs text-red-500"><AlertCircle size={11} />{errors.terms}</p>}
          </div>

          <button type="submit" disabled={submitting}
            className="mt-1 w-full rounded-xl bg-[#2563EB] py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#1d4ed8] disabled:opacity-60">
            {submitting ? "Creating Account…" : "Create Partner Account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#64748B]">
          Already have an account?{" "}
          <Link to="/partner/signin" className="font-semibold text-[#2563EB] hover:underline">Sign in</Link>
        </p>
      </div>
    </PartnerAuthLayout>
  );
}
