import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { CalendarDays, CheckCircle2, Mail, Sparkles } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

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

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function BookingConfirmedPage() {
  const location = useLocation();
  const state = (location.state as ConfirmedState | undefined) ?? null;
  const bookingRef = `BOKKO${Math.abs(Date.now() % 100000)}`;

  useEffect(() => {
    document.title = "Booking Confirmed | Bokko";
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg rounded-[24px] border border-[#E2E8F0] bg-white p-8 text-center shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ECFDF5] text-[#16A34A]">
            <CheckCircle2 size={32} />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-[#0F172A]">Booking Confirmed!</h1>

          {state ? (
            <>
              <p className="mt-2 text-sm text-[#64748B]">
                {state.guestName ? `Thanks, ${state.guestName}. ` : ""}Your stay at <span className="font-semibold text-[#0F172A]">{state.hotelName}</span> in{" "}
                {state.cityName} is booked.
              </p>

              <div className="mt-5 flex flex-col gap-2 rounded-2xl bg-[#F8FAFC] p-4 text-left text-sm text-[#334155]">
                <p className="flex items-center gap-2">
                  <CalendarDays size={14} className="text-[#2563EB]" />
                  {formatDate(state.checkIn)} → {formatDate(state.checkOut)}
                </p>
                <p>
                  <span className="font-semibold">Room:</span> {state.roomName}
                </p>
                {state.email && (
                  <p className="flex items-center gap-2">
                    <Mail size={14} className="text-[#2563EB]" />
                    Confirmation sent to {state.email}
                  </p>
                )}
                <p>
                  <span className="font-semibold">Booking Reference:</span> {bookingRef}
                </p>
                <p>
                  <span className="font-semibold">Amount Paid:</span> ₹{state.totalAmount.toLocaleString()}
                </p>
                {state.totalSaved > 0 && (
                  <p className="flex items-center gap-1.5 font-semibold text-[#16A34A]">
                    <Sparkles size={13} />
                    You saved ₹{state.totalSaved.toLocaleString()} with Bokko
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-[#64748B]">Your booking has been confirmed.</p>
          )}

          <Link to="/" className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#111111] py-3 text-sm font-bold text-white hover:bg-black">
            Back to Home
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
