import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { XCircle } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function BookingFailedPage() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("id");

  useEffect(() => {
    document.title = "Payment Failed | Bokko";
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg rounded-[24px] border border-[#E2E8F0] bg-white p-8 text-center shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF2F2] text-[#DC2626]">
            <XCircle size={32} />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-[#0F172A]">Payment Failed</h1>
          <p className="mt-2 text-sm text-[#64748B]">
            Your payment could not be processed and no amount has been charged. You can try again or contact support.
          </p>

          {bookingId && (
            <p className="mt-3 text-xs text-[#94A3B8]">
              Reference: <span className="font-mono">{bookingId.substring(0, 8).toUpperCase()}</span>
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3">
            <Link
              to="/"
              className="inline-flex w-full items-center justify-center rounded-xl bg-[#111111] py-3 text-sm font-bold text-white hover:bg-black"
            >
              Try Again
            </Link>
            <Link
              to="/contact"
              className="inline-flex w-full items-center justify-center rounded-xl border border-[#E2E8F0] py-3 text-sm font-semibold text-[#334155] hover:bg-[#F8FAFC]"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
