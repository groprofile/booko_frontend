import { useState, useEffect } from "react";
import { TrendingUp, Building2, CalendarDays } from "lucide-react";
import SuperPartnerLayout from "../../../components/partner/SuperPartnerLayout";
import { apiGet, getVendorToken } from "../../../lib/api";

interface DashboardData {
  locked: boolean;
  status?: string;
  message?: string;
  totalCenters?: number;
  totalBookings?: number;
  todayBookings?: number;
  totalRevenue?: number;
}

interface ApiBooking {
  id: string;
  txnid?: string;
  status: string;
  checkin_status?: string;
  slot_date?: string;
  vendor_amount_paise?: number;
  users?: { full_name?: string };
  centers?: { center_name?: string };
}

type DisplayStatus = "confirmed" | "checked_in" | "pending" | "cancelled" | "completed";

function toDisplayStatus(b: ApiBooking): DisplayStatus {
  if (b.checkin_status === "checked_in") return "checked_in";
  if (b.status === "paid" || b.status === "confirmed") return "confirmed";
  if (b.status === "cancelled") return "cancelled";
  if (b.status === "completed") return "completed";
  return "pending";
}

const STATUS_STYLES: Record<DisplayStatus, string> = {
  confirmed: "bg-blue-100 text-blue-700",
  checked_in: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-slate-100 text-slate-600",
};

const STATUS_LABELS: Record<DisplayStatus, string> = {
  confirmed: "Confirmed",
  checked_in: "Checked In",
  pending: "Pending",
  cancelled: "Cancelled",
  completed: "Completed",
};

function formatINR(paise: number): string {
  const amount = paise / 100;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function SuperPartnerOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getVendorToken() ?? undefined;
    Promise.all([
      apiGet<DashboardData>("/vendor/dashboard", token),
      apiGet<{ data: ApiBooking[] }>("/vendor/bookings?limit=5", token),
    ])
      .then(([dash, bk]) => {
        setDashboard(dash);
        setBookings(bk.data ?? []);
      })
      .catch((err) => setError((err as Error).message ?? "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <SuperPartnerLayout title="Overview" subtitle="Your super-partner dashboard at a glance">
        <div className="flex items-center justify-center py-20 text-sm text-[#94A3B8]">
          Loading dashboard…
        </div>
      </SuperPartnerLayout>
    );
  }

  if (error) {
    return (
      <SuperPartnerLayout title="Overview" subtitle="Your super-partner dashboard at a glance">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-bold text-red-700">Error</p>
          <p className="mt-1 text-xs text-red-600">{error}</p>
        </div>
      </SuperPartnerLayout>
    );
  }

  if (dashboard?.locked) {
    return (
      <SuperPartnerLayout title="Overview" subtitle="Your super-partner dashboard at a glance">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <p className="text-sm font-bold text-amber-800 capitalize">{dashboard.status ?? "Account Locked"}</p>
          <p className="mt-2 text-xs text-amber-700">{dashboard.message}</p>
        </div>
      </SuperPartnerLayout>
    );
  }

  return (
    <SuperPartnerLayout title="Overview" subtitle="Your super-partner dashboard at a glance">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
            <TrendingUp size={20} className="text-[#2563EB]" />
          </div>
          <p className="mt-4 text-2xl font-bold text-[#0F172A]">
            {formatINR(dashboard?.totalRevenue ?? 0)}
          </p>
          <p className="mt-1 text-xs text-[#64748B]">Total Revenue</p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50">
            <CalendarDays size={20} className="text-violet-600" />
          </div>
          <p className="mt-4 text-2xl font-bold text-[#0F172A]">{dashboard?.totalBookings ?? 0}</p>
          <p className="mt-1 text-xs text-[#64748B]">Total Bookings</p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
            <Building2 size={20} className="text-emerald-600" />
          </div>
          <p className="mt-4 text-2xl font-bold text-[#0F172A]">{dashboard?.totalCenters ?? 0}</p>
          <p className="mt-1 text-xs text-[#64748B]">Total Centers</p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
            <CalendarDays size={20} className="text-amber-500" />
          </div>
          <p className="mt-4 text-2xl font-bold text-[#0F172A]">{dashboard?.todayBookings ?? 0}</p>
          <p className="mt-1 text-xs text-[#64748B]">Today's Bookings</p>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="mt-5 rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
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
                <th className="px-4 py-2.5 text-left font-semibold text-[#64748B]">Date</th>
                <th className="px-4 py-2.5 text-right font-semibold text-[#64748B]">Amount</th>
                <th className="px-4 py-2.5 text-left font-semibold text-[#64748B]">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-[#94A3B8]">
                    No bookings yet.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => {
                  const displayStatus = toDisplayStatus(b);
                  return (
                    <tr key={b.id} className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#F8FAFC]">
                      <td className="px-4 py-2.5 font-mono text-[10px] text-[#94A3B8]">
                        {b.txnid ?? b.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-[#0F172A]">
                        {b.users?.full_name ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-[#64748B]">
                        {b.centers?.center_name ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-[#64748B]">{b.slot_date ?? "—"}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-[#0F172A]">
                        {b.vendor_amount_paise != null
                          ? `₹${(b.vendor_amount_paise / 100).toLocaleString("en-IN")}`
                          : "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[displayStatus]}`}
                        >
                          {STATUS_LABELS[displayStatus]}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SuperPartnerLayout>
  );
}
