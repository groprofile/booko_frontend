interface MobileContinueBarProps {
  totalAmount: number;
  canContinue: boolean;
  submitting: boolean;
  onContinue: () => void;
}

export default function MobileContinueBar({ totalAmount, canContinue, submitting, onContinue }: MobileContinueBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-[#E2E8F0] bg-white px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] sm:hidden">
      <div>
        <p className="text-xs text-[#94A3B8]">Total Amount</p>
        <p className="text-lg font-extrabold text-[#0F172A]">₹{totalAmount.toLocaleString()}</p>
      </div>
      <button
        type="button"
        disabled={!canContinue || submitting}
        onClick={onContinue}
        className="cta-gradient flex-1 rounded-xl py-3 text-center text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Processing..." : "Continue To Payment"}
      </button>
    </div>
  );
}
