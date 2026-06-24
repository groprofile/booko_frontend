import { Landmark, Lock, ShieldCheck, UserCheck, FileCheck2, BadgeCheck, Building2 } from "lucide-react";

const items = [
  { icon: FileCheck2, label: "Verified Documents" },
  { icon: Building2, label: "Verified Property" },
  { icon: UserCheck, label: "Verified Provider" },
  { icon: BadgeCheck, label: "Compliance Checked" },
  { icon: ShieldCheck, label: "GST Ready" },
  { icon: Landmark, label: "Government Accepted" },
  { icon: Lock, label: "100% Secure Process" },
];

export default function TrustSection() {
  return (
    <section className="rounded-[20px] border border-[#E2E8F0] bg-white p-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ECFDF5] text-[#16A34A]">
              <Icon size={20} strokeWidth={1.8} />
            </span>
            <p className="text-xs font-semibold text-[#334155]">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
