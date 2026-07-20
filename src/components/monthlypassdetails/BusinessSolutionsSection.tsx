import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Armchair, Briefcase, Building2, CheckCircle2, Hotel, Layers, PlaneTakeoff } from "lucide-react";
import SectionLabel from "./SectionLabel";

interface BusinessSolutionsSectionProps {
  citySlug: string;
}

export default function BusinessSolutionsSection({ citySlug }: BusinessSolutionsSectionProps) {
  const [managedOfficeRequested, setManagedOfficeRequested] = useState(false);
  const [travelRequested, setTravelRequested] = useState(false);

  const solutions = [
    { icon: Armchair, title: "Day Pass", description: "Try a workspace before committing to a membership.", href: `/${citySlug}/day-pass` },
    { icon: Briefcase, title: "Meeting Rooms", description: "Book an hourly meeting room nearby.", href: `/${citySlug}/meeting-rooms` },
    { icon: Building2, title: "Virtual Office", description: "Get a GST-ready business address.", href: `/${citySlug}/virtual-office` },
    { icon: Layers, title: "Private Cabin", description: "Need privacy? Book a private cabin.", href: `/${citySlug}/day-pass` },
    { icon: Hotel, title: "Hourly Hotel", description: "Short stays nearby, billed by the hour.", href: `/${citySlug}/hourly-hotels` },
  ];

  return (
    <section className="m-0">
      <SectionLabel title="Bokko Business Solutions" />
      <p className="mb-4 text-sm text-[#64748B]">Everything your business needs, all bookable on Bokko.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {solutions.map(({ icon: Icon, title, description, href }) => (
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
            <Building2 size={20} strokeWidth={1.8} />
          </span>
          <div>
            <p className="text-sm font-bold text-[#0F172A]">Managed Office</p>
            <p className="mt-1 text-xs text-[#64748B]">Fully managed private office for your team.</p>
          </div>
          {managedOfficeRequested ? (
            <p className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[#16A34A]">
              <CheckCircle2 size={15} />
              Request received!
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setManagedOfficeRequested(true)}
              className="mt-auto inline-flex items-center gap-1 text-left text-sm font-semibold text-[#2563EB] hover:underline"
            >
              Request Details
              <ArrowRight size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-sm border border-dashed border-[#2563EB]/40 bg-[#EFF6FF] p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-white text-[#2563EB]">
            <PlaneTakeoff size={20} strokeWidth={1.8} />
          </span>
          <div>
            <p className="text-sm font-bold text-[#0F172A]">Business Travel</p>
            <p className="mt-1 text-xs text-[#64748B]">Travel & stay support for your visiting team.</p>
          </div>
          {travelRequested ? (
            <p className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[#16A34A]">
              <CheckCircle2 size={15} />
              Request received!
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setTravelRequested(true)}
              className="mt-auto inline-flex items-center gap-1 text-left text-sm font-semibold text-[#2563EB] hover:underline"
            >
              Request Details
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
