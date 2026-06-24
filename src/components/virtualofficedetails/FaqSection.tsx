import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqItem } from "../../data/virtualOfficeDetails";
import SectionLabel from "./SectionLabel";

interface FaqSectionProps {
  faqs: FaqItem[];
}

export default function FaqSection({ faqs }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section>
      <SectionLabel title="Frequently Asked Questions" />
      <div className="flex flex-col gap-2.5">
        {faqs.map((faq, index) => {
          const open = openIndex === index;
          return (
            <div key={faq.question} className="rounded-[16px] border border-[#E2E8F0] bg-white">
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : index)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <span>
                  <span className="block text-[11px] font-bold uppercase tracking-wide text-[#2563EB]">{faq.category}</span>
                  <span className="block text-sm font-bold text-[#0F172A]">{faq.question}</span>
                </span>
                <ChevronDown size={18} className={"shrink-0 text-[#64748B] transition-transform " + (open ? "rotate-180" : "")} />
              </button>
              {open && <p className="px-5 pb-4 text-sm text-[#64748B]">{faq.answer}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
