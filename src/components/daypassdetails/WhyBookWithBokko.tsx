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
    <section className="m-0">
      <SectionLabel title="Why Book With Bokko?" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {benefits.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-sm border border-border bg-card p-6 shadow-soft transition-all hover:shadow-soft-lg hover:border-primary-blue/20"
          >
            <span className="flex h-13 w-13 items-center justify-center rounded-sm bg-blue-50 text-primary-blue">
              <Icon size={24} strokeWidth={1.5} />
            </span>
            <p className="mt-4 text-base font-bold text-primary-text">{title}</p>
            <p className="mt-2 text-sm text-secondary-text leading-relaxed">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
