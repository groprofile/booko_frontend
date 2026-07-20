import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
}

const PAD = { none: "", sm: "p-4", md: "p-5", lg: "p-6" } as const;

// Standard opaque card — the canonical white surface used across dashboards.
export default function Card({ padding = "md", className = "", children, ...rest }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-[#E2E8F0] bg-white shadow-soft ${PAD[padding]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
