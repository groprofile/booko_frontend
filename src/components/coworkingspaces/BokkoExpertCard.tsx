import { useState } from "react";
import { CalendarClock, MessageCircle, Phone, Sparkles } from "lucide-react";

type RequestType = "call" | "whatsapp" | "consultation";

const confirmations: Record<RequestType, string> = {
  call: "We'll call you shortly.",
  whatsapp: "We'll message you on WhatsApp shortly.",
  consultation: "Consultation scheduled! We'll confirm the time shortly.",
};

export default function BokkoExpertCard() {
  const [requested, setRequested] = useState<RequestType | null>(null);

  return (
    <div className="rounded-[24px] border border-[#E2E8F0] bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
        <Sparkles size={19} strokeWidth={1.8} />
      </span>
      <p className="mt-3 text-base font-bold text-[#0F172A]">Need help choosing a workspace?</p>
      <p className="mt-1 text-xs text-[#64748B]">Our Bokko experts know every workspace on this list personally.</p>

      {requested ? (
        <div className="mt-4 rounded-xl bg-[#ECFDF5] px-3 py-2.5 text-xs font-semibold text-[#16A34A]">
          {confirmations[requested]}
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setRequested("call")}
            className="cta-gradient flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold text-white"
          >
            <Phone size={14} />
            Call Bokko Expert
          </button>
          <button
            type="button"
            onClick={() => setRequested("whatsapp")}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#16A34A] text-sm font-bold text-[#16A34A] hover:bg-[#ECFDF5]"
          >
            <MessageCircle size={14} />
            WhatsApp
          </button>
          <button
            type="button"
            onClick={() => setRequested("consultation")}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] text-sm font-bold text-[#334155] hover:border-[#94A3B8]"
          >
            <CalendarClock size={14} />
            Schedule Consultation
          </button>
        </div>
      )}
    </div>
  );
}
