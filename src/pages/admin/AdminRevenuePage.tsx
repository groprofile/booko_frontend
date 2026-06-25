import AdminLayout from "../../components/admin/AdminLayout";
import { LineAreaChart, BarChart, DonutChart } from "../../components/admin/Charts";
import { useAdmin, MONTHLY_REVENUE, MONTHLY_BOOKINGS, CATEGORY_REVENUE } from "../../context/AdminContext";
import { Download, TrendingUp, TrendingDown } from "lucide-react";

const fmt = (n: number) => n >= 10000000 ? `₹${(n / 10000000).toFixed(2)} Cr` : n >= 100000 ? `₹${(n / 100000).toFixed(2)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;

const PAYMENT_METHODS = [
  { label: "UPI", value: 54, color: "#2563EB" },
  { label: "Credit Card", value: 22, color: "#7C3AED" },
  { label: "Net Banking", value: 14, color: "#059669" },
  { label: "Debit Card", value: 10, color: "#D97706" },
];

export default function AdminRevenuePage() {
  const { bookings, settlements } = useAdmin();

  const grossRevenue = bookings.filter((b) => b.paymentStatus === "paid").reduce((a, b) => a + b.amount, 0);
  const commission = bookings.filter((b) => b.paymentStatus === "paid").reduce((a, b) => a + b.commission, 0);
  const refundAmount = bookings.filter((b) => b.paymentStatus === "refunded").reduce((a, b) => a + b.amount, 0);
  const vendorPayable = grossRevenue - commission - refundAmount;
  const settledAmount = settlements.filter((s) => s.status === "paid").reduce((a, s) => a + s.netPayable, 0);
  const pendingSettlement = settlements.filter((s) => s.status !== "paid").reduce((a, s) => a + s.netPayable, 0);
  const gstOnCommission = commission * 0.18;
  const netRevenue = commission + gstOnCommission;

  const SUMMARY = [
    { label: "Gross Revenue", value: fmt(grossRevenue), trend: 18, up: true, color: "#2563EB", bg: "#EFF6FF" },
    { label: "Net Revenue (Commission)", value: fmt(netRevenue), trend: 18, up: true, color: "#16A34A", bg: "#DCFCE7" },
    { label: "Commission Earned", value: fmt(commission), trend: 18, up: true, color: "#7C3AED", bg: "#F3E8FF" },
    { label: "GST Collected", value: fmt(gstOnCommission), trend: 18, up: true, color: "#0891B2", bg: "#E0F2FE" },
    { label: "Refund Amount", value: fmt(refundAmount), trend: 5, up: false, color: "#DC2626", bg: "#FEE2E2" },
    { label: "Vendor Payable", value: fmt(vendorPayable), trend: 12, up: true, color: "#D97706", bg: "#FEF3C7" },
    { label: "Settled to Vendors", value: fmt(settledAmount), trend: 8, up: true, color: "#64748B", bg: "#F1F5F9" },
    { label: "Pending Settlement", value: fmt(pendingSettlement), trend: -2, up: false, color: "#DC2626", bg: "#FEE2E2" },
  ];

  const CAT_REVENUE = [
    { label: "Hotels", value: Math.round(grossRevenue * 0.38), pct: 38 },
    { label: "Coworking", value: Math.round(grossRevenue * 0.24), pct: 24 },
    { label: "Meeting Rooms", value: Math.round(grossRevenue * 0.18), pct: 18 },
    { label: "Day Pass", value: Math.round(grossRevenue * 0.12), pct: 12 },
    { label: "Virtual Office", value: Math.round(grossRevenue * 0.05), pct: 5 },
    { label: "Monthly Pass", value: Math.round(grossRevenue * 0.03), pct: 3 },
  ];

  return (
    <AdminLayout title="Revenue Dashboard" subtitle="Financial overview and commission tracking">
      {/* Export */}
      <div className="mb-5 flex justify-end">
        <button className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC]">
          <Download size={14} /> Export Revenue Report
        </button>
      </div>

      {/* Summary cards */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SUMMARY.map((s) => (
          <div key={s.label} className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">{s.label}</p>
              <div className={`flex items-center gap-1 text-[10px] font-bold ${s.up ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                {s.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {Math.abs(s.trend)}%
              </div>
            </div>
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
              <p className="text-xs text-[#94A3B8]">Monthly gross revenue in ₹ Lakhs</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#2563EB]" />
              <span className="text-xs text-[#64748B]">Revenue (₹L)</span>
            </div>
          </div>
          <LineAreaChart data={MONTHLY_REVENUE} color="#2563EB" height={220} />
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <p className="mb-1 font-bold text-[#0F172A]">Payment Methods</p>
          <p className="mb-4 text-xs text-[#94A3B8]">Distribution of payment modes</p>
          <DonutChart data={PAYMENT_METHODS} size={130} />
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* Category revenue */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <p className="mb-1 font-bold text-[#0F172A]">Revenue by Category</p>
          <p className="mb-4 text-xs text-[#94A3B8]">Breakdown by booking product type</p>
          <BarChart data={CATEGORY_REVENUE} />
          <div className="mt-4 divide-y divide-[#F8FAFC]">
            {CAT_REVENUE.map((c) => (
              <div key={c.label} className="flex items-center justify-between py-2.5 text-xs">
                <span className="text-[#64748B]">{c.label}</span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-[#0F172A]">{fmt(c.value)}</span>
                  <span className="text-[#94A3B8]">{c.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking trend */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <p className="mb-1 font-bold text-[#0F172A]">Booking Volume Trend</p>
          <p className="mb-4 text-xs text-[#94A3B8]">Monthly booking count over the year</p>
          <LineAreaChart data={MONTHLY_BOOKINGS} color="#16A34A" height={220} />
        </div>
      </div>

      {/* Monthly table */}
      <div className="mt-5 rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="border-b border-[#F1F5F9] px-5 py-4">
          <p className="font-bold text-[#0F172A]">Monthly Breakdown</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                {["Month", "Gross Revenue", "Bookings", "Commission", "GST", "Refunds", "Net Revenue"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#64748B]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MONTHLY_REVENUE.slice().reverse().map((m, i) => {
                const bookingCount = MONTHLY_BOOKINGS[MONTHLY_BOOKINGS.length - 1 - i]?.value ?? 0;
                const gross = m.value * 100000;
                const comm = gross * 0.10;
                const gst = comm * 0.18;
                const refund = gross * 0.02;
                const net = comm + gst - refund;
                return (
                  <tr key={m.month} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC]">
                    <td className="px-4 py-3 font-semibold text-[#0F172A]">{m.month}</td>
                    <td className="px-4 py-3 font-bold text-[#0F172A]">{fmt(gross)}</td>
                    <td className="px-4 py-3 text-[#64748B]">{bookingCount.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-[#7C3AED]">{fmt(comm)}</td>
                    <td className="px-4 py-3 text-[#0891B2]">{fmt(gst)}</td>
                    <td className="px-4 py-3 text-[#DC2626]">{fmt(refund)}</td>
                    <td className="px-4 py-3 font-bold text-[#16A34A]">{fmt(net)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
