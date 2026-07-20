import { BadgeCheck, Clock, Star, Trophy, UserRound } from "lucide-react";
import type { HostInfo } from "../../data/meetingRoomDetails";
import SectionLabel from "./SectionLabel";

interface HostDetailsSectionProps {
  host: HostInfo;
}

export default function HostDetailsSection({ host }: HostDetailsSectionProps) {
  const rows = [
    { icon: UserRound, label: "Property Manager", value: host.propertyManager },
    { icon: Clock, label: "Response Time", value: `Usually within ${host.responseTimeMinutes} minutes` },
    { icon: Trophy, label: "Years Operating", value: `${host.yearsOperating} years` },
    { icon: Star, label: "Customer Satisfaction", value: `${host.satisfactionScore.toFixed(1)} / 5` },
  ];

  return (
    <section className="m-0">
      <SectionLabel title="Host Details" />
      <div className="rounded-sm border border-[#E2E8F0] bg-white p-6 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-sm bg-[#EFF6FF] text-[#2563EB]">
            <UserRound size={22} strokeWidth={1.8} />
          </span>
          <div>
            <p className="flex items-center gap-1.5 text-base font-bold text-[#0F172A]">
              {host.brand}
              {host.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[10px] font-bold text-[#16A34A]">
                  <BadgeCheck size={11} />
                  Verified Host
                </span>
              )}
            </p>
            <p className="text-sm text-[#64748B]">Hosted by {host.propertyManager}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-[#F8FAFC] text-[#2563EB]">
                <Icon size={16} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">{label}</p>
                <p className="text-sm font-semibold text-[#0F172A]">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
