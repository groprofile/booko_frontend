import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import Section from "./common/Section";
import { METROS } from "../data/metros";

export default function PopularCitiesSection() {
  return (
    <Section
      heading="Popular Cities"
      description="Book verified coworking spaces, meeting rooms and more across India's top business hubs."
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {METROS.map((metro) => (
          <Link
            key={metro.slug}
            to={`/${metro.slug}/coworking-spaces`}
            className="group flex items-center gap-2.5 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3.5 text-sm font-bold text-primary-text transition-colors hover:border-brand hover:text-brand"
          >
            <MapPin size={16} strokeWidth={1.75} className="shrink-0 text-muted-text transition-colors group-hover:text-brand" />
            <span className="truncate">{metro.label}</span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
