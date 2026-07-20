import { BadgeCheck, RotateCcw, ShieldCheck, Sparkles, Tag, Headphones } from "lucide-react";
import SectionLabel from "./SectionLabel";

const items = [
  { icon: BadgeCheck, label: "Verified Hotels" },
  { icon: Sparkles, label: "Instant Confirmation" },
  { icon: ShieldCheck, label: "Secure Payments" },
  { icon: Headphones, label: "24x7 Support" },
  { icon: Tag, label: "Best Price Guarantee" },
  { icon: RotateCcw, label: "Easy Refunds" },
];

export default function WhyBookSection() {
  return (
    <section className="m-0">
      <SectionLabel title="Why Book With Bokko" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white p-4 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
              <Icon size={18} strokeWidth={1.8} />
            </span>
            <p className="text-xs font-bold text-[#0F172A]">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
