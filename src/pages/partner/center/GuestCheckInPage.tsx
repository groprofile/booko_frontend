import { useState, useEffect } from "react";
import {
  Search,
  CheckCircle2,
  Phone,
  Clock,
  KeyRound,
  RefreshCw,
} from "lucide-react";
import CenterLayout from "../../../components/partner/CenterLayout";
import { apiGet, apiPost, getVendorToken } from "../../../lib/api";

interface ApiBooking {
  id: string;
  status: string;
  checkin_status: string; // 'pending' | 'checked_in'
  slot_date: string;
  start_time: string;
  end_time: string;
  total_paise: number;
  center_id: string;
  users: { full_name: string; phone: string };
  centers: { center_name: string };
}

function fmt(t?: string) { return t ? String(t).slice(0, 5) : '—'; }
function avatarChar(name: string) { return (name ?? '?')[0].toUpperCase(); }

export default function GuestCheckInPage() {
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkinStatus, setCheckinStatus] = useState<Record<string, boolean>>({});
  const [otpOpen, setOtpOpen] = useState<Record<string, boolean>>({});
  const [otpValues, setOtpValues] = useState<Record<string, string>>({});
  const [otpLoading, setOtpLoading] = useState<Record<string, boolean>>({});
  const [otpErrors, setOtpErrors] = useState<Record<string, string>>({});
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [resendLoading, setResendLoading] = useState<Record<string, boolean>>({});
  const [resendMessages, setResendMessages] = useState<Record<string, string>>({});

  useEffect(() => {
    const token = getVendorToken();
    if (!token) return;
    apiGet<{ data: ApiBooking[]; total: number }>('/vendor/bookings/today', token)
      .then((res) => {
        setBookings(res.data ?? []);
        const init: Record<string, boolean> = {};
        (res.data ?? []).forEach((b) => { init[b.id] = b.checkin_status === 'checked_in'; });
        setCheckinStatus(init);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleVerifyOtp(booking: ApiBooking) {
    const otp = (otpValues[booking.id] ?? '').trim();
    if (!otp) {
      setOtpErrors((p) => ({ ...p, [booking.id]: 'Enter the OTP' }));
      return;
    }
    setOtpLoading((p) => ({ ...p, [booking.id]: true }));
    setOtpErrors((p) => ({ ...p, [booking.id]: '' }));
    try {
      await apiPost('/vendor/checkin/verify-otp', {
        centreId: booking.center_id,
        bookingId: booking.id,
        otp,
      }, getVendorToken() ?? undefined);
      setCheckinStatus((p) => ({ ...p, [booking.id]: true }));
      setOtpOpen((p) => ({ ...p, [booking.id]: false }));
      setFlashIds((p) => new Set([...p, booking.id]));
      setTimeout(() => {
        setFlashIds((p) => { const n = new Set(p); n.delete(booking.id); return n; });
      }, 2000);
    } catch (err) {
      setOtpErrors((p) => ({ ...p, [booking.id]: (err as Error).message ?? 'Invalid OTP' }));
    } finally {
      setOtpLoading((p) => ({ ...p, [booking.id]: false }));
    }
  }

  async function handleResendOtp(booking: ApiBooking) {
    setResendLoading((p) => ({ ...p, [booking.id]: true }));
    setResendMessages((p) => ({ ...p, [booking.id]: '' }));
    try {
      await apiPost('/vendor/checkin/resend-otp', {
        centreId: booking.center_id,
        bookingId: booking.id,
      }, getVendorToken() ?? undefined);
      setResendMessages((p) => ({ ...p, [booking.id]: 'OTP resent' }));
    } catch (err) {
      setResendMessages((p) => ({ ...p, [booking.id]: (err as Error).message ?? 'Failed to resend OTP' }));
    } finally {
      setResendLoading((p) => ({ ...p, [booking.id]: false }));
    }
  }

  const arrivingSoon = bookings
    .filter((b) => !checkinStatus[b.id])
    .sort((a, b) => (a.start_time ?? '').localeCompare(b.start_time ?? ''));

  const currentlyCheckedIn = bookings.filter((b) => checkinStatus[b.id]);

  const searchResult = searchQuery.trim().length > 2
    ? bookings.find(
        (b) =>
          b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (b.users?.full_name ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  if (loading) {
    return (
      <CenterLayout title="Guest Check-in" subtitle="Check in guests arriving today">
        <div className="py-20 text-center text-sm text-[#94A3B8]">Loading today's bookings…</div>
      </CenterLayout>
    );
  }

  return (
    <CenterLayout title="Guest Check-in" subtitle="Check in guests arriving today">
      <div className="grid grid-cols-2 gap-5">
        {/* LEFT: Arriving Soon */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Arriving Soon</h3>
              <p className="text-xs text-[#94A3B8]">{arrivingSoon.length} pending</p>
            </div>
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
                const showOtp = otpOpen[b.id] ?? false;
                const guestName = b.users?.full_name ?? 'Guest';

                return (
                  <div key={b.id} className={`p-4 transition-all ${isFlashing ? 'bg-emerald-50' : ''}`}>
                    {isFlashing ? (
                      <div className="flex flex-col items-center justify-center py-3 gap-2">
                        <CheckCircle2 size={32} className="text-emerald-500" />
                        <p className="text-sm font-bold text-emerald-700">Checked In Successfully!</p>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center gap-1 pt-1">
                          <span className="rounded-lg bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-bold text-[#64748B]">
                            {fmt(b.start_time)}
                          </span>
                        </div>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-sm font-bold text-white">
                          {avatarChar(guestName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#0F172A]">{guestName}</p>
                          <p className="text-xs text-[#64748B]">{fmt(b.start_time)} – {fmt(b.end_time)}</p>
                          <div className="mt-1 flex items-center gap-3">
                            <span className="font-mono text-[10px] text-[#94A3B8]">{b.id.slice(0, 8)}…</span>
                            <div className="flex items-center gap-1">
                              <Phone size={10} className="text-[#94A3B8]" />
                              <span className="text-[10px] text-[#94A3B8]">{b.users?.phone ?? '—'}</span>
                            </div>
                          </div>
                          {showOtp ? (
                            <div className="mt-2">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Enter OTP"
                                  value={otpValues[b.id] ?? ''}
                                  onChange={(e) => setOtpValues((p) => ({ ...p, [b.id]: e.target.value }))}
                                  maxLength={6}
                                  className="flex-1 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-sm text-[#0F172A] outline-none focus:border-[#2563EB]"
                                />
                                <button
                                  onClick={() => handleVerifyOtp(b)}
                                  disabled={otpLoading[b.id]}
                                  className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-600 disabled:opacity-60"
                                >
                                  {otpLoading[b.id] ? '…' : 'Verify'}
                                </button>
                                <button
                                  onClick={() => setOtpOpen((p) => ({ ...p, [b.id]: false }))}
                                  className="rounded-lg border border-[#E2E8F0] px-2 py-1.5 text-xs text-[#64748B] hover:bg-[#F1F5F9]"
                                >
                                  ✕
                                </button>
                              </div>
                              {otpErrors[b.id] && (
                                <p className="mt-1 text-[10px] text-red-500">{otpErrors[b.id]}</p>
                              )}
                              <button
                                onClick={() => handleResendOtp(b)}
                                disabled={resendLoading[b.id]}
                                className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-[#2563EB] hover:underline disabled:opacity-60"
                              >
                                <RefreshCw size={10} className={resendLoading[b.id] ? 'animate-spin' : ''} />
                                {resendLoading[b.id] ? 'Resending…' : "Didn't get it? Resend OTP"}
                              </button>
                              {resendMessages[b.id] && (
                                <p className="mt-0.5 text-[10px] text-[#64748B]">{resendMessages[b.id]}</p>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => setOtpOpen((p) => ({ ...p, [b.id]: true }))}
                              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-600"
                            >
                              <KeyRound size={13} />
                              Check In with OTP
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

        {/* RIGHT: Search */}
        <div className="flex flex-col gap-4">
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

            {searchQuery.trim().length > 2 && (
              <div className="mt-3">
                {searchResult ? (
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-sm font-bold text-white">
                        {avatarChar(searchResult.users?.full_name ?? 'G')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#0F172A]">{searchResult.users?.full_name ?? '—'}</p>
                        <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5">
                          <p className="text-xs text-[#64748B]">
                            <span className="font-medium">ID:</span>{' '}
                            <span className="font-mono">{searchResult.id.slice(0, 8)}…</span>
                          </p>
                          <p className="text-xs text-[#64748B]">
                            <span className="font-medium">Time:</span> {fmt(searchResult.start_time)} – {fmt(searchResult.end_time)}
                          </p>
                          <p className="text-xs text-[#64748B]">
                            <span className="font-medium">Mobile:</span> {searchResult.users?.phone ?? '—'}
                          </p>
                          <p className="text-xs text-[#64748B]">
                            <span className="font-medium">Amount:</span>{' '}
                            ₹{Math.round((searchResult.total_paise ?? 0) / 100).toLocaleString('en-IN')}
                          </p>
                        </div>
                        {checkinStatus[searchResult.id] ? (
                          <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-100 px-3 py-2">
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            <span className="text-sm font-semibold text-emerald-700">Already Checked In</span>
                          </div>
                        ) : otpOpen[searchResult.id] ? (
                          <div className="mt-2">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Enter OTP"
                                value={otpValues[searchResult.id] ?? ''}
                                onChange={(e) => setOtpValues((p) => ({ ...p, [searchResult.id]: e.target.value }))}
                                maxLength={6}
                                className="flex-1 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#2563EB]"
                              />
                              <button
                                onClick={() => handleVerifyOtp(searchResult)}
                                disabled={otpLoading[searchResult.id]}
                                className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-60"
                              >
                                {otpLoading[searchResult.id] ? '…' : 'Verify'}
                              </button>
                            </div>
                            {otpErrors[searchResult.id] && (
                              <p className="mt-1 text-xs text-red-500">{otpErrors[searchResult.id]}</p>
                            )}
                            <button
                              onClick={() => handleResendOtp(searchResult)}
                              disabled={resendLoading[searchResult.id]}
                              className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-[#2563EB] hover:underline disabled:opacity-60"
                            >
                              <RefreshCw size={10} className={resendLoading[searchResult.id] ? 'animate-spin' : ''} />
                              {resendLoading[searchResult.id] ? 'Resending…' : "Didn't get it? Resend OTP"}
                            </button>
                            {resendMessages[searchResult.id] && (
                              <p className="mt-0.5 text-[10px] text-[#64748B]">{resendMessages[searchResult.id]}</p>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => setOtpOpen((p) => ({ ...p, [searchResult.id]: true }))}
                            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-600"
                          >
                            <KeyRound size={14} />
                            Check In with OTP
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

          {/* Stats card */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm p-5">
            <h3 className="mb-3 text-sm font-bold text-[#0F172A]">Today's Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-3">
                <p className="text-[10px] font-medium text-emerald-700">Checked In</p>
                <p className="mt-1 text-xl font-bold text-emerald-700">{currentlyCheckedIn.length}</p>
              </div>
              <div className="rounded-xl bg-amber-50 border border-amber-100 px-3 py-3">
                <p className="text-[10px] font-medium text-amber-700">Pending</p>
                <p className="mt-1 text-xl font-bold text-amber-700">{arrivingSoon.length}</p>
              </div>
              <div className="col-span-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-3">
                <p className="text-[10px] font-medium text-[#64748B]">Total Today</p>
                <p className="mt-1 text-xl font-bold text-[#0F172A]">{bookings.length}</p>
              </div>
            </div>
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
            {currentlyCheckedIn.map((b) => {
              const guestName = b.users?.full_name ?? 'Guest';
              return (
                <div key={b.id} className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                      {avatarChar(guestName)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#0F172A]">{guestName}</p>
                      <p className="text-[10px] text-[#64748B]">{b.centers?.center_name ?? '—'}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Clock size={10} className="text-[#94A3B8]" />
                      <span className="text-[10px] text-[#64748B]">Since {fmt(b.start_time)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone size={10} className="text-[#94A3B8]" />
                      <span className="text-[10px] text-[#64748B]">{b.users?.phone ?? '—'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CenterLayout>
  );
}
