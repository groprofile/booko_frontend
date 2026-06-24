import { CheckCircle2 } from "lucide-react";

const benefits = [
  "Instant Confirmation",
  "Fully Equipped Rooms",
  "Corporate Billing",
  "Best Hourly Pricing",
];

export default function PromoBanner() {
  return (
    <div className="cta-gradient flex flex-col items-start gap-5 rounded-[24px] p-8 text-white sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-xl font-extrabold sm:text-2xl">Professional Spaces For Productive Meetings</h3>
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-1.5 text-sm font-medium text-white/90">
              <CheckCircle2 size={15} />
              {benefit}
            </li>
          ))}
        </ul>
      </div>
      <a
        href="#top"
        className="shrink-0 rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#2563EB] transition-transform hover:scale-[1.03]"
      >
        Explore Meeting Rooms
      </a>
    </div>
  );
}
