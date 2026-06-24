interface UniversalMobileCTAProps {
  totalAmount: number;
  label: string;
  disabled: boolean;
  submitting: boolean;
  onClick: () => void;
}

export default function UniversalMobileCTA({ totalAmount, label, disabled, submitting, onClick }: UniversalMobileCTAProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-[#E2E8F0] bg-white px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] lg:hidden">
      <div>
        <p className="text-xs text-[#94A3B8]">Total</p>
        <p className="text-lg font-extrabold text-[#0F172A]">₹{totalAmount.toLocaleString()}</p>
      </div>
      <button
        type="button"
        disabled={disabled || submitting}
        onClick={onClick}
        className="flex-1 rounded-xl bg-[#2563EB] py-3 text-center text-sm font-bold text-white transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Processing…" : label}
      </button>
    </div>
  );
}
