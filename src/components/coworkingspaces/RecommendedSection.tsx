import { Briefcase, Building2, Globe2, Rocket, Users, Users2 } from "lucide-react";
import SectionLabel from "./SectionLabel";

export type Persona = "freelancers" | "startups" | "remoteTeams" | "salesTeams" | "corporateTeams" | "agencies";

interface RecommendedSectionProps {
  activePersona: Persona | null;
  onSelectPersona: (persona: Persona) => void;
}

const personas: { key: Persona; label: string; icon: typeof Rocket; description: string }[] = [
  { key: "freelancers", label: "Freelancers", icon: Briefcase, description: "Flexible day passes, pay as you go" },
  { key: "startups", label: "Startups", icon: Rocket, description: "Affordable, flexible workspaces to grow" },
  { key: "remoteTeams", label: "Remote Teams", icon: Globe2, description: "Monthly memberships with 24x7 access" },
  { key: "salesTeams", label: "Sales Teams", icon: Users, description: "Meeting rooms for client pitches" },
  { key: "corporateTeams", label: "Corporate Teams", icon: Building2, description: "Corporate billing & managed offices" },
  { key: "agencies", label: "Agencies", icon: Users2, description: "Virtual office + meeting rooms combined" },
];

export default function RecommendedSection({ activePersona, onSelectPersona }: RecommendedSectionProps) {
  return (
    <section>
      <SectionLabel title="Recommended Workspaces" />
      <p className="mb-4 text-sm text-[#64748B]">Tap a persona to instantly filter workspaces best suited for you.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {personas.map(({ key, label, icon: Icon, description }) => {
          const active = activePersona === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectPersona(key)}
              className={
                "flex flex-col items-start gap-2.5 rounded-2xl border p-4 text-left transition-colors " +
                (active ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E2E8F0] bg-white hover:border-[#94A3B8]")
              }
            >
              <span
                className={
                  "flex h-9 w-9 items-center justify-center rounded-xl " +
                  (active ? "bg-[#2563EB] text-white" : "bg-[#F8FAFC] text-[#2563EB]")
                }
              >
                <Icon size={16} strokeWidth={1.8} />
              </span>
              <p className="text-sm font-bold text-[#0F172A]">{label}</p>
              <p className="text-xs text-[#64748B]">{description}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
