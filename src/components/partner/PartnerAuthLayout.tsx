import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Logo from "../Logo";

interface Props {
  children: ReactNode;
  headline?: string;
  subheadline?: string;
}

export default function PartnerAuthLayout({ children }: Props) {
  return (
    <div className="app-wash flex min-h-screen flex-col">
      <header className="glass-panel border-b border-white/40">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <Logo height={30} />
            <div className="h-5 w-px bg-[#E2E8F0]" />
            <span className="rounded-md bg-[#EFF6FF] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">
              Partner Central
            </span>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A]"
          >
            <ArrowLeft size={14} />
            Back to Bokko
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-start justify-center px-4 py-10 sm:py-12">
        <div className="w-full max-w-[600px]">
          {children}
        </div>
      </div>
    </div>
  );
}
