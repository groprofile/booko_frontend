import { Link } from "react-router-dom";
import { Building2, Ticket, MonitorPlay, Briefcase, ArrowRight } from "lucide-react";

// The four offerings Bokko promotes to customers. Curated (not read from
// /categories): the DB categories are a vendor-onboarding concept — the
// customer-facing catalog is exactly these products.
const OFFERINGS = [
  {
    slug: "coworking",
    name: "Coworking Spaces",
    description: "Full-service workspaces with desks, cabins and community.",
    icon: Building2,
    color: "#0891B2",
    bg: "#ECFEFF",
    href: "/coworking-spaces",
  },
  {
    slug: "day-pass",
    name: "Day Pass",
    description: "Walk in and work for a day — no commitment, all amenities.",
    icon: Ticket,
    color: "#7C3AED",
    bg: "#F5F3FF",
    href: "/day-pass",
  },
  {
    slug: "meeting-room",
    name: "Meeting Rooms",
    description: "Book professional rooms by the hour for teams and clients.",
    icon: MonitorPlay,
    color: "#0D9488",
    bg: "#F0FDFA",
    href: "/meeting-rooms",
  },
  {
    slug: "virtual-office",
    name: "Virtual Office",
    description: "GST-ready business address with mail handling and compliance.",
    icon: Briefcase,
    color: "#D97706",
    bg: "#FFFBEB",
    href: "/virtual-office",
  },
];

export default function ExploreCategoriesSection() {
  return (
    <section className="w-full bg-[#F8FAFC] py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#111111] sm:text-3xl">
              Explore Categories
            </h2>
            <p className="mt-2 text-sm text-[#64748B] sm:text-base">
              Everything you need to work and meet — in one place.
            </p>
          </div>
          <Link
            to="/coworking-spaces"
            className="hidden items-center gap-1 text-sm font-semibold text-[#2563EB] hover:underline sm:flex"
          >
            View all <ArrowRight size={15} />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {OFFERINGS.map(({ slug, name, description, icon: Icon, color, bg, href }) => (
            <Link
              key={slug}
              to={href}
              className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,42,0.10)]"
            >
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
                style={{ background: bg }}
              >
                <Icon size={26} style={{ color }} strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-base font-extrabold text-[#0F172A]">{name}</p>
                <p className="mt-1 line-clamp-2 text-sm leading-snug text-[#64748B]">{description}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#2563EB]">
                Explore
                <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              {/* Colored accent bar that grows on hover */}
              <span
                className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                style={{ background: color }}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
