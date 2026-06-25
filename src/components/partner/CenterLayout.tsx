import { type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, CalendarDays, ScanLine, MessageSquare,
  CalendarRange, Settings2, LogOut, ChevronRight, Bell, Store,
} from "lucide-react";
import Logo from "../Logo";
import { usePartner } from "../../context/PartnerContext";

const NAV = [
  { href: "/partner/center/overview",  label: "Dashboard",       icon: LayoutDashboard },
  { href: "/partner/center/bookings",  label: "Bookings",        icon: CalendarDays,  badge: "12" },
  { href: "/partner/center/checkin",   label: "Guest Check-in",  icon: ScanLine,      badge: "4", badgeColor: "emerald" },
  { href: "/partner/center/requests",  label: "Special Requests",icon: MessageSquare, badge: "2", badgeColor: "amber" },
  { href: "/partner/center/calendar",  label: "Calendar",        icon: CalendarRange  },
  { href: "/partner/settings",         label: "Settings",        icon: Settings2      },
];

interface Props { children: ReactNode; title?: string; subtitle?: string; }

export default function CenterLayout({ children, title, subtitle }: Props) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { partner, signout } = usePartner();

  function handleSignout() { signout(); navigate("/partner/signin"); }

  const BADGE_COLORS: Record<string, string> = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-400",
    blue: "bg-[#2563EB]",
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F1F5F9]">
      {/* Sidebar */}
      <aside className="flex w-[220px] shrink-0 flex-col bg-[#0F172A]">
        {/* Logo + Center name */}
        <div className="border-b border-white/8 px-4 py-4">
          <div className="flex items-center gap-2.5">
            <Logo height={24} />
            <div>
              <span className="block text-[9px] font-bold uppercase tracking-[0.15em] text-[#475569]">Partner Hub</span>
              <div className="mt-0.5 flex items-center gap-1">
                <Store size={9} className="text-[#60A5FA]" />
                <span className="text-[10px] font-bold text-[#60A5FA]">Center Portal</span>
              </div>
            </div>
          </div>
          {/* Center pill */}
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/5 px-2.5 py-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#2563EB]/20 text-[10px] font-bold text-[#60A5FA]">
              {(partner?.businessName ?? "C").charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-bold text-white">{partner?.businessName ?? "My Center"}</p>
              <p className="text-[9px] text-[#475569]">{partner?.city ?? "—"}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2.5 pt-3">
          {NAV.map((item) => {
            const active = pathname === item.href;
            const badgeStyle = item.badgeColor ? BADGE_COLORS[item.badgeColor] : BADGE_COLORS.blue;
            return (
              <Link key={item.href} to={item.href}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all ${
                  active
                    ? "bg-[#2563EB] text-white shadow-md shadow-blue-900/40"
                    : "text-[#64748B] hover:bg-white/6 hover:text-[#CBD5E1]"
                }`}>
                <item.icon size={15} className="shrink-0" />
                <span className="flex-1 leading-none">{item.label}</span>
                {item.badge && !active && (
                  <span className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white ${badgeStyle}`}>
                    {item.badge}
                  </span>
                )}
                {active && <ChevronRight size={12} className="text-white/50" />}
              </Link>
            );
          })}
        </nav>

        {/* Profile */}
        <div className="border-t border-white/8 p-2.5">
          <div className="flex items-center gap-2.5 rounded-xl px-2.5 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white">
              {partner?.name?.charAt(0) ?? "P"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-[#CBD5E1]">{partner?.name ?? "Partner"}</p>
              <p className="truncate text-[10px] text-[#475569]">Center Manager</p>
            </div>
            <button onClick={handleSignout} title="Sign out"
              className="shrink-0 text-[#475569] transition-colors hover:text-[#EF4444]">
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Topbar with live indicator */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#E2E8F0] bg-white px-6">
          <div>
            <h1 className="text-[15px] font-bold leading-none text-[#0F172A]">{title ?? "Dashboard"}</h1>
            {subtitle && <p className="mt-0.5 text-xs text-[#94A3B8]">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2.5">
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[10px] font-bold text-emerald-600">Live</span>
            </div>
            <button className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-[#E2E8F0] text-[#64748B] transition-colors hover:bg-[#F8FAFC]">
              <Bell size={14} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-1 ring-white" />
            </button>
            <div className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] text-[9px] font-bold text-white">
                {partner?.name?.charAt(0) ?? "P"}
              </div>
              <span className="text-[12px] font-semibold text-[#0F172A]">{partner?.name ?? "Partner"}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5">{children}</main>
      </div>
    </div>
  );
}
