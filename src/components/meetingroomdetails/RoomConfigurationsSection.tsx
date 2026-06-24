import type { RoomConfiguration } from "../../data/meetingRoomDetails";
import SectionLabel from "./SectionLabel";

function Seat() {
  return <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" />;
}

function LayoutDiagram({ layout }: { layout: string }) {
  if (layout === "Boardroom Layout") {
    return (
      <div className="flex h-24 w-full items-center justify-center">
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex gap-2">
            <Seat /><Seat /><Seat />
          </div>
          <div className="h-8 w-28 rounded-md border-2 border-[#2563EB]/40 bg-[#EFF6FF]" />
          <div className="flex gap-2">
            <Seat /><Seat /><Seat />
          </div>
        </div>
      </div>
    );
  }
  if (layout === "Classroom Layout") {
    return (
      <div className="flex h-24 w-full flex-col items-center justify-center gap-1.5">
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex gap-2">
            <Seat /><Seat /><Seat /><Seat />
          </div>
        ))}
        <div className="mt-1 h-1.5 w-32 rounded-full bg-[#94A3B8]/40" />
      </div>
    );
  }
  if (layout === "U Shape Layout") {
    return (
      <div className="flex h-24 w-full items-center justify-center">
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col gap-2"><Seat /><Seat /></div>
          <div className="flex flex-col justify-end"><Seat /></div>
          <div className="flex flex-col gap-2"><Seat /><Seat /></div>
        </div>
      </div>
    );
  }
  if (layout === "Theatre Layout") {
    return (
      <div className="flex h-24 w-full flex-col items-center justify-center gap-1">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="flex gap-1.5">
            <Seat /><Seat /><Seat /><Seat /><Seat />
          </div>
        ))}
      </div>
    );
  }
  if (layout === "Cabaret Layout") {
    return (
      <div className="flex h-24 w-full items-center justify-center gap-3">
        {[0, 1].map((table) => (
          <div key={table} className="flex flex-col items-center gap-1">
            <div className="flex gap-1.5"><Seat /><Seat /></div>
            <div className="h-5 w-8 rounded-full border-2 border-[#2563EB]/40 bg-[#EFF6FF]" />
            <div className="flex gap-1.5"><Seat /><Seat /></div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex h-24 w-full items-center justify-center gap-4">
      <Seat />
      <div className="h-6 w-16 rounded-md border-2 border-[#2563EB]/40 bg-[#EFF6FF]" />
      <Seat />
    </div>
  );
}

interface RoomConfigurationsSectionProps {
  configurations: RoomConfiguration[];
}

export default function RoomConfigurationsSection({ configurations }: RoomConfigurationsSectionProps) {
  return (
    <section>
      <SectionLabel title="Room Configurations" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {configurations.map((config) => (
          <div key={config.layout} className="rounded-[18px] border border-[#E2E8F0] bg-white p-4">
            <div className="rounded-[14px] bg-[#F8FAFC]">
              <LayoutDiagram layout={config.layout} />
            </div>
            <p className="mt-3 text-sm font-bold text-[#0F172A]">{config.layout}</p>
            <p className="text-xs font-semibold text-[#2563EB]">Capacity: {config.capacity}</p>
            <p className="mt-1 text-xs text-[#64748B]">{config.suitableFor}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
