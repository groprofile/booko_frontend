import { Clock, FileText } from "lucide-react";
import type { DocumentRequirement } from "../../data/virtualOfficeDetails";
import SectionLabel from "./SectionLabel";

interface DocumentRequirementsSectionProps {
  documents: DocumentRequirement[];
  approvalWindow: string;
}

export default function DocumentRequirementsSection({ documents, approvalWindow }: DocumentRequirementsSectionProps) {
  return (
    <section className="m-0">
      <SectionLabel title="Document Requirements" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc, index) => (
          <div key={doc.name} className="rounded-sm border border-[#E2E8F0] bg-white p-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EFF6FF] text-xs font-bold text-[#2563EB]">
                {index + 1}
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#F8FAFC] text-[#64748B]">
                <FileText size={16} />
              </span>
            </div>
            <p className="mt-2 text-sm font-bold text-[#0F172A]">{doc.name}</p>
            <p className="mt-1 text-xs text-[#64748B]">{doc.description}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#FFFBEB] px-3 py-1.5 text-xs font-semibold text-[#B45309]">
        <Clock size={14} />
        {approvalWindow}
      </p>
    </section>
  );
}
