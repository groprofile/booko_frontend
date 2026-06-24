import { BadgePercent, CalendarCheck, ShieldCheck, Zap } from "lucide-react";
import SectionLabel from "./SectionLabel";

const benefits = [
  {
    icon: Zap,
    title: "Instant Confirmation",
    description: "Your day pass is confirmed the moment you book — no waiting, no follow-up calls.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Workspaces",
    description: "Every workspace on Bokko is personally verified for quality, safety and amenities.",
  },
  {
    icon: CalendarCheck,
    title: "Flexible Bookings",
    description: "Change your plans easily — reschedule or switch seating types with no hassle.",
  },
  {
    icon: BadgePercent,
    title: "Best Price Guarantee",
    description: "We negotiate directly with brands so you always get the best available rate.",
  },
];

export default function WhyBookWithBokko() {
  return (
    <section>
      <SectionLabel title="Why Book With Bokko?" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {benefits.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-[20px] border border-[#E2E8F0] bg-white p-6 shadow-soft transition-shadow hover:shadow-soft-lg"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
              <Icon size={22} strokeWidth={1.8} />
            </span>
            <p className="mt-4 text-base font-bold text-[#0F172A]">{title}</p>
            <p className="mt-1.5 text-sm text-[#64748B]">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
