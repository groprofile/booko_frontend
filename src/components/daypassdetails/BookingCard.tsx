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
    <div className="rounded-sm border border-border bg-card p-6 shadow-soft-lg">
      <p className="text-lg font-bold text-primary-text">Book {selected?.type} at {listing.name}</p>

      {(listing.premier || listing.popular) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {listing.premier && (
            <span className="rounded-sm bg-blue-50 px-3 py-1.5 text-xs font-bold text-primary-blue">
              Premium Workspace
            </span>
          )}
        </div>
      )}

      {listing.popular && (
        <div className="mt-4 flex items-start gap-3 rounded-sm bg-blue-50 px-4 py-3 text-sm text-secondary-text">
          <ThumbsUp size={16} className="mt-0.5 shrink-0 text-primary-blue" />
          Great choice! This is one of our most popular workspaces.
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-text">Date</span>
          <input
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            className="h-11 w-full rounded-sm border border-border bg-card px-4 text-sm font-medium text-primary-text outline-none transition-all focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/10"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-text">Members</span>
          <select
            value={members}
            onChange={(event) => onMembersChange(Number(event.target.value))}
            className="h-11 w-full rounded-sm border border-border bg-card px-4 text-sm font-medium text-primary-text outline-none transition-all focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/10"
          >
            {[1, 2, 3, 4, 5, 10].map((value) => (
              <option key={value} value={value}>
                {value} {value === 1 ? "Member" : "Members"}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-text">Seating Type</span>
          <select
            value={selectedType}
            onChange={(event) => onSelectType(event.target.value)}
            className="h-11 w-full rounded-sm border border-border bg-card px-4 text-sm font-medium text-primary-text outline-none transition-all focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/10"
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
        <div className="mt-6 flex flex-col gap-2 border-t border-border pt-6">
          <div className="flex items-center justify-between text-sm text-muted-text">
            <span>Price ({members} × ₹{selected.price})</span>
            <span>₹{(selected.price * members).toLocaleString()}</span>
          </div>
          {selected.offerCode && selected.price * members > total && (
            <div className="flex items-center justify-between text-sm font-semibold text-success">
              <span>Offer Applied · {selected.offerCode}</span>
              <span>- ₹{(selected.price * members - total).toLocaleString()}</span>
            </div>
          )}
          <div className="mt-2 flex items-center justify-between border-t border-border pt-3 text-lg font-extrabold text-primary-text">
            <span>Total Amount</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={goToCheckout}
        className="cta-gradient mt-6 w-full rounded-sm py-3 text-base font-semibold text-white shadow-[0_8px_24px_rgba(37,99,235,0.28)] transition-all hover:brightness-[1.06]"
      >
        Book Day Pass
      </button>
    </div>
  );
}
