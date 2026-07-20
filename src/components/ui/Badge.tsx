import { type ReactNode } from "react";

type Tone = "brand" | "cyan" | "success" | "warning" | "danger" | "purple" | "neutral";

interface BadgeProps {
  tone?: Tone;
  size?: "sm" | "md";
  className?: string;
  children: ReactNode;
}

// Lightweight semantic pill for general use (cart tags, labels, chips).
// For admin domain statuses keep using components/admin/StatusBadge.tsx.
const TONES: Record<Tone, string> = {
  brand: "bg-[#EFF6FF] text-[#1D4ED8]",
  cyan: "bg-[#ECFEFF] text-[#0E7490]",
  success: "bg-[#ECFDF5] text-[#15803D]",
  warning: "bg-[#FEF9C3] text-[#92400E]",
  danger: "bg-[#FEE2E2] text-[#B91C1C]",
  purple: "bg-[#F3E8FF] text-[#7C3AED]",
  neutral: "bg-[#F1F5F9] text-[#475569]",
};

export default function Badge({ tone = "neutral", size = "sm", className = "", children }: BadgeProps) {
  const px = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";
  return (
    <span className={`inline-flex items-center rounded-full font-bold ${TONES[tone]} ${px} ${className}`}>
      {children}
    </span>
  );
}
