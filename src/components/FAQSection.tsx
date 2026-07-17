import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What can I book on Bokko?",
    answer:
      "You can book hotels, coworking spaces, day passes, meeting rooms, virtual offices and monthly passes, all from one platform.",
  },
  {
    question: "Is my payment secure?",
    answer:
      "Yes. All payments on Bokko are processed through encrypted, secure payment gateways.",
  },
  {
    question: "Will I get a GST invoice for my booking?",
    answer:
      "Yes. GST invoices are available for eligible bookings, making it easy for businesses to manage expenses.",
  },
  {
    question: "How quickly is my booking confirmed?",
    answer:
      "Most bookings on Bokko are confirmed instantly. You'll receive confirmation details immediately after payment.",
  },
  {
    question: "How do I list my hotel or workspace on Bokko?",
    answer:
      "Click on \"List Your Space\" and our partner team will guide you through onboarding your property.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="w-full bg-[#F8FAFC] py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="mt-10 flex flex-col gap-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                >
                  <span className="text-base font-semibold text-[#0F172A]">{faq.question}</span>
                  <ChevronDown
                    size={20}
                    className={
                      "shrink-0 text-[#64748B] transition-transform duration-200 " +
                      (isOpen ? "rotate-180" : "")
                    }
                  />
                </button>
                <div
                  className={
                    "grid transition-[grid-template-rows] duration-300 ease-out " +
                    (isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")
                  }
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-4 text-sm text-[#64748B] sm:px-6">{faq.answer}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
