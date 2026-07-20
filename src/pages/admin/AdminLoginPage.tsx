import { useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, Lock, ChevronDown, ChevronUp } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import Logo from "../../components/Logo";

const CREDS = [
  { role: "Super Admin",      email: "admin@bokkoapp.com",   pwd: "Admin@2024"   },
  { role: "Finance Admin",    email: "finance@bokkoapp.com", pwd: "Finance@2024" },
  { role: "Operations Admin", email: "ops@bokkoapp.com",     pwd: "Ops@2024"     },
  { role: "Support Admin",    email: "support@bokkoapp.com", pwd: "Support@2024" },
];

export default function AdminLoginPage() {
  const { admin, login } = useAdmin();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [otp, setOtp] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [showCreds, setShowCreds] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (admin) return <Navigate to="/admin/dashboard" replace />;

  function validate() {
    const e: Record<string, string> = {};
    if (!email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    if (!pwd) e.pwd = "Password is required";
    return e;
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setError("");
    const result = await login(email.trim().toLowerCase(), pwd, otp || undefined);
    setLoading(false);
    if (!result.success) { setError(result.error ?? "Login failed"); return; }
    navigate("/admin/dashboard");
  }

  const inputBase = "w-full rounded-xl border px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-all bg-[#F8FAFC] focus:bg-white";
  const inputNormal = `${inputBase} border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10`;
  const inputErr = `${inputBase} border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/10`;

  return (
    <div className="app-wash flex min-h-screen flex-col items-center justify-center px-4 py-10">
      {/* Top logo */}
      <div className="mb-8 flex flex-col items-center gap-1">
        <Logo height={36} />
        <span className="mt-1 rounded-full bg-[#0F172A] px-3 py-0.5 text-[11px] font-bold uppercase tracking-widest text-white">
          Admin Panel
        </span>
      </div>

      {/* Card */}
      <div className="glass-panel w-full max-w-[420px] overflow-hidden rounded-3xl shadow-soft-lg">
        {/* Card header */}
        <div className="flex flex-col items-center gap-2 border-b border-white/50 bg-white/40 px-8 py-6 text-center">
          <div className="cta-gradient flex h-12 w-12 items-center justify-center rounded-2xl ring-4 ring-[#2563EB]/10">
            <Lock size={22} className="text-white" />
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#0F172A]">Welcome back</h1>
          <p className="text-sm text-[#64748B]">Sign in to Bokko Admin · Authorized Access Only</p>
        </div>

        {/* Form */}
        <div className="px-8 py-7">
          {error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              <AlertCircle size={15} className="shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#0F172A]">Email Address</label>
              <input type="email" value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                className={errors.email ? inputErr : inputNormal}
                placeholder="admin@bokkoapp.com" autoComplete="email" />
              {errors.email && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500"><AlertCircle size={10} />{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#0F172A]">Password</label>
              <div className="relative">
                <input type={showPwd ? "text" : "password"} value={pwd}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => { setPwd(e.target.value); setErrors((p) => ({ ...p, pwd: "" })); }}
                  className={`${errors.pwd ? inputErr : inputNormal} pr-11`}
                  placeholder="Enter your password" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors hover:text-[#2563EB]">
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.pwd && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500"><AlertCircle size={10} />{errors.pwd}</p>
              )}
            </div>

            {/* OTP optional */}
            <div>
              <button type="button" onClick={() => setShowOtp((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-[#1d4ed8]">
                {showOtp ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                {showOtp ? "Hide 2FA OTP" : "Have a 2FA OTP? (optional)"}
              </button>
              {showOtp && (
                <input type="text" value={otp}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className={`${inputNormal} mt-2 tracking-[0.25em] text-center font-mono text-base`}
                  placeholder="· · · · · ·" maxLength={6} />
              )}
            </div>

            <button type="submit" disabled={loading}
              className="mt-1 w-full rounded-xl bg-[#2563EB] py-3.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition-all hover:bg-[#1d4ed8] active:scale-[0.985] disabled:opacity-60">
              {loading ? "Authenticating…" : "Sign in to Admin →"}
            </button>
          </form>
        </div>
      </div>

      {/* Demo credentials collapsible */}
      <div className="mt-4 w-full max-w-[420px] overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
        <button onClick={() => setShowCreds((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-[#64748B] hover:bg-[#F8FAFC]">
          <span>Demo Credentials</span>
          {showCreds ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {showCreds && (
          <div className="border-t border-[#F1F5F9] px-2 pb-2">
            {CREDS.map((c) => (
              <button key={c.email} onClick={() => { setEmail(c.email); setPwd(c.pwd); setErrors({}); setShowCreds(false); }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[#EFF6FF]">
                <span className="text-sm font-semibold text-[#0F172A]">{c.role}</span>
                <span className="font-mono text-xs text-[#64748B]">{c.email}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-[#94A3B8]">Restricted · Bokko Internal Use Only</p>
    </div>
  );
}
