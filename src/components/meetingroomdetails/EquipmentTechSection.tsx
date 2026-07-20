import SectionLabel from "./SectionLabel";
import AmenityIconGrid from "../common/AmenityIconGrid";

interface EquipmentTechSectionProps {
  equipment: string[];
}

export default function EquipmentTechSection({ equipment }: EquipmentTechSectionProps) {
  return (
    <section className="m-0">
      <SectionLabel title="Equipment & Technology" />
      <AmenityIconGrid items={equipment} />
    </section>
  );
}
