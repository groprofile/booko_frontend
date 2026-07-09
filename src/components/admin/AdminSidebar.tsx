import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Building2, ClipboardCheck, MapPin, CalendarDays,
  Users, TrendingUp, Banknote, Tag, Headphones, Settings,
  ChevronLeft, ChevronRight, LogOut, ShieldCheck,
  RotateCcw, UserCog, CreditCard, ScrollText, Percent, Megaphone,
} from "lucide-react";
import { useAdmin, ROLE_LABELS, type AdminRole } from "../../context/AdminContext";
import Logo from "../Logo";

const ROLE_COLORS: Record<AdminRole, string> = {
  super_admin: "#2563EB",
  operations_admin: "#059669",
  finance_admin: "#7C3AED",
  support_admin: "#D97706",
  sales_admin: "#DC2626",
  content_admin: "#64748B",
};

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
  permission: string;
}

const NAV: NavItem[] = [
  { label: "Dashboard",         to: "/admin/dashboard",         icon: LayoutDashboard, permission: "dashboard" },
  { label: "Vendors",           to: "/admin/vendors",           icon: Building2,        permission: "vendors" },
  { label: "Approvals",         to: "/admin/vendor-approvals",  icon: ClipboardCheck,   permission: "vendor_approvals" },
  { label: "Centers",           to: "/admin/centers",           icon: MapPin,           permission: "centers" },
  { label: "Bookings",          to: "/admin/bookings",          icon: CalendarDays,     permission: "bookings" },
  { label: "Users",             to: "/admin/users",             icon: Users,            permission: "users" },
  { label: "Revenue",           to: "/admin/revenue",           icon: TrendingUp,       permission: "revenue" },
  { label: "Settlements",       to: "/admin/settlements",       icon: Banknote,         permission: "settlements" },
  { label: "Commissions",       to: "/admin/commissions",       icon: Percent,          permission: "commissions" },
  { label: "Coupons",           to: "/admin/coupons",           icon: Tag,              permission: "coupons" },
  { label: "Refunds",           to: "/admin/refunds",           icon: RotateCcw,        permission: "refunds" },
  { label: "Employees",         to: "/admin/employees",         icon: UserCog,          permission: "employees" },
  { label: "Payments",          to: "/admin/payments",          icon: CreditCard,       permission: "payments" },
  { label: "Audit Logs",        to: "/admin/audit-logs",        icon: ScrollText,       permission: "audit_logs" },
  { label: "Support",           to: "/admin/support",           icon: Headphones,       permission: "support" },
  { label: "Announcements",     to: "/admin/announcements",     icon: Megaphone,        permission: "announcements" },
  { label: "Settings",          to: "/admin/settings",          icon: Settings,         permission: "settings" },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export default function AdminSidebar({ collapsed, onToggle }: Props) {
  const location = useLocation();
  const { admin, logout, hasPermission } = useAdmin();
  const roleColor = admin ? ROLE_COLORS[admin.role] : "#2563EB";

  return (
    <aside
      className="relative flex h-screen shrink-0 flex-col border-r border-[#1E2D45] bg-[#0F172A] transition-all duration-200"
      style={{ width: collapsed ? 64 : 232 }}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-[#1E2D45] px-4">
        {!collapsed && (
          <div className="flex flex-1 items-center gap-2.5">
            <Logo height={28} variant="light" />
            <span className="rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#2563EB] bg-[#2563EB]/10">
              Admin
            </span>
          </div>
        )}
        {collapsed && (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563EB] text-white text-xs font-extrabold">
            B
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto flex h-6 w-6 items-center justify-center rounded-md text-[#475569] transition-colors hover:bg-[#1E2D45] hover:text-white"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <ul className="flex flex-col gap-0.5">
          {NAV.map((item) => {
            if (!hasPermission(item.permission)) return null;
            const active = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-[#2563EB] text-white"
                      : "text-[#94A3B8] hover:bg-[#1E2D45] hover:text-white"
                  }`}
                >
                  <item.icon size={17} className="shrink-0" />
                  {!collapsed && <span className="font-medium leading-none">{item.label}</span>}
                  {active && !collapsed && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white opacity-70" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User panel */}
      {admin && (
        <div className="border-t border-[#1E2D45] p-3">
          {!collapsed && (
            <div className="mb-2 rounded-xl bg-[#1E2D45] p-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: roleColor }}
                >
                  {admin.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-white">{admin.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <ShieldCheck size={10} style={{ color: roleColor }} />
                    <span className="text-[10px] font-medium" style={{ color: roleColor }}>
                      {ROLE_LABELS[admin.role]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            title="Logout"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#64748B] transition-colors hover:bg-[#1E2D45] hover:text-[#EF4444]"
          >
            <LogOut size={15} className="shrink-0" />
            {!collapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      )}
    </aside>
  );
}
