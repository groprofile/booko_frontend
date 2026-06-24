import { Gift, History, LogIn, Sparkles, Zap } from "lucide-react";
import SectionLabel from "./SectionLabel";

const benefits = [
  { icon: History, label: "Save Traveller Details" },
  { icon: Sparkles, label: "Manage Bookings" },
  { icon: Zap, label: "Faster Checkout" },
  { icon: Gift, label: "Exclusive Offers" },
  { icon: Sparkles, label: "Loyalty Rewards" },
];

interface LoginBenefitsSectionProps {
  onSignIn: () => void;
}

export default function LoginBenefitsSection({ onSignIn }: LoginBenefitsSectionProps) {
  return (
    <section className="rounded-[20px] border border-[#E2E8F0] bg-white p-5">
      <SectionLabel
        title="Login Benefits"
        action={
          <button
            type="button"
            onClick={onSignIn}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#111111] px-4 py-2 text-sm font-bold text-white hover:bg-black"
          >
            <LogIn size={14} />
            Sign In
          </button>
        }
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {benefits.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 text-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
              <Icon size={16} strokeWidth={1.8} />
            </span>
            <p className="text-xs font-semibold text-[#334155]">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
