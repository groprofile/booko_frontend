import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  IndianRupee,
} from "lucide-react";
import CenterLayout from "../../../components/partner/CenterLayout";

interface DayData {
  day: number;
  bookings: number;
  dayPass: boolean;
  meetingRoom: boolean;
  highOccupancy: boolean;
  full: boolean;
  revenue: number;
}

// June 2026 booking data — 1-indexed day numbers
const JUNE_DATA: Record<number, DayData> = {
  1:  { day: 1,  bookings: 3,  dayPass: true,  meetingRoom: false, highOccupancy: false, full: false, revenue: 2397 },
  2:  { day: 2,  bookings: 5,  dayPass: true,  meetingRoom: true,  highOccupancy: false, full: false, revenue: 4195 },
  3:  { day: 3,  bookings: 2,  dayPass: true,  meetingRoom: false, highOccupancy: false, full: false, revenue: 998 },
  5:  { day: 5,  bookings: 4,  dayPass: true,  meetingRoom: true,  highOccupancy: false, full: false, revenue: 3196 },
  8:  { day: 8,  bookings: 5,  dayPass: true,  meetingRoom: true,  highOccupancy: false, full: false, revenue: 4295 },
  9:  { day: 9,  bookings: 3,  dayPass: false, meetingRoom: true,  highOccupancy: false, full: false, revenue: 3597 },
  10: { day: 10, bookings: 4,  dayPass: true,  meetingRoom: false, highOccupancy: false, full: false, revenue: 3196 },
  12: { day: 12, bookings: 2,  dayPass: true,  meetingRoom: false, highOccupancy: false, full: false, revenue: 1598 },
  15: { day: 15, bookings: 5,  dayPass: true,  meetingRoom: true,  highOccupancy: false, full: false, revenue: 4595 },
  16: { day: 16, bookings: 4,  dayPass: true,  meetingRoom: true,  highOccupancy: false, full: false, revenue: 3596 },
  20: { day: 20, bookings: 10, dayPass: true,  meetingRoom: true,  highOccupancy: true,  full: false, revenue: 10990 },
  21: { day: 21, bookings: 12, dayPass: true,  meetingRoom: true,  highOccupancy: true,  full: false, revenue: 13188 },
  22: { day: 22, bookings: 14, dayPass: true,  meetingRoom: true,  highOccupancy: true,  full: false, revenue: 15386 },
  23: { day: 23, bookings: 16, dayPass: true,  meetingRoom: true,  highOccupancy: true,  full: true,  revenue: 17584 },
  24: { day: 24, bookings: 15, dayPass: true,  meetingRoom: true,  highOccupancy: true,  full: true,  revenue: 16485 },
  25: { day: 25, bookings: 8,  dayPass: true,  meetingRoom: true,  highOccupancy: false, full: false, revenue: 6393 },
  26: { day: 26, bookings: 11, dayPass: true,  meetingRoom: true,  highOccupancy: true,  full: false, revenue: 12089 },
  27: { day: 27, bookings: 13, dayPass: true,  meetingRoom: true,  highOccupancy: true,  full: false, revenue: 14287 },
  29: { day: 29, bookings: 6,  dayPass: true,  meetingRoom: false, highOccupancy: false, full: false, revenue: 4794 },
  30: { day: 30, bookings: 9,  dayPass: true,  meetingRoom: true,  highOccupancy: true,  full: false, revenue: 9891 },
};

const UPCOMING_WEEK = [
  { date: "Thu, 25 Jun", bookings: 8,  revenue: 6393 },
  { date: "Fri, 26 Jun", bookings: 11, revenue: 12089 },
  { date: "Sat, 27 Jun", bookings: 13, revenue: 14287 },
  { date: "Sun, 28 Jun", bookings: 0,  revenue: 0 },
  { date: "Mon, 29 Jun", bookings: 6,  revenue: 4794 },
  { date: "Tue, 30 Jun", bookings: 9,  revenue: 9891 },
];

// June 2026 starts on Monday (weekday index 0 = Mon in our grid)
const JUNE_2026_START_DOW = 0; // Monday
const JUNE_2026_DAYS = 30;

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
  // 0=Mon ... 6=Sun mapping
  const jsDay = new Date(year, month, 1).getDay(); // 0=Sun
  return jsDay === 0 ? 6 : jsDay - 1;
}

export default function CenterCalendarPage() {
  const [calMonth, setCalMonth] = useState<CalendarMonth>({ year: 2026, month: 5 }); // June 2026
  const [selectedDay, setSelectedDay] = useState<number | null>(25);

  const TODAY_DAY = 25;
  const IS_JUNE_2026 = calMonth.year === 2026 && calMonth.month === 5;

  const daysInMonth = IS_JUNE_2026 ? JUNE_2026_DAYS : getDaysInMonth(calMonth.year, calMonth.month);
  const startDow = IS_JUNE_2026 ? JUNE_2026_START_DOW : getStartDow(calMonth.year, calMonth.month);

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

  const selectedDayData = selectedDay && IS_JUNE_2026 ? JUNE_DATA[selectedDay] : null;

  // Build grid cells: empty slots + day numbers
  const totalCells = startDow + daysInMonth;
  const gridCells: Array<number | null> = [
    ...Array<null>(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (gridCells.length % 7 !== 0) gridCells.push(null);

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
        <h2 className="text-base font-bold text-[#0F172A]">
          {MONTHS[calMonth.month]} {calMonth.year}
        </h2>
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
          <span className="text-xs text-[#64748B]">Day Pass</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
          <span className="text-xs text-[#64748B]">Meeting Room</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="text-xs text-[#64748B]">High Occupancy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="text-xs text-[#64748B]">Full</span>
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

            const isPast = IS_JUNE_2026 && day < TODAY_DAY;
            const isToday = IS_JUNE_2026 && day === TODAY_DAY;
            const isSelected = selectedDay === day && IS_JUNE_2026;
            const data = IS_JUNE_2026 ? JUNE_DATA[day] : undefined;

            return (
              <div
                key={day}
                onClick={() => IS_JUNE_2026 && setSelectedDay(day === selectedDay ? null : day)}
                className={`relative min-h-[80px] cursor-pointer border-b border-[#F1F5F9] p-2.5 transition-all ${
                  isPast ? "bg-[#F8FAFC]" : "bg-white"
                } ${isToday ? "ring-2 ring-inset ring-[#2563EB]" : ""} ${
                  isSelected && !isToday ? "ring-2 ring-inset ring-purple-400" : ""
                } hover:bg-[#F1F5F9]`}
              >
                {/* Day number */}
                <div className={`mb-1.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  isToday ? "bg-[#2563EB] text-white" : isPast ? "text-[#94A3B8]" : "text-[#0F172A]"
                }`}>
                  {day}
                </div>

                {/* Dots */}
                {data && (
                  <div className="flex flex-wrap gap-1 mb-1">
                    {data.dayPass && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
                    )}
                    {data.meetingRoom && (
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    )}
                    {data.highOccupancy && !data.full && (
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    )}
                    {data.full && (
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    )}
                  </div>
                )}

                {/* Booking count */}
                {data && (
                  <p className={`text-[9px] font-semibold leading-none ${
                    isPast ? "text-[#94A3B8]" : data.full ? "text-red-500" : data.highOccupancy ? "text-amber-600" : "text-[#64748B]"
                  }`}>
                    {data.bookings} bookings
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected day detail panel */}
      {selectedDay && IS_JUNE_2026 && (
        <div className="mt-4 rounded-2xl border border-[#E2E8F0] bg-white shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">
                {selectedDay} June 2026 {selectedDay === TODAY_DAY ? "(Today)" : ""}
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
            <div className="grid grid-cols-4 gap-4">
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
                <p className="text-[10px] text-[#64748B]">Space Types</p>
                <div className="mt-1 flex gap-1.5 flex-wrap">
                  {selectedDayData.dayPass && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-600">Day Pass</span>
                  )}
                  {selectedDayData.meetingRoom && (
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-600">Meeting Room</span>
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                <p className="text-[10px] text-[#64748B]">Occupancy</p>
                <p className={`mt-1 text-sm font-bold ${
                  selectedDayData.full ? "text-red-500" : selectedDayData.highOccupancy ? "text-amber-600" : "text-emerald-600"
                }`}>
                  {selectedDayData.full ? "Full" : selectedDayData.highOccupancy ? "High" : "Normal"}
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

      {/* Upcoming this week */}
      <div className="mt-5 rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="border-b border-[#E2E8F0] px-5 py-4">
          <h3 className="text-sm font-bold text-[#0F172A]">Upcoming This Week</h3>
          <p className="text-xs text-[#94A3B8]">June 25 – 30, 2026</p>
        </div>
        <div className="divide-y divide-[#F1F5F9]">
          {UPCOMING_WEEK.map((item) => (
            <div key={item.date} className="flex items-center justify-between px-5 py-3.5 hover:bg-[#F8FAFC] transition-colors">
              <div className="flex items-center gap-3">
                <CalendarDays size={14} className="text-[#94A3B8]" />
                <span className="text-sm font-medium text-[#0F172A]">{item.date}</span>
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
                {/* Mini bar */}
                <div className="w-24">
                  <div className="h-1.5 rounded-full bg-[#F1F5F9]">
                    <div
                      className={`h-1.5 rounded-full ${
                        item.bookings === 0 ? "bg-[#E2E8F0]" :
                        item.bookings >= 12 ? "bg-amber-400" :
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
    </CenterLayout>
  );
}
