import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Star, ArrowLeft } from "lucide-react";

const valueProps = [
  "No setup fee — go live in 48 hours",
  "Verified, intent-based customer bookings",
  "Real-time dashboard for every center",
  "Simple weekly payout process",
  "Dedicated partner support team",
];

const stats = [
  { value: "2,000+", label: "Active Partners" },
  { value: "50K+", label: "Monthly Bookings" },
  { value: "30+", label: "Cities Live" },
];

interface Props {
  children: ReactNode;
  headline?: string;
  subheadline?: string;
}

export default function PartnerAuthLayout({ children, headline, subheadline }: Props) {
  return (
    <div className="flex min-h-screen">
      {/* Left: dark brand panel */}
      <div className="relative hidden w-[460px] shrink-0 flex-col justify-between overflow-hidden bg-[#0F172A] p-10 lg:flex xl:w-[500px]">
        <div aria-hidden className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#2563EB] opacity-20 blur-3xl" />
        <div aria-hidden className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-[#2563EB] opacity-10 blur-3xl" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white">
            <ArrowLeft size={14} />
            Back to Bokko
          </Link>

          <div className="mt-10">
            <img src="/bokko-logo.png" alt="Bokko" style={{ height: 36, width: "auto", filter: "brightness(0) invert(1)" }} />
            <p className="mt-3 text-xs font-bold uppercase tracking-widest text-[#2563EB]">Partner Central</p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-white">
              {headline ?? "Grow Your Bookings\nWith Bokko"}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-white/55">
              {subheadline ?? "List your hotel, coworking space, meeting room or virtual office and start receiving verified bookings."}
            </p>
          </div>

          <ul className="mt-8 flex flex-col gap-3.5">
            {valueProps.map((prop) => (
              <li key={prop} className="flex items-start gap-3 text-sm text-white/75">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#16A34A]" />
                {prop}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10">
          <div className="grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
                <p className="text-[22px] font-extrabold text-white">{s.value}</p>
                <p className="mt-0.5 text-[11px] text-white/45">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={13} className="fill-[#F59E0B] text-[#F59E0B]" />
              ))}
            </div>
            <p className="mt-2.5 text-[13px] leading-relaxed text-white/65">
              "Bokko helped us fill our empty desks within the first week. The onboarding was seamless and the support team is incredible."
            </p>
            <div className="mt-3.5 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white">
                R
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Rahul Sharma</p>
                <p className="text-[11px] text-white/40">WorkHub Spaces, Bangalore</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-[#F8FAFC]">
        <div className="flex flex-1 items-start justify-center px-5 py-10 sm:items-center sm:px-10">
          <div className="w-full max-w-[480px]">
            <div className="mb-7 flex items-center justify-between lg:hidden">
              <Link to="/" className="flex items-center gap-2">
                <img src="/bokko-logo.png" alt="Bokko" style={{ height: 32, width: "auto" }} />
                <span className="text-sm font-bold text-[#64748B]">Partners</span>
              </Link>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
