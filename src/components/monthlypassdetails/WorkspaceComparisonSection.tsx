import { useMemo } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import type { MonthlyPassListing } from "../../data/monthlyPassListings";
import SectionLabel from "./SectionLabel";

interface WorkspaceComparisonSectionProps {
  current: MonthlyPassListing;
  allListings: MonthlyPassListing[];
}

export default function WorkspaceComparisonSection({ current, allListings }: WorkspaceComparisonSectionProps) {
  const competitors = useMemo(() => {
    return allListings
      .filter((listing) => listing.id !== current.id)
      .sort((a, b) => Math.abs(a.distanceKm - current.distanceKm) - Math.abs(b.distanceKm - current.distanceKm))
      .slice(0, 2);
  }, [allListings, current]);

  const columns = [current, ...competitors];

  return (
    <section>
      <SectionLabel title="Workspace Comparison" />
      <div className="overflow-x-auto rounded-[20px] border border-[#E2E8F0]">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="bg-[#F8FAFC]">
              <th className="p-4 text-left text-xs font-bold uppercase tracking-wide text-[#94A3B8]">Feature</th>
              {columns.map((listing) => (
                <th key={listing.id} className="p-4 text-left text-sm font-extrabold text-[#0F172A]">
                  {listing.id === current.id ? `${listing.brand} (This Workspace)` : listing.brand}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white">
              <td className="border-t border-[#E2E8F0] p-4 font-semibold text-[#475569]">Price</td>
              {columns.map((listing) => (
                <td key={listing.id} className="border-t border-[#E2E8F0] p-4 text-[#0F172A]">
                  ₹{listing.bestPrice.toLocaleString()}/mo
                </td>
              ))}
            </tr>
            <tr className="bg-[#F8FAFC]/50">
              <td className="border-t border-[#E2E8F0] p-4 font-semibold text-[#475569]">Location</td>
              {columns.map((listing) => (
                <td key={listing.id} className="border-t border-[#E2E8F0] p-4 text-[#0F172A]">
                  {listing.locality} ({listing.distanceKm} km)
                </td>
              ))}
            </tr>
            <tr className="bg-white">
              <td className="border-t border-[#E2E8F0] p-4 font-semibold text-[#475569]">Rating</td>
              {columns.map((listing) => (
                <td key={listing.id} className="border-t border-[#E2E8F0] p-4 text-[#0F172A]">
                  {listing.rating.toFixed(1)} ({listing.reviews.toLocaleString()})
                </td>
              ))}
            </tr>
            <tr className="bg-[#F8FAFC]/50">
              <td className="border-t border-[#E2E8F0] p-4 font-semibold text-[#475569]">Amenities</td>
              {columns.map((listing) => (
                <td key={listing.id} className="border-t border-[#E2E8F0] p-4 text-[#0F172A]">
                  {listing.seatingTypes.length} seating types
                </td>
              ))}
            </tr>
            <tr className="bg-white">
              <td className="border-t border-[#E2E8F0] p-4 font-semibold text-[#475569]">Meeting Rooms</td>
              {columns.map((listing) => (
                <td key={listing.id} className="border-t border-[#E2E8F0] p-4">
                  {listing.premier || listing.seatingTypes.length > 1 ? (
                    <CheckCircle2 size={16} className="text-[#16A34A]" />
                  ) : (
                    <XCircle size={16} className="text-[#94A3B8]" />
                  )}
                </td>
              ))}
            </tr>
            <tr className="bg-[#F8FAFC]/50">
              <td className="border-t border-[#E2E8F0] p-4 font-semibold text-[#475569]">Parking</td>
              {columns.map((listing) => (
                <td key={listing.id} className="border-t border-[#E2E8F0] p-4">
                  {listing.accessibility.includes("Parking (Free/Paid)") ? (
                    <CheckCircle2 size={16} className="text-[#16A34A]" />
                  ) : (
                    <XCircle size={16} className="text-[#94A3B8]" />
                  )}
                </td>
              ))}
            </tr>
            <tr className="bg-white">
              <td className="border-t border-[#E2E8F0] p-4 font-semibold text-[#475569]">Community</td>
              {columns.map((listing) => (
                <td key={listing.id} className="border-t border-[#E2E8F0] p-4">
                  {listing.popular ? (
                    <CheckCircle2 size={16} className="text-[#16A34A]" />
                  ) : (
                    <XCircle size={16} className="text-[#94A3B8]" />
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
