import { BadgeCheck, Landmark, Rocket, ShieldCheck, Star } from "lucide-react";

const badges = [
  { icon: ShieldCheck, label: "GST Compliant" },
  { icon: Landmark, label: "Govt Accepted Address" },
  { icon: Rocket, label: "Startup Friendly" },
  { icon: BadgeCheck, label: "Verified Center" },
  { icon: Star, label: "Premium Location" },
];

export default function TrustBadgesRow() {
  return (
    <div className="flex flex-wrap gap-2.5">
      {badges.map(({ icon: Icon, label }) => (
        <span
          key={label}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#334155]"
        >
          <Icon size={14} className="text-[#16A34A]" />
          {label}
        </span>
      ))}
    </div>
  );
}
