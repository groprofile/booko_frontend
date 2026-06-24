import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, Building2, CheckCircle2, PlaneTakeoff, Users } from "lucide-react";
import SectionLabel from "./SectionLabel";

interface NearbyExperiencesSectionProps {
  citySlug: string;
}

export default function NearbyExperiencesSection({ citySlug }: NearbyExperiencesSectionProps) {
  const [transferRequested, setTransferRequested] = useState(false);

  const experiences = [
    {
      icon: Briefcase,
      title: "Coworking Spaces",
      description: "Book a day pass at a coworking space near this hotel.",
      href: `/${citySlug}/day-pass`,
    },
    {
      icon: Users,
      title: "Meeting Rooms",
      description: "Reserve an hourly meeting room nearby for your work needs.",
      href: `/${citySlug}/meeting-rooms`,
    },
    {
      icon: Building2,
      title: "Virtual Office",
      description: "Set up a registered business address in this city.",
      href: `/${citySlug}/virtual-office`,
    },
  ];

  return (
    <section>
      <SectionLabel title="Nearby Bokko Experiences" />
      <p className="mb-4 text-sm text-[#64748B]">
        Make the most of your stay — explore workspaces and services around this hotel, all bookable on Bokko.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {experiences.map(({ icon: Icon, title, description, href }) => (
          <Link
            key={title}
            to={href}
            className="group flex flex-col gap-3 rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-soft transition-shadow hover:shadow-soft-lg"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
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

        <div className="flex flex-col gap-3 rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-soft">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
            <PlaneTakeoff size={20} strokeWidth={1.8} />
          </span>
          <div>
            <p className="text-sm font-bold text-[#0F172A]">Airport Transfer</p>
            <p className="mt-1 text-xs text-[#64748B]">Request a cab to or from the airport for this stay.</p>
          </div>
          {transferRequested ? (
            <p className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[#16A34A]">
              <CheckCircle2 size={15} />
              Request received!
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setTransferRequested(true)}
              className="mt-auto inline-flex items-center gap-1 text-left text-sm font-semibold text-[#2563EB] hover:underline"
            >
              Request Transfer
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
