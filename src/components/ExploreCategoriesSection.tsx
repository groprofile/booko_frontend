import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Hotel, Building2, Ticket, MonitorPlay, Briefcase, CalendarCheck, LayoutGrid, ArrowRight } from "lucide-react";
import { apiGet } from "../lib/api";

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
  sort_order: number;
}

const SLUG_ICON: Record<string, typeof Hotel> = {
  hotel: Hotel,
  coworking: Building2,
  "day-pass": Ticket,
  "meeting-room": MonitorPlay,
  "meeting-rooms": MonitorPlay,
  "virtual-office": Briefcase,
  "monthly-pass": CalendarCheck,
};

const SLUG_COLORS: Record<string, { color: string; bg: string }> = {
  hotel: { color: "#2563EB", bg: "#EFF6FF" },
  coworking: { color: "#0891B2", bg: "#ECFEFF" },
  "day-pass": { color: "#7C3AED", bg: "#F5F3FF" },
  "meeting-room": { color: "#0D9488", bg: "#F0FDFA" },
  "meeting-rooms": { color: "#0D9488", bg: "#F0FDFA" },
  "virtual-office": { color: "#D97706", bg: "#FFFBEB" },
  "monthly-pass": { color: "#16A34A", bg: "#F0FDF4" },
};

const SLUG_HREF: Record<string, string> = {
  hotel: "/hotels",
  coworking: "/coworking-spaces",
  "day-pass": "/day-pass",
  "meeting-room": "/meeting-rooms",
  "meeting-rooms": "/meeting-rooms",
  "virtual-office": "/virtual-office",
  "monthly-pass": "/monthly-pass",
};

export default function ExploreCategoriesSection() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    apiGet<CategoryRow[]>("/categories")
      .then((rows) => {
        if (!cancelled) setCategories(rows);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => { cancelled = true; };
  }, []);

  if (categories.length === 0) return null;

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
            to="/coworking-spaces"
            className="hidden items-center gap-1 text-sm font-semibold text-[#2563EB] hover:underline sm:flex"
          >
            View all <ArrowRight size={15} />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const Icon = SLUG_ICON[cat.slug] ?? LayoutGrid;
            const { color, bg } = SLUG_COLORS[cat.slug] ?? { color: "#2563EB", bg: "#EFF6FF" };
            const href = SLUG_HREF[cat.slug] ?? "/coworking-spaces";
            return (
              <Link
                key={cat.id}
                to={href}
                className="group flex items-center gap-5 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#BFDBFE] hover:shadow-md"
              >
                <span
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                  style={{ background: bg }}
                >
                  <Icon size={26} style={{ color }} strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <p className="text-base font-bold text-[#0F172A]">{cat.name}</p>
                  {cat.description && (
                    <p className="mt-0.5 text-sm leading-snug text-[#64748B]">{cat.description}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-5 flex justify-center sm:hidden">
          <Link
            to="/coworking-spaces"
            className="flex items-center gap-1 text-sm font-semibold text-[#2563EB] hover:underline"
          >
            View all categories <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
