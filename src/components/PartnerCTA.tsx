import { Link } from "react-router-dom";

export default function PartnerCTA() {
  return (
    <section className="w-full bg-white py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-[#0F172A] px-6 py-12 text-center sm:px-10 sm:py-14 lg:px-16 lg:py-16">
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-0 h-[420px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2563EB] opacity-20 blur-[110px]"
          />

          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              List Your Space On Bokko
            </h2>
            <p className="mt-4 text-base text-white/70 sm:text-lg">
              Reach professionals, startups, teams and travelers.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/partner/signup"
                className="w-full rounded-xl bg-[#2563EB] px-7 py-3.5 text-center text-sm font-semibold text-white shadow-soft transition-transform hover:scale-[1.02] sm:w-auto"
              >
                Become a Partner
              </Link>
              <Link
                to="/partner/signin"
                className="w-full rounded-xl border border-white/20 px-7 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
              >
                Partner Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
