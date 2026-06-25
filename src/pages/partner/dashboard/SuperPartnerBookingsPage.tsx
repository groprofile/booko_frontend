import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Eye, XCircle, ChevronDown } from "lucide-react";
import SuperPartnerLayout from "../../../components/partner/SuperPartnerLayout";

type BookingStatus = "confirmed" | "checked_in" | "pending" | "cancelled" | "completed";

interface Booking {
  id: string;
  guest: string;
  guestEmail: string;
  center: string;
  spaceType: string;
  date: string;
  time: string;
  duration: string;
  amount: number;
  status: BookingStatus;
}

const BOOKINGS: Booking[] = [
  { id: "BK-2401", guest: "Arjun Sharma", guestEmail: "arjun@email.com", center: "WeWork BKC", spaceType: "Day Pass", date: "25 Jun 2024", time: "09:00 AM", duration: "8 hrs", amount: 1200, status: "confirmed" },
  { id: "BK-2402", guest: "Priya Mehta", guestEmail: "priya@email.com", center: "91Springboard HSR", spaceType: "Meeting Room", date: "25 Jun 2024", time: "10:30 AM", duration: "3 hrs", amount: 3600, status: "checked_in" },
  { id: "BK-2403", guest: "Rahul Gupta", guestEmail: "rahul@email.com", center: "Smartworks Cyber City", spaceType: "Day Pass", date: "25 Jun 2024", time: "08:00 AM", duration: "8 hrs", amount: 800, status: "pending" },
  { id: "BK-2404", guest: "Sneha Patel", guestEmail: "sneha@email.com", center: "WeWork BKC", spaceType: "Meeting Room", date: "24 Jun 2024", time: "02:00 PM", duration: "6 hrs", amount: 5400, status: "completed" },
  { id: "BK-2405", guest: "Vikram Nair", guestEmail: "vikram@email.com", center: "91Springboard HSR", spaceType: "Day Pass", date: "24 Jun 2024", time: "09:00 AM", duration: "8 hrs", amount: 1100, status: "cancelled" },
  { id: "BK-2406", guest: "Aisha Khan", guestEmail: "aisha@email.com", center: "WeWork BKC", spaceType: "Day Pass", date: "24 Jun 2024", time: "10:00 AM", duration: "8 hrs", amount: 1200, status: "confirmed" },
  { id: "BK-2407", guest: "Deepak Joshi", guestEmail: "deepak@email.com", center: "Smartworks Cyber City", spaceType: "Meeting Room", date: "23 Jun 2024", time: "11:00 AM", duration: "2 hrs", amount: 2400, status: "completed" },
  { id: "BK-2408", guest: "Kavya Reddy", guestEmail: "kavya@email.com", center: "91Springboard HSR", spaceType: "Day Pass", date: "23 Jun 2024", time: "09:00 AM", duration: "8 hrs", amount: 1100, status: "confirmed" },
  { id: "BK-2409", guest: "Rohan Malhotra", guestEmail: "rohan@email.com", center: "WeWork BKC", spaceType: "Meeting Room", date: "23 Jun 2024", time: "03:00 PM", duration: "4 hrs", amount: 4800, status: "checked_in" },
  { id: "BK-2410", guest: "Ananya Singh", guestEmail: "ananya@email.com", center: "Smartworks Cyber City", spaceType: "Day Pass", date: "22 Jun 2024", time: "09:00 AM", duration: "8 hrs", amount: 800, status: "pending" },
  { id: "BK-2411", guest: "Karan Verma", guestEmail: "karan@email.com", center: "WeWork BKC", spaceType: "Day Pass", date: "22 Jun 2024", time: "08:30 AM", duration: "8 hrs", amount: 1200, status: "cancelled" },
  { id: "BK-2412", guest: "Meera Iyer", guestEmail: "meera@email.com", center: "91Springboard HSR", spaceType: "Meeting Room", date: "22 Jun 2024", time: "01:00 PM", duration: "5 hrs", amount: 6000, status: "completed" },
];

const STATUS_STYLES: Record<BookingStatus, string> = {
  confirmed: "bg-blue-100 text-blue-700",
  checked_in: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-slate-100 text-slate-600",
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  confirmed: "Confirmed",
  checked_in: "Checked In",
  pending: "Pending",
  cancelled: "Cancelled",
  completed: "Completed",
};

type DateFilter = "today" | "week" | "month";
type TabFilter = "all" | BookingStatus;

const TAB_FILTERS: { key: TabFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "confirmed", label: "Confirmed" },
  { key: "checked_in", label: "Checked In" },
  { key: "pending", label: "Pending" },
  { key: "cancelled", label: "Cancelled" },
  { key: "completed", label: "Completed" },
];

const PAGE_SIZE = 8;

export default function SuperPartnerBookingsPage() {
  const [dateFilter, setDateFilter] = useState<DateFilter>("month");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tabFilter, setTabFilter] = useState<TabFilter>("all");
  const [page, setPage] = useState(1);

  const filtered = BOOKINGS.filter((b) => {
    const matchTab = tabFilter === "all" || b.status === tabFilter;
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    const matchSearch =
      !search ||
      b.guest.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.center.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchStatus && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const todayCount = 18;
  const pendingCount = BOOKINGS.filter((b) => b.status === "pending").length;
  const cancelledCount = BOOKINGS.filter((b) => b.status === "cancelled").length;
  const revenueToday = 14400;

  function handleTabChange(tab: TabFilter) {
    setTabFilter(tab);
    setPage(1);
  }

  return (
    <SuperPartnerLayout title="All Bookings" subtitle="Monitor and manage bookings across all centers">
      {/* Top filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-[#E2E8F0] bg-white p-0.5">
          {(["today", "week", "month"] as DateFilter[]).map((d) => (
            <button
              key={d}
              onClick={() => setDateFilter(d)}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                dateFilter === d
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              {d === "today" ? "Today" : d === "week" ? "This Week" : "This Month"}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search bookings, guests..."
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl pl-8 pr-4 py-2.5 text-sm outline-none text-[#0F172A] placeholder:text-[#94A3B8]"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
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
          <p className="text-xl font-bold text-[#0F172A]">{todayCount}</p>
          <p className="mt-0.5 text-xs text-[#64748B]">Today's Bookings</p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
          <p className="text-xl font-bold text-amber-600">{pendingCount}</p>
          <p className="mt-0.5 text-xs text-[#64748B]">Pending Confirmation</p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
          <p className="text-xl font-bold text-red-500">{cancelledCount}</p>
          <p className="mt-0.5 text-xs text-[#64748B]">Cancelled</p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
          <p className="text-xl font-bold text-emerald-600">₹{revenueToday.toLocaleString("en-IN")}</p>
          <p className="mt-0.5 text-xs text-[#64748B]">Revenue Today</p>
        </div>
      </div>

      {/* Table card */}
      <div className="mt-4 rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
        {/* Tab filters */}
        <div className="flex items-center gap-0.5 overflow-x-auto border-b border-[#E2E8F0] px-4 pt-3 pb-0">
          {TAB_FILTERS.map((t) => (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key)}
              className={`shrink-0 rounded-t-lg px-4 py-2 text-xs font-semibold transition-all border-b-2 ${
                tabFilter === t.key
                  ? "border-[#2563EB] text-[#2563EB]"
                  : "border-transparent text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              {t.label}
              {t.key !== "all" && (
                <span className="ml-1.5 rounded-full bg-[#F1F5F9] px-1.5 py-0.5 text-[10px]">
                  {BOOKINGS.filter((b) => b.status === t.key).length}
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
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Space Type</th>
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Date &amp; Time</th>
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Duration</th>
                <th className="px-4 py-3 text-right font-semibold text-[#64748B]">Amount</th>
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Status</th>
                <th className="px-4 py-3 text-center font-semibold text-[#64748B]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm text-[#94A3B8]">
                    No bookings found matching your filters.
                  </td>
                </tr>
              ) : (
                paginated.map((b) => (
                  <tr key={b.id} className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-4 py-3 font-mono text-[#94A3B8]">{b.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#0F172A]">{b.guest}</p>
                      <p className="text-[10px] text-[#94A3B8]">{b.guestEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-[#64748B]">{b.center}</td>
                    <td className="px-4 py-3 text-[#64748B]">{b.spaceType}</td>
                    <td className="px-4 py-3">
                      <p className="text-[#0F172A]">{b.date}</p>
                      <p className="text-[10px] text-[#94A3B8]">{b.time}</p>
                    </td>
                    <td className="px-4 py-3 text-[#64748B]">{b.duration}</td>
                    <td className="px-4 py-3 text-right font-semibold text-[#0F172A]">
                      ₹{b.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[b.status]}`}>
                        {STATUS_LABELS[b.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          title="View Booking"
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
                        >
                          <Eye size={12} />
                        </button>
                        {b.status === "pending" && (
                          <button
                            title="Cancel Booking"
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:border-red-400 hover:text-red-500 transition-colors"
                          >
                            <XCircle size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-[#E2E8F0] px-5 py-3">
          <p className="text-xs text-[#94A3B8]">
            Showing {Math.min((safePage - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} bookings
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={13} />
            </button>
            <span className="text-xs font-semibold text-[#0F172A]">{safePage} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
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
