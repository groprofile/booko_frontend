const offers = [
  {
    id: "weekend",
    label: "Get 20% Off",
    description: "On weekend bookings using coupon",
    code: "WEEKEND20",
    gradient: "linear-gradient(135deg, #6B3A82 0%, #3B1E49 100%)",
  },
  {
    id: "first-booking",
    label: "Flat 15% Off",
    description: "On your first day pass booking using coupon",
    code: "FIRSTPASS",
    gradient: "linear-gradient(135deg, #2563EB 0%, #1E3A8A 100%)",
  },
  {
    id: "flat-discount",
    label: "Flat ₹100 Off",
    description: "On bookings above ₹500 using coupon",
    code: "SAVE100",
    gradient: "linear-gradient(135deg, #92654B 0%, #4A2E1C 100%)",
  },
  {
    id: "partner",
    label: "Partner Offer",
    description: "Extra 10% off at select premium workspaces",
    code: "PARTNER10",
    gradient: "linear-gradient(135deg, #16A34A 0%, #14532D 100%)",
  },
];

export default function DayPassOffersRail() {
  return (
    <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-1">
      {offers.map((offer) => (
        <div
          key={offer.id}
          className="flex h-[120px] w-[260px] shrink-0 flex-col justify-center gap-1.5 rounded-2xl p-5 shadow-soft"
          style={{ backgroundImage: offer.gradient }}
        >
          <p className="text-base font-bold text-white">{offer.label}</p>
          <p className="text-xs leading-relaxed text-white/85">{offer.description}</p>
          <p className="text-xs font-bold text-white">Use {offer.code}</p>
        </div>
      ))}
    </div>
  );
}
