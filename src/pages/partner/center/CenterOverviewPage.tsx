import { useState, useEffect } from "react";
import {
  UserCheck,
  Clock,
  CalendarDays,
  IndianRupee,
  CheckCircle2,
  UserPlus,
  PlusCircle,
  FileBarChart2,
  Check,
} from "lucide-react";
import CenterLayout from "../../../components/partner/CenterLayout";
import { usePartner } from "../../../context/PartnerContext";

interface Booking {
  id: string;
  guest: string;
  mobile: string;
  type: string;
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

function formatTime(): string {
  const now = new Date();
  return now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function CenterOverviewPage() {
  const { partner } = usePartner();
  const [currentTime, setCurrentTime] = useState(formatTime());
  const [checkedIn, setCheckedIn] = useState<Set<string>>(
    new Set(TODAY_BOOKINGS.filter((b) => b.status === "checked_in").map((b) => b.id))
  );

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(formatTime()), 60000);
    return () => clearInterval(timer);
  }, []);

  const totalRevenue = TODAY_BOOKINGS.reduce((s, b) => s + b.amount, 0);
  const checkedInCount = checkedIn.size;
  const upcomingCount = TODAY_BOOKINGS.filter((b) => b.status === "upcoming" || b.status === "confirmed").length;
  const totalToday = TODAY_BOOKINGS.length;

  const TOTAL_SEATS = 40;
  const occupiedSeats = checkedInCount + 2;
  const occupancyPct = Math.round((occupiedSeats / TOTAL_SEATS) * 100);

  const specialRequests = TODAY_BOOKINGS.filter((b) => b.special.length > 0);
  const [resolvedRequests, setResolvedRequests] = useState<Set<string>>(new Set());

  const sorted = [...TODAY_BOOKINGS].sort((a, b) => a.checkIn.localeCompare(b.checkIn));

  function handleCheckIn(id: string) {
    setCheckedIn((prev) => new Set([...prev, id]));
  }

  const activeGuests = TODAY_BOOKINGS.filter((b) => checkedIn.has(b.id));

  return (
    <CenterLayout
      title="Dashboard"
      subtitle="Live overview of your center today"
    >
      {/* Greeting header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">
            {getGreeting()}, {partner?.name?.split(" ")[0] ?? "Partner"}
          </h2>
          <p className="mt-0.5 text-sm text-[#64748B]">Wednesday, 25 June 2026</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-2.5 shadow-sm">
          <Clock size={15} className="text-[#2563EB]" />
          <span className="text-sm font-bold text-[#0F172A]">{currentTime}</span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="mb-5 grid grid-cols-4 gap-4">
        {/* Checked In */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm border-l-4 border-l-emerald-500 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-[#64748B]">Checked In</p>
              <p className="mt-1 text-2xl font-bold text-[#0F172A]">{checkedInCount}</p>
              <p className="mt-0.5 text-xs text-[#94A3B8]">guests active now</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
              <UserCheck size={18} className="text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Upcoming */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm border-l-4 border-l-amber-400 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-[#64748B]">Upcoming</p>
              <p className="mt-1 text-2xl font-bold text-[#0F172A]">{upcomingCount}</p>
              <p className="mt-0.5 text-xs text-[#94A3B8]">next 2 hours</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
              <Clock size={18} className="text-amber-600" />
            </div>
          </div>
        </div>

        {/* Total Today */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm border-l-4 border-l-[#2563EB] p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-[#64748B]">Total Today</p>
              <p className="mt-1 text-2xl font-bold text-[#0F172A]">{totalToday}</p>
              <p className="mt-0.5 text-xs text-[#94A3B8]">bookings</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <CalendarDays size={18} className="text-[#2563EB]" />
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm border-l-4 border-l-purple-500 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-[#64748B]">Today's Revenue</p>
              <p className="mt-1 text-2xl font-bold text-[#0F172A]">
                &#8377;{totalRevenue.toLocaleString("en-IN")}
              </p>
              <p className="mt-0.5 text-xs text-[#94A3B8]">collected</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
              <IndianRupee size={18} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Middle row: Timeline + Occupancy */}
      <div className="mb-5 grid grid-cols-5 gap-4">
        {/* Timeline — 60% */}
        <div className="col-span-3 rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="border-b border-[#E2E8F0] px-5 py-3.5">
            <h3 className="text-sm font-bold text-[#0F172A]">Today's Booking Timeline</h3>
            <p className="text-xs text-[#94A3B8]">Sorted by check-in time</p>
          </div>
          <div className="max-h-[320px] overflow-y-auto p-4">
            <div className="relative space-y-0">
              {sorted.map((booking, idx) => {
                const isCheckedIn = checkedIn.has(booking.id);
                const canCheckIn = booking.status === "upcoming" || booking.status === "confirmed";
                const effectiveStatus = isCheckedIn ? "checked_in" : booking.status;
                return (
                  <div key={booking.id} className="relative flex gap-3 pb-4 last:pb-0">
                    {/* Timeline line */}
                    {idx < sorted.length - 1 && (
                      <div className="absolute left-[34px] top-7 h-full w-px bg-[#E2E8F0]" />
                    )}
                    {/* Time pill */}
                    <div className="w-16 shrink-0 pt-1 text-right">
                      <span className="rounded-lg bg-[#F1F5F9] px-1.5 py-0.5 text-[10px] font-bold text-[#64748B]">
                        {booking.checkIn}
                      </span>
                    </div>
                    {/* Avatar */}
                    <div className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                      isCheckedIn ? "bg-emerald-500" : "bg-[#2563EB]"
                    }`}>
                      {booking.avatar}
                    </div>
                    {/* Content */}
                    <div className="flex flex-1 items-center justify-between gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-[#0F172A]">{booking.guest}</p>
                        <p className="text-[10px] text-[#94A3B8]">{booking.type} &middot; {booking.duration}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[effectiveStatus]}`}>
                          {STATUS_LABELS[effectiveStatus]}
                        </span>
                        {isCheckedIn ? (
                          <CheckCircle2 size={16} className="text-emerald-500" />
                        ) : canCheckIn ? (
                          <button
                            onClick={() => handleCheckIn(booking.id)}
                            className="rounded-lg bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white transition-colors hover:bg-emerald-600"
                          >
                            Check In
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Occupancy — 40% */}
        <div className="col-span-2 flex flex-col gap-4">
          {/* Donut */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm p-5">
            <h3 className="mb-4 text-sm font-bold text-[#0F172A]">Live Occupancy</h3>
            <div className="flex items-center gap-5">
              {/* Donut */}
              <div className="relative h-24 w-24 shrink-0">
                <div
                  className="h-24 w-24 rounded-full"
                  style={{
                    background: `conic-gradient(#10B981 0% ${occupancyPct}%, #F1F5F9 ${occupancyPct}% 100%)`,
                  }}
                />
                {/* Inner white circle */}
                <div className="absolute inset-[14px] flex flex-col items-center justify-center rounded-full bg-white">
                  <span className="text-lg font-bold text-[#0F172A]">{occupancyPct}%</span>
                  <span className="text-[9px] text-[#94A3B8]">occupied</span>
                </div>
              </div>
              {/* Capacity bars */}
              <div className="flex-1 space-y-2.5">
                <div>
                  <div className="flex justify-between text-[10px] font-medium">
                    <span className="text-[#64748B]">Total Seats</span>
                    <span className="text-[#0F172A]">{TOTAL_SEATS}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-medium mb-0.5">
                    <span className="text-[#64748B]">Occupied</span>
                    <span className="text-emerald-600">{occupiedSeats}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#F1F5F9]">
                    <div
                      className="h-1.5 rounded-full bg-emerald-500"
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-medium mb-0.5">
                    <span className="text-[#64748B]">Available</span>
                    <span className="text-[#2563EB]">{TOTAL_SEATS - occupiedSeats}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#F1F5F9]">
                    <div
                      className="h-1.5 rounded-full bg-[#2563EB]"
                      style={{ width: `${100 - occupancyPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Guests */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm p-4">
            <h3 className="mb-3 text-sm font-bold text-[#0F172A]">Active Guests</h3>
            <div className="space-y-2">
              {activeGuests.map((g) => (
                <div key={g.id} className="flex items-center gap-2.5 rounded-xl border border-[#E2E8F0] px-3 py-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                    {g.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-[#0F172A]">{g.guest}</p>
                    <p className="text-[10px] text-[#94A3B8]">
                      {g.seat ?? g.room} &middot; since {g.checkIn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: Special Requests + Quick Actions */}
      <div className="grid grid-cols-5 gap-4">
        {/* Special Requests */}
        <div className="col-span-3 rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="border-b border-[#E2E8F0] px-5 py-3.5">
            <h3 className="text-sm font-bold text-[#0F172A]">Special Requests Today</h3>
            <p className="text-xs text-[#94A3B8]">{specialRequests.length - resolvedRequests.size} pending</p>
          </div>
          <div className="p-4 space-y-3">
            {specialRequests.map((b) => {
              const done = resolvedRequests.has(b.id);
              return (
                <div
                  key={b.id}
                  className={`rounded-xl border px-4 py-3 ${done ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        done ? "bg-emerald-200 text-emerald-800" : "bg-amber-200 text-amber-800"
                      }`}>
                        {b.avatar}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#0F172A]">{b.guest}</p>
                        <p className="mt-0.5 text-xs text-[#64748B]">{b.special}</p>
                        <p className="mt-1 text-[10px] text-[#94A3B8]">{b.type} &middot; Check-in {b.checkIn}</p>
                      </div>
                    </div>
                    {done ? (
                      <div className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1">
                        <Check size={11} className="text-emerald-600" />
                        <span className="text-[10px] font-bold text-emerald-700">Done</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setResolvedRequests((prev) => new Set([...prev, b.id]))}
                        className="shrink-0 rounded-lg border border-emerald-300 bg-white px-2.5 py-1 text-[10px] font-bold text-emerald-600 transition-colors hover:bg-emerald-50"
                      >
                        Mark Done
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-span-2 rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="border-b border-[#E2E8F0] px-5 py-3.5">
            <h3 className="text-sm font-bold text-[#0F172A]">Quick Actions</h3>
            <p className="text-xs text-[#94A3B8]">Common center operations</p>
          </div>
          <div className="flex flex-col gap-3 p-4">
            <button className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5 text-left transition-all hover:border-emerald-300 hover:bg-emerald-50">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100">
                <UserCheck size={17} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">Manual Check-in</p>
                <p className="text-[11px] text-[#94A3B8]">Check in a guest by ID or name</p>
              </div>
            </button>

            <button className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5 text-left transition-all hover:border-blue-300 hover:bg-blue-50">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100">
                <PlusCircle size={17} className="text-[#2563EB]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">Add Walk-in Booking</p>
                <p className="text-[11px] text-[#94A3B8]">Create booking for walk-in guest</p>
              </div>
            </button>

            <button className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5 text-left transition-all hover:border-purple-300 hover:bg-purple-50">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100">
                <FileBarChart2 size={17} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">Generate Day Report</p>
                <p className="text-[11px] text-[#94A3B8]">Export today's summary as PDF</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </CenterLayout>
  );
}
