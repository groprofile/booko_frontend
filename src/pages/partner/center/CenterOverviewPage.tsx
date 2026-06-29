import { useState, useEffect } from "react";
import {
  UserCheck,
  Clock,
  CalendarDays,
  IndianRupee,
  CheckCircle2,
  PlusCircle,
  FileBarChart2,
} from "lucide-react";
import CenterLayout from "../../../components/partner/CenterLayout";
import { usePartner } from "../../../context/PartnerContext";
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
  paid: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
};

function formatTime(): string {
  return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function fmt(t?: string) { return t ? String(t).slice(0, 5) : '—'; }
function avatarChar(name: string) { return (name ?? '?')[0].toUpperCase(); }

function todayLabel() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function CenterOverviewPage() {
  const { partner } = usePartner();
  const [currentTime, setCurrentTime] = useState(formatTime());
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [localCheckin, setLocalCheckin] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(formatTime()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const token = getVendorToken();
    if (!token) return;
    apiGet<{ data: ApiBooking[]; total: number }>('/vendor/bookings/today', token)
      .then((res) => {
        setBookings(res.data ?? []);
        const pre = new Set((res.data ?? []).filter((b) => b.checkin_status).map((b) => b.id));
        setLocalCheckin(pre);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleCheckIn(id: string) {
    setLocalCheckin((prev) => new Set([...prev, id]));
  }

  const checkedInCount = localCheckin.size;
  const upcomingCount = bookings.filter((b) => !localCheckin.has(b.id)).length;
  const totalToday = bookings.length;
  const totalRevenue = bookings.reduce((s, b) => s + Math.round((b.total_paise ?? 0) / 100), 0);

  const TOTAL_SEATS = 40;
  const occupancyPct = Math.min(Math.round((checkedInCount / TOTAL_SEATS) * 100), 100);

  const sorted = [...bookings].sort((a, b) => (a.start_time ?? '').localeCompare(b.start_time ?? ''));
  const activeGuests = bookings.filter((b) => localCheckin.has(b.id));

  return (
    <CenterLayout title="Dashboard" subtitle="Live overview of your center today">
      {/* Greeting header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">
            {getGreeting()}, {partner?.name?.split(" ")[0] ?? "Partner"}
          </h2>
          <p className="mt-0.5 text-sm text-[#64748B]">{todayLabel()}</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-2.5 shadow-sm">
          <Clock size={15} className="text-[#2563EB]" />
          <span className="text-sm font-bold text-[#0F172A]">{currentTime}</span>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-[#94A3B8]">Loading today's data…</div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="mb-5 grid grid-cols-4 gap-4">
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

            <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm border-l-4 border-l-amber-400 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-[#64748B]">Upcoming</p>
                  <p className="mt-1 text-2xl font-bold text-[#0F172A]">{upcomingCount}</p>
                  <p className="mt-0.5 text-xs text-[#94A3B8]">not yet arrived</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                  <Clock size={18} className="text-amber-600" />
                </div>
              </div>
            </div>

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
            {/* Timeline */}
            <div className="col-span-3 rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
              <div className="border-b border-[#E2E8F0] px-5 py-3.5">
                <h3 className="text-sm font-bold text-[#0F172A]">Today's Booking Timeline</h3>
                <p className="text-xs text-[#94A3B8]">Sorted by check-in time</p>
              </div>
              <div className="max-h-[320px] overflow-y-auto p-4">
                {sorted.length === 0 ? (
                  <div className="py-8 text-center text-sm text-[#94A3B8]">No bookings today.</div>
                ) : (
                  <div className="relative space-y-0">
                    {sorted.map((booking, idx) => {
                      const isCheckedIn = localCheckin.has(booking.id);
                      const canCheckIn = !isCheckedIn;
                      const effectiveStatus = isCheckedIn ? "checked_in" : booking.status;
                      const guestName = booking.users?.full_name ?? 'Guest';
                      return (
                        <div key={booking.id} className="relative flex gap-3 pb-4 last:pb-0">
                          {idx < sorted.length - 1 && (
                            <div className="absolute left-[34px] top-7 h-full w-px bg-[#E2E8F0]" />
                          )}
                          <div className="w-16 shrink-0 pt-1 text-right">
                            <span className="rounded-lg bg-[#F1F5F9] px-1.5 py-0.5 text-[10px] font-bold text-[#64748B]">
                              {fmt(booking.start_time)}
                            </span>
                          </div>
                          <div className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                            isCheckedIn ? "bg-emerald-500" : "bg-[#2563EB]"
                          }`}>
                            {avatarChar(guestName)}
                          </div>
                          <div className="flex flex-1 items-center justify-between gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2">
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-[#0F172A]">{guestName}</p>
                              <p className="text-[10px] text-[#94A3B8]">{fmt(booking.start_time)} – {fmt(booking.end_time)}</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[effectiveStatus] ?? 'bg-slate-100 text-slate-600'}`}>
                                {STATUS_LABELS[effectiveStatus] ?? effectiveStatus}
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
                )}
              </div>
            </div>

            {/* Occupancy */}
            <div className="col-span-2 flex flex-col gap-4">
              <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm p-5">
                <h3 className="mb-4 text-sm font-bold text-[#0F172A]">Live Occupancy</h3>
                <div className="flex items-center gap-5">
                  <div className="relative h-24 w-24 shrink-0">
                    <div
                      className="h-24 w-24 rounded-full"
                      style={{
                        background: `conic-gradient(#10B981 0% ${occupancyPct}%, #F1F5F9 ${occupancyPct}% 100%)`,
                      }}
                    />
                    <div className="absolute inset-[14px] flex flex-col items-center justify-center rounded-full bg-white">
                      <span className="text-lg font-bold text-[#0F172A]">{occupancyPct}%</span>
                      <span className="text-[9px] text-[#94A3B8]">occupied</span>
                    </div>
                  </div>
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
                        <span className="text-emerald-600">{checkedInCount}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#F1F5F9]">
                        <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${occupancyPct}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-medium mb-0.5">
                        <span className="text-[#64748B]">Available</span>
                        <span className="text-[#2563EB]">{Math.max(TOTAL_SEATS - checkedInCount, 0)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#F1F5F9]">
                        <div className="h-1.5 rounded-full bg-[#2563EB]" style={{ width: `${100 - occupancyPct}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Guests */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm p-4">
                <h3 className="mb-3 text-sm font-bold text-[#0F172A]">Active Guests</h3>
                <div className="space-y-2">
                  {activeGuests.length === 0 ? (
                    <p className="py-4 text-center text-xs text-[#94A3B8]">No active guests yet.</p>
                  ) : (
                    activeGuests.map((g) => (
                      <div key={g.id} className="flex items-center gap-2.5 rounded-xl border border-[#E2E8F0] px-3 py-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                          {avatarChar(g.users?.full_name ?? 'G')}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-[#0F172A]">{g.users?.full_name ?? '—'}</p>
                          <p className="text-[10px] text-[#94A3B8]">since {fmt(g.start_time)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row: Quick Actions */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
            <div className="border-b border-[#E2E8F0] px-5 py-3.5">
              <h3 className="text-sm font-bold text-[#0F172A]">Quick Actions</h3>
              <p className="text-xs text-[#94A3B8]">Common center operations</p>
            </div>
            <div className="flex gap-3 p-4">
              <button className="flex flex-1 items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5 text-left transition-all hover:border-emerald-300 hover:bg-emerald-50">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100">
                  <UserCheck size={17} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">Manual Check-in</p>
                  <p className="text-[11px] text-[#94A3B8]">Check in a guest by ID or name</p>
                </div>
              </button>

              <button className="flex flex-1 items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5 text-left transition-all hover:border-blue-300 hover:bg-blue-50">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100">
                  <PlusCircle size={17} className="text-[#2563EB]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">Add Walk-in Booking</p>
                  <p className="text-[11px] text-[#94A3B8]">Create booking for walk-in guest</p>
                </div>
              </button>

              <button className="flex flex-1 items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5 text-left transition-all hover:border-purple-300 hover:bg-purple-50">
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
        </>
      )}
    </CenterLayout>
  );
}
