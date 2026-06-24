import { CheckCircle2 } from "lucide-react";

interface ConfidenceBarProps {
  freeCancellation: boolean;
}

export default function ConfidenceBar({ freeCancellation }: ConfidenceBarProps) {
  const items = [
    ...(freeCancellation ? ["Free Cancellation Available"] : []),
    "Instant Confirmation",
    "Secure Payment",
    "Trusted By Thousands",
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-2xl bg-[#F8FAFC] px-4 py-4 text-center">
      {items.map((item) => (
        <span key={item} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#334155]">
          <CheckCircle2 size={15} className="text-[#16A34A]" />
          {item}
        </span>
      ))}
    </div>
  );
}
