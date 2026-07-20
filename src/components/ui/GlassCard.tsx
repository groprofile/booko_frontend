import { type HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
}

const PAD = { none: "", sm: "p-4", md: "p-5", lg: "p-6 sm:p-8" } as const;

// Frosted glass surface — for hero cards, auth panels, floating overlays.
// Relies on the `glass-panel` utility in index.css (degrades gracefully).
export default function GlassCard({ padding = "lg", className = "", children, ...rest }: GlassCardProps) {
  return (
    <div
      className={`glass-panel rounded-3xl shadow-soft-lg ${PAD[padding]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
