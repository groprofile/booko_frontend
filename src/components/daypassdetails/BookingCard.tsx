import { useNavigate } from "react-router-dom";
import { ThumbsUp } from "lucide-react";
import type { DayPassListing } from "../../data/dayPassListings";
import type { SeatingOptionDetail } from "../../data/dayPassDetails";

interface BookingCardProps {
  listing: DayPassListing;
  citySlug: string;
  cityName: string;
  seatingOptions: SeatingOptionDetail[];
  selectedType: string;
  onSelectType: (type: string) => void;
  date: string;
  onDateChange: (value: string) => void;
  members: number;
  onMembersChange: (value: number) => void;
}

export default function BookingCard({
  listing,
  citySlug,
  cityName,
  seatingOptions,
  selectedType,
  onSelectType,
  date,
  onDateChange,
  members,
  onMembersChange,
}: BookingCardProps) {
  const navigate = useNavigate();
  const selected = seatingOptions.find((option) => option.type === selectedType) ?? seatingOptions[0];
  const total = selected ? selected.bestPrice * members : 0;

  function goToCheckout() {
    navigate("/checkout", {
      state: {
        productType: "day-pass",
        listingId: listing.id,
        workspaceName: listing.name,
        brand: listing.brand,
        citySlug,
        cityName,
        locality: listing.locality,
        image: listing.images[0],
        spaceType: listing.spaceType,
        rating: listing.rating,
        reviews: listing.reviews,
        date,
        passType: selectedType,
        members,
        seatingOptions,
      },
    });
  }

  return (
    <div className="rounded-[24px] border border-[#E2E8F0] bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
      <p className="text-base font-bold text-[#0F172A]">Book {selected?.type} at {listing.name}</p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {listing.premier && (
          <span className="rounded-md bg-[#EFF6FF] px-2 py-1 text-[11px] font-bold text-[#2563EB]">
            Premium Workspace
          </span>
        )}
      </div>

      {listing.popular && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#F1F5F9] px-3 py-2.5 text-sm text-[#334155]">
          <ThumbsUp size={15} className="mt-0.5 shrink-0 text-[#2563EB]" />
          Great choice! This is one of our most popular workspaces.
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Date</span>
          <input
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            className="h-11 w-full rounded-xl border border-[#D1D5DB] px-3 text-sm font-medium text-[#0F172A] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Members</span>
          <select
            value={members}
            onChange={(event) => onMembersChange(Number(event.target.value))}
            className="h-11 w-full rounded-xl border border-[#D1D5DB] bg-white px-3 text-sm font-medium text-[#0F172A] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
          >
            {[1, 2, 3, 4, 5, 10].map((value) => (
              <option key={value} value={value}>
                {value} {value === 1 ? "Member" : "Members"}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Seating Type</span>
          <select
            value={selectedType}
            onChange={(event) => onSelectType(event.target.value)}
            className="h-11 w-full rounded-xl border border-[#D1D5DB] bg-white px-3 text-sm font-medium text-[#0F172A] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
          >
            {seatingOptions.map((option) => (
              <option key={option.type} value={option.type}>
                {option.type}
              </option>
            ))}
          </select>
        </label>
      </div>

      {selected && (
        <div className="mt-4 flex flex-col gap-1 border-t border-[#E2E8F0] pt-4">
          <div className="flex items-center justify-between text-sm text-[#64748B]">
            <span>Price ({members} × ₹{selected.price})</span>
            <span className="line-through">₹{(selected.price * members).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-[#16A34A]">
            <span>Offer Applied · {selected.offerCode}</span>
            <span>- ₹{(selected.price * members - total).toLocaleString()}</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between border-t border-[#E2E8F0] pt-2 text-base font-extrabold text-[#0F172A]">
            <span>Total Amount</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={goToCheckout}
        className="mt-4 w-full rounded-xl bg-[#111111] py-3.5 text-sm font-bold text-white transition-colors hover:bg-black"
      >
        Book Day Pass
      </button>
    </div>
  );
}
