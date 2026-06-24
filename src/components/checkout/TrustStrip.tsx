import { BadgeCheck, Clock, Headphones, ShieldCheck, Sparkles } from "lucide-react";

interface TrustStripProps {
  freeCancellation: boolean;
}

export default function TrustStrip({ freeCancellation }: TrustStripProps) {
  const items = [
    { icon: Sparkles, label: "Instant Confirmation" },
    { icon: ShieldCheck, label: "Secure Payment" },
    ...(freeCancellation ? [{ icon: BadgeCheck, label: "Free Cancellation" }] : []),
    { icon: Headphones, label: "24x7 Support" },
    { icon: Clock, label: "Best Price Guarantee" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-[#2563EB]/15 bg-[#EFF6FF] px-4 py-3">
      {items.map(({ icon: Icon, label }) => (
        <span key={label} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] sm:text-sm">
          <Icon size={14} />
          {label}
        </span>
      ))}
    </div>
  );
}
