import { Apple } from "lucide-react";

function GooglePlayGlyph({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden="true">
      <path fill="#00C2FF" d="M99 12C87 19 79 33 79 49v414c0 16 8 30 20 37l227-227z" />
      <path fill="#00E676" d="M99 12c7-4 16-5 24-2l243 139-90 89z" />
      <path fill="#FFC400" d="M366 149l90 50c20 11 20 41 0 52l-90 50-89-76z" />
      <path fill="#FF3D00" d="M366 363 123 500c-8 4-17 3-24-1l187-188z" />
    </svg>
  );
}

interface BadgeProps {
  className?: string;
  size?: "default" | "compact";
}

export function GooglePlayBadge({ className = "", size = "default" }: BadgeProps) {
  const compact = size === "compact";
  return (
    <a
      href="#"
      className={
        "flex items-center gap-2.5 rounded-xl bg-[#111111] text-white shadow-soft transition-transform hover:scale-[1.02] " +
        (compact ? "px-3 py-2" : "px-5 py-3") +
        " " +
        className
      }
    >
      <GooglePlayGlyph size={compact ? 16 : 22} />
      <span className="text-left">
        <span
          className={
            "block leading-none tracking-wide text-slate-300 " +
            (compact ? "text-[8px]" : "text-[10px]")
          }
        >
          GET IT ON
        </span>
        <span className={"block font-bold leading-tight " + (compact ? "text-xs" : "text-base")}>
          Google Play
        </span>
      </span>
    </a>
  );
}

export function AppStoreBadge({ className = "", size = "default" }: BadgeProps) {
  const compact = size === "compact";
  return (
    <a
      href="#"
      className={
        "flex items-center gap-2.5 rounded-xl bg-[#111111] text-white shadow-soft transition-transform hover:scale-[1.02] " +
        (compact ? "px-3 py-2" : "px-5 py-3") +
        " " +
        className
      }
    >
      <Apple size={compact ? 16 : 22} strokeWidth={0} fill="currentColor" />
      <span className="text-left">
        <span
          className={
            "block leading-none tracking-wide text-slate-300 " +
            (compact ? "text-[8px]" : "text-[10px]")
          }
        >
          DOWNLOAD ON THE
        </span>
        <span className={"block font-bold leading-tight " + (compact ? "text-xs" : "text-base")}>
          App Store
        </span>
      </span>
    </a>
  );
}
