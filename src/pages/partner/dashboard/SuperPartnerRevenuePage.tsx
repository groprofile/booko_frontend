import { useState, useEffect } from "react";
import { TrendingUp, Wallet, Clock } from "lucide-react";
import SuperPartnerLayout from "../../../components/partner/SuperPartnerLayout";
import { apiGet, getVendorToken } from "../../../lib/api";

interface EarningsData {
  totalRevenue: number;
  pendingSettlement: number;
  paidSettlement: number;
}

interface Settlement {
  id: string;
  status: "pending" | "paid" | "processing";
  net_amount_paise?: number;
  amount_paise?: number;
  created_at?: string;
  center_id?: string;
  center_name?: string;
}

function formatINR(paise: number): string {
  const amount = paise / 100;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatINRFull(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

const TIMELINE_STYLES: Record<"paid" | "pending" | "processing", { dot: string; badge: string }> = {
  paid: { dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700" },
  pending: { dot: "bg-amber-400", badge: "bg-amber-100 text-amber-700" },
  processing: { dot: "bg-blue-500", badge: "bg-blue-100 text-blue-700" },
};

const TIMELINE_LABELS: Record<"paid" | "pending" | "processing", string> = {
  paid: "Paid",
  pending: "Pending",
  processing: "Processing",
};

export default function SuperPartnerRevenuePage() {
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getVendorToken() ?? undefined;
    Promise.all([
      apiGet<EarningsData>("/vendor/earnings", token),
      apiGet<{ data: Settlement[] }>("/vendor/settlements?limit=10", token),
    ])
      .then(([e, s]) => {
        setEarnings(e);
        setSettlements(s.data ?? []);
      })
      .catch((err) => setError((err as Error).message ?? "Failed to load revenue"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <SuperPartnerLayout title="Revenue" subtitle="Earnings, payouts and tax summary">
        <div className="flex items-center justify-center py-20 text-sm text-[#94A3B8]">
          Loading revenue data…
        </div>
      </SuperPartnerLayout>
    );
  }

  if (error) {
    return (
      <SuperPartnerLayout title="Revenue" subtitle="Earnings, payouts and tax summary">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-bold text-red-700">Error</p>
          <p className="mt-1 text-xs text-red-600">{error}</p>
        </div>
      </SuperPartnerLayout>
    );
  }

  const totalRevenue = earnings?.totalRevenue ?? 0;
  const pendingSettlement = earnings?.pendingSettlement ?? 0;
  const paidSettlement = earnings?.paidSettlement ?? 0;

  return (
    <SuperPartnerLayout title="Revenue" subtitle="Earnings, payouts and tax summary">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <TrendingUp size={18} className="text-[#2563EB]" />
          </div>
          <p className="mt-3 text-xl font-bold text-[#0F172A]">{formatINRFull(totalRevenue)}</p>
          <p className="mt-0.5 text-xs text-[#64748B]">Total Revenue</p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
            <Wallet size={18} className="text-emerald-600" />
          </div>
          <p className="mt-3 text-xl font-bold text-[#0F172A]">{formatINRFull(paidSettlement)}</p>
          <p className="mt-0.5 text-xs text-[#64748B]">Paid Out</p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
            <Clock size={18} className="text-amber-600" />
          </div>
          <p className="mt-3 text-xl font-bold text-[#0F172A]">{formatINRFull(pendingSettlement)}</p>
          <p className="mt-0.5 text-xs text-[#64748B]">Pending Settlement</p>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Tax Summary */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[#0F172A]">Earnings Summary</h2>
          <p className="text-xs text-[#94A3B8]">Approximate breakdown</p>
          <div className="mt-4 flex flex-col gap-3">
            {[
              { label: "Total Revenue", value: formatINRFull(totalRevenue), highlight: true },
              { label: "Paid Out", value: formatINRFull(paidSettlement), highlight: false },
              { label: "Pending Settlement", value: formatINRFull(pendingSettlement), highlight: false },
            ].map((row) => (
              <div
                key={row.label}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${
                  row.highlight ? "bg-emerald-50 border border-emerald-100" : "bg-[#F8FAFC]"
                }`}
              >
                <span className={`text-xs ${row.highlight ? "font-bold text-emerald-800" : "text-[#64748B]"}`}>
                  {row.label}
                </span>
                <span className={`text-xs font-bold ${row.highlight ? "text-emerald-700" : "text-[#0F172A]"}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Settlement Timeline */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[#0F172A]">Settlement Timeline</h2>
          <p className="text-xs text-[#94A3B8]">Recent payouts and pending settlements</p>

          {settlements.length === 0 ? (
            <div className="mt-6 text-center text-xs text-[#94A3B8]">No settlements yet.</div>
          ) : (
            <div className="relative mt-4">
              <div className="absolute left-3.5 top-0 bottom-0 w-px bg-[#E2E8F0]" />
              <div className="flex flex-col gap-4">
                {settlements.map((item) => {
                  const status = (item.status ?? "pending") as "paid" | "pending" | "processing";
                  const styles = TIMELINE_STYLES[status] ?? TIMELINE_STYLES.pending;
                  const date = item.created_at
                    ? new Date(item.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—";
                  const amount = item.net_amount_paise ?? item.amount_paise ?? 0;
                  return (
                    <div key={item.id} className="flex items-start gap-4 pl-8 relative">
                      <span className={`absolute left-2.5 top-1.5 h-2 w-2 rounded-full ring-2 ring-white ${styles.dot}`} />
                      <div className="flex flex-1 items-start justify-between">
                        <div>
                          <p className="text-xs font-semibold text-[#0F172A]">
                            {item.center_name ?? "Settlement"}
                          </p>
                          <p className="text-[10px] text-[#94A3B8]">{date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#0F172A]">
                            {formatINR(amount)}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${styles.badge}`}>
                            {TIMELINE_LABELS[status]}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </SuperPartnerLayout>
  );
}
