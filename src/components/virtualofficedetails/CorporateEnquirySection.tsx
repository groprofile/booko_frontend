import { useState } from "react";
import { CalendarClock, CheckCircle2, MessageSquareText, PhoneCall, Sparkles } from "lucide-react";

type RequestType = "expert" | "consultation" | "callback";

const confirmations: Record<RequestType, string> = {
  expert: "Thanks! A Bokko expert will reach out shortly.",
  consultation: "Consultation scheduled! We'll confirm the time shortly.",
  callback: "Callback requested! We'll call you soon.",
};

export default function CorporateEnquirySection() {
  const [requested, setRequested] = useState<RequestType | null>(null);

  return (
    <section className="cta-gradient rounded-[24px] p-8 text-white">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
        <Sparkles size={13} />
        For Growing Businesses
      </span>
      <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">Need multiple locations?</h2>
      <ul className="mt-3 flex flex-col gap-1.5 text-sm text-white/90 sm:flex-row sm:gap-6">
        <li>Need PAN India presence?</li>
        <li>Need GST registration support?</li>
        <li>Need bulk team setup?</li>
      </ul>

      {requested ? (
        <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-3 text-sm font-semibold">
          <CheckCircle2 size={16} />
          {confirmations[requested]}
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setRequested("expert")}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#2563EB] transition-transform hover:scale-[1.03]"
          >
            <MessageSquareText size={16} />
            Talk To Bokko Expert
          </button>
          <button
            type="button"
            onClick={() => setRequested("consultation")}
            className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
          >
            <CalendarClock size={16} />
            Schedule Consultation
          </button>
          <button
            type="button"
            onClick={() => setRequested("callback")}
            className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
          >
            <PhoneCall size={16} />
            Request Callback
          </button>
        </div>
      )}
    </section>
  );
}
