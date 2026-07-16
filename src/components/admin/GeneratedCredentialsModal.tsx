import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface Props {
  email: string;
  password: string;
  title?: string;
  onClose: () => void;
}

export default function GeneratedCredentialsModal({ email, password, title, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#E2E8F0] bg-white shadow-xl">
        <div className="flex flex-col items-center gap-3 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <Check size={24} className="text-emerald-600" />
          </div>
          <p className="text-sm font-bold text-[#0F172A]">{title ?? "Credentials Generated"}</p>
          <p className="text-xs text-[#64748B]">
            Share these login details with <span className="font-semibold text-[#0F172A]">{email}</span> — this password will not be shown again.
          </p>

          <div className="mt-2 flex w-full flex-col gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-left">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">Email</p>
              <code className="text-xs text-[#0F172A]">{email}</code>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">Password</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-sm font-bold text-[#0F172A]">{password}</code>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-2 py-1 text-[10px] font-semibold text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
                >
                  {copied ? <Check size={11} /> : <Copy size={11} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-2 w-full rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
