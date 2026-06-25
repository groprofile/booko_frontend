import { useState } from "react";
import {
  Search,
  CalendarDays,
  IndianRupee,
  Eye,
  UserCheck,
  UserX,
  LogOut,
} from "lucide-react";
import CenterLayout from "../../../components/partner/CenterLayout";

interface Booking {
  id: string;
  guest: string;
  mobile: string;
  type: "Day Pass" | "Meeting Room";
  checkIn: string;
  checkOut: string;
  duration: string;
  status: "checked_in" | "upcoming" | "confirmed" | "cancelled" | "completed";
  seat?: string;
  room?: string;
  guests?: number;
  amount: number;
  avatar: string;
  special: string;
}

const TODAY_BOOKINGS: Booking[] = [
  { id: "BK8823", guest: "Rahul Sharma", mobile: "+91 98765 43210", type: "Day Pass", checkIn: "09:00", checkOut: "18:00", duration: "Full Day", status: "checked_in", seat: "A-12", amount: 799, avatar: "R", special: "" },
  { id: "BK8824", guest: "Priya Mehta", mobile: "+91 87654 32109", type: "Meeting Room", checkIn: "10:00", checkOut: "12:00", duration: "2 hrs", status: "upcoming", room: "Boardroom A", guests: 6, amount: 1999, avatar: "P", special: "Need projector + whiteboard setup" },
  { id: "BK8825", guest: "Arjun Kapoor", mobile: "+91 76543 21098", type: "Day Pass", checkIn: "10:30", checkOut: "15:00", duration: "Half Day", status: "upcoming", seat: "B-07", amount: 499, avatar: "A", special: "" },
  { id: "BK8826", guest: "Neha Singh", mobile: "+91 65432 10987", type: "Meeting Room", checkIn: "11:00", checkOut: "12:00", duration: "1 hr", status: "confirmed", room: "Focus Room 1", guests: 3, amount: 799, avatar: "N", special: "Please arrange 3 chairs" },
  { id: "BK8827", guest: "Vikram Patel", mobile: "+91 54321 09876", type: "Day Pass", checkIn: "09:00", checkOut: "18:00", duration: "Full Day", status: "checked_in", seat: "C-03", amount: 799, avatar: "V", special: "" },
  { id: "BK8828", guest: "Sneha Gupta", mobile: "+91 43210 98765", type: "Day Pass", checkIn: "11:30", checkOut: "18:00", duration: "Half Day", status: "confirmed", seat: "D-15", amount: 499, avatar: "S", special: "" },
  { id: "BK8829", guest: "Rohit Kumar", mobile: "+91 32109 87654", type: "Meeting Room", checkIn: "14:00", checkOut: "16:00", duration: "2 hrs", status: "confirmed", room: "Boardroom B", guests: 8, amount: 1999, avatar: "R", special: "Team lunch — need extra chairs" },
  { id: "BK8830", guest: "Anjali Nair", mobile: "+91 21098 76543", type: "Day Pass", checkIn: "08:00", checkOut: "13:00", duration: "Half Day", status: "checked_in", seat: "E-22", amount: 499, avatar: "A", special: "" },
];

type StatusFilter = "all" | "confirmed" | "checked_in" | "upcoming" | "completed" | "cancelled";
type TypeFilter = "all" | "Day Pass" | "Meeting Room" | "Virtual Office";

const STATUS_STYLES: Record<string, string> = {
  checked_in: "bg-emerald-100 text-emerald-700",
  confirmed: "bg-blue-100 text-blue-700",
  upcoming: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-600",
  completed: "bg-slate-100 text-slate-600",
};

const STATUS_LABELS: Record<string, string> = {
  checked_in: "Checked In",
  confirmed: "Confirmed",
  upcoming: "Upcoming",
  cancelled: "Cancelled",
  completed: "Completed",
};

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "confirmed", label: "Confirmed" },
  { value: "checked_in", label: "Checked In" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function CenterBookingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [dateFilter, setDateFilter] = useState("2026-06-25");
  const [bookingStatuses, setBookingStatuses] = useState<Record<string, Booking["status"]>>(
    Object.fromEntries(TODAY_BOOKINGS.map((b) => [b.id, b.status]))
  );

  const totalRevenue = TODAY_BOOKINGS.reduce((s, b) => s + b.amount, 0);

  const filtered = TODAY_BOOKINGS.filter((b) => {
    const effectiveStatus = bookingStatuses[b.id] ?? b.status;
    const matchStatus = statusFilter === "all" || effectiveStatus === statusFilter;
    const matchType = typeFilter === "all" || b.type === typeFilter;
    const matchSearch =
      searchQuery.trim() === "" ||
      b.guest.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchType && matchSearch;
  });

  function handleCheckIn(id: string) {
    setBookingStatuses((prev) => ({ ...prev, [id]: "checked_in" }));
  }

  function handleCheckOut(id: string) {
    setBookingStatuses((prev) => ({ ...prev, [id]: "completed" }));
  }

  function handleCancel(id: string) {
    setBookingStatuses((prev) => ({ ...prev, [id]: "cancelled" }));
  }

  return (
    <CenterLayout title="Bookings" subtitle="Manage all reservations for your center">
      {/* KPI Summary */}
      <div className="mb-5 grid grid-cols-4 gap-3">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-sm">
          <p className="text-xs text-[#64748B]">Today</p>
          <p className="mt-0.5 text-xl font-bold text-[#0F172A]">8</p>
          <p className="text-[10px] text-[#94A3B8]">bookings</p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-sm">
          <p className="text-xs text-[#64748B]">This Week</p>
          <p className="mt-0.5 text-xl font-bold text-[#0F172A]">42</p>
          <p className="text-[10px] text-[#94A3B8]">bookings</p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-sm">
          <p className="text-xs text-[#64748B]">Pending</p>
          <p className="mt-0.5 text-xl font-bold text-amber-500">4</p>
          <p className="text-[10px] text-[#94A3B8]">need action</p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-1">
            <IndianRupee size={12} className="text-[#64748B]" />
            <p className="text-xs text-[#64748B]">Revenue</p>
          </div>
          <p className="mt-0.5 text-xl font-bold text-[#0F172A]">
            &#8377;{totalRevenue.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-[#94A3B8]">today</p>
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

          {/* Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            className="bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl px-4 py-2 text-sm text-[#0F172A] outline-none"
          >
            <option value="all">All Space Types</option>
            <option value="Day Pass">Day Pass</option>
            <option value="Meeting Room">Meeting Room</option>
            <option value="Virtual Office">Virtual Office</option>
          </select>

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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]">Booking ID</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]">Guest</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]">Space Type</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]">Time</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]">Duration</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]">Seat / Room</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]">Amount</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]">Status</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-[#94A3B8]">
                    No bookings found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((booking) => {
                  const effectiveStatus = bookingStatuses[booking.id] ?? booking.status;
                  const canCheckIn = effectiveStatus === "upcoming" || effectiveStatus === "confirmed";
                  const isCheckedIn = effectiveStatus === "checked_in";
                  const canCancel = effectiveStatus === "confirmed" || effectiveStatus === "upcoming";

                  return (
                    <tr
                      key={booking.id}
                      className="transition-colors hover:bg-[#F8FAFC]"
                    >
                      {/* ID */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-semibold text-[#2563EB]">{booking.id}</span>
                      </td>

                      {/* Guest */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2563EB]/10 text-xs font-bold text-[#2563EB]">
                            {booking.avatar}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[#0F172A]">{booking.guest}</p>
                            <p className="text-[10px] text-[#94A3B8]">{booking.mobile}</p>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          booking.type === "Day Pass"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-purple-50 text-purple-600"
                        }`}>
                          {booking.type}
                        </span>
                      </td>

                      {/* Time */}
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-[#0F172A]">{booking.checkIn} – {booking.checkOut}</p>
                        <p className="text-[10px] text-[#94A3B8]">25 Jun 2026</p>
                      </td>

                      {/* Duration */}
                      <td className="px-4 py-3">
                        <p className="text-xs text-[#64748B]">{booking.duration}</p>
                      </td>

                      {/* Seat/Room */}
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-[#0F172A]">
                          {booking.seat ?? booking.room}
                        </p>
                        {booking.guests && (
                          <p className="text-[10px] text-[#94A3B8]">{booking.guests} guests</p>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-[#0F172A]">
                          &#8377;{booking.amount.toLocaleString("en-IN")}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[effectiveStatus]}`}>
                          {STATUS_LABELS[effectiveStatus]}
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

                          {canCheckIn && (
                            <button
                              onClick={() => handleCheckIn(booking.id)}
                              title="Check In"
                              className="flex h-7 items-center gap-1 rounded-lg bg-emerald-100 px-2 text-[10px] font-bold text-emerald-700 transition-colors hover:bg-emerald-200"
                            >
                              <UserCheck size={11} />
                              Check In
                            </button>
                          )}

                          {isCheckedIn && (
                            <button
                              onClick={() => handleCheckOut(booking.id)}
                              title="Check Out"
                              className="flex h-7 items-center gap-1 rounded-lg bg-slate-100 px-2 text-[10px] font-bold text-slate-600 transition-colors hover:bg-slate-200"
                            >
                              <LogOut size={11} />
                              Check Out
                            </button>
                          )}

                          {canCancel && (
                            <button
                              onClick={() => handleCancel(booking.id)}
                              title="Cancel Booking"
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 text-red-400 transition-colors hover:bg-red-50"
                            >
                              <UserX size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-[#E2E8F0] px-5 py-3 flex items-center justify-between bg-[#F8FAFC]">
          <p className="text-xs text-[#94A3B8]">
            Showing {filtered.length} of {TODAY_BOOKINGS.length} bookings
          </p>
          <p className="text-xs text-[#94A3B8]">
            Note: On mobile, some columns are hidden for better readability.
          </p>
        </div>
      </div>
    </CenterLayout>
  );
}
