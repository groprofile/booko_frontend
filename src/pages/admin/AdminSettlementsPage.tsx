import { useState } from "react";
import { Download, CheckCircle, Clock, Banknote, AlertCircle } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import StatusBadge from "../../components/admin/StatusBadge";
import { useAdmin } from "../../context/AdminContext";

const fmt = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(2)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;

export default function AdminSettlementsPage() {
  const { settlements, markSettlementPaid } = useAdmin();
  const [filter, setFilter] = useState<"all" | "pending" | "processing" | "paid">("all");

  const filtered = settlements.filter((s) => filter === "all" || s.status === filter);
  const totalPending = settlements.filter((s) => s.status === "pending").reduce((a, s) => a + s.netPayable, 0);
  const totalPaid = settlements.filter((s) => s.status === "paid").reduce((a, s) => a + s.netPayable, 0);

  return (
    <AdminLayout title="Settlement Management" subtitle="Vendor payout tracking and processing">
      {/* Summary */}
      <div className="mb-5 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Settlements", value: settlements.length.toString(), icon: Banknote, color: "#2563EB", bg: "#EFF6FF" },
          { label: "Pending Payout", value: fmt(totalPending), icon: Clock, color: "#D97706", bg: "#FEF3C7" },
          { label: "Total Settled", value: fmt(totalPaid), icon: CheckCircle, color: "#16A34A", bg: "#DCFCE7" },
          { label: "Overdue Vendors", value: settlements.filter(s => s.status === "pending").length.toString(), icon: AlertCircle, color: "#DC2626", bg: "#FEE2E2" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#64748B]">{m.label}</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: m.bg }}>
                <m.icon size={15} style={{ color: m.color }} />
              </div>
            </div>
            <p className="mt-2 text-xl font-extrabold" style={{ color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["all", "pending", "processing", "paid"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${filter === s ? "bg-[#2563EB] text-white" : "border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#2563EB]"}`}>
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)} {s !== "all" && `(${settlements.filter(x => x.status === s).length})`}
          </button>
        ))}
        <div className="ml-auto">
          <button className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-medium text-[#64748B] hover:bg-[#F8FAFC]">
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                {["Settlement ID", "Vendor", "Period", "Bookings", "Gross Amount", "Commission", "GST", "TDS", "Net Payable", "Bank", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#64748B]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-[#2563EB]">{s.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#0F172A]">{s.vendorName}</p>
                    <p className="text-xs text-[#94A3B8]">{s.bookingsCount} bookings</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#64748B]">{s.period}</td>
                  <td className="px-4 py-3 text-center text-xs font-semibold text-[#0F172A]">{s.bookingsCount}</td>
                  <td className="px-4 py-3 text-xs font-bold text-[#0F172A]">{fmt(s.grossAmount)}</td>
                  <td className="px-4 py-3 text-xs text-[#7C3AED]">-{fmt(s.commission)}</td>
                  <td className="px-4 py-3 text-xs text-[#0891B2]">-{fmt(s.gst)}</td>
                  <td className="px-4 py-3 text-xs text-[#D97706]">-{fmt(s.tds)}</td>
                  <td className="px-4 py-3 text-xs font-extrabold text-[#16A34A]">{fmt(s.netPayable)}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-xs font-mono text-[#0F172A]">{s.bankAccount}</p>
                      <p className="text-[11px] text-[#94A3B8]">{s.ifsc}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {s.status === "pending" && (
                        <button onClick={() => markSettlementPaid(s.id)}
                          className="flex items-center gap-1.5 rounded-lg bg-[#DCFCE7] px-2.5 py-1.5 text-xs font-bold text-[#15803D] hover:bg-[#BBF7D0]">
                          <CheckCircle size={11} /> Mark Paid
                        </button>
                      )}
                      {s.status === "paid" && s.paidAt && (
                        <span className="text-[11px] text-[#94A3B8]">Paid {s.paidAt}</span>
                      )}
                      <button className="flex items-center gap-1 rounded-lg border border-[#E2E8F0] px-2 py-1.5 text-[11px] text-[#64748B] hover:bg-[#F8FAFC]">
                        <Download size={11} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commission info */}
      <div className="mt-5 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <p className="mb-3 font-bold text-[#0F172A]">Settlement Policy</p>
        <div className="grid gap-4 sm:grid-cols-3 text-xs text-[#64748B]">
          <div className="rounded-xl bg-[#F8FAFC] p-3">
            <p className="font-bold text-[#0F172A]">Settlement Window</p>
            <p className="mt-1">7 days after booking completion. Settlements are generated every Monday for the previous week.</p>
          </div>
          <div className="rounded-xl bg-[#F8FAFC] p-3">
            <p className="font-bold text-[#0F172A]">Commission Structure</p>
            <p className="mt-1">Coworking/Meeting Rooms: 10% + 18% GST. Hotels: 12% + 18% GST. Virtual Office: 8% + 18% GST.</p>
          </div>
          <div className="rounded-xl bg-[#F8FAFC] p-3">
            <p className="font-bold text-[#0F172A]">TDS Deduction</p>
            <p className="mt-1">2% TDS deducted for annual vendor earnings above ₹30,000. Applicable per Section 194C.</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
