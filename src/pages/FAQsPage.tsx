import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const faqs = [
  { q: "What is Bokko?", a: "Bokko is India's fastest-growing workspace booking platform. You can book coworking day passes, meeting rooms, virtual offices, monthly memberships and hotels across India — instantly, with no brokers." },
  { q: "How do I book a day pass?", a: "Search for your city on the Day Pass tab, choose a workspace that suits you, select the date and seat type, and complete payment. You'll receive instant confirmation with your Check-in OTP." },
  { q: "What is a Check-in OTP?", a: "A 6-digit one-time password sent to you after booking confirmation. Show it at the reception desk for contactless workspace access. It's valid for 1 hour from your check-in time." },
  { q: "Can I cancel a booking?", a: "Yes. Day passes can be cancelled up to 2 hours before check-in for a full refund. Meeting rooms up to 4 hours. See our Refund Policy for full details." },
  { q: "What is a Virtual Office?", a: "A virtual office gives your business a professional registered address in a prime location, without needing a physical office. Useful for GST registration, company registration, and mail handling." },
  { q: "Is Bokko available across India?", a: "We currently have verified workspaces in Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Pune, Noida, Ghaziabad, Greater Noida, Navi Mumbai and Kochi. We're expanding to more cities every month." },
  { q: "How do I list my workspace on Bokko?", a: "Click 'List Your Space' in the header or footer. Fill in your workspace details and our partner team will review and onboard you within 48 hours." },
  { q: "What payment methods are accepted?", a: "UPI, credit/debit cards, net banking, wallets, EMI and corporate payment. All payments are secured with SSL encryption." },
  { q: "Is there a Bokko app?", a: "Our mobile app is coming soon on Android and iOS. You can use the full-featured mobile web experience at bokkoapp.com in the meantime." },
  { q: "I have a booking issue — who do I contact?", a: "Email support@bokkoapp.com or WhatsApp +91 80080 08000. Our team typically responds within 2 hours on business days." },
];

export default function FAQsPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Header />
      <main className="flex-1">
        <div className="bg-[#0F172A] px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[860px]">
            <nav className="flex items-center gap-1.5 text-sm text-white/50">
              <Link to="/" className="hover:text-white">Home</Link>
              <ChevronRight size={14} />
              <span className="text-white">FAQs</span>
            </nav>
            <h1 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">Frequently Asked Questions</h1>
          </div>
        </div>
        <div className="mx-auto max-w-[860px] px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
                <button type="button" onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left">
                  <span className="text-sm font-bold text-[#0F172A]">{faq.q}</span>
                  <ChevronDown size={18} className={"shrink-0 text-[#94A3B8] transition-transform " + (open === i ? "rotate-180" : "")} />
                </button>
                {open === i && (
                  <div className="border-t border-[#E2E8F0] px-5 py-4">
                    <p className="text-sm leading-relaxed text-[#475569]">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-10 rounded-2xl border border-[#E2E8F0] bg-white p-6 text-center">
            <p className="text-base font-bold text-[#0F172A]">Still have questions?</p>
            <p className="mt-1 text-sm text-[#64748B]">Our support team is available 9 AM – 9 PM, Mon–Sat</p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <Link to="/contact" className="rounded-xl bg-[#2563EB] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#1d4ed8]">
                Contact Support
              </Link>
              <a href="https://wa.me/918008008000" target="_blank" rel="noreferrer"
                className="rounded-xl bg-[#25D366] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#1ebe5d]">
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
