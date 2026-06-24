import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

interface Section {
  heading: string;
  body: string;
}

interface StaticPageProps {
  title: string;
  subtitle?: string;
  sections: Section[];
}

export default function StaticPage({ title, subtitle, sections }: StaticPageProps) {
  useEffect(() => { document.title = `${title} | Bokko`; }, [title]);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Header />
      <main className="flex-1">
        <div className="bg-[#0F172A] px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[860px]">
            <nav className="flex items-center gap-1.5 text-sm text-white/50">
              <Link to="/" className="hover:text-white">Home</Link>
              <ChevronRight size={14} />
              <span className="text-white">{title}</span>
            </nav>
            <h1 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">{title}</h1>
            {subtitle && <p className="mt-2 text-base text-white/60">{subtitle}</p>}
          </div>
        </div>
        <div className="mx-auto max-w-[860px] px-4 py-12 sm:px-6 lg:px-8">
          {sections.map((section, i) => (
            <div key={i} className={i > 0 ? "mt-10" : ""}>
              <h2 className="text-xl font-bold text-[#0F172A]">{section.heading}</h2>
              <p className="mt-3 text-base leading-relaxed text-[#475569] whitespace-pre-line">{section.body}</p>
            </div>
          ))}
          <div className="mt-12 rounded-2xl border border-[#E2E8F0] bg-white p-6 text-center">
            <p className="text-sm text-[#64748B]">Questions? We're here to help.</p>
            <a href="mailto:support@bokkoapp.com"
              className="mt-3 inline-block rounded-xl bg-[#2563EB] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#1d4ed8]">
              Contact Support
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
