import SectionLabel from "./SectionLabel";
import AmenityIconGrid from "../common/AmenityIconGrid";

interface AmenitiesSectionProps {
  amenities: string[];
}

export default function AmenitiesSection({ amenities }: AmenitiesSectionProps) {
  return (
    <section className="m-0">
      <SectionLabel title="Amenities" />
      <AmenityIconGrid items={amenities} />
    </section>
  );
}
