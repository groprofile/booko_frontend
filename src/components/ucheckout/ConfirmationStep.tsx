import { useMemo } from "react";
import { CheckCircle2, Download, Calendar, Share2, Sparkles, ExternalLink, KeyRound, Copy, Building2, CreditCard, Landmark, Smartphone, Wallet, type LucideIcon } from "lucide-react";
import type { UniversalCheckoutState } from "../../data/universalCheckout";

interface ConfirmationStepProps {
  booking: UniversalCheckoutState;
  bookingId: string;
  totalAmount: number;
  totalSaved?: number;
  guestName: string;
  guestEmail: string;
  paymentMethod: string;
}

function downloadBlob(content: string, filename: string, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function generateICS(booking: UniversalCheckoutState, bookingId: string): string {
  let dtStart = "", dtEnd = "", summary = "", location = "";

  if (booking.productType === "day-pass") {
    dtStart = booking.date.replace(/-/g, "") + "T090000";
    dtEnd = booking.date.replace(/-/g, "") + "T180000";
    summary = `Day Pass – ${booking.workspaceName}`;
    location = `${booking.workspaceName}, ${booking.locality}, ${booking.cityName}`;
  } else if (booking.productType === "meeting-room") {
    const [h, m] = (booking.startTime || "09:00").split(":").map(Number);
    const room = booking.siblingRoomTypes.find((r) => r.id === booking.selectedRoomId) ?? booking.siblingRoomTypes[0];
    const tier = room?.pricing.find((t) => t.key === booking.selectedDurationKey) ?? room?.pricing[0];
    const durationMatch = tier?.label.match(/(\d+(?:\.\d+)?)\s*hr/i);
    const hours = durationMatch ? Number(durationMatch[1]) : 1;
    const endH = Math.floor(h + hours);
    const endM = Math.round((h + hours - endH) * 60 + m);
    dtStart = booking.date.replace(/-/g, "") + `T${String(h).padStart(2, "0")}${String(m).padStart(2, "0")}00`;
    dtEnd = booking.date.replace(/-/g, "") + `T${String(endH % 24).padStart(2, "0")}${String(endM).padStart(2, "0")}00`;
    summary = `Meeting Room – ${booking.roomName} @ ${booking.workspaceName}`;
    location = `${booking.workspaceName}, ${booking.locality}, ${booking.cityName}`;
  }
  if (!dtStart) return "";
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Bokko//Booking//EN",
    "BEGIN:VEVENT",
    `DTSTART:${dtStart}`, `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:Booking Reference: ${bookingId}\\nBooked via Bokko`,
    `LOCATION:${location}`,
    "STATUS:CONFIRMED", "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}

function generateInvoice(booking: UniversalCheckoutState, bookingId: string, totalAmount: number, guestName: string, guestEmail: string): string {
  const workspaceName = booking.productType === "virtual-office" ? booking.centerName : booking.workspaceName;
  const date = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Bokko Invoice – ${bookingId}</title>
<style>body{font-family:system-ui,sans-serif;max-width:640px;margin:40px auto;padding:24px;color:#0F172A}
h1{color:#2563EB;margin:0}header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #E2E8F0;padding-bottom:16px;margin-bottom:24px}
.label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#94A3B8;margin-top:16px}
.value{font-size:15px;font-weight:600;color:#0F172A;margin-top:4px}
.total{font-size:22px;font-weight:800;color:#2563EB}
.footer{margin-top:32px;font-size:12px;color:#94A3B8;border-top:1px solid #E2E8F0;padding-top:16px}</style></head>
<body><header><div><h1>Bokko</h1><p style="color:#64748B;font-size:13px">Tax Invoice</p></div>
<div style="text-align:right"><p class="label">Booking Reference</p><p style="font-size:16px;font-weight:700;color:#0F172A">${bookingId}</p></div></header>
<div class="label">Date</div><div class="value">${date}</div>
<div class="label">Billed To</div><div class="value">${guestName}<br><span style="font-weight:400;color:#64748B">${guestEmail}</span></div>
<div class="label">Workspace</div><div class="value">${workspaceName}, ${booking.cityName}</div>
<div class="label">Product</div><div class="value" style="text-transform:capitalize">${booking.productType.replace(/-/g, " ")}</div>
<div style="margin-top:24px;border-top:1px solid #E2E8F0;padding-top:16px">
<div class="label">Amount Paid</div><div class="total">₹${totalAmount.toLocaleString()}</div>
<div style="font-size:12px;color:#94A3B8;margin-top:4px">Inclusive of all taxes and GST</div></div>
<div class="footer">Issued by Grofeed Technology India Pvt Ltd · support@bokkoapp.com<br>
This is a computer-generated invoice and does not require a signature.</div>
</body></html>`;
}

export default function ConfirmationStep({
  booking, bookingId, totalAmount, totalSaved, guestName, guestEmail, paymentMethod,
}: ConfirmationStepProps) {
  const workspaceName = booking.productType === "virtual-office" ? booking.centerName : booking.workspaceName;
  const hasCalendar = booking.productType === "day-pass" || booking.productType === "meeting-room";
  const hasQR = booking.productType === "day-pass" || booking.productType === "meeting-room";
  const qrData = encodeURIComponent(`${bookingId}|${workspaceName}|${guestName}`);
  const payIcon: Record<string, LucideIcon> = { upi: Smartphone, card: CreditCard, netbanking: Landmark, wallet: Wallet, emi: Calendar, corporate: Building2 };

  const checkinOtp = useMemo(() => {
    const hash = bookingId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return String((hash * 7919 + 104729) % 900000 + 100000);
  }, [bookingId]);

  function copyOtp() {
    navigator.clipboard.writeText(checkinOtp).catch(() => {});
  }

  function handleShare() {
    const text = `My booking at ${workspaceName}, ${booking.cityName} is confirmed! Ref: ${bookingId} — Booked via @BokkoApp`;
    if (navigator.share) {
      navigator.share({ title: "Booking Confirmed — Bokko", text, url: window.location.origin }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => alert("Booking details copied to clipboard!")).catch(() => {});
    }
  }

  const bookingDate = booking.productType === "day-pass" ? booking.date
    : booking.productType === "meeting-room" ? booking.date
    : "";

  return (
    <div className="flex flex-col items-center gap-8 py-4">
      {/* Hero */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-[#DCFCE7] opacity-50" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#DCFCE7]">
            <CheckCircle2 size={44} className="text-[#16A34A]" />
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-[#0F172A] sm:text-3xl">Booking Confirmed! 🎉</h2>
        <p className="max-w-sm text-sm text-[#64748B]">
          {booking.productType === "virtual-office"
            ? "Your application is under review. A Bokko Expert will call within 24–48 hours to complete verification."
            : `You're all set! Show your OTP at reception and enjoy your workspace.`}
        </p>
        {(totalSaved ?? 0) > 0 && (
          <div className="flex items-center gap-2 rounded-full bg-[#DCFCE7] px-4 py-2">
            <Sparkles size={15} className="text-[#16A34A]" />
            <p className="text-sm font-bold text-[#15803D]">You saved ₹{(totalSaved ?? 0).toLocaleString()} with Bokko!</p>
          </div>
        )}
      </div>

      {/* Booking Details Card */}
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="bg-[#0F172A] px-6 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Booking Confirmed</p>
          <p className="mt-0.5 text-lg font-extrabold text-white">{bookingId}</p>
        </div>
        <div className="divide-y divide-[#F8FAFC] px-6">
          {(
            [
              { label: "Workspace", value: workspaceName },
              { label: "City", value: booking.cityName },
              ...(bookingDate ? [{ label: "Date", value: bookingDate }] : []),
              { label: "Guest", value: guestName || "—" },
              { label: "Email", value: guestEmail || "—" },
              { label: "Payment", value: paymentMethod.toUpperCase(), icon: payIcon[paymentMethod] ?? CreditCard },
              { label: "Status", value: "Confirmed", icon: CheckCircle2 },
            ] as { label: string; value: string; icon?: LucideIcon }[]
          ).map(({ label, value, icon: RowIcon }) => (
            <div key={label} className="flex items-center justify-between py-3 text-sm">
              <span className="text-[#64748B]">{label}</span>
              <span className="flex items-center gap-1.5 text-right font-semibold text-[#0F172A]">
                {RowIcon && <RowIcon size={14} strokeWidth={2} className={label === "Status" ? "text-[#16A34A]" : ""} />}
                {value}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between bg-[#0F172A] px-6 py-4">
          <span className="text-sm font-semibold text-white/70">Amount Paid</span>
          <span className="text-xl font-extrabold text-white">₹{totalAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Check-in OTP */}
      {(booking.productType === "day-pass" || booking.productType === "meeting-room") && (
        <div className="w-full max-w-lg rounded-2xl border-2 border-[#2563EB] bg-[#EFF6FF] p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2563EB]">
              <KeyRound size={16} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8]">Check-in OTP</p>
              <p className="text-[11px] text-[#3B82F6]">Show this to reception for workspace access</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-white px-5 py-4 shadow-sm">
            <div className="flex gap-2">
              {checkinOtp.split("").map((digit, i) => (
                <span key={i} className="flex h-10 w-9 items-center justify-center rounded-lg bg-[#F1F5F9] text-xl font-extrabold text-[#0F172A]">
                  {digit}
                </span>
              ))}
            </div>
            <button type="button" onClick={copyOtp}
              className="flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-2 text-xs font-bold text-white hover:bg-[#1d4ed8]">
              <Copy size={12} />
              Copy
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-[#64748B]">Valid for 1 hour after check-in time · Do not share</p>
        </div>
      )}

      {/* QR Access Pass */}
      {hasQR && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">QR Access Pass</p>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrData}&bgcolor=ffffff&color=0F172A&margin=10`}
            alt="QR Access Pass"
            className="h-[180px] w-[180px] rounded-2xl border border-[#E2E8F0] shadow-sm"
          />
          <p className="text-xs text-[#94A3B8]">Scan at workspace gate for contactless entry</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex w-full max-w-lg flex-col gap-3">
        <button type="button"
          onClick={() => downloadBlob(generateInvoice(booking, bookingId, totalAmount, guestName, guestEmail), `bokko-invoice-${bookingId}.html`, "text/html")}
          className="flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white py-3.5 text-sm font-semibold text-[#0F172A] hover:border-[#94A3B8]">
          <Download size={15} />
          Download Invoice
        </button>

        {hasCalendar && (
          <button type="button"
            onClick={() => { const ics = generateICS(booking, bookingId); if (ics) downloadBlob(ics, `bokko-${bookingId}.ics`, "text/calendar"); }}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white py-3.5 text-sm font-semibold text-[#0F172A] hover:border-[#94A3B8]">
            <Calendar size={15} />
            Add to Calendar
          </button>
        )}

        <button type="button" onClick={handleShare}
          className="flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white py-3.5 text-sm font-semibold text-[#0F172A] hover:border-[#94A3B8]">
          <Share2 size={15} />
          Share Booking
        </button>

        <a href={`https://wa.me/918008008000?text=Hi Bokko! My booking ${bookingId} at ${workspaceName} is confirmed. OTP: ${checkinOtp}`}
          target="_blank" rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 text-sm font-semibold text-white hover:bg-[#1ebe5d]">
          <ExternalLink size={15} />
          WhatsApp Confirmation
        </a>
      </div>
    </div>
  );
}
