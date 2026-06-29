import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  IndianRupee,
} from "lucide-react";
import CenterLayout from "../../../components/partner/CenterLayout";
import { apiGet, getVendorToken } from "../../../lib/api";

interface ApiBooking {
  id: string;
  status: string;
  slot_date: string;
  total_paise: number;
}

interface DayData {
  bookings: number;
  revenue: number;
  highOccupancy: boolean;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface CalendarMonth {
  year: number;
  month: number; // 0-indexed
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getStartDow(year: number, month: number): number {
  const jsDay = new Date(year, month, 1).getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

function isoDate(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function groupByDay(bookings: ApiBooking[]): Record<number, DayData> {
  const map: Record<number, DayData> = {};
  for (const b of bookings) {
    const d = new Date(b.slot_date);
    const day = d.getUTCDate();
    if (!map[day]) map[day] = { bookings: 0, revenue: 0, highOccupancy: false };
    map[day].bookings += 1;
    map[day].revenue += Math.round((b.total_paise ?? 0) / 100);
  }
  for (const d of Object.values(map)) {
    d.highOccupancy = d.bookings >= 10;
  }
  return map;
}

function upcomingWeek(
  year: number,
  month: number,
  todayDay: number,
  dayData: Record<number, DayData>,
  daysInMonth: number,
): { label: string; bookings: number; revenue: number }[] {
  const result = [];
  for (let i = 0; i < 7; i++) {
    const day = todayDay + i;
    if (day > daysInMonth) break;
    const date = new Date(year, month, day);
    const label = date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    const data = dayData[day] ?? { bookings: 0, revenue: 0 };
    result.push({ label, bookings: data.bookings, revenue: data.revenue });
  }
  return result;
}

export default function CenterCalendarPage() {
  const now = new Date();
  const [calMonth, setCalMonth] = useState<CalendarMonth>({ year: now.getFullYear(), month: now.getMonth() });
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());
  const [dayData, setDayData] = useState<Record<number, DayData>>({});
  const [loading, setLoading] = useState(true);

  const isCurrentMonth = calMonth.year === now.getFullYear() && calMonth.month === now.getMonth();
  const TODAY_DAY = isCurrentMonth ? now.getDate() : -1;

  const daysInMonth = getDaysInMonth(calMonth.year, calMonth.month);
  const startDow = getStartDow(calMonth.year, calMonth.month);

  const fetchMonth = useCallback((year: number, month: number) => {
    const token = getVendorToken();
    if (!token) return;
    const startDate = isoDate(year, month, 1);
    const endDate = isoDate(year, month, getDaysInMonth(year, month));
    setLoading(true);
    apiGet<{ data: ApiBooking[]; total: number }>(
      `/vendor/bookings?startDate=${startDate}&endDate=${endDate}&limit=500`,
      token,
    )
      .then((res) => {
        setDayData(groupByDay(res.data ?? []));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchMonth(calMonth.year, calMonth.month);
  }, [calMonth, fetchMonth]);

  function prevMonth() {
    setCalMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: prev.month - 1 };
    });
    setSelectedDay(null);
  }

  function nextMonth() {
    setCalMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: prev.month + 1 };
    });
    setSelectedDay(null);
  }

  const selectedDayData = selectedDay ? dayData[selectedDay] : null;

  const gridCells: Array<number | null> = [
    ...Array<null>(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (gridCells.length % 7 !== 0) gridCells.push(null);

  const weekAhead = isCurrentMonth
    ? upcomingWeek(calMonth.year, calMonth.month, TODAY_DAY, dayData, daysInMonth)
    : [];

  const monthTotal = Object.values(dayData).reduce((s, d) => s + d.bookings, 0);
  const monthRevenue = Object.values(dayData).reduce((s, d) => s + d.revenue, 0);

  return (
    <CenterLayout title="Calendar" subtitle="Monthly booking overview and occupancy">
      {/* Month navigation */}
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-[#64748B] shadow-sm transition-colors hover:bg-[#F8FAFC]"
        >
          <ChevronLeft size={16} />
          {MONTHS[(calMonth.month - 1 + 12) % 12]}
        </button>
        <div className="text-center">
          <h2 className="text-base font-bold text-[#0F172A]">
            {MONTHS[calMonth.month]} {calMonth.year}
          </h2>
          {!loading && (
            <p className="text-xs text-[#94A3B8]">{monthTotal} bookings · ₹{monthRevenue.toLocaleString('en-IN')} revenue</p>
          )}
        </div>
        <button
          onClick={nextMonth}
          className="flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-[#64748B] shadow-sm transition-colors hover:bg-[#F8FAFC]"
        >
          {MONTHS[(calMonth.month + 1) % 12]}
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Legend */}
      <div className="mb-4 flex items-center gap-5 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" />
          <span className="text-xs text-[#64748B]">Has Bookings</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="text-xs text-[#64748B]">High Occupancy (10+)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB] ring-2 ring-[#2563EB]/30" />
          <span className="text-xs text-[#64748B]">Today</span>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-[#E2E8F0]">
          {DAY_HEADERS.map((d) => (
            <div
              key={d}
              className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 divide-x divide-[#F1F5F9]">
          {gridCells.map((day, idx) => {
            if (!day) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[80px] border-b border-[#F1F5F9] bg-[#FAFAFA]"
                />
              );
            }

            const isPast = isCurrentMonth && day < TODAY_DAY;
            const isToday = isCurrentMonth && day === TODAY_DAY;
            const isSelected = selectedDay === day;
            const data = dayData[day];

            return (
              <div
                key={day}
                onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                className={`relative min-h-[80px] cursor-pointer border-b border-[#F1F5F9] p-2.5 transition-all ${
                  isPast ? "bg-[#F8FAFC]" : "bg-white"
                } ${isToday ? "ring-2 ring-inset ring-[#2563EB]" : ""} ${
                  isSelected && !isToday ? "ring-2 ring-inset ring-purple-400" : ""
                } hover:bg-[#F1F5F9]`}
              >
                <div className={`mb-1.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  isToday ? "bg-[#2563EB] text-white" : isPast ? "text-[#94A3B8]" : "text-[#0F172A]"
                }`}>
                  {day}
                </div>

                {data && (
                  <>
                    <div className="flex flex-wrap gap-1 mb-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
                      {data.highOccupancy && (
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      )}
                    </div>
                    <p className={`text-[9px] font-semibold leading-none ${
                      isPast ? "text-[#94A3B8]" : data.highOccupancy ? "text-amber-600" : "text-[#64748B]"
                    }`}>
                      {data.bookings} bookings
                    </p>
                  </>
                )}

                {loading && !data && (
                  <div className="mt-1 h-1 w-8 animate-pulse rounded bg-[#E2E8F0]" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected day detail panel */}
      {selectedDay && (
        <div className="mt-4 rounded-2xl border border-[#E2E8F0] bg-white shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">
                {selectedDay} {MONTHS[calMonth.month]} {calMonth.year}
                {isCurrentMonth && selectedDay === TODAY_DAY ? " (Today)" : ""}
              </h3>
              <p className="text-xs text-[#94A3B8]">Day summary</p>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              className="rounded-lg border border-[#E2E8F0] px-3 py-1 text-xs text-[#64748B] hover:bg-[#F8FAFC]"
            >
              Deselect
            </button>
          </div>

          {selectedDayData ? (
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                <p className="text-[10px] text-[#64748B]">Total Bookings</p>
                <p className="mt-1 text-xl font-bold text-[#0F172A]">{selectedDayData.bookings}</p>
              </div>
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                <p className="text-[10px] text-[#64748B]">Revenue</p>
                <p className="mt-1 text-xl font-bold text-[#0F172A]">
                  &#8377;{selectedDayData.revenue.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                <p className="text-[10px] text-[#64748B]">Occupancy</p>
                <p className={`mt-1 text-sm font-bold ${
                  selectedDayData.highOccupancy ? "text-amber-600" : "text-emerald-600"
                }`}>
                  {selectedDayData.highOccupancy ? "High" : "Normal"}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#E2E8F0] px-4 py-8 text-center text-sm text-[#94A3B8]">
              No bookings on this day.
            </div>
          )}
        </div>
      )}

      {/* Upcoming this week (only shown for current month) */}
      {isCurrentMonth && weekAhead.length > 0 && (
        <div className="mt-5 rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="border-b border-[#E2E8F0] px-5 py-4">
            <h3 className="text-sm font-bold text-[#0F172A]">Next 7 Days</h3>
            <p className="text-xs text-[#94A3B8]">From today</p>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {weekAhead.map((item) => (
              <div key={item.label} className="flex items-center justify-between px-5 py-3.5 hover:bg-[#F8FAFC] transition-colors">
                <div className="flex items-center gap-3">
                  <CalendarDays size={14} className="text-[#94A3B8]" />
                  <span className="text-sm font-medium text-[#0F172A]">{item.label}</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#0F172A]">{item.bookings}</p>
                    <p className="text-[10px] text-[#94A3B8]">bookings</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-0.5">
                      <IndianRupee size={12} className="text-[#64748B]" />
                      <p className="text-sm font-bold text-[#0F172A]">
                        {item.revenue.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <p className="text-[10px] text-[#94A3B8]">revenue</p>
                  </div>
                  <div className="w-24">
                    <div className="h-1.5 rounded-full bg-[#F1F5F9]">
                      <div
                        className={`h-1.5 rounded-full ${
                          item.bookings === 0 ? "bg-[#E2E8F0]" :
                          item.bookings >= 10 ? "bg-amber-400" :
                          "bg-[#2563EB]"
                        }`}
                        style={{ width: `${Math.min((item.bookings / 16) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </CenterLayout>
  );
}
