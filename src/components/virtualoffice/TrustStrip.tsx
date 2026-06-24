const items = [
  "GST Registration Support",
  "MCA Accepted Address",
  "Same Day Activation",
  "Dedicated Bokko Expert",
];

export default function TrustStrip() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-[#E2E8F0] bg-white px-5 py-3.5">
      {items.map((item) => (
        <span key={item} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F172A]">
          ✅ {item}
        </span>
      ))}
    </div>
  );
}
