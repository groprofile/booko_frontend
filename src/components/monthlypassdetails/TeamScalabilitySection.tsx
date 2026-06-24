import { useState } from "react";
import { TrendingUp } from "lucide-react";
import type { SeatTier } from "../../data/monthlyPassDetails";

interface TeamScalabilitySectionProps {
  seatTiers: SeatTier[];
}

export default function TeamScalabilitySection({ seatTiers }: TeamScalabilitySectionProps) {
  const [selectedSeats, setSelectedSeats] = useState<SeatTier["seats"]>(seatTiers[0].seats);
  const [requested, setRequested] = useState(false);
  const selectedTier = seatTiers.find((tier) => tier.seats === selectedSeats) ?? seatTiers[0];

  return (
    <section className="rounded-[20px] border border-[#E2E8F0] bg-white p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]">
          <TrendingUp size={15} />
        </span>
        <p className="text-xs font-bold uppercase tracking-wide text-[#2563EB]">Unique Bokko Feature</p>
      </div>
      <h2 className="mt-2 text-lg font-extrabold text-[#0F172A]">Need More Seats? Upgrade Anytime</h2>
      <p className="mt-1 text-sm text-[#64748B]">Scale your team's seats up or down as you grow — no new contracts needed.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {seatTiers.map((tier) => {
          const selected = tier.seats === selectedSeats;
          return (
            <button
              key={String(tier.seats)}
              type="button"
              onClick={() => setSelectedSeats(tier.seats)}
              className={
                "rounded-xl border px-4 py-2 text-sm font-bold transition-colors " +
                (selected
                  ? "border-[#2563EB] bg-[#2563EB] text-white"
                  : "border-[#E2E8F0] bg-white text-[#334155] hover:border-[#94A3B8]")
              }
            >
              {tier.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-[#F8FAFC] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-[#94A3B8]">Estimated Monthly Cost</p>
          <p className="text-2xl font-extrabold text-[#0F172A]">
            {selectedTier.estimatedMonthly !== null ? `₹${selectedTier.estimatedMonthly.toLocaleString()}` : "Custom Pricing"}
          </p>
        </div>
        {requested ? (
          <span className="rounded-xl bg-[#ECFDF5] px-4 py-2.5 text-sm font-semibold text-[#16A34A]">
            Request received! Our team will reach out shortly.
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setRequested(true)}
            className="cta-gradient flex h-11 items-center justify-center rounded-xl px-5 text-sm font-bold text-white"
          >
            {selectedTier.seats === "Enterprise" ? "Talk To Enterprise Team" : "Upgrade Seats"}
          </button>
        )}
      </div>
    </section>
  );
}
