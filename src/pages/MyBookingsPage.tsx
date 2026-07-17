import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, MapPin } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { apiGet, getUserToken } from "../lib/api";

interface BookingRow {
  id: string;
  status: string;
  payment_status: string;
  product_type: string;
  booking_date: string | null;
  checkout_date: string | null;
  slot_date: string | null;
  start_time: string | null;
  end_time: string | null;
  total_paise: number;
  booking_ref: string | null;
  created_at: string;
  center: {
    center_name: string;
    address: string | null;
    city: string | null;
    cover_image_url: string | null;
  } | null;
}

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function productLabel(type: string) {
  const map: Record<string, string> = {
    hotel_room: "Hotel",
    coworking_day_pass: "Day Pass",
    coworking_monthly_pass: "Monthly Pass / Virtual Office",
    coworking_meeting_room: "Meeting Room",
    gym_slot: "Gym",
    turf_slot: "Turf",
  };
  return map[type] ?? type;
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-[#ECFDF5] text-[#16A34A]",
  pending: "bg-[#FFFBEB] text-[#D97706]",
  cancelled: "bg-[#FEF2F2] text-[#DC2626]",
  completed: "bg-[#EFF6FF] text-[#2563EB]",
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "My Bookings | Bokko";
  }, []);

  useEffect(() => {
    const token = getUserToken();
    if (!token) {
      setError("Please sign in to view your bookings.");
      setLoading(false);
      return;
    }
    apiGet<{ bookings: BookingRow[] }>("/bookings/my", token)
      .then((res) => setBookings(res.bookings))
      .catch((e) => setError((e as Error).message ?? "Could not load bookings."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-[900px] px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-3xl">My Bookings</h1>

          {loading && <p className="mt-6 text-sm text-[#64748B]">Loading your bookings…</p>}
          {!loading && error && <p className="mt-6 text-sm text-red-500">{error}</p>}

          {!loading && !error && bookings.length === 0 && (
            <div className="mt-8 rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center">
              <p className="text-sm text-[#64748B]">You don't have any bookings yet.</p>
              <Link to="/" className="mt-4 inline-flex rounded-xl bg-[#111111] px-5 py-2.5 text-sm font-semibold text-white hover:bg-black">
                Browse Bokko
              </Link>
            </div>
          )}

          {!loading && !error && bookings.length > 0 && (
            <div className="mt-6 flex flex-col gap-4">
              {bookings.map((booking) => {
                const dateLabel = booking.slot_date
                  ? `${formatDate(booking.slot_date)}${booking.start_time ? ` · ${booking.start_time.slice(0, 5)}` : ""}`
                  : booking.booking_date
                    ? `${formatDate(booking.booking_date)}${booking.checkout_date ? ` → ${formatDate(booking.checkout_date)}` : ""}`
                    : null;

                return (
                  <Link
                    key={booking.id}
                    to={`/booking-confirmed?id=${booking.id}`}
                    className="flex gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-4 transition-colors hover:border-[#BFDBFE]"
                  >
                    {booking.center?.cover_image_url && (
                      <img
                        src={booking.center.cover_image_url}
                        alt={booking.center.center_name}
                        className="h-20 w-20 shrink-0 rounded-xl object-cover"
                      />
                    )}
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-base font-bold text-[#0F172A]">
                          {booking.center?.center_name ?? productLabel(booking.product_type)}
                        </p>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[booking.status] ?? "bg-[#F1F5F9] text-[#334155]"}`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[#64748B]">{productLabel(booking.product_type)}</p>
                      {booking.center?.address && (
                        <p className="flex items-center gap-1.5 truncate text-xs text-[#64748B]">
                          <MapPin size={12} className="shrink-0" />
                          {booking.center.address}{booking.center.city ? `, ${booking.center.city}` : ""}
                        </p>
                      )}
                      {dateLabel && (
                        <p className="flex items-center gap-1.5 text-xs text-[#64748B]">
                          <CalendarDays size={12} className="shrink-0" />
                          {dateLabel}
                        </p>
                      )}
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-sm font-extrabold text-[#0F172A]">
                          ₹{(booking.total_paise / 100).toLocaleString("en-IN")}
                        </span>
                        {booking.booking_ref && (
                          <span className="text-[11px] text-[#94A3B8]">Ref: {booking.booking_ref}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
