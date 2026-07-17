import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, ShieldCheck, Sparkles, Star, Train } from "lucide-react";
import type { CoworkingSpace } from "../../data/coworkingSpaces";
import { CITY_NAMES } from "../../data/coworkingSpaces";

interface WorkspaceCardProps {
  space: CoworkingSpace;
}

const serviceBadgeStyles: Record<string, string> = {
  dayPass: "bg-[#EFF6FF] text-[#2563EB]",
  meetingRoom: "bg-[#F5F3FF] text-[#7C3AED]",
  monthlyPass: "bg-[#ECFDF5] text-[#16A34A]",
  virtualOffice: "bg-[#FFFBEB] text-[#B45309]",
  privateCabin: "bg-[#F1F5F9] text-[#475569]",
  managedOffice: "bg-[#EEF2FF] text-[#4338CA]",
  trainingRoom: "bg-[#FDF2F8] text-[#BE185D]",
  boardRoom: "bg-[#ECFEFF] text-[#0E7490]",
};

const primaryCtaLabels: Record<string, string> = {
  dayPass: "View Day Pass",
  meetingRoom: "View Meeting Rooms",
  monthlyPass: "View Monthly Pass",
  virtualOffice: "View Virtual Office",
};

export default function WorkspaceCard({ space }: WorkspaceCardProps) {
  const [matchExpanded, setMatchExpanded] = useState(false);
  const cityName = CITY_NAMES[space.city] ?? space.city;
  const primaryServices = space.services.filter((service) => primaryCtaLabels[service.key]);
  const secondaryServices = space.services.filter((service) => !primaryCtaLabels[service.key]);

  return (
    <div className="group overflow-hidden rounded-[22px] border border-[#E2E8F0] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-transform duration-300 hover:-translate-y-1">
      <div className="flex flex-col sm:flex-row">
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden sm:aspect-auto sm:h-auto sm:w-[280px]">
          <img src={space.image} alt={space.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />

          <span className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-base font-extrabold text-[#2563EB] shadow-soft">
            {space.brand.charAt(0)}
          </span>

          {space.premium && (
            <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#2563EB] shadow-soft">
              Premium
            </span>
          )}
        </div>

        <div className="flex-1 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-[#0F172A] px-2.5 py-1 text-[11px] font-bold text-white">
              <Star size={11} strokeWidth={1.75} className="fill-[#FBBF24] text-[#FBBF24]" />
              {Number(space.rating ?? 0).toFixed(1)} ({Number(space.reviews ?? 0).toLocaleString()})
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#64748B]">
              <Train size={12} strokeWidth={1.75} />
              {space.distanceKm} km from Metro
            </span>
            {space.gstCompliant && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[11px] font-semibold text-[#16A34A]">
                <ShieldCheck size={11} strokeWidth={1.75} />
                GST Ready
              </span>
            )}
          </div>

          <h3 className="mt-2 text-lg font-bold text-[#0F172A] sm:text-[20px]">{space.name}</h3>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">{space.brand}</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-[#64748B]">
            <MapPin size={14} strokeWidth={1.75} />
            {space.locality}, {cityName}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {space.services.map((service) => (
              <span
                key={service.key}
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${serviceBadgeStyles[service.key] ?? "bg-[#F1F5F9] text-[#475569]"}`}
              >
                ✓ {service.label}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setMatchExpanded((v) => !v)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-[#2563EB]/20 bg-[#EFF6FF] px-3 py-1.5 text-xs font-bold text-[#2563EB]"
          >
            <Sparkles size={12} strokeWidth={1.75} />
            {space.matchScore}/100 Match
            <span className="text-[#2563EB]/60">{matchExpanded ? "Hide" : "Why?"}</span>
          </button>

          <div
            className={
              "grid transition-[grid-template-rows] duration-300 ease-out " +
              (matchExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]")
            }
          >
            <div className="overflow-hidden">
              <div className="mt-2 flex flex-wrap gap-1.5">
                {space.matchScoreItems
                  .filter((item) => item.achieved)
                  .map((item) => (
                    <span key={item.label} className="rounded-full bg-[#F8FAFC] px-2.5 py-1 text-[11px] font-semibold text-[#334155]">
                      {item.label}
                    </span>
                  ))}
              </div>
            </div>
          </div>

          {secondaryServices.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#64748B]">
              {secondaryServices.map((service) => (
                <Link key={service.key} to={service.href} className="font-semibold text-[#334155] hover:text-[#2563EB] hover:underline">
                  {service.priceLabel}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {primaryServices.length > 0 && (
        <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <div className="flex flex-wrap gap-2 text-xs text-[#64748B] sm:gap-4">
            {primaryServices.map((service) => (
              <span key={service.key} className="font-semibold text-[#334155]">
                {service.priceLabel}
              </span>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {primaryServices.map((service) => (
              <Link
                key={service.key}
                to={service.href}
                className="rounded-xl border border-[#2563EB] px-4 py-2 text-sm font-semibold text-[#2563EB] transition-colors hover:bg-[#EFF6FF]"
              >
                {primaryCtaLabels[service.key]}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
