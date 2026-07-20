import { useState } from "react";
import { CheckCircle2, MessageSquareText, PhoneCall, Sparkles } from "lucide-react";

type RequestType = "expert" | "callback" | "quote";

const confirmations: Record<RequestType, string> = {
  expert: "Thanks! A Bokko expert will reach out shortly.",
  callback: "Callback scheduled! We'll call you soon.",
  quote: "Quote request received! Check your email shortly.",
};

export default function CorporateEnquirySection() {
  const [requested, setRequested] = useState<RequestType | null>(null);

  return (
    <section className="cta-gradient rounded-sm p-8 text-white">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
        <Sparkles size={13} />
        For Teams & Enterprises
      </span>
      <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">Need recurring meeting rooms?</h2>
      <ul className="mt-3 flex flex-col gap-1.5 text-sm text-white/90 sm:flex-row sm:gap-6">
        <li>Need 50+ seats?</li>
        <li>Need multiple city bookings?</li>
        <li>Need a dedicated account manager?</li>
      </ul>

      {requested ? (
        <div className="mt-5 inline-flex items-center gap-2 rounded-sm bg-white/15 px-4 py-3 text-sm font-semibold">
          <CheckCircle2 size={16} />
          {confirmations[requested]}
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setRequested("expert")}
            className="inline-flex items-center gap-2 rounded-sm bg-white px-5 py-3 text-sm font-bold text-[#2563EB] transition-transform hover:scale-[1.03]"
          >
            <MessageSquareText size={16} />
            Talk to Bokko Expert
          </button>
          <button
            type="button"
            onClick={() => setRequested("callback")}
            className="inline-flex items-center gap-2 rounded-sm border border-white/40 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
          >
            <PhoneCall size={16} />
            Request Callback
          </button>
          <button
            type="button"
            onClick={() => setRequested("quote")}
            className="inline-flex items-center gap-2 rounded-sm border border-white/40 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
          >
            Get Custom Quote
          </button>
        </div>
      )}
    </section>
  );
}
