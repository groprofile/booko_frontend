import { useState, useEffect } from "react";
import { CreditCard, TrendingUp, CheckCircle, XCircle, Clock, Download } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { apiGet, getAdminToken } from "../../lib/api";

interface Payment {
  id: string;
  txnid?: string;
  booking_id: string;
  user_name?: string;
  user_email?: string;
  center_name?: string;
  amount_paise: number;
  gateway: string;
  status: "success" | "failed" | "pending" | "refunded";
  method?: string;
  created_at: string;
  gateway_order_id?: string;
}

const fmt = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;
const fmtLarge = (paise: number) => {
  const n = paise / 100;
  return n >= 100000 ? `₹${(n / 100000).toFixed(2)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;
};

const STATUS_STYLE: Record<string, string> = {
  success: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  pending: "bg-amber-100 text-amber-700",
  refunded: "bg-blue-100 text-blue-700",
};

type Filter = "all" | "success" | "failed" | "pending" | "refunded";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    const token = getAdminToken() ?? undefined;
    apiGet<Payment[]>("/admin/payments", token)
      .then((data) => setPayments(data ?? []))
      .catch((err) => setError((err as Error).message ?? "Failed to load payments"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? payments : payments.filter((p) => p.status === filter);
  const totalSuccessful = payments.filter((p) => p.status === "success").reduce((a, p) => a + p.amount_paise, 0);
  const totalFailed = payments.filter((p) => p.status === "failed").length;

  return (
    <AdminLayout title="Payments" subtitle="All transaction history across the platform">
      {/* Metrics */}
      <div className="mb-5 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Transactions", value: payments.length.toString(), icon: CreditCard, color: "#2563EB", bg: "#EFF6FF" },
          { label: "Total Revenue", value: fmtLarge(totalSuccessful), icon: TrendingUp, color: "#16A34A", bg: "#DCFCE7" },
          { label: "Successful", value: payments.filter((p) => p.status === "success").length.toString(), icon: CheckCircle, color: "#059669", bg: "#ECFDF5" },
          { label: "Failed", value: totalFailed.toString(), icon: XCircle, color: "#DC2626", bg: "#FEE2E2" },
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

      {/* Filters + Export */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["all", "success", "failed", "pending", "refunded"] as Filter[]).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              filter === s ? "bg-[#2563EB] text-white" : "border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#2563EB]"
            }`}>
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            {s !== "all" && ` (${payments.filter((p) => p.status === s).length})`}
          </button>
        ))}
        <div className="ml-auto">
          <button className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-medium text-[#64748B] hover:bg-[#F8FAFC]">
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      {loading ? (
        <div className="py-16 text-center text-sm text-[#94A3B8]">Loading payments…</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                  {["Txn ID", "Customer", "Center", "Amount", "Gateway", "Method", "Date", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#64748B]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="py-16 text-center text-sm text-[#94A3B8]">No transactions found</td></tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-[#2563EB]">
                        {p.txnid ?? p.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#0F172A]">{p.user_name ?? "—"}</p>
                        <p className="text-xs text-[#94A3B8]">{p.user_email ?? ""}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#64748B]">{p.center_name ?? "—"}</td>
                      <td className="px-4 py-3 font-bold text-[#0F172A]">{fmt(p.amount_paise)}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-lg bg-[#F1F5F9] px-2 py-0.5 text-xs font-medium text-[#64748B] capitalize">
                          {p.gateway}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#64748B] capitalize">{p.method ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-[#64748B]">{p.created_at.slice(0, 10)}</td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold w-fit ${STATUS_STYLE[p.status]}`}>
                          {p.status === "success" ? <CheckCircle size={10} /> : p.status === "failed" ? <XCircle size={10} /> : <Clock size={10} />}
                          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
