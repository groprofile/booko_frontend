import { useState } from "react";
import { ShieldCheck, Lock, Zap } from "lucide-react";
import CategoryTabs from "./CategoryTabs";
import SearchCard from "./SearchCard";
import { productTabs } from "../data/productTabs";
import type { ProductKey } from "../types";

const trustSignals = [
  { label: "Verified Spaces", icon: ShieldCheck },
  { label: "Secure Payments", icon: Lock },
  { label: "Instant Confirmation", icon: Zap },
];

export default function Hero() {
  const [activeKey, setActiveKey] = useState<ProductKey>(productTabs[0].key);
  const activeTab = productTabs.find((tab) => tab.key === activeKey) ?? productTabs[0];

  return (
    <section className="relative z-10 w-full overflow-hidden">
      <div
        className="relative pb-12 pt-10 sm:pb-14 sm:pt-12 lg:pb-16 lg:pt-14"
        style={{ background: "linear-gradient(180deg, #F8FAFC 0%, #E0F2FE 100%)" }}
      >
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[#2563EB] opacity-[0.08] blur-[100px]"
        />
        <div
          aria-hidden="true"
          className="absolute right-0 top-1/3 h-[360px] w-[360px] translate-x-1/3 rounded-full bg-[#06B6D4] opacity-[0.10] blur-[90px]"
        />

        <div className="relative mx-auto flex max-w-[1280px] flex-col items-center px-4 text-center sm:px-6 lg:px-8 animate-fade-in-up">
          <h1 className="text-[34px] font-extrabold leading-[1.15] tracking-tight text-[#0F172A] sm:text-5xl lg:text-[64px]">
            India's All-in-One<br />
            <span className="text-[#2563EB]">Space Booking</span> Platform
          </h1>
          <p className="mt-4 max-w-2xl text-base font-medium text-[#475569] sm:text-lg">
            Find and book verified hotels, coworking spaces, meeting rooms and day passes
            across India — instantly, with no brokers, no calls, no waiting.
          </p>
        </div>

        <div className="relative z-10 mx-auto mt-10 max-w-[1280px] px-4 sm:mt-12 sm:px-6 lg:px-8 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <div className="rounded-[24px] border border-[#E2E8F0] bg-white shadow-float">
            <div className="flex justify-center overflow-x-auto p-3 sm:p-4">
              <CategoryTabs activeKey={activeKey} onSelect={setActiveKey} />
            </div>
            <div className="border-t border-[#E2E8F0]">
              <SearchCard activeTab={activeTab} />
            </div>
          </div>

          <div className="scrollbar-hide mt-8 flex items-center justify-center gap-x-6 gap-y-2 overflow-x-auto whitespace-nowrap px-2 sm:flex-wrap">
            {trustSignals.map((signal) => (
              <span
                key={signal.label}
                className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-[#475569]"
              >
                <signal.icon size={15} className="shrink-0 text-[#2563EB]" />
                {signal.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
