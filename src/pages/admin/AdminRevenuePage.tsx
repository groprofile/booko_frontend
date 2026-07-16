import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { LineAreaChart, BarChart } from "../../components/admin/Charts";
import { useAdmin } from "../../context/AdminContext";
import { apiGet, getAdminToken } from "../../lib/api";

const fmt = (n: number) => n >= 10000000 ? `₹${(n / 10000000).toFixed(2)} Cr` : n >= 100000 ? `₹${(n / 100000).toFixed(2)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;

const CATEGORY_COLORS = ["#2563EB", "#7C3AED", "#059669", "#D97706", "#DC2626", "#64748B"];

interface Overview {
  monthly: Array<{ label: string; revenue: number; bookings: number }>;
  categoryRevenue: Array<{ label: string; value: number }>;
  cityBookings: Array<{ city: string; pct: number }>;
}

export default function AdminRevenuePage() {
  const { bookings, settlements } = useAdmin();
  const [overview, setOverview] = useState<Overview | null>(null);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    apiGet<Overview>("/admin/reports/overview", token).then(setOverview).catch(console.error);
  }, []);

  const grossRevenue = bookings.filter((b) => b.paymentStatus === "paid").reduce((a, b) => a + b.amount, 0);
  const commission = bookings.filter((b) => b.paymentStatus === "paid").reduce((a, b) => a + b.commission, 0);
  const refundAmount = bookings.filter((b) => b.paymentStatus === "refunded").reduce((a, b) => a + b.amount, 0);
  const vendorPayable = grossRevenue - commission - refundAmount;
  const settledAmount = settlements.filter((s) => s.status === "paid").reduce((a, s) => a + s.netPayable, 0);
  const pendingSettlement = settlements.filter((s) => s.status !== "paid").reduce((a, s) => a + s.netPayable, 0);
  const gstOnCommission = commission * 0.18;
  const netRevenue = commission + gstOnCommission;

  const SUMMARY = [
    { label: "Gross Revenue", value: fmt(grossRevenue), color: "#2563EB", bg: "#EFF6FF" },
    { label: "Net Revenue (Commission)", value: fmt(netRevenue), color: "#16A34A", bg: "#DCFCE7" },
    { label: "Commission Earned", value: fmt(commission), color: "#7C3AED", bg: "#F3E8FF" },
    { label: "GST Collected", value: fmt(gstOnCommission), color: "#0891B2", bg: "#E0F2FE" },
    { label: "Refund Amount", value: fmt(refundAmount), color: "#DC2626", bg: "#FEE2E2" },
    { label: "Vendor Payable", value: fmt(vendorPayable), color: "#D97706", bg: "#FEF3C7" },
    { label: "Settled to Vendors", value: fmt(settledAmount), color: "#64748B", bg: "#F1F5F9" },
    { label: "Pending Settlement", value: fmt(pendingSettlement), color: "#DC2626", bg: "#FEE2E2" },
  ];

  const revenuePoints = (overview?.monthly ?? []).map((m) => ({ month: m.label, value: +(m.revenue / 100000).toFixed(2) }));
  const bookingPoints = (overview?.monthly ?? []).map((m) => ({ month: m.label, value: m.bookings }));
  const categoryTotal = (overview?.categoryRevenue ?? []).reduce((a, c) => a + c.value, 0);
  const categoryBars = (overview?.categoryRevenue ?? []).slice(0, 6).map((c, i) => ({
    label: c.label,
    value: categoryTotal > 0 ? Math.round((c.value / categoryTotal) * 100) : 0,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  return (
    <AdminLayout title="Revenue Dashboard" subtitle="Financial overview and commission tracking">
      {/* Summary cards */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SUMMARY.map((s) => (
          <div key={s.label} className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">{s.label}</p>
            <p className="mt-2 text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
            <div className="mt-2 h-1 w-full rounded-full" style={{ backgroundColor: s.bg }}>
              <div className="h-full w-3/4 rounded-full" style={{ backgroundColor: s.color + "40" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="col-span-2 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="font-bold text-[#0F172A]">Revenue Trend</p>
              <p className="text-xs text-[#94A3B8]">Monthly gross revenue in ₹ Lakhs — last 6 months</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#2563EB]" />
              <span className="text-xs text-[#64748B]">Revenue (₹L)</span>
            </div>
          </div>
          {revenuePoints.length === 0 ? (
            <div className="flex h-[220px] items-center justify-center text-xs text-[#94A3B8]">
              {overview ? "No revenue recorded yet" : "Loading…"}
            </div>
          ) : (
            <LineAreaChart data={revenuePoints} color="#2563EB" height={220} prefix="₹" suffix="L" />
          )}
        </div>

        {/* Category revenue */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <p className="mb-1 font-bold text-[#0F172A]">Revenue by Category</p>
          <p className="mb-4 text-xs text-[#94A3B8]">Share of total revenue</p>
          {categoryBars.length === 0 ? (
            <p className="py-8 text-center text-xs text-[#94A3B8]">{overview ? "No revenue recorded yet" : "Loading…"}</p>
          ) : (
            <>
              <BarChart data={categoryBars} />
              <div className="mt-4 divide-y divide-[#F8FAFC]">
                {(overview?.categoryRevenue ?? []).slice(0, 6).map((c) => (
                  <div key={c.label} className="flex items-center justify-between py-2.5 text-xs">
                    <span className="text-[#64748B]">{c.label}</span>
                    <span className="font-semibold text-[#0F172A]">{fmt(c.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* Booking trend */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <p className="mb-1 font-bold text-[#0F172A]">Booking Volume Trend</p>
          <p className="mb-4 text-xs text-[#94A3B8]">Monthly booking count — last 6 months</p>
          {bookingPoints.length === 0 ? (
            <div className="flex h-[220px] items-center justify-center text-xs text-[#94A3B8]">
              {overview ? "No bookings recorded yet" : "Loading…"}
            </div>
          ) : (
            <LineAreaChart data={bookingPoints} color="#16A34A" height={220} />
          )}
        </div>

        {/* Monthly table */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="border-b border-[#F1F5F9] px-5 py-4">
            <p className="font-bold text-[#0F172A]">Monthly Breakdown</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                  {["Month", "Gross Revenue", "Bookings"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#64748B]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(overview?.monthly ?? []).slice().reverse().map((m) => (
                  <tr key={m.label} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC]">
                    <td className="px-4 py-3 font-semibold text-[#0F172A]">{m.label}</td>
                    <td className="px-4 py-3 font-bold text-[#0F172A]">{fmt(m.revenue)}</td>
                    <td className="px-4 py-3 text-[#64748B]">{m.bookings.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
                {(overview?.monthly ?? []).length === 0 && (
                  <tr><td colSpan={3} className="py-10 text-center text-xs text-[#94A3B8]">{overview ? "No data yet" : "Loading…"}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
