import { useState } from "react";
import {
  Search,
  CheckCircle2,
  LogOut,
  Phone,
  User,
  Clock,
} from "lucide-react";
import CenterLayout from "../../../components/partner/CenterLayout";

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

interface WalkInForm {
  name: string;
  mobile: string;
  spaceType: string;
  duration: string;
}

export default function GuestCheckInPage() {
  const [statuses, setStatuses] = useState<Record<string, Booking["status"]>>(
    Object.fromEntries(TODAY_BOOKINGS.map((b) => [b.id, b.status]))
  );
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [walkInForm, setWalkInForm] = useState<WalkInForm>({
    name: "",
    mobile: "",
    spaceType: "Day Pass",
    duration: "Full Day",
  });
  const [walkInSuccess, setWalkInSuccess] = useState(false);
  const [checkedOutIds, setCheckedOutIds] = useState<Set<string>>(new Set());

  const arrivingSoon = TODAY_BOOKINGS.filter((b) => {
    const s = statuses[b.id];
    return s === "upcoming" || s === "confirmed";
  }).sort((a, b) => a.checkIn.localeCompare(b.checkIn));

  const currentlyCheckedIn = TODAY_BOOKINGS.filter(
    (b) => statuses[b.id] === "checked_in" && !checkedOutIds.has(b.id)
  );

  function handleCheckIn(id: string) {
    setStatuses((prev) => ({ ...prev, [id]: "checked_in" }));
    setFlashIds((prev) => new Set([...prev, id]));
    setTimeout(() => {
      setFlashIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 2000);
  }

  function handleCheckOut(id: string) {
    setCheckedOutIds((prev) => new Set([...prev, id]));
    setStatuses((prev) => ({ ...prev, [id]: "completed" }));
  }

  const searchResult = searchQuery.trim().length > 2
    ? TODAY_BOOKINGS.find(
        (b) =>
          b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.guest.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  function handleWalkInSubmit(e: React.FormEvent) {
    e.preventDefault();
    setWalkInSuccess(true);
    setWalkInForm({ name: "", mobile: "", spaceType: "Day Pass", duration: "Full Day" });
    setTimeout(() => setWalkInSuccess(false), 3000);
  }

  return (
    <CenterLayout title="Guest Check-in" subtitle="Check in guests arriving today">
      <div className="grid grid-cols-2 gap-5">
        {/* LEFT: Arriving Soon */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Arriving Soon</h3>
              <p className="text-xs text-[#94A3B8]">Next 3 hours</p>
            </div>
            {/* Live dot */}
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[10px] font-bold text-emerald-600">Live</span>
            </div>
          </div>

          <div className="divide-y divide-[#F1F5F9] max-h-[480px] overflow-y-auto">
            {arrivingSoon.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-[#94A3B8]">
                No guests arriving soon.
              </div>
            ) : (
              arrivingSoon.map((b) => {
                const isFlashing = flashIds.has(b.id);
                const alreadyCheckedIn = statuses[b.id] === "checked_in";

                return (
                  <div
                    key={b.id}
                    className={`p-4 transition-all ${
                      isFlashing ? "bg-emerald-50" : ""
                    }`}
                  >
                    {isFlashing ? (
                      <div className="flex flex-col items-center justify-center py-3 gap-2">
                        <CheckCircle2 size={32} className="text-emerald-500" />
                        <p className="text-sm font-bold text-emerald-700">Checked In Successfully!</p>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        {/* Time badge */}
                        <div className="flex flex-col items-center gap-1 pt-1">
                          <span className="rounded-lg bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-bold text-[#64748B]">
                            {b.checkIn}
                          </span>
                        </div>
                        {/* Avatar */}
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-sm font-bold text-white">
                          {b.avatar}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#0F172A]">{b.guest}</p>
                          <p className="text-xs text-[#64748B]">{b.type} &middot; {b.duration}</p>
                          <div className="mt-1 flex items-center gap-3">
                            <span className="font-mono text-[10px] text-[#94A3B8]">{b.id}</span>
                            <div className="flex items-center gap-1">
                              <Phone size={10} className="text-[#94A3B8]" />
                              <span className="text-[10px] text-[#94A3B8]">{b.mobile}</span>
                            </div>
                          </div>
                          {alreadyCheckedIn ? (
                            <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1.5">
                              <CheckCircle2 size={13} className="text-emerald-600" />
                              <span className="text-xs font-semibold text-emerald-700">Checked In</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleCheckIn(b.id)}
                              className="mt-2 w-full rounded-xl bg-emerald-500 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-600"
                            >
                              Check In
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT: Search + Walk-in */}
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm p-5">
            <h3 className="mb-3 text-sm font-bold text-[#0F172A]">Search &amp; Manual Check-in</h3>
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Enter Booking ID or Guest Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl pl-10 pr-4 py-3 text-sm text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
              />
            </div>

            {/* Search result */}
            {searchQuery.trim().length > 2 && (
              <div className="mt-3">
                {searchResult ? (
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-sm font-bold text-white">
                        {searchResult.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#0F172A]">{searchResult.guest}</p>
                        <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5">
                          <p className="text-xs text-[#64748B]">
                            <span className="font-medium">ID:</span>{" "}
                            <span className="font-mono">{searchResult.id}</span>
                          </p>
                          <p className="text-xs text-[#64748B]">
                            <span className="font-medium">Type:</span> {searchResult.type}
                          </p>
                          <p className="text-xs text-[#64748B]">
                            <span className="font-medium">Time:</span> {searchResult.checkIn} – {searchResult.checkOut}
                          </p>
                          <p className="text-xs text-[#64748B]">
                            <span className="font-medium">Seat:</span> {searchResult.seat ?? searchResult.room}
                          </p>
                          <p className="text-xs text-[#64748B]">
                            <span className="font-medium">Mobile:</span> {searchResult.mobile}
                          </p>
                          <p className="text-xs text-[#64748B]">
                            <span className="font-medium">Amount:</span> &#8377;{searchResult.amount.toLocaleString("en-IN")}
                          </p>
                        </div>
                        {statuses[searchResult.id] === "checked_in" ? (
                          <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-100 px-3 py-2">
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            <span className="text-sm font-semibold text-emerald-700">Already Checked In</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleCheckIn(searchResult.id)}
                            className="mt-3 w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-600"
                          >
                            Check In Guest
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-6 text-center text-sm text-[#94A3B8]">
                    No booking found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Walk-in form */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm p-5">
            <h3 className="mb-1 text-sm font-bold text-[#0F172A]">Walk-in Guest</h3>
            <p className="mb-4 text-xs text-[#94A3B8]">Create a new booking and check in immediately</p>

            {walkInSuccess ? (
              <div className="flex flex-col items-center gap-2 py-6">
                <CheckCircle2 size={36} className="text-emerald-500" />
                <p className="text-sm font-bold text-emerald-700">Walk-in checked in!</p>
                <p className="text-xs text-[#94A3B8]">Booking created and guest is now active.</p>
              </div>
            ) : (
              <form onSubmit={handleWalkInSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#64748B]">Guest Name</label>
                    <div className="relative">
                      <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                      <input
                        type="text"
                        required
                        placeholder="Full name"
                        value={walkInForm.name}
                        onChange={(e) => setWalkInForm((p) => ({ ...p, name: e.target.value }))}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#64748B]">Mobile</label>
                    <div className="relative">
                      <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                      <input
                        type="tel"
                        required
                        placeholder="+91 XXXXX XXXXX"
                        value={walkInForm.mobile}
                        onChange={(e) => setWalkInForm((p) => ({ ...p, mobile: e.target.value }))}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#64748B]">Space Type</label>
                    <select
                      value={walkInForm.spaceType}
                      onChange={(e) => setWalkInForm((p) => ({ ...p, spaceType: e.target.value }))}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl px-3 py-2.5 text-sm text-[#0F172A] outline-none"
                    >
                      <option>Day Pass</option>
                      <option>Meeting Room</option>
                      <option>Virtual Office</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#64748B]">Duration</label>
                    <select
                      value={walkInForm.duration}
                      onChange={(e) => setWalkInForm((p) => ({ ...p, duration: e.target.value }))}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl px-3 py-2.5 text-sm text-[#0F172A] outline-none"
                    >
                      <option>Half Day</option>
                      <option>Full Day</option>
                      <option>1 hr</option>
                      <option>2 hrs</option>
                      <option>4 hrs</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#2563EB] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1D4ED8]"
                >
                  Create &amp; Check In
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Currently Checked In */}
      <div className="mt-5 rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="border-b border-[#E2E8F0] px-5 py-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#0F172A]">Currently Checked In</h3>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-100 px-1.5 text-[10px] font-bold text-emerald-700">
              {currentlyCheckedIn.length}
            </span>
          </div>
          <p className="text-xs text-[#94A3B8]">Guests currently active in the center</p>
        </div>

        {currentlyCheckedIn.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-[#94A3B8]">
            No guests are currently checked in.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 p-5">
            {currentlyCheckedIn.map((b) => (
              <div
                key={b.id}
                className="rounded-xl border border-emerald-100 bg-emerald-50 p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                    {b.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#0F172A]">{b.guest}</p>
                    <p className="text-[10px] text-[#64748B]">{b.type}</p>
                  </div>
                </div>

                <div className="space-y-1 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-medium text-[#64748B]">Seat/Room:</span>
                    <span className="text-[10px] font-bold text-[#0F172A]">{b.seat ?? b.room}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={10} className="text-[#94A3B8]" />
                    <span className="text-[10px] text-[#64748B]">Since {b.checkIn}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleCheckOut(b.id)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white py-1.5 text-[11px] font-bold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  <LogOut size={11} />
                  Check Out
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </CenterLayout>
  );
}
