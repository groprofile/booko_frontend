import { Link } from "react-router-dom";
import { Hotel, Building2, Ticket, MonitorPlay, Briefcase, CalendarCheck, ArrowRight } from "lucide-react";

const categories = [
  {
    key: "hotels",
    label: "Hotels",
    description: "Curated stays across India, verified for quality and comfort.",
    icon: Hotel,
    href: "/mumbai/hotels",
    color: "#2563EB",
    bg: "#EFF6FF",
  },
  {
    key: "coworking",
    label: "Coworking",
    description: "Flexible desks and offices in premium business hubs.",
    icon: Building2,
    href: "/mumbai/coworking-spaces",
    color: "#0891B2",
    bg: "#ECFEFF",
  },
  {
    key: "day-pass",
    label: "Day Pass",
    description: "Drop-in access to workspaces, by the day.",
    icon: Ticket,
    href: "/mumbai/day-pass",
    color: "#7C3AED",
    bg: "#F5F3FF",
  },
  {
    key: "meeting-rooms",
    label: "Meeting Rooms",
    description: "Book professional meeting spaces by the hour.",
    icon: MonitorPlay,
    href: "/mumbai/meeting-rooms",
    color: "#0D9488",
    bg: "#F0FDFA",
  },
  {
    key: "virtual-office",
    label: "Virtual Office",
    description: "A registered business address without the overhead.",
    icon: Briefcase,
    href: "/mumbai/virtual-office",
    color: "#D97706",
    bg: "#FFFBEB",
  },
  {
    key: "monthly-pass",
    label: "Monthly Pass",
    description: "Unlimited monthly access to workspaces near you.",
    icon: CalendarCheck,
    href: "/mumbai/monthly-pass",
    color: "#16A34A",
    bg: "#F0FDF4",
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
              Everything you need to work, stay and meet — in one place.
            </p>
          </div>
          <Link
            to="/mumbai/coworking-spaces"
            className="hidden items-center gap-1 text-sm font-semibold text-[#2563EB] hover:underline sm:flex"
          >
            View all <ArrowRight size={15} />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.key}
                to={cat.href}
                className="group flex items-center gap-5 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:shadow-md"
              >
                <span
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                  style={{ background: cat.bg }}
                >
                  <Icon size={26} style={{ color: cat.color }} strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <p className="text-base font-bold text-[#0F172A]">{cat.label}</p>
                  <p className="mt-0.5 text-sm leading-snug text-[#64748B]">{cat.description}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-5 flex justify-center sm:hidden">
          <Link
            to="/mumbai/coworking-spaces"
            className="flex items-center gap-1 text-sm font-semibold text-[#2563EB] hover:underline"
          >
            View all categories <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
