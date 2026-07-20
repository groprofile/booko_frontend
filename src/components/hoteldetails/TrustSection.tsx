import { Headphones, Lock, ReceiptText, ShieldCheck, Zap } from "lucide-react";

const items = [
  { icon: ShieldCheck, label: "Verified Property" },
  { icon: Lock, label: "Secure Payments" },
  { icon: Zap, label: "Instant Confirmation" },
  { icon: Headphones, label: "Customer Support" },
  { icon: ReceiptText, label: "No Hidden Charges" },
];

export default function TrustSection() {
  return (
    <section className="rounded-sm border border-[#E2E8F0] bg-white p-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-[#ECFDF5] text-[#16A34A]">
              <Icon size={20} strokeWidth={1.8} />
            </span>
            <p className="text-xs font-semibold text-[#334155]">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
