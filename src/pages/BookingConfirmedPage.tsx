import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { CalendarDays, CheckCircle2, Mail, Sparkles, MapPin, Hash } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { apiGet, getUserToken } from "../lib/api";

interface ConfirmedState {
  hotelName: string;
  cityName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  email: string;
  totalAmount: number;
  totalSaved: number;
  paymentMethod: string | null;
}

interface BookingDetail {
  id: string;
  booking_ref: string | null;
  product_type: string;
  status: string;
  payment_status: string;
  booking_date: string | null;
  checkout_date: string | null;
  slot_date: string | null;
  start_time: string | null;
  end_time: string | null;
  total_paise: number;
  check_in_otp: string | null;
  created_at: string;
  center: {
    center_name: string;
    address: string;
    city: string;
  } | null;
  plan_name: string | null;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function productLabel(type: string) {
  const map: Record<string, string> = {
    coworking_day_pass: "Day Pass",
    coworking_meeting_room: "Meeting Room",
    coworking_monthly_pass: "Monthly Pass / Virtual Office",
  };
  return map[type] ?? type;
}

export default function BookingConfirmedPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("id");

  const legacyState = (location.state as ConfirmedState | undefined) ?? null;

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(!!bookingId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Booking Confirmed | Bokko";
  }, []);

  useEffect(() => {
    if (!bookingId) return;
    const token = getUserToken();
    if (!token) {
      setError("Please sign in to view your booking.");
      setLoading(false);
      return;
    }
    apiGet<BookingDetail>(`/bookings/my/${bookingId}`, token)
      .then((data) => setBooking(data))
      .catch((e) => setError((e as Error).message ?? "Could not load booking."))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const fallbackRef = `BOKKO${Math.abs(Date.now() % 100000)}`;

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg rounded-[24px] border border-[#E2E8F0] bg-white p-8 text-center shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ECFDF5] text-[#16A34A]">
            <CheckCircle2 size={32} />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-[#0F172A]">Booking Confirmed!</h1>

          {loading && (
            <p className="mt-4 text-sm text-[#64748B]">Loading booking details…</p>
          )}

          {!loading && error && (
            <p className="mt-4 text-sm text-red-500">{error}</p>
          )}

          {/* Real booking from API */}
          {!loading && !error && booking && (
            <>
              <p className="mt-2 text-sm text-[#64748B]">
                Your <span className="font-semibold text-[#0F172A]">{productLabel(booking.product_type)}</span>
                {booking.center?.center_name ? (
                  <> at <span className="font-semibold text-[#0F172A]">{booking.center.center_name}</span></>
                ) : null}
                {" "}is confirmed.
              </p>

              <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-[#F8FAFC] p-4 text-left text-sm text-[#334155]">
                {booking.center?.address && (
                  <p className="flex items-start gap-2">
                    <MapPin size={14} className="mt-0.5 shrink-0 text-[#2563EB]" />
                    {booking.center.address}{booking.center.city ? `, ${booking.center.city}` : ""}
                  </p>
                )}

                {/* Plan-based date */}
                {booking.booking_date && (
                  <p className="flex items-center gap-2">
                    <CalendarDays size={14} className="text-[#2563EB]" />
                    {formatDate(booking.booking_date)}
                    {booking.checkout_date ? ` → ${formatDate(booking.checkout_date)}` : ""}
                  </p>
                )}

                {/* Slot-based date + time */}
                {booking.slot_date && (
                  <p className="flex items-center gap-2">
                    <CalendarDays size={14} className="text-[#2563EB]" />
                    {formatDate(booking.slot_date)}
                    {booking.start_time ? ` · ${booking.start_time.slice(0, 5)}` : ""}
                    {booking.end_time ? ` – ${booking.end_time.slice(0, 5)}` : ""}
                  </p>
                )}

                {booking.plan_name && (
                  <p>
                    <span className="font-semibold">Plan:</span> {booking.plan_name}
                  </p>
                )}

                <p className="flex items-center gap-2">
                  <Hash size={14} className="text-[#2563EB]" />
                  <span className="font-semibold">Ref:</span>{" "}
                  {booking.booking_ref ?? booking.id.substring(0, 8).toUpperCase()}
                </p>

                <p>
                  <span className="font-semibold">Amount Paid:</span>{" "}
                  ₹{(booking.total_paise / 100).toLocaleString("en-IN")}
                </p>

                {booking.check_in_otp && (
                  <div className="mt-1 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-3 text-center">
                    <p className="text-xs font-medium text-[#166534]">Check-in OTP</p>
                    <p className="mt-0.5 text-2xl font-bold tracking-widest text-[#16A34A]">
                      {booking.check_in_otp}
                    </p>
                    <p className="mt-0.5 text-xs text-[#4B7A55]">Show this at the centre reception</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Legacy hotel state (hotel checkout still uses navigate state) */}
          {!loading && !error && !booking && legacyState && (
            <>
              <p className="mt-2 text-sm text-[#64748B]">
                {legacyState.guestName ? `Thanks, ${legacyState.guestName}. ` : ""}Your stay at{" "}
                <span className="font-semibold text-[#0F172A]">{legacyState.hotelName}</span> in {legacyState.cityName} is booked.
              </p>

              <div className="mt-5 flex flex-col gap-2 rounded-2xl bg-[#F8FAFC] p-4 text-left text-sm text-[#334155]">
                <p className="flex items-center gap-2">
                  <CalendarDays size={14} className="text-[#2563EB]" />
                  {formatDate(legacyState.checkIn)} → {formatDate(legacyState.checkOut)}
                </p>
                <p>
                  <span className="font-semibold">Room:</span> {legacyState.roomName}
                </p>
                {legacyState.email && (
                  <p className="flex items-center gap-2">
                    <Mail size={14} className="text-[#2563EB]" />
                    Confirmation sent to {legacyState.email}
                  </p>
                )}
                <p>
                  <span className="font-semibold">Booking Reference:</span> {fallbackRef}
                </p>
                <p>
                  <span className="font-semibold">Amount Paid:</span> ₹{legacyState.totalAmount.toLocaleString()}
                </p>
                {legacyState.totalSaved > 0 && (
                  <p className="flex items-center gap-1.5 font-semibold text-[#16A34A]">
                    <Sparkles size={13} />
                    You saved ₹{legacyState.totalSaved.toLocaleString()} with Bokko
                  </p>
                )}
              </div>
            </>
          )}

          {/* No data at all */}
          {!loading && !error && !booking && !legacyState && (
            <p className="mt-2 text-sm text-[#64748B]">Your booking has been confirmed.</p>
          )}

          <div className="mt-6 flex flex-col gap-3">
            <Link
              to="/"
              className="inline-flex w-full items-center justify-center rounded-xl bg-[#111111] py-3 text-sm font-bold text-white hover:bg-black"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
