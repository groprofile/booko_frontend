import { Check, X } from "lucide-react";
import type { PlanComparisonRow } from "../../data/virtualOfficeDetails";
import SectionLabel from "./SectionLabel";

interface PlanComparisonTableProps {
  rows: PlanComparisonRow[];
}

function Cell({ included }: { included: boolean }) {
  return (
    <td className="px-4 py-3 text-center">
      {included ? <Check size={16} className="mx-auto text-[#16A34A]" /> : <X size={16} className="mx-auto text-[#CBD5E1]" />}
    </td>
  );
}

export default function PlanComparisonTable({ rows }: PlanComparisonTableProps) {
  return (
    <section className="m-0">
      <SectionLabel title="Plan Comparison" />
      <div className="overflow-x-auto rounded-sm border border-[#E2E8F0] bg-white">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <th className="px-4 py-3 text-left font-bold text-[#0F172A]">Feature</th>
              <th className="px-4 py-3 text-center font-bold text-[#0F172A]">Basic</th>
              <th className="px-4 py-3 text-center font-bold text-[#2563EB]">Business</th>
              <th className="px-4 py-3 text-center font-bold text-[#7C3AED]">Premium</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.feature} className="border-b border-[#E2E8F0] last:border-0">
                <td className="px-4 py-3 font-semibold text-[#334155]">{row.feature}</td>
                <Cell included={row.basic} />
                <Cell included={row.business} />
                <Cell included={row.premium} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
