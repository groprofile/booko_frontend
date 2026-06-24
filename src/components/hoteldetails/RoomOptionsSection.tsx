import { useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Maximize, ShieldCheck, Users } from "lucide-react";
import type { RoomOption } from "../../data/hotelDetails";
import SectionLabel from "./SectionLabel";

interface RoomCardProps {
  room: RoomOption;
  selected: boolean;
  onSelect: () => void;
}

function RoomCard({ room, selected, onSelect }: RoomCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const showPrev = () => setImageIndex((i) => (i === 0 ? room.images.length - 1 : i - 1));
  const showNext = () => setImageIndex((i) => (i === room.images.length - 1 ? 0 : i + 1));
  const fullDay = room.pricing.find((tier) => tier.key === "full-day");

  return (
    <div
      className={
        "flex flex-col gap-4 rounded-[20px] border p-4 transition-colors sm:flex-row " +
        (selected ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E2E8F0] bg-white")
      }
    >
      <div className="relative h-[180px] w-full shrink-0 overflow-hidden rounded-[16px] sm:h-[150px] sm:w-[220px]">
        <img src={room.images[imageIndex]} alt={room.name} className="h-full w-full object-cover" />
        {room.breakfastIncluded && (
          <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-[#16A34A] shadow-soft">
            Breakfast Included
          </span>
        )}
        {room.images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={showPrev}
              className="absolute left-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#0F172A] hover:bg-white"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={showNext}
              className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#0F172A] hover:bg-white"
            >
              <ChevronRight size={14} />
            </button>
          </>
        )}
      </div>

      <div className="flex-1">
        <p className="text-lg font-bold text-[#0F172A]">{room.name}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-[#475569]">
          <span className="inline-flex items-center gap-1">
            <Maximize size={13} />
            {room.sizeSqft} sq.ft
          </span>
          <span className="inline-flex items-center gap-1">
            <Users size={13} />
            Up to {room.occupancy} guests
          </span>
          <span>{room.bedType}</span>
        </div>

        <p className="mt-2 text-sm text-[#64748B]">{room.description}</p>

        <p className="mt-2 text-xs font-semibold text-[#94A3B8]">{room.amenities.join(" • ")}</p>

        <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#16A34A]">
          <ShieldCheck size={13} />
          {room.cancellationPolicy}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {room.pricing
            .filter((tier) => !tier.isWorkcation)
            .map((tier) => (
              <span
                key={tier.key}
                className="flex min-w-[72px] flex-col items-center rounded-lg border border-[#E2E8F0] px-2.5 py-1.5"
              >
                <span className="text-xs font-bold text-[#0F172A]">{tier.available ? `₹${tier.price.toLocaleString()}` : "N/A"}</span>
                <span className="text-[10px] text-[#64748B]">{tier.label}</span>
              </span>
            ))}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end justify-between gap-3 sm:w-[140px]">
        <div className="text-right">
          <p className="text-xs text-[#94A3B8]">Full Day from</p>
          <p className="text-xl font-extrabold text-[#0F172A]">₹{(fullDay?.price ?? room.pricing[0].price).toLocaleString()}</p>
        </div>
        <button
          type="button"
          onClick={onSelect}
          className={
            "flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors " +
            (selected ? "bg-[#2563EB] text-white" : "border border-[#E2E8F0] bg-white text-[#334155] hover:border-[#94A3B8]")
          }
        >
          {selected && <CheckCircle2 size={15} />}
          {selected ? "Selected" : "Select Room"}
        </button>
      </div>
    </div>
  );
}

interface RoomOptionsSectionProps {
  rooms: RoomOption[];
  selectedRoomId: string;
  onSelectRoom: (id: string) => void;
}

export default function RoomOptionsSection({ rooms, selectedRoomId, onSelectRoom }: RoomOptionsSectionProps) {
  return (
    <section>
      <SectionLabel title="Room Options" />
      <div className="flex flex-col gap-4">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} selected={room.id === selectedRoomId} onSelect={() => onSelectRoom(room.id)} />
        ))}
      </div>
    </section>
  );
}
