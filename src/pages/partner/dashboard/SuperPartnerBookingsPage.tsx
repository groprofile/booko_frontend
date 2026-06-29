import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import SuperPartnerLayout from "../../../components/partner/SuperPartnerLayout";
import { apiGet, getVendorToken } from "../../../lib/api";

type DisplayStatus = "confirmed" | "checked_in" | "pending" | "cancelled" | "completed";

interface ApiBooking {
  id: string;
  txnid?: string;
  status: string;
  checkin_status?: string;
  slot_date?: string;
  start_time?: string;
  end_time?: string;
  member_count?: number;
  total_paise?: number;
  created_at?: string;
  users?: { full_name?: string; phone?: string };
  centers?: { center_name?: string };
}

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

type TabFilter = "all" | DisplayStatus;

const TAB_FILTERS: { key: TabFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "confirmed", label: "Confirmed" },
  { key: "checked_in", label: "Checked In" },
  { key: "pending", label: "Pending" },
  { key: "cancelled", label: "Cancelled" },
  { key: "completed", label: "Completed" },
];

const PAGE_SIZE = 10;

export default function SuperPartnerBookingsPage() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [tabFilter, setTabFilter] = useState<TabFilter>("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    const token = getVendorToken() ?? undefined;
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
    });
    apiGet<{ data: ApiBooking[]; total: number }>(`/vendor/bookings?${params}`, token)
      .then((res) => {
        setBookings(res.data ?? []);
        setTotal(res.total ?? 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  const filtered = bookings.filter((b) => {
    const displayStatus = toDisplayStatus(b);
    const matchTab = tabFilter === "all" || displayStatus === tabFilter;
    const matchStatus = statusFilter === "all" || displayStatus === statusFilter;
    const matchSearch =
      !search ||
      (b.users?.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (b.txnid ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (b.centers?.center_name ?? "").toLowerCase().includes(search.toLowerCase());
    return matchTab && matchStatus && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const countByStatus = (status: DisplayStatus) =>
    bookings.filter((b) => toDisplayStatus(b) === status).length;

  return (
    <SuperPartnerLayout title="All Bookings" subtitle="Monitor and manage bookings across all centers">
      {/* Top filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search bookings, guests..."
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl pl-8 pr-4 py-2.5 text-sm outline-none text-[#0F172A] placeholder:text-[#94A3B8]"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="appearance-none bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl pl-4 pr-8 py-2.5 text-sm outline-none text-[#64748B] cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked In</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
          <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
        </div>
      </div>

      {/* KPI row */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
          <p className="text-xl font-bold text-[#0F172A]">{total}</p>
          <p className="mt-0.5 text-xs text-[#64748B]">Total Bookings</p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
          <p className="text-xl font-bold text-amber-600">{countByStatus("pending")}</p>
          <p className="mt-0.5 text-xs text-[#64748B]">Pending</p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
          <p className="text-xl font-bold text-red-500">{countByStatus("cancelled")}</p>
          <p className="mt-0.5 text-xs text-[#64748B]">Cancelled</p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
          <p className="text-xl font-bold text-emerald-600">{countByStatus("confirmed")}</p>
          <p className="mt-0.5 text-xs text-[#64748B]">Confirmed</p>
        </div>
      </div>

      {/* Table card */}
      <div className="mt-4 rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
        {/* Tab filters */}
        <div className="flex items-center gap-0.5 overflow-x-auto border-b border-[#E2E8F0] px-4 pt-3 pb-0">
          {TAB_FILTERS.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTabFilter(t.key);
                setPage(1);
              }}
              className={`shrink-0 rounded-t-lg px-4 py-2 text-xs font-semibold transition-all border-b-2 ${
                tabFilter === t.key
                  ? "border-[#2563EB] text-[#2563EB]"
                  : "border-transparent text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              {t.label}
              {t.key !== "all" && (
                <span className="ml-1.5 rounded-full bg-[#F1F5F9] px-1.5 py-0.5 text-[10px]">
                  {countByStatus(t.key as DisplayStatus)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Booking ID</th>
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Guest</th>
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Center</th>
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Time</th>
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Members</th>
                <th className="px-4 py-3 text-right font-semibold text-[#64748B]">Amount</th>
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-[#94A3B8]">
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-[#94A3B8]">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => {
                  const displayStatus = toDisplayStatus(b);
                  return (
                    <tr
                      key={b.id}
                      className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-[10px] text-[#94A3B8]">
                        {b.txnid ?? b.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#0F172A]">{b.users?.full_name ?? "—"}</p>
                        <p className="text-[10px] text-[#94A3B8]">{b.users?.phone ?? ""}</p>
                      </td>
                      <td className="px-4 py-3 text-[#64748B]">{b.centers?.center_name ?? "—"}</td>
                      <td className="px-4 py-3 text-[#0F172A]">{b.slot_date ?? "—"}</td>
                      <td className="px-4 py-3 text-[10px] text-[#94A3B8]">
                        {b.start_time && b.end_time ? `${b.start_time} – ${b.end_time}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-[#64748B]">{b.member_count ?? "—"}</td>
                      <td className="px-4 py-3 text-right font-semibold text-[#0F172A]">
                        {b.total_paise != null
                          ? `₹${(b.total_paise / 100).toLocaleString("en-IN")}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
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

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-[#E2E8F0] px-5 py-3">
          <p className="text-xs text-[#94A3B8]">
            {total} total bookings
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={13} />
            </button>
            <span className="text-xs font-semibold text-[#0F172A]">
              {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </SuperPartnerLayout>
  );
}
