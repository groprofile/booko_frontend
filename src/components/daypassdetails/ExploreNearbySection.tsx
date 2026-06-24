import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SectionLabel from "./SectionLabel";

interface ExploreNearbySectionProps {
  citySlug: string;
  localities: string[];
  images: string[];
}

export default function ExploreNearbySection({ citySlug, localities, images }: ExploreNearbySectionProps) {
  return (
    <section>
      <SectionLabel title="Explore Nearby" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {localities.slice(0, 6).map((locality, index) => (
          <Link
            key={locality}
            to={`/${citySlug}/day-pass?location=${encodeURIComponent(locality)}`}
            className="group relative h-[110px] overflow-hidden rounded-[16px] shadow-soft"
          >
            <img
              src={images[index % images.length]}
              alt={locality}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.08]"
            />
            <span className="absolute inset-0 bg-[#0F172A]/45" />
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 p-3 text-sm font-bold text-white">
              {locality}
              <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
