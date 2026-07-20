import SectionLabel from "./SectionLabel";
import AmenityIconGrid from "../common/AmenityIconGrid";

interface AmenitiesGridProps {
  amenities: string[];
}

export default function AmenitiesGrid({ amenities }: AmenitiesGridProps) {
  return (
    <section className="m-0">
      <SectionLabel title="Workspace Amenities" />
      <AmenityIconGrid items={amenities} />
    </section>
  );
}
