import { useState, useEffect, useCallback } from "react";
import {
  Search,
  CalendarDays,
  IndianRupee,
  Eye,
} from "lucide-react";
import CenterLayout from "../../../components/partner/CenterLayout";
import { apiGet, getVendorToken } from "../../../lib/api";

interface ApiBooking {
  id: string;
  status: string;
  checkin_status: boolean;
  slot_date: string;
  start_time: string;
  end_time: string;
  total_paise: number;
  center_id: string;
  users: { full_name: string; phone: string };
  centers: { center_name: string };
}

type StatusFilter = "all" | "confirmed" | "paid" | "checked_in" | "completed" | "cancelled";

const STATUS_STYLES: Record<string, string> = {
  checked_in: "bg-emerald-100 text-emerald-700",
  confirmed: "bg-blue-100 text-blue-700",
  paid: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-600",
  completed: "bg-slate-100 text-slate-600",
};

const STATUS_LABELS: Record<string, string> = {
  checked_in: "Checked In",
  confirmed: "Confirmed",
  paid: "Paid",
  cancelled: "Cancelled",
  completed: "Completed",
};

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "confirmed", label: "Confirmed" },
  { value: "paid", label: "Paid" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function fmt(t?: string) { return t ? String(t).slice(0, 5) : '—'; }
function avatarChar(name: string) { return (name ?? '?')[0].toUpperCase(); }

function effectiveStatus(b: ApiBooking): string {
  if (b.checkin_status) return 'checked_in';
  return b.status;
}

export default function CenterBookingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState(todayIso());
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback((date: string) => {
    const token = getVendorToken();
    if (!token) return;
    setLoading(true);
    apiGet<{ data: ApiBooking[]; total: number }>(
      `/vendor/bookings?date=${date}&limit=100`,
      token,
    )
      .then((res) => {
        setBookings(res.data ?? []);
        setTotal(res.total ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchBookings(dateFilter);
  }, [dateFilter, fetchBookings]);

  const filtered = bookings.filter((b) => {
    const es = effectiveStatus(b);
    const matchStatus = statusFilter === "all" || es === statusFilter || b.status === statusFilter;
    const matchSearch =
      searchQuery.trim() === "" ||
      (b.users?.full_name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalRevenue = bookings.reduce((s, b) => s + Math.round((b.total_paise ?? 0) / 100), 0);
  const pendingCount = bookings.filter((b) => b.status === 'confirmed' || b.status === 'paid').length;

  return (
    <CenterLayout title="Bookings" subtitle="Manage all reservations for your center">
      {/* KPI Summary */}
      <div className="mb-5 grid grid-cols-4 gap-3">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-sm">
          <p className="text-xs text-[#64748B]">Selected Date</p>
          <p className="mt-0.5 text-xl font-bold text-[#0F172A]">{total}</p>
          <p className="text-[10px] text-[#94A3B8]">bookings</p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-sm">
          <p className="text-xs text-[#64748B]">Checked In</p>
          <p className="mt-0.5 text-xl font-bold text-emerald-600">
            {bookings.filter((b) => b.checkin_status).length}
          </p>
          <p className="text-[10px] text-[#94A3B8]">guests</p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-sm">
          <p className="text-xs text-[#64748B]">Pending</p>
          <p className="mt-0.5 text-xl font-bold text-amber-500">{pendingCount}</p>
          <p className="text-[10px] text-[#94A3B8]">not yet arrived</p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-1">
            <IndianRupee size={12} className="text-[#64748B]" />
            <p className="text-xs text-[#64748B]">Revenue</p>
          </div>
          <p className="mt-0.5 text-xl font-bold text-[#0F172A]">
            &#8377;{totalRevenue.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-[#94A3B8]">selected date</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date */}
          <div className="flex items-center gap-2">
            <CalendarDays size={14} className="text-[#94A3B8]" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl px-4 py-2 text-sm text-[#0F172A] outline-none"
            />
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search guest name or booking ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl pl-9 pr-4 py-2 text-sm text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
            />
          </div>
        </div>

        {/* Status tabs */}
        <div className="mt-3 flex gap-1.5 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                statusFilter === tab.value
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-[#94A3B8]">Loading bookings…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]">Booking ID</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]">Guest</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]">Center</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]">Time</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]">Date</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]">Amount</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]">Status</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-[#94A3B8]">
                      No bookings found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((booking) => {
                    const es = effectiveStatus(booking);
                    return (
                      <tr key={booking.id} className="transition-colors hover:bg-[#F8FAFC]">
                        {/* ID */}
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-semibold text-[#2563EB]">
                            {booking.id.slice(0, 8)}…
                          </span>
                        </td>

                        {/* Guest */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2563EB]/10 text-xs font-bold text-[#2563EB]">
                              {avatarChar(booking.users?.full_name ?? 'G')}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-[#0F172A]">{booking.users?.full_name ?? '—'}</p>
                              <p className="text-[10px] text-[#94A3B8]">{booking.users?.phone ?? '—'}</p>
                            </div>
                          </div>
                        </td>

                        {/* Center */}
                        <td className="px-4 py-3">
                          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-600">
                            {booking.centers?.center_name ?? '—'}
                          </span>
                        </td>

                        {/* Time */}
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-[#0F172A]">
                            {fmt(booking.start_time)} – {fmt(booking.end_time)}
                          </p>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3">
                          <p className="text-xs text-[#64748B]">{booking.slot_date?.slice(0, 10) ?? '—'}</p>
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3">
                          <p className="text-xs font-semibold text-[#0F172A]">
                            &#8377;{Math.round((booking.total_paise ?? 0) / 100).toLocaleString("en-IN")}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[es] ?? 'bg-slate-100 text-slate-600'}`}>
                            {STATUS_LABELS[es] ?? es}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              title="View Details"
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] transition-colors hover:bg-[#F1F5F9]"
                            >
                              <Eye size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-[#E2E8F0] px-5 py-3 flex items-center justify-between bg-[#F8FAFC]">
          <p className="text-xs text-[#94A3B8]">
            Showing {filtered.length} of {total} bookings
          </p>
          <p className="text-xs text-[#94A3B8]">
            Date: {dateFilter}
          </p>
        </div>
      </div>
    </CenterLayout>
  );
}
