import SectionLabel from "./SectionLabel";
import type { MembershipType } from "../../data/monthlyPassDetails";

interface MembershipPlansTableProps {
  membershipTypes: MembershipType[];
}

export default function MembershipPlansTable({ membershipTypes }: MembershipPlansTableProps) {
  const rows: { label: string; key: keyof MembershipType }[] = [
    { label: "Price", key: "price" },
    { label: "Access Hours", key: "accessHours" },
    { label: "Meeting Room Credits", key: "meetingRoomCredits" },
    { label: "Guests Allowed", key: "guestsAllowed" },
    { label: "Storage", key: "storage" },
    { label: "Community Access", key: "communityAccess" },
  ];

  return (
    <section className="m-0">
      <SectionLabel title="Membership Plans" />
      <div className="overflow-x-auto rounded-sm border border-[#E2E8F0]">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="bg-[#F8FAFC]">
              <th className="p-4 text-left text-xs font-bold uppercase tracking-wide text-[#94A3B8]">Feature</th>
              {membershipTypes.map((type) => (
                <th key={type.key} className="p-4 text-left text-sm font-extrabold text-[#0F172A]">
                  {type.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.label} className={index % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]/50"}>
                <td className="border-t border-[#E2E8F0] p-4 font-semibold text-[#475569]">{row.label}</td>
                {membershipTypes.map((type) => (
                  <td key={type.key} className="border-t border-[#E2E8F0] p-4 text-[#0F172A]">
                    {row.key === "price" ? `₹${type.price.toLocaleString()}/mo` : String(type[row.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
