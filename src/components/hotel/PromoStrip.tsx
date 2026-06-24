import { CalendarHeart, Laptop, Percent, Sparkles } from "lucide-react";

const promos = [
  { icon: Percent, title: "Flat 20% OFF", subtitle: "On your first hourly booking" },
  { icon: Sparkles, title: "Hourly Stay Deals", subtitle: "Starting ₹399 only" },
  { icon: CalendarHeart, title: "Weekend Special", subtitle: "Extra 10% off, Fri-Sun" },
  { icon: Laptop, title: "Workcation Offers", subtitle: "Stay, work & relax" },
];

export default function PromoStrip() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {promos.map(({ icon: Icon, title, subtitle }) => (
        <div
          key={title}
          className="cta-gradient flex flex-col gap-2 rounded-2xl p-4 text-white shadow-soft"
        >
          <Icon size={20} />
          <p className="text-sm font-bold">{title}</p>
          <p className="text-xs text-white/85">{subtitle}</p>
        </div>
      ))}
    </div>
  );
}
