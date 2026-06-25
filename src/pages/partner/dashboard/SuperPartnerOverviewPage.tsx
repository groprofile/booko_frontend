import { TrendingUp, Building2, CalendarDays, Star } from "lucide-react";
import SuperPartnerLayout from "../../../components/partner/SuperPartnerLayout";

interface Center {
  id: string;
  name: string;
  city: string;
  revenue: number;
  bookings: number;
  occupancy: number;
}

interface MonthlyRevenue {
  month: string;
  amount: number;
}

interface RecentBooking {
  id: string;
  guest: string;
  center: string;
  type: string;
  amount: number;
  status: "confirmed" | "checked_in" | "pending" | "cancelled" | "completed";
}

const CENTERS: Center[] = [
  { id: "c1", name: "WeWork BKC", city: "Mumbai", revenue: 128400, bookings: 84, occupancy: 78 },
  { id: "c2", name: "91Springboard HSR", city: "Bangalore", revenue: 96200, bookings: 67, occupancy: 65 },
  { id: "c3", name: "Smartworks Cyber City", city: "Gurgaon", revenue: 74800, bookings: 52, occupancy: 58 },
  { id: "c4", name: "The Hive Powai", city: "Mumbai", revenue: 0, bookings: 0, occupancy: 0 },
];

const MONTHLY_REVENUE: MonthlyRevenue[] = [
  { month: "Jan", amount: 142000 },
  { month: "Feb", amount: 168000 },
  { month: "Mar", amount: 195000 },
  { month: "Apr", amount: 221000 },
  { month: "May", amount: 258000 },
  { month: "Jun", amount: 299400 },
];

const RECENT_BOOKINGS: RecentBooking[] = [
  { id: "BK-2401", guest: "Arjun Sharma", center: "WeWork BKC", type: "Day Pass", amount: 1200, status: "confirmed" },
  { id: "BK-2402", guest: "Priya Mehta", center: "91Springboard HSR", type: "Meeting Room", amount: 3600, status: "checked_in" },
  { id: "BK-2403", guest: "Rahul Gupta", center: "Smartworks Cyber City", type: "Day Pass", amount: 800, status: "pending" },
  { id: "BK-2404", guest: "Sneha Patel", center: "WeWork BKC", type: "Meeting Room", amount: 5400, status: "completed" },
  { id: "BK-2405", guest: "Vikram Nair", center: "91Springboard HSR", type: "Day Pass", amount: 1100, status: "cancelled" },
];

const STATUS_STYLES: Record<RecentBooking["status"], string> = {
  confirmed: "bg-blue-100 text-blue-700",
  checked_in: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-slate-100 text-slate-600",
};

const STATUS_LABELS: Record<RecentBooking["status"], string> = {
  confirmed: "Confirmed",
  checked_in: "Checked In",
  pending: "Pending",
  cancelled: "Cancelled",
  completed: "Completed",
};

const CENTER_COLORS = ["bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-amber-400"];

function formatINR(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function SuperPartnerOverviewPage() {
  const totalBookings = 203;
  const activeCenters = 3;
  const avgRating = 4.83;
  const maxAmount = Math.max(...MONTHLY_REVENUE.map((m) => m.amount));
  const totalRevForShare = CENTERS.reduce((s, c) => s + c.revenue, 0);

  return (
    <SuperPartnerLayout title="Overview" subtitle="Your super-partner dashboard at a glance">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Revenue */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <TrendingUp size={20} className="text-[#2563EB]" />
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">+16%</span>
          </div>
          <p className="mt-4 text-2xl font-bold text-[#0F172A]">₹2,99,400</p>
          <p className="mt-1 text-xs text-[#64748B]">Total Revenue This Month</p>
        </div>

        {/* Bookings */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50">
              <CalendarDays size={20} className="text-violet-600" />
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">+12%</span>
          </div>
          <p className="mt-4 text-2xl font-bold text-[#0F172A]">{totalBookings}</p>
          <p className="mt-1 text-xs text-[#64748B]">Total Bookings</p>
        </div>

        {/* Active Centers */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
              <Building2 size={20} className="text-emerald-600" />
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">of 4</span>
          </div>
          <p className="mt-4 text-2xl font-bold text-[#0F172A]">{activeCenters}</p>
          <p className="mt-1 text-xs text-[#64748B]">Active Centers</p>
        </div>

        {/* Rating */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
              <Star size={20} className="text-amber-500" />
            </div>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">Excellent</span>
          </div>
          <p className="mt-4 text-2xl font-bold text-[#0F172A]">{avgRating}</p>
          <p className="mt-1 text-xs text-[#64748B]">Avg Rating Across Centers</p>
        </div>
      </div>

      {/* Revenue Row */}
      <div className="mt-5 grid grid-cols-5 gap-4">
        {/* Bar Chart — 60% */}
        <div className="col-span-3 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[#0F172A]">Monthly Revenue</h2>
          <p className="text-xs text-[#94A3B8]">Jan – Jun 2024</p>

          <div className="relative mt-5 flex h-36 items-end gap-2">
            {MONTHLY_REVENUE.map((item, idx) => {
              const pct = Math.round((item.amount / maxAmount) * 100);
              const isCurrentMonth = idx === MONTHLY_REVENUE.length - 1;
              return (
                <div key={item.month} className="flex flex-1 flex-col items-center gap-1">
                  {isCurrentMonth && (
                    <span className="text-[10px] font-semibold text-[#2563EB]">
                      {formatINR(item.amount)}
                    </span>
                  )}
                  <div className="relative w-full flex flex-col justify-end" style={{ height: "100%" }}>
                    <div
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        isCurrentMonth
                          ? "bg-[#2563EB]"
                          : "border border-[#BFDBFE] bg-[#EFF6FF]"
                      }`}
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[#94A3B8]">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue by Center — 40% */}
        <div className="col-span-2 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[#0F172A]">Revenue by Center</h2>
          <p className="text-xs text-[#94A3B8]">This month</p>

          <div className="mt-4 flex flex-col gap-3">
            {CENTERS.map((c, idx) => {
              const pct = totalRevForShare > 0 ? Math.round((c.revenue / totalRevForShare) * 100) : 0;
              return (
                <div key={c.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${CENTER_COLORS[idx]}`} />
                      <span className="text-xs font-medium text-[#0F172A]">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#0F172A]">{formatINR(c.revenue)}</span>
                      <span className="text-[10px] text-[#94A3B8]">{pct}%</span>
                    </div>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-[#F1F5F9]">
                    <div
                      className={`h-1.5 rounded-full ${CENTER_COLORS[idx]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="mt-5 grid grid-cols-2 gap-4">
        {/* Recent Bookings Table */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="border-b border-[#E2E8F0] px-5 py-4">
            <h2 className="text-sm font-semibold text-[#0F172A]">Recent Bookings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                  <th className="px-4 py-2.5 text-left font-semibold text-[#64748B]">ID</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-[#64748B]">Guest</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-[#64748B]">Center</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-[#64748B]">Type</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-[#64748B]">Amt</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-[#64748B]">Status</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_BOOKINGS.map((b) => (
                  <tr key={b.id} className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#F8FAFC]">
                    <td className="px-4 py-2.5 font-mono text-[#94A3B8]">{b.id}</td>
                    <td className="px-4 py-2.5 font-medium text-[#0F172A]">{b.guest}</td>
                    <td className="px-4 py-2.5 text-[#64748B]">{b.center.replace("91Springboard ", "")}</td>
                    <td className="px-4 py-2.5 text-[#64748B]">{b.type}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-[#0F172A]">₹{b.amount.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-2.5">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[b.status]}`}>
                        {STATUS_LABELS[b.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Center Performance */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="border-b border-[#E2E8F0] px-5 py-4">
            <h2 className="text-sm font-semibold text-[#0F172A]">Center Performance</h2>
          </div>
          <div className="flex flex-col divide-y divide-[#F1F5F9] p-2">
            {CENTERS.map((c, idx) => (
              <div key={c.id} className="flex items-center gap-3 px-3 py-3">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white ${CENTER_COLORS[idx]}`}>
                  {c.name.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-[#0F172A]">{c.name}</p>
                  <p className="text-[10px] text-[#94A3B8]">{c.city}</p>
                </div>
                <div className="flex gap-4 text-right">
                  <div>
                    <p className="text-xs font-bold text-[#0F172A]">{c.occupancy}%</p>
                    <p className="text-[10px] text-[#94A3B8]">Occupancy</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0F172A]">{c.bookings}</p>
                    <p className="text-[10px] text-[#94A3B8]">Bookings</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0F172A]">{formatINR(c.revenue)}</p>
                    <p className="text-[10px] text-[#94A3B8]">Revenue</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SuperPartnerLayout>
  );
}
