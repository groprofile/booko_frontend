import { useState } from "react";
import { CheckCircle2, MessageCircle, Phone } from "lucide-react";

export default function TrustBanner() {
  const [requested, setRequested] = useState<"call" | "whatsapp" | null>(null);

  return (
    <div className="sticky bottom-0 z-30 hidden border-t border-[#E2E8F0] bg-white/95 px-6 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm lg:flex lg:items-center lg:justify-between">
      <div>
        <p className="text-sm font-bold text-[#0F172A]">Need help choosing a Virtual Office?</p>
        <p className="text-xs text-[#64748B]">Talk to a Bokko Expert in under 2 minutes.</p>
      </div>

      {requested ? (
        <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#16A34A]">
          <CheckCircle2 size={15} />
          {requested === "call" ? "We'll call you shortly." : "We'll message you on WhatsApp shortly."}
        </p>
      ) : (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setRequested("call")}
            className="cta-gradient inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white"
          >
            <Phone size={15} />
            Call Now
          </button>
          <button
            type="button"
            onClick={() => setRequested("whatsapp")}
            className="inline-flex items-center gap-2 rounded-xl border border-[#16A34A] px-5 py-2.5 text-sm font-bold text-[#16A34A] hover:bg-[#ECFDF5]"
          >
            <MessageCircle size={15} />
            WhatsApp
          </button>
        </div>
      )}
    </div>
  );
}
