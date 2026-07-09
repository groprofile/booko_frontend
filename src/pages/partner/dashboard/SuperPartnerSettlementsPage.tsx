import { useState, useEffect } from "react";
import { Download, CheckCircle, Clock, Banknote, AlertCircle } from "lucide-react";
import SuperPartnerLayout from "../../../components/partner/SuperPartnerLayout";
import { apiGet, getVendorToken } from "../../../lib/api";

interface Settlement {
  id: string;
  gross_amount_paise: number;
  net_amount_paise: number;
  period_start: string;
  period_end: string;
  status: "pending" | "paid";
  created_at: string;
  paid_at?: string;
}

const fmt = (paise: number) => {
  const n = paise / 100;
  return n >= 100000 ? `₹${(n / 100000).toFixed(2)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n.toLocaleString("en-IN")}`;
};

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
};

type Filter = "all" | "pending" | "paid";

export default function SuperPartnerSettlementsPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    const token = getVendorToken() ?? undefined;
    apiGet<{ data: Settlement[] }>("/vendor/settlements?limit=50", token)
      .then((res) => setSettlements(res.data ?? []))
      .catch((err) => setError((err as Error).message ?? "Failed to load settlements"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? settlements : settlements.filter((s) => s.status === filter);
  const totalPending = settlements.filter((s) => s.status === "pending").reduce((a, s) => a + s.net_amount_paise, 0);
  const totalPaid = settlements.filter((s) => s.status === "paid").reduce((a, s) => a + s.net_amount_paise, 0);

  const metrics = [
    { label: "Total Settlements", value: settlements.length.toString(), icon: Banknote, color: "#2563EB", bg: "#EFF6FF" },
    { label: "Pending Payout", value: fmt(totalPending), icon: Clock, color: "#D97706", bg: "#FEF3C7" },
    { label: "Total Received", value: fmt(totalPaid), icon: CheckCircle, color: "#16A34A", bg: "#DCFCE7" },
    { label: "Pending Count", value: settlements.filter((s) => s.status === "pending").length.toString(), icon: AlertCircle, color: "#DC2626", bg: "#FEE2E2" },
  ];

  return (
    <SuperPartnerLayout title="Settlements" subtitle="Your payout history and pending settlements">
      {/* Metrics */}
      <div className="mb-5 grid gap-4 sm:grid-cols-4">
        {metrics.map((m) => (
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
        {(["all", "pending", "paid"] as Filter[]).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              filter === s ? "bg-[#2563EB] text-white" : "border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#2563EB]"
            }`}>
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            {s !== "all" && ` (${settlements.filter((x) => x.status === s).length})`}
          </button>
        ))}
        <div className="ml-auto">
          <button className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-medium text-[#64748B] hover:bg-[#F8FAFC]">
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="py-16 text-center text-sm text-[#94A3B8]">Loading settlements…</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                  {["ID", "Period", "Gross Amount", "Net Payable", "Status", "Paid Date"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#64748B]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-sm text-[#94A3B8]">No settlements found</td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.id} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-[#2563EB]">{s.id.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-xs text-[#64748B]">
                        {s.period_start} → {s.period_end}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-[#0F172A]">{fmt(s.gross_amount_paise)}</td>
                      <td className="px-4 py-3 text-xs font-extrabold text-[#16A34A]">{fmt(s.net_amount_paise)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[s.status]}`}>
                          {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-[#64748B]">
                        {s.paid_at ? new Date(s.paid_at).toLocaleDateString("en-IN") : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Policy info */}
      <div className="mt-5 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <p className="mb-3 text-sm font-bold text-[#0F172A]">Settlement Policy</p>
        <div className="grid gap-4 text-xs text-[#64748B] sm:grid-cols-2">
          <div className="rounded-xl bg-[#F8FAFC] p-3">
            <p className="font-bold text-[#0F172A]">Settlement Window</p>
            <p className="mt-1">Settlements are created per booking once confirmed. Net Payable already reflects your final payout amount.</p>
          </div>
          <div className="rounded-xl bg-[#F8FAFC] p-3">
            <p className="font-bold text-[#0F172A]">Payout Status</p>
            <p className="mt-1">Pending settlements are awaiting admin processing. Paid settlements show the date they were disbursed.</p>
          </div>
        </div>
      </div>
    </SuperPartnerLayout>
  );
}
