import { Star } from "lucide-react";
import { GooglePlayBadge, AppStoreBadge } from "./StoreBadges";
import { useInView } from "../hooks/useInView";

const QR_CODE_URL =
  "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://bokko.app/download&color=0F172A&bgcolor=FFFFFF";

export default function DownloadAppSection() {
  const { ref, isInView } = useInView<HTMLDivElement>();

  return (
    <section className="w-full bg-white py-10 sm:py-14 lg:py-16">
      <div ref={ref} className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="relative flex flex-col items-center gap-12 overflow-hidden rounded-[32px] border border-[#E2E8F0] bg-white px-6 py-12 sm:px-10 sm:py-14 lg:flex-row lg:justify-between lg:gap-10 lg:px-16 lg:py-0">
          <div
            aria-hidden="true"
            className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#2563EB] opacity-[0.06] blur-3xl"
          />

          <div className={"relative z-10 max-w-md text-center lg:text-left " + (isInView ? "animate-fade-in-up" : "opacity-0")}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#2563EB] shadow-soft">
              <Star size={12} className="fill-[#2563EB] text-[#2563EB]" />
              4.8 rated booking experience
            </span>

            <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-[#0F172A] sm:text-4xl">
              Download the App Now!
            </h2>
            <p className="mt-4 text-base text-[#334155] sm:text-lg">
              Book hotels, coworking spaces, meeting rooms, day passes and more — anytime,
              anywhere, right from your pocket.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
              <GooglePlayBadge />
              <AppStoreBadge />
            </div>
          </div>

          <div
            className={"relative z-10 flex shrink-0 justify-center py-10 lg:py-16 " + (isInView ? "animate-fade-in-up" : "opacity-0")}
            style={{ animationDelay: "120ms" }}
          >
            <div className="relative h-[380px] w-[200px] rounded-[34px] border-[6px] border-[#0F172A] bg-[#0F172A] shadow-float sm:h-[420px] sm:w-[220px]">
              <span className="absolute left-1/2 top-0 h-1.5 w-16 -translate-x-1/2 rounded-b-md bg-[#0F172A]" />

              <div className="cta-gradient flex h-full w-full flex-col items-center gap-4 overflow-hidden rounded-[28px] pt-12 sm:pt-14">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-xl font-extrabold text-[#2563EB] shadow-soft">
                  B
                </span>
                <p className="px-6 text-center text-sm font-bold leading-snug text-white">
                  Book Karo, Bokko Karo
                </p>
                <div className="mx-6 w-full max-w-[150px] rounded-xl bg-white/95 px-3 py-2.5 shadow-soft">
                  <div className="h-1.5 w-3/4 rounded-full bg-[#E2E8F0]" />
                  <div className="mt-1.5 h-1.5 w-1/2 rounded-full bg-[#E2E8F0]" />
                </div>
              </div>

              <div className="absolute -right-8 -bottom-6 w-[150px] rounded-2xl border border-[#E2E8F0] bg-white p-3 text-center shadow-float sm:-right-10">
                <img
                  src={QR_CODE_URL}
                  alt="Scan to download the Bokko app"
                  className="mx-auto h-24 w-24 rounded-lg"
                />
                <p className="mt-2 text-[11px] font-semibold leading-snug text-[#334155]">
                  Scan the QR code to download the app
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
