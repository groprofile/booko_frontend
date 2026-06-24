import { Clock3, Eye, Flame, Users } from "lucide-react";
import type { UrgencySignals } from "../../data/checkoutConfig";

interface UrgencySectionProps {
  signals: UrgencySignals;
}

export default function UrgencySection({ signals }: UrgencySectionProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-[#F59E0B]/30 bg-[#FFFBEB] px-4 py-3">
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B45309] sm:text-sm">
        <Flame size={14} />
        Only {signals.roomsLeft} room{signals.roomsLeft === 1 ? "" : "s"} left
      </span>
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B45309] sm:text-sm">
        <Users size={14} />
        Booked {signals.bookedToday} times today
      </span>
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B45309] sm:text-sm">
        <Eye size={14} />
        Viewed by {signals.viewedBy} people
      </span>
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B45309] sm:text-sm">
        <Clock3 size={14} />
        Last booking {signals.lastBookingMinutesAgo} minutes ago
      </span>
    </div>
  );
}
