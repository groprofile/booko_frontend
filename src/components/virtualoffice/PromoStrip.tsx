import { MessageCircleQuestion, Receipt, Tag } from "lucide-react";

const promos = [
  { icon: Tag, title: "Plans Starting ₹999/month", subtitle: "Virtual Office for every business" },
  { icon: Receipt, title: "GST Registration Support", subtitle: "Get registered, hassle-free" },
  { icon: MessageCircleQuestion, title: "Free Consultation", subtitle: "Talk to a Bokko expert today" },
];

export default function PromoStrip() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {promos.map(({ icon: Icon, title, subtitle }) => (
        <div key={title} className="cta-gradient flex flex-col gap-2 rounded-2xl p-4 text-white shadow-soft">
          <Icon size={20} />
          <p className="text-sm font-bold">{title}</p>
          <p className="text-xs text-white/85">{subtitle}</p>
        </div>
      ))}
    </div>
  );
}
