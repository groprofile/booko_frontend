import {
  Briefcase,
  Building2,
  FileCheck2,
  Headphones,
  Mail,
  MessageCircle,
  Package,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import SectionLabel from "./SectionLabel";

const iconMap: Record<string, typeof Mail> = {
  "GST Registration Address": FileCheck2,
  "Business Address": Building2,
  "Mail Handling": Mail,
  "Courier Handling": Package,
  "Company Registration Support": Briefcase,
  "Dedicated Support": Headphones,
  "Meeting Room Access": Users,
  "Coworking Access": Users,
  "Reception Services": UserRound,
  "Business Correspondence": MessageCircle,
  "Government Compliance Ready": ShieldCheck,
};

interface WhyThisOfficeSectionProps {
  items: string[];
}

export default function WhyThisOfficeSection({ items }: WhyThisOfficeSectionProps) {
  return (
    <section className="m-0">
      <SectionLabel title="Why This Virtual Office" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((label) => {
          const Icon = iconMap[label] ?? ShieldCheck;
          return (
            <div
              key={label}
              className="flex flex-col items-center gap-2 rounded-sm border border-[#E2E8F0] bg-white px-3 py-5 text-center shadow-soft transition-shadow hover:shadow-soft-lg"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-[#EFF6FF] text-[#2563EB]">
                <Icon size={20} strokeWidth={1.8} />
              </span>
              <p className="text-sm font-semibold text-[#0F172A]">{label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
