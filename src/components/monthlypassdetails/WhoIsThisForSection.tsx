import SectionLabel from "./SectionLabel";

interface WhoIsThisForSectionProps {
  items: string[];
}

export default function WhoIsThisForSection({ items }: WhoIsThisForSectionProps) {
  return (
    <section className="m-0">
      <SectionLabel title="Who Is This For" />
      <div className="flex flex-wrap gap-2.5">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-[#334155]"
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
