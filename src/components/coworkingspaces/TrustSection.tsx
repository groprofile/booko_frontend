import { Award, Camera, ShieldCheck, Sparkles, Verified } from "lucide-react";

const badges = [
  { icon: Verified, label: "Verified Workspace" },
  { icon: ShieldCheck, label: "Verified Provider" },
  { icon: Camera, label: "Verified Photos" },
  { icon: Award, label: "GST Compliant" },
  { icon: Sparkles, label: "Premium Partner" },
];

export default function TrustSection() {
  return (
    <section className="rounded-[20px] border border-[#E2E8F0] bg-white p-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {badges.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
              <Icon size={19} strokeWidth={1.8} />
            </span>
            <p className="text-xs font-bold text-[#0F172A]">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
