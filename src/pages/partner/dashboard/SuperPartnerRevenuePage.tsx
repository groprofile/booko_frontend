import { useState } from "react";
import { TrendingUp, Wallet, Clock, IndianRupee } from "lucide-react";
import SuperPartnerLayout from "../../../components/partner/SuperPartnerLayout";

interface CenterRevenue {
  id: string;
  name: string;
  city: string;
  gross: number;
  commission: number;
  gstOnCommission: number;
  tds: number;
  netPayout: number;
  settlement: "paid" | "pending" | "na";
}

interface TimelineItem {
  date: string;
  center: string;
  amount: number;
  status: "paid" | "pending" | "processing";
}

interface MonthlyRevenue {
  month: string;
  amount: number;
}

const MONTHLY_REVENUE: MonthlyRevenue[] = [
  { month: "Jan", amount: 142000 },
  { month: "Feb", amount: 168000 },
  { month: "Mar", amount: 195000 },
  { month: "Apr", amount: 221000 },
  { month: "May", amount: 258000 },
  { month: "Jun", amount: 299400 },
];

const CENTER_REVENUES: CenterRevenue[] = [
  {
    id: "c1", name: "WeWork BKC", city: "Mumbai",
    gross: 128400, commission: 12840, gstOnCommission: 2311, tds: 2568, netPayout: 110681,
    settlement: "paid",
  },
  {
    id: "c2", name: "91Springboard HSR", city: "Bangalore",
    gross: 96200, commission: 9620, gstOnCommission: 1732, tds: 1924, netPayout: 82924,
    settlement: "pending",
  },
  {
    id: "c3", name: "Smartworks Cyber City", city: "Gurgaon",
    gross: 74800, commission: 7480, gstOnCommission: 1346, tds: 1496, netPayout: 64478,
    settlement: "pending",
  },
  {
    id: "c4", name: "The Hive Powai", city: "Mumbai",
    gross: 0, commission: 0, gstOnCommission: 0, tds: 0, netPayout: 0,
    settlement: "na",
  },
];

const TIMELINE: TimelineItem[] = [
  { date: "20 Jun 2024", center: "WeWork BKC", amount: 110681, status: "paid" },
  { date: "20 Jun 2024", center: "91Springboard HSR", amount: 82924, status: "processing" },
  { date: "15 May 2024", center: "Smartworks Cyber City", amount: 58200, status: "paid" },
  { date: "10 May 2024", center: "WeWork BKC", amount: 104200, status: "paid" },
  { date: "05 Apr 2024", center: "91Springboard HSR", amount: 76400, status: "paid" },
  { date: "01 Apr 2024", center: "Smartworks Cyber City", amount: 52800, status: "pending" },
];

const SETTLEMENT_STYLES: Record<CenterRevenue["settlement"], string> = {
  paid: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  na: "bg-slate-100 text-slate-500",
};

const SETTLEMENT_LABELS: Record<CenterRevenue["settlement"], string> = {
  paid: "Paid",
  pending: "Pending",
  na: "Not Applicable",
};

const TIMELINE_STYLES: Record<TimelineItem["status"], { dot: string; badge: string }> = {
  paid: { dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700" },
  pending: { dot: "bg-amber-400", badge: "bg-amber-100 text-amber-700" },
  processing: { dot: "bg-blue-500", badge: "bg-blue-100 text-blue-700" },
};

const TIMELINE_LABELS: Record<TimelineItem["status"], string> = {
  paid: "Paid",
  pending: "Pending",
  processing: "Processing",
};

const BAR_COLORS = ["bg-[#EFF6FF] border border-[#BFDBFE]", "bg-[#EFF6FF] border border-[#BFDBFE]", "bg-[#EFF6FF] border border-[#BFDBFE]", "bg-[#EFF6FF] border border-[#BFDBFE]", "bg-[#EFF6FF] border border-[#BFDBFE]", "bg-[#2563EB]"];

function formatINR(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatINRFull(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function SuperPartnerRevenuePage() {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const maxAmount = Math.max(...MONTHLY_REVENUE.map((m) => m.amount));

  const totalRevenue = 299400;
  const commission = 29940;
  const netPayout = 269460;
  const pendingSettlement = 74800;

  const totalGST = CENTER_REVENUES.reduce((s, c) => s + c.gstOnCommission, 0);
  const totalTDS = CENTER_REVENUES.reduce((s, c) => s + c.tds, 0);
  const totalNet = CENTER_REVENUES.reduce((s, c) => s + c.netPayout, 0);

  return (
    <SuperPartnerLayout title="Revenue" subtitle="Earnings, payouts and tax summary">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <TrendingUp size={18} className="text-[#2563EB]" />
          </div>
          <p className="mt-3 text-xl font-bold text-[#0F172A]">{formatINRFull(totalRevenue)}</p>
          <p className="mt-0.5 text-xs text-[#64748B]">Total Revenue</p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
            <IndianRupee size={18} className="text-violet-600" />
          </div>
          <p className="mt-3 text-xl font-bold text-[#0F172A]">{formatINRFull(commission)}</p>
          <p className="mt-0.5 text-xs text-[#64748B]">Platform Commission <span className="text-[#94A3B8]">(10%)</span></p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
            <Wallet size={18} className="text-emerald-600" />
          </div>
          <p className="mt-3 text-xl font-bold text-[#0F172A]">{formatINRFull(netPayout)}</p>
          <p className="mt-0.5 text-xs text-[#64748B]">Net Payout</p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
            <Clock size={18} className="text-amber-600" />
          </div>
          <p className="mt-3 text-xl font-bold text-[#0F172A]">{formatINRFull(pendingSettlement)}</p>
          <p className="mt-0.5 text-xs text-[#64748B]">Pending Settlement</p>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="mt-5 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#0F172A]">Revenue Trend</h2>
            <p className="text-xs text-[#94A3B8]">Jan – Jun 2024 &bull; Gross revenue across all centers</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#94A3B8]">Jun 2024</p>
            <p className="text-lg font-bold text-[#2563EB]">{formatINR(299400)}</p>
          </div>
        </div>

        {/* Y-axis guides */}
        <div className="relative mt-5">
          <div className="flex justify-between text-[10px] text-[#94A3B8] mb-1">
            <span>₹0</span>
            <span>₹1L</span>
            <span>₹2L</span>
            <span>₹3L</span>
          </div>
          <div className="relative h-44 w-full">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="w-full border-b border-dashed border-[#F1F5F9]" />
              ))}
            </div>

            {/* Bars */}
            <div className="relative flex h-full items-end gap-3 px-2">
              {MONTHLY_REVENUE.map((item, idx) => {
                const pct = Math.round((item.amount / maxAmount) * 100);
                const isActive = idx === MONTHLY_REVENUE.length - 1;
                const isHovered = hoveredBar === idx;
                return (
                  <div
                    key={item.month}
                    className="relative flex flex-1 flex-col items-center group"
                    onMouseEnter={() => setHoveredBar(idx)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Tooltip */}
                    {isHovered && (
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 shadow-lg">
                        <p className="text-[10px] font-semibold text-[#94A3B8]">{item.month} 2024</p>
                        <p className="text-sm font-bold text-[#0F172A]">{formatINRFull(item.amount)}</p>
                      </div>
                    )}
                    <div className="w-full flex flex-col justify-end" style={{ height: "100%" }}>
                      <div
                        className={`w-full rounded-t-xl transition-all duration-200 cursor-pointer ${BAR_COLORS[idx]} ${isHovered ? "opacity-80" : ""}`}
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                    <span className={`mt-2 text-[10px] font-semibold ${isActive ? "text-[#2563EB]" : "text-[#94A3B8]"}`}>
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="mt-5 rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="border-b border-[#E2E8F0] px-5 py-4">
          <h2 className="text-sm font-semibold text-[#0F172A]">Revenue Breakdown by Center</h2>
          <p className="text-xs text-[#94A3B8]">June 2024 — commission 10%, GST 18%, TDS 2%</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                <th className="px-5 py-3 text-left font-semibold text-[#64748B]">Center</th>
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">City</th>
                <th className="px-4 py-3 text-right font-semibold text-[#64748B]">Gross Revenue</th>
                <th className="px-4 py-3 text-right font-semibold text-[#64748B]">Commission</th>
                <th className="px-4 py-3 text-right font-semibold text-[#64748B]">GST on Comm.</th>
                <th className="px-4 py-3 text-right font-semibold text-[#64748B]">TDS (2%)</th>
                <th className="px-4 py-3 text-right font-semibold text-[#64748B]">Net Payout</th>
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Settlement</th>
              </tr>
            </thead>
            <tbody>
              {CENTER_REVENUES.map((c) => (
                <tr key={c.id} className={`border-b border-[#F1F5F9] last:border-0 hover:bg-[#F8FAFC] transition-colors ${c.gross === 0 ? "opacity-50" : ""}`}>
                  <td className="px-5 py-3 font-semibold text-[#0F172A]">{c.name}</td>
                  <td className="px-4 py-3 text-[#64748B]">{c.city}</td>
                  <td className="px-4 py-3 text-right font-semibold text-[#0F172A]">
                    {c.gross > 0 ? formatINRFull(c.gross) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-[#64748B]">
                    {c.commission > 0 ? formatINRFull(c.commission) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-[#64748B]">
                    {c.gstOnCommission > 0 ? formatINRFull(c.gstOnCommission) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-[#64748B]">
                    {c.tds > 0 ? formatINRFull(c.tds) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-700">
                    {c.netPayout > 0 ? formatINRFull(c.netPayout) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${SETTLEMENT_STYLES[c.settlement]}`}>
                      {SETTLEMENT_LABELS[c.settlement]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#F8FAFC] border-t-2 border-[#E2E8F0]">
                <td className="px-5 py-3 font-bold text-[#0F172A]">Total</td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3 text-right font-bold text-[#0F172A]">{formatINRFull(totalRevenue)}</td>
                <td className="px-4 py-3 text-right font-bold text-[#0F172A]">{formatINRFull(commission)}</td>
                <td className="px-4 py-3 text-right font-bold text-[#0F172A]">{formatINRFull(totalGST)}</td>
                <td className="px-4 py-3 text-right font-bold text-[#0F172A]">{formatINRFull(totalTDS)}</td>
                <td className="px-4 py-3 text-right font-bold text-emerald-700">{formatINRFull(totalNet)}</td>
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Bottom row */}
      <div className="mt-5 grid grid-cols-5 gap-4">
        {/* Settlement Timeline */}
        <div className="col-span-3 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[#0F172A]">Settlement Timeline</h2>
          <p className="text-xs text-[#94A3B8]">Recent payouts and scheduled settlements</p>
          <div className="relative mt-4">
            <div className="absolute left-3.5 top-0 bottom-0 w-px bg-[#E2E8F0]" />
            <div className="flex flex-col gap-4">
              {TIMELINE.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 pl-8 relative">
                  <span className={`absolute left-2.5 top-1.5 h-2 w-2 rounded-full ring-2 ring-white ${TIMELINE_STYLES[item.status].dot}`} />
                  <div className="flex flex-1 items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#0F172A]">{item.center}</p>
                      <p className="text-[10px] text-[#94A3B8]">{item.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#0F172A]">{formatINRFull(item.amount)}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${TIMELINE_STYLES[item.status].badge}`}>
                        {TIMELINE_LABELS[item.status]}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* GST & Tax Summary */}
        <div className="col-span-2 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[#0F172A]">GST &amp; Tax Summary</h2>
          <p className="text-xs text-[#94A3B8]">June 2024</p>
          <div className="mt-4 flex flex-col gap-3">
            {[
              { label: "Total Gross Revenue", value: formatINRFull(totalRevenue), highlight: false },
              { label: "Platform Commission (10%)", value: formatINRFull(commission), highlight: false },
              { label: "GST on Commission (18%)", value: formatINRFull(totalGST), highlight: false },
              { label: "TDS Deducted (2%)", value: formatINRFull(totalTDS), highlight: false },
              { label: "Net Payout After Deductions", value: formatINRFull(totalNet), highlight: true },
            ].map((row) => (
              <div key={row.label} className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${row.highlight ? "bg-emerald-50 border border-emerald-100" : "bg-[#F8FAFC]"}`}>
                <span className={`text-xs ${row.highlight ? "font-bold text-emerald-800" : "text-[#64748B]"}`}>{row.label}</span>
                <span className={`text-xs font-bold ${row.highlight ? "text-emerald-700" : "text-[#0F172A]"}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SuperPartnerLayout>
  );
}
