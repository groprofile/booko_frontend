import {
  CalendarDays, TrendingUp, Building2, Users, Banknote, AlertCircle,
  MapPin, UserPlus, XCircle, RefreshCw, Clock, CheckCircle2,
  ArrowUpRight, Zap,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import MetricCard from "../../components/admin/MetricCard";
import { LineAreaChart, BarChart } from "../../components/admin/Charts";
import { useAdmin, MONTHLY_REVENUE, MONTHLY_BOOKINGS, CATEGORY_REVENUE, CITY_BOOKINGS } from "../../context/AdminContext";

const fmt = (n: number) =>
  n >= 10000000 ? `₹${(n / 10000000).toFixed(2)} Cr` : n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  booking: CalendarDays, vendor: Building2, payment: Banknote,
  refund: RefreshCw, user: Users, center: MapPin, approval: CheckCircle2, kyc: AlertCircle,
};

const ACTIVITY_COLORS: Record<string, string> = {
  booking: "#2563EB", vendor: "#7C3AED", payment: "#059669",
  refund: "#D97706", user: "#64748B", center: "#0891B2", approval: "#16A34A", kyc: "#DC2626",
};

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AdminDashboardPage() {
  const { vendors, bookings, users, settlements, activity, tickets } = useAdmin();

  const totalRevenue = bookings.filter((b) => b.paymentStatus === "paid").reduce((a, b) => a + b.amount, 0);
  const todayBookings = bookings.filter((b) => b.date === "2026-06-23").length;
  const todayRevenue = bookings.filter((b) => b.date === "2026-06-23" && b.paymentStatus === "paid").reduce((a, b) => a + b.amount, 0);
  const activeVendors = vendors.filter((v) => v.status === "approved").length;
  const pendingVendors = vendors.filter((v) => v.status === "pending" || v.status === "under_review").length;
  const activeCenters = 8;
  const newUsers = users.filter((u) => u.signupDate >= "2026-06-01").length;
  const cancelledBookings = bookings.filter((b) => b.bookingStatus === "cancelled").length;
  const refundRequests = bookings.filter((b) => b.refundStatus === "requested").length;
  const pendingSettlements = settlements.filter((s) => s.status === "pending").reduce((a, s) => a + s.netPayable, 0);
  const openTickets = tickets.filter((t) => t.status === "open").length;

  const METRICS = [
    { label: "Total Bookings",       value: bookings.length.toString(),     sub: `${todayBookings} today`,            trend: 12,  icon: CalendarDays, iconColor: "#2563EB", iconBg: "#EFF6FF",   accent: "#2563EB" },
    { label: "Total Revenue",        value: fmt(totalRevenue),              sub: `${fmt(todayRevenue)} today`,         trend: 18,  icon: TrendingUp,   iconColor: "#16A34A", iconBg: "#DCFCE7",   accent: "#16A34A" },
    { label: "Active Vendors",       value: activeVendors.toString(),       sub: `${pendingVendors} pending review`,   trend: 8,   icon: Building2,    iconColor: "#7C3AED", iconBg: "#F3E8FF",   accent: "#7C3AED" },
    { label: "Active Centers",       value: activeCenters.toString(),       sub: "1 pending approval",                 trend: 5,   icon: MapPin,       iconColor: "#0891B2", iconBg: "#E0F2FE",   accent: "#0891B2" },
    { label: "New Users (Jun)",      value: newUsers.toString(),            sub: `${users.length} total users`,        trend: 22,  icon: UserPlus,     iconColor: "#D97706", iconBg: "#FEF3C7",   accent: "#D97706" },
    { label: "Open Tickets",         value: openTickets.toString(),         sub: `${tickets.length} total tickets`,    trend: -5,  icon: AlertCircle,  iconColor: "#DC2626", iconBg: "#FEE2E2",   accent: "#DC2626" },
    { label: "Cancelled Bookings",   value: cancelledBookings.toString(),   sub: `${refundRequests} refund pending`,   trend: -3,  icon: XCircle,      iconColor: "#64748B", iconBg: "#F1F5F9",   accent: "#64748B" },
    { label: "Pending Settlements",  value: fmt(pendingSettlements),        sub: "Due by Jun 30",                      trend: -8,  icon: Clock,        iconColor: "#D97706", iconBg: "#FEF9C3",   accent: "#D97706" },
  ];

  return (
    <AdminLayout title="Dashboard" subtitle={`Good morning, Arjun · ${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}`}>
      {/* Alert banner */}
      {pendingVendors > 0 && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3">
          <Zap size={16} className="text-[#D97706] shrink-0" />
          <p className="text-sm text-[#92400E]">
            <span className="font-bold">{pendingVendors} vendor{pendingVendors > 1 ? "s" : ""}</span> pending review. Review and approve to keep onboarding momentum.
          </p>
          <a href="/admin/vendor-approvals" className="ml-auto flex items-center gap-1 text-xs font-bold text-[#D97706] hover:underline">
            Review <ArrowUpRight size={12} />
          </a>
        </div>
      )}

      {/* KPI grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((m) => <MetricCard key={m.label} {...m} />)}
      </div>

      {/* Charts row */}
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {/* Revenue trend */}
        <div className="col-span-2 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-[#0F172A]">Revenue Trend</p>
              <p className="text-xs text-[#94A3B8]">Monthly gross revenue (₹ Lakhs) — last 12 months</p>
            </div>
            <div className="rounded-lg bg-[#EFF6FF] px-2.5 py-1 text-xs font-bold text-[#2563EB]">+18% MoM</div>
          </div>
          <LineAreaChart data={MONTHLY_REVENUE} color="#2563EB" height={200} prefix="₹" suffix="L" />
        </div>

        {/* Category revenue */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <p className="mb-1 text-sm font-bold text-[#0F172A]">Revenue by Category</p>
          <p className="mb-4 text-xs text-[#94A3B8]">Percentage of total revenue</p>
          <BarChart data={CATEGORY_REVENUE} />
        </div>
      </div>

      {/* Second chart row */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {/* Booking trend */}
        <div className="col-span-2 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-[#0F172A]">Booking Trend</p>
              <p className="text-xs text-[#94A3B8]">Monthly total bookings — last 12 months</p>
            </div>
            <div className="rounded-lg bg-[#DCFCE7] px-2.5 py-1 text-xs font-bold text-[#15803D]">+11% MoM</div>
          </div>
          <LineAreaChart data={MONTHLY_BOOKINGS} color="#16A34A" height={200} />
        </div>

        {/* City distribution */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <p className="mb-1 text-sm font-bold text-[#0F172A]">City-wise Bookings</p>
          <p className="mb-4 text-xs text-[#94A3B8]">Share of total bookings</p>
          <div className="flex flex-col gap-3">
            {CITY_BOOKINGS.map((c, i) => {
              const colors = ["#2563EB", "#7C3AED", "#059669", "#D97706", "#DC2626", "#64748B"];
              return (
                <div key={c.city}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-[#0F172A]">{c.city}</span>
                    <span className="font-bold text-[#0F172A]">{c.pct}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#F1F5F9]">
                    <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: colors[i] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom row: Activity + Top vendors */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* Recent activity */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm font-bold text-[#0F172A]">Recent Activity</p>
          <ul className="flex flex-col gap-0">
            {activity.slice(0, 8).map((log, i) => {
              const Icon = ACTIVITY_ICONS[log.type] ?? CalendarDays;
              const color = ACTIVITY_COLORS[log.type] ?? "#64748B";
              return (
                <li key={log.id} className="relative flex gap-3 pb-4">
                  {i < 7 && <div className="absolute left-4 top-8 h-full w-px bg-[#E2E8F0]" />}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: color + "18" }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#0F172A]">{log.description}</p>
                    {log.meta && <p className="mt-0.5 text-[11px] text-[#94A3B8]">{log.meta}</p>}
                  </div>
                  <span className="shrink-0 text-[10px] text-[#94A3B8]">{timeAgo(log.timestamp)}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Top vendors */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm font-bold text-[#0F172A]">Top Performing Vendors</p>
          <div className="flex flex-col gap-0">
            {vendors
              .filter((v) => v.status === "approved")
              .sort((a, b) => b.totalRevenue - a.totalRevenue)
              .slice(0, 6)
              .map((v, i) => (
                <div key={v.id} className="flex items-center gap-3 border-b border-[#F8FAFC] py-3 last:border-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0F172A] text-[11px] font-extrabold text-white">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-[#0F172A]">{v.businessName}</p>
                    <p className="text-[11px] text-[#94A3B8]">{v.city} · {v.businessType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#0F172A]">{fmt(v.totalRevenue)}</p>
                    <p className="text-[11px] text-[#94A3B8]">{v.totalBookings} bookings</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
