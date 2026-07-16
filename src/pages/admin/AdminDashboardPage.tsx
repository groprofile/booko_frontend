import { useEffect, useState } from "react";
import {
  CalendarDays, TrendingUp, Building2, Users, AlertCircle,
  MapPin, XCircle, Clock, ArrowUpRight, Zap, ScrollText, User,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import MetricCard from "../../components/admin/MetricCard";
import { LineAreaChart, BarChart } from "../../components/admin/Charts";
import { useAdmin } from "../../context/AdminContext";
import { apiGet, getAdminToken } from "../../lib/api";

const fmt = (n: number) =>
  n >= 10000000 ? `₹${(n / 10000000).toFixed(2)} Cr` : n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;

const CATEGORY_COLORS = ["#2563EB", "#7C3AED", "#059669", "#D97706", "#DC2626", "#64748B"];

interface Overview {
  monthly: Array<{ label: string; revenue: number; bookings: number }>;
  categoryRevenue: Array<{ label: string; value: number }>;
  cityBookings: Array<{ city: string; pct: number }>;
}

interface AuditLog {
  id: string;
  resource_type: string;
  description?: string;
  actor_name?: string;
  created_at: string;
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AdminDashboardPage() {
  const { admin, dashboardStats, vendors, bookings, users, settlements } = useAdmin();

  const [overview, setOverview] = useState<Overview | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [openTickets, setOpenTickets] = useState<number | null>(null);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    apiGet<Overview>("/admin/reports/overview", token).then(setOverview).catch(console.error);
    apiGet<{ logs: AuditLog[] }>("/admin/audit-logs?page=1&limit=8", token)
      .then((r) => setRecentLogs(r.logs ?? []))
      .catch(console.error);
    apiGet<{ total: number }>("/admin/support/tickets?status=open&limit=1", token)
      .then((r) => setOpenTickets(r.total ?? 0))
      .catch(console.error);
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const totalRevenue = dashboardStats?.totalRevenue ?? bookings.filter((b) => b.paymentStatus === "paid").reduce((a, b) => a + b.amount, 0);
  const todayBookings = dashboardStats?.todayBookings ?? bookings.filter((b) => b.date === todayStr).length;
  const activeVendors = vendors.filter((v) => v.status === "approved").length;
  const pendingVendors = dashboardStats?.pendingKyc ?? vendors.filter((v) => v.status === "pending" || v.status === "under_review").length;
  const activeCenters = dashboardStats?.totalCenters ?? 0;
  const cancelledBookings = bookings.filter((b) => b.bookingStatus === "cancelled").length;
  const refundRequests = bookings.filter((b) => b.refundStatus === "requested").length;
  const pendingSettlements = settlements.filter((s) => s.status === "pending").reduce((a, s) => a + s.netPayable, 0);
  const monthlyBookings = dashboardStats?.monthlyBookings ?? bookings.length;
  const totalUsers = dashboardStats?.totalUsers ?? users.length;

  const revenuePoints = (overview?.monthly ?? []).map((m) => ({ month: m.label, value: +(m.revenue / 100000).toFixed(2) }));
  const bookingPoints = (overview?.monthly ?? []).map((m) => ({ month: m.label, value: m.bookings }));
  const categoryTotal = (overview?.categoryRevenue ?? []).reduce((a, c) => a + c.value, 0);
  const categoryBars = (overview?.categoryRevenue ?? []).slice(0, 6).map((c, i) => ({
    label: c.label,
    value: categoryTotal > 0 ? Math.round((c.value / categoryTotal) * 100) : 0,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  const METRICS = [
    { label: "Total Bookings",      value: monthlyBookings.toString(),   sub: `${todayBookings} today`,                icon: CalendarDays, iconColor: "#2563EB", iconBg: "#EFF6FF", accent: "#2563EB" },
    { label: "Total Revenue",       value: fmt(totalRevenue),            sub: "paid bookings",                          icon: TrendingUp,   iconColor: "#16A34A", iconBg: "#DCFCE7", accent: "#16A34A" },
    { label: "Active Vendors",      value: activeVendors.toString(),     sub: `${pendingVendors} pending review`,       icon: Building2,    iconColor: "#7C3AED", iconBg: "#F3E8FF", accent: "#7C3AED" },
    { label: "Active Centers",      value: activeCenters.toString(),     sub: `${dashboardStats?.totalVendors ?? vendors.length} total vendors`, icon: MapPin, iconColor: "#0891B2", iconBg: "#E0F2FE", accent: "#0891B2" },
    { label: "Total Users",         value: totalUsers.toString(),        sub: "registered customers",                   icon: Users,        iconColor: "#D97706", iconBg: "#FEF3C7", accent: "#D97706" },
    { label: "Open Tickets",        value: openTickets != null ? openTickets.toString() : "—", sub: "support queue",   icon: AlertCircle,  iconColor: "#DC2626", iconBg: "#FEE2E2", accent: "#DC2626" },
    { label: "Cancelled Bookings",  value: cancelledBookings.toString(), sub: `${refundRequests} refund pending`,       icon: XCircle,      iconColor: "#64748B", iconBg: "#F1F5F9", accent: "#64748B" },
    { label: "Pending Settlements", value: fmt(pendingSettlements),      sub: "awaiting payout",                        icon: Clock,        iconColor: "#D97706", iconBg: "#FEF9C3", accent: "#D97706" },
  ];

  return (
    <AdminLayout title="Dashboard" subtitle={`Good morning, ${admin?.name ?? "Admin"} · ${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}`}>
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
          <div className="mb-4">
            <p className="text-sm font-bold text-[#0F172A]">Revenue Trend</p>
            <p className="text-xs text-[#94A3B8]">Monthly gross revenue (₹ Lakhs) — last 6 months</p>
          </div>
          {revenuePoints.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center text-xs text-[#94A3B8]">
              {overview ? "No revenue recorded yet" : "Loading…"}
            </div>
          ) : (
            <LineAreaChart data={revenuePoints} color="#2563EB" height={200} prefix="₹" suffix="L" />
          )}
        </div>

        {/* Category revenue */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <p className="mb-1 text-sm font-bold text-[#0F172A]">Revenue by Category</p>
          <p className="mb-4 text-xs text-[#94A3B8]">Percentage of total revenue</p>
          {categoryBars.length === 0 ? (
            <p className="py-8 text-center text-xs text-[#94A3B8]">{overview ? "No revenue recorded yet" : "Loading…"}</p>
          ) : (
            <BarChart data={categoryBars} />
          )}
        </div>
      </div>

      {/* Second chart row */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {/* Booking trend */}
        <div className="col-span-2 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-sm font-bold text-[#0F172A]">Booking Trend</p>
            <p className="text-xs text-[#94A3B8]">Monthly total bookings — last 6 months</p>
          </div>
          {bookingPoints.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center text-xs text-[#94A3B8]">
              {overview ? "No bookings recorded yet" : "Loading…"}
            </div>
          ) : (
            <LineAreaChart data={bookingPoints} color="#16A34A" height={200} />
          )}
        </div>

        {/* City distribution */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <p className="mb-1 text-sm font-bold text-[#0F172A]">City-wise Bookings</p>
          <p className="mb-4 text-xs text-[#94A3B8]">Share of total bookings</p>
          {(overview?.cityBookings ?? []).length === 0 ? (
            <p className="py-8 text-center text-xs text-[#94A3B8]">{overview ? "No bookings recorded yet" : "Loading…"}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {(overview?.cityBookings ?? []).map((c, i) => (
                <div key={c.city}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-[#0F172A]">{c.city}</span>
                    <span className="font-bold text-[#0F172A]">{c.pct}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#F1F5F9]">
                    <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: Activity + Top vendors */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* Recent activity — real admin audit trail */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm font-bold text-[#0F172A]">Recent Activity</p>
          {recentLogs.length === 0 ? (
            <p className="py-8 text-center text-xs text-[#94A3B8]">No admin activity recorded yet.</p>
          ) : (
            <ul className="flex flex-col gap-0">
              {recentLogs.map((log, i) => {
                const Icon = log.resource_type === "user" ? User : log.resource_type === "vendor" ? Building2 : ScrollText;
                const color = log.resource_type === "user" ? "#D97706" : "#7C3AED";
                return (
                  <li key={log.id} className="relative flex gap-3 pb-4">
                    {i < recentLogs.length - 1 && <div className="absolute left-4 top-8 h-full w-px bg-[#E2E8F0]" />}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: color + "18" }}>
                      <Icon size={14} style={{ color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#0F172A]">{log.description ?? "Status change"}</p>
                      {log.actor_name && <p className="mt-0.5 text-[11px] text-[#94A3B8]">by {log.actor_name}</p>}
                    </div>
                    <span className="shrink-0 text-[10px] text-[#94A3B8]">{timeAgo(log.created_at)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Top vendors */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm font-bold text-[#0F172A]">Recently Approved Vendors</p>
          {vendors.filter((v) => v.status === "approved").length === 0 ? (
            <p className="py-8 text-center text-xs text-[#94A3B8]">No approved vendors yet.</p>
          ) : (
            <div className="flex flex-col gap-0">
              {vendors
                .filter((v) => v.status === "approved")
                .slice(0, 6)
                .map((v, i) => (
                  <div key={v.id} className="flex items-center gap-3 border-b border-[#F8FAFC] py-3 last:border-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0F172A] text-[11px] font-extrabold text-white">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-[#0F172A]">{v.businessName}</p>
                      <p className="text-[11px] text-[#94A3B8]">{v.city}{v.businessType ? ` · ${v.businessType}` : ""}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-[#94A3B8]">{v.approvedAt ?? v.joinedAt}</p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
