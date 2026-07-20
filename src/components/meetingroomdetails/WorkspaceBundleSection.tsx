import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Armchair,
  Briefcase,
  Building2,
  CheckCircle2,
  Hotel,
  Layers,
  Users,
} from "lucide-react";
import SectionLabel from "./SectionLabel";

interface WorkspaceBundleSectionProps {
  citySlug: string;
}

export default function WorkspaceBundleSection({ citySlug }: WorkspaceBundleSectionProps) {
  const [comboRequested, setComboRequested] = useState(false);

  const bundles = [
    { icon: Armchair, title: "Day Pass", description: "Book a coworking day pass nearby.", href: `/${citySlug}/day-pass` },
    { icon: Briefcase, title: "Coworking Desk", description: "Reserve a dedicated desk for the day.", href: `/${citySlug}/day-pass` },
    { icon: Layers, title: "Private Cabin", description: "Need privacy? Book a private cabin.", href: `/${citySlug}/day-pass` },
    { icon: Building2, title: "Virtual Office", description: "Set up a registered business address.", href: `/${citySlug}/virtual-office` },
    { icon: Hotel, title: "Hourly Hotel", description: "Need a short stay nearby? Book by the hour.", href: `/${citySlug}/hourly-hotels` },
    { icon: Users, title: "Corporate Stay", description: "Business hotels for your visiting team.", href: `/${citySlug}/business-hotels` },
  ];

  return (
    <section className="m-0">
      <SectionLabel title="Complete Your Workspace Bundle" />
      <p className="mb-4 text-sm text-[#64748B]">
        Pair this meeting room with other Bokko products for your visit — all bookable in one place.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {bundles.map(({ icon: Icon, title, description, href }) => (
          <Link
            key={title}
            to={href}
            className="group flex flex-col gap-3 rounded-sm border border-[#E2E8F0] bg-white p-5 shadow-soft transition-shadow hover:shadow-soft-lg"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-[#EFF6FF] text-[#2563EB]">
              <Icon size={20} strokeWidth={1.8} />
            </span>
            <div>
              <p className="text-sm font-bold text-[#0F172A]">{title}</p>
              <p className="mt-1 text-xs text-[#64748B]">{description}</p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-[#2563EB] group-hover:underline">
              Explore
              <ArrowRight size={14} />
            </span>
          </Link>
        ))}

        <div className="flex flex-col gap-3 rounded-sm border border-dashed border-[#2563EB]/40 bg-[#EFF6FF] p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-white text-[#2563EB]">
            <Layers size={20} strokeWidth={1.8} />
          </span>
          <div>
            <p className="text-sm font-bold text-[#0F172A]">Meeting Room + Day Pass Combo</p>
            <p className="mt-1 text-xs text-[#64748B]">Get a discounted combo for your full team's day.</p>
          </div>
          {comboRequested ? (
            <p className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[#16A34A]">
              <CheckCircle2 size={15} />
              Request received!
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setComboRequested(true)}
              className="mt-auto inline-flex items-center gap-1 text-left text-sm font-semibold text-[#2563EB] hover:underline"
            >
              Request Combo Deal
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
