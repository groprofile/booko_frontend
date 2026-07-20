import { useState } from "react";
import { Link } from "react-router-dom";

interface LogoProps {
  variant?: "dark" | "light";
  height?: number;
}

export default function Logo({ variant = "dark", height = 36 }: LogoProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const textColor = variant === "light" ? "#FFFFFF" : "#0F172A";
  const imgFilter = variant === "light" ? "brightness(0) invert(1)" : "none";

  return (
    <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="Bokko home">
      {!imgFailed ? (
        <img
          src="/bokko-logo.webp"
          alt="Bokko"
          onError={() => setImgFailed(true)}
          style={{ height: `${height}px`, width: "auto", filter: imgFilter }}
        />
      ) : (
        <>
          <span
            className="flex shrink-0 items-center justify-center rounded-[10px] text-base font-extrabold text-white"
            style={{
              background: "linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)",
              height: height,
              width: height,
            }}
            aria-hidden="true"
          >
            B
          </span>
          <span className="text-xl font-extrabold tracking-tight" style={{ color: textColor }}>
            Bokko
          </span>
        </>
      )}
    </Link>
  );
}
