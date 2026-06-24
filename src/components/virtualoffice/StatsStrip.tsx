import { Building2, MapPinned, ShieldCheck, Zap } from "lucide-react";

const stats = [
  { icon: Building2, value: "500+", label: "Virtual Offices" },
  { icon: MapPinned, value: "50+", label: "Locations" },
  { icon: Zap, value: "Same Day", label: "Setup" },
  { icon: ShieldCheck, value: "100%", label: "GST Ready" },
];

export default function StatsStrip() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map(({ icon: Icon, value, label }) => (
        <div
          key={label}
          className="flex flex-col items-center gap-1.5 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-5 text-center"
        >
          <Icon size={20} className="text-[#2563EB]" />
          <p className="text-xl font-extrabold text-[#0F172A]">{value}</p>
          <p className="text-xs font-semibold text-[#64748B]">{label}</p>
        </div>
      ))}
    </div>
  );
}
