import { useState } from "react";
import { CheckCircle2, MessageCircle, Phone, Sparkles } from "lucide-react";

const features = [
  "Best Hourly Deals",
  "Business Travel Help",
  "Workcation Recommendations",
  "Fast Booking Support",
];

export default function BokkoExpertCard() {
  const [requested, setRequested] = useState<"call" | "chat" | null>(null);

  return (
    <div className="rounded-[24px] border border-[#E2E8F0] bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
        <Sparkles size={22} strokeWidth={1.8} />
      </span>
      <p className="mt-3 text-base font-bold text-[#0F172A]">Need Help Choosing?</p>
      <p className="text-sm text-[#64748B]">Talk to a Bokko Expert</p>

      <ul className="mt-4 flex flex-col gap-2 border-t border-[#E2E8F0] pt-4">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-[#334155]">
            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#16A34A]" />
            {feature}
          </li>
        ))}
      </ul>

      {requested ? (
        <div className="mt-4 rounded-xl bg-[#ECFDF5] px-4 py-3 text-sm font-semibold text-[#16A34A]">
          {requested === "call"
            ? "Got it! Our expert will call you shortly."
            : "Got it! We'll message you on WhatsApp shortly."}
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => setRequested("call")}
            className="cta-gradient flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-soft transition-transform hover:scale-[1.02]"
          >
            <Phone size={16} />
            Call Expert
          </button>
          <button
            type="button"
            onClick={() => setRequested("chat")}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#16A34A] text-sm font-bold text-[#16A34A] transition-colors hover:bg-[#ECFDF5]"
          >
            <MessageCircle size={16} />
            Chat on WhatsApp
          </button>
        </div>
      )}
    </div>
  );
}
