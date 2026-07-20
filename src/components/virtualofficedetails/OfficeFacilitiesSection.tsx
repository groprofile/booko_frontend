import SectionLabel from "./SectionLabel";
import AmenityIconGrid from "../common/AmenityIconGrid";

interface OfficeFacilitiesSectionProps {
  facilities: string[];
}

export default function OfficeFacilitiesSection({ facilities }: OfficeFacilitiesSectionProps) {
  return (
    <section className="m-0">
      <SectionLabel title="Office Facilities" />
      <AmenityIconGrid items={facilities} />
    </section>
  );
}
