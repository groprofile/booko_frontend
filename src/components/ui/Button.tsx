import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

// Single source of truth for buttons across the app. `primary` is the brand
// blue→cyan gradient — the ONE dominant CTA style, replacing the old mix of
// black (#111111) / lone cta-gradient / blue treatments.
const VARIANTS: Record<Variant, string> = {
  primary:
    "cta-gradient text-white shadow-[0_8px_24px_rgba(37,99,235,0.28)] hover:brightness-[1.06] active:brightness-95",
  secondary:
    "border border-[#2563EB]/25 bg-[#2563EB]/10 text-[#1D4ED8] backdrop-blur-sm hover:border-[#2563EB]/45 hover:bg-[#2563EB]/15",
  ghost: "text-[#334155] hover:bg-[#F1F5F9]",
  danger: "bg-[#DC2626] text-white hover:bg-[#B91C1C]",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 gap-1.5 px-3.5 text-xs",
  md: "h-11 gap-2 px-5 text-sm",
  lg: "h-12 gap-2 px-6 text-[15px]",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, leftIcon, rightIcon, fullWidth, className = "", children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-xl font-bold tracking-tight transition-all disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
});

export default Button;
