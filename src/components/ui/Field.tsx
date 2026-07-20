import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
}

// Shared text input matching the app's existing field pattern
// (h-11 rounded-xl border, blue focus ring). One place to evolve input styling.
const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, hint, error, leftIcon, className = "", id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-[#334155]">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">{leftIcon}</span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-[#0F172A] outline-none transition-colors placeholder:text-[#94A3B8] focus:ring-2 ${
            error
              ? "border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/15"
              : "border-[#D1D5DB] focus:border-[#2563EB] focus:ring-[#2563EB]/15"
          } ${leftIcon ? "pl-9" : ""} ${className}`}
          {...rest}
        />
      </div>
      {error ? (
        <p className="text-xs font-medium text-[#DC2626]">{error}</p>
      ) : hint ? (
        <p className="text-xs text-[#94A3B8]">{hint}</p>
      ) : null}
    </div>
  );
});

export default Field;
