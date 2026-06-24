import { useState } from "react";
import { CheckCircle2, MessageCircle, Phone, Sparkles, X } from "lucide-react";

const features = [
  "Hotel Recommendations",
  "Corporate Booking Help",
  "Group Booking Support",
  "Workcation Assistance",
];

type RequestType = "call" | "whatsapp";

export default function BokkoExpertWidget() {
  const [open, setOpen] = useState(false);
  const [requested, setRequested] = useState<RequestType | null>(null);

  return (
    <div className="fixed bottom-24 right-4 z-50 sm:bottom-6 sm:right-6">
      {open && (
        <div className="mb-3 w-[280px] rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.15)]">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
              <Sparkles size={18} strokeWidth={1.8} />
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close expert widget"
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#64748B] hover:bg-[#F8FAFC]"
            >
              <X size={16} />
            </button>
          </div>
          <p className="mt-2 text-sm font-bold text-[#0F172A]">Talk To Bokko Expert</p>

          <ul className="mt-3 flex flex-col gap-1.5">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-1.5 text-xs text-[#334155]">
                <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-[#16A34A]" />
                {feature}
              </li>
            ))}
          </ul>

          {requested ? (
            <div className="mt-3 rounded-xl bg-[#ECFDF5] px-3 py-2 text-xs font-semibold text-[#16A34A]">
              {requested === "call" ? "We'll call you shortly." : "We'll message you on WhatsApp shortly."}
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setRequested("call")}
                className="cta-gradient flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-bold text-white"
              >
                <Phone size={14} />
                Call Expert
              </button>
              <button
                type="button"
                onClick={() => setRequested("whatsapp")}
                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-[#16A34A] text-sm font-bold text-[#16A34A] hover:bg-[#ECFDF5]"
              >
                <MessageCircle size={14} />
                WhatsApp
              </button>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Talk to Bokko Expert"
        className="cta-gradient flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_12px_30px_rgba(37,99,235,0.4)] transition-transform hover:scale-105"
      >
        {open ? <X size={22} /> : <Sparkles size={22} />}
      </button>
    </div>
  );
}
