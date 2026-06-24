const offers = [
  {
    id: "annual",
    label: "Save 20% Extra",
    description: "On annual (12-month) lock-in plans",
    code: "ANNUAL20",
    gradient: "linear-gradient(135deg, #2563EB 0%, #1E3A8A 100%)",
  },
  {
    id: "team",
    label: "Flat 15% Off",
    description: "On team plans for 5+ members",
    code: "TEAM15",
    gradient: "linear-gradient(135deg, #16A34A 0%, #14532D 100%)",
  },
  {
    id: "zero-deposit",
    label: "Zero Deposit",
    description: "On select managed office plans",
    code: "ZERODEP",
    gradient: "linear-gradient(135deg, #92654B 0%, #4A2E1C 100%)",
  },
  {
    id: "first-month",
    label: "First Month Free",
    description: "On 12-month dedicated desk plans",
    code: "FREEMONTH",
    gradient: "linear-gradient(135deg, #6B3A82 0%, #3B1E49 100%)",
  },
];

export default function MonthlyPassOffersRail() {
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
