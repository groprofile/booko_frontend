import { type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Building2, CalendarDays, TrendingUp,
  Users, Settings, LogOut, ChevronRight, Bell, Crown,
  Banknote,
} from "lucide-react";
import Logo from "../Logo";
import ToastContainer from "../admin/Toast";
import { usePartner } from "../../context/PartnerContext";

const NAV = [
  { href: "/partner/dashboard",    label: "Overview",     icon: LayoutDashboard },
  { href: "/partner/centers",      label: "Centers",      icon: Building2       },
  { href: "/partner/bookings",     label: "All Bookings", icon: CalendarDays    },
  { href: "/partner/revenue",      label: "Revenue",      icon: TrendingUp      },
  { href: "/partner/settlements",  label: "Settlements",  icon: Banknote        },
  { href: "/partner/team",         label: "Team Access",  icon: Users           },
  { href: "/partner/settings",     label: "Settings",     icon: Settings        },
];

interface Props { children: ReactNode; title?: string; subtitle?: string; }

export default function SuperPartnerLayout({ children, title, subtitle }: Props) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { partner, signout } = usePartner();

  function handleSignout() { signout(); navigate("/partner/signin"); }

  return (
    <div className="app-wash flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="relative flex w-[220px] shrink-0 flex-col bg-[#0F172A]">
        {/* Brand glow behind the logo header */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(60%_80%_at_20%_0%,rgba(37,99,235,0.35),transparent_70%),radial-gradient(50%_70%_at_90%_0%,rgba(6,182,212,0.22),transparent_70%)]" />
        {/* Logo area */}
        <div className="relative flex items-center gap-3 border-b border-white/8 px-4 py-4">
          <Logo height={26} />
          <div>
            <span className="block text-[9px] font-bold uppercase tracking-[0.15em] text-[#475569]">Partner Hub</span>
            <div className="mt-0.5 flex items-center gap-1">
              <Crown size={9} className="text-[#FBBF24]" />
              <span className="text-[10px] font-bold text-[#FBBF24]">Super Partner</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="relative flex flex-1 flex-col gap-0.5 overflow-y-auto p-2.5 pt-3">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} to={item.href}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all ${
                  active
                    ? "cta-gradient text-white shadow-md shadow-blue-900/40"
                    : "text-[#64748B] hover:bg-white/6 hover:text-[#CBD5E1]"
                }`}>
                <item.icon size={15} className="shrink-0" />
                <span className="flex-1 leading-none">{item.label}</span>
                {active && <ChevronRight size={12} className="text-white/50" />}
              </Link>
            );
          })}
        </nav>

        {/* Profile */}
        <div className="border-t border-white/8 p-2.5">
          <div className="flex items-center gap-2.5 rounded-xl px-2.5 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-xs font-bold text-white">
              {partner?.name?.charAt(0) ?? "P"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-[#CBD5E1]">{partner?.name ?? "Partner"}</p>
              <p className="truncate text-[10px] text-[#475569]">{partner?.businessName ?? ""}</p>
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
        {/* Topbar */}
        <header className="glass-panel z-20 flex h-14 shrink-0 items-center justify-between border-b border-white/40 px-6">
          <div>
            <h1 className="text-[15px] font-bold leading-none text-[#0F172A]">{title ?? "Dashboard"}</h1>
            {subtitle && <p className="mt-0.5 text-xs text-[#94A3B8]">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2.5">
            <button className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-[#E2E8F0] text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#0F172A]">
              <Bell size={14} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-1 ring-white" />
            </button>
            <div className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white/70 px-3 py-1.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-[9px] font-bold text-white">
                {partner?.name?.charAt(0) ?? "P"}
              </div>
              <span className="text-[12px] font-semibold text-[#0F172A]">{partner?.name ?? "Partner"}</span>
              <Crown size={10} className="text-[#FBBF24]" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5">{children}</main>
      </div>
      <ToastContainer />
    </div>
  );
}
