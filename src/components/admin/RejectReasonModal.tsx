import { useState } from "react";

interface RejectReasonModalProps {
  open: boolean;
  title?: string;
  onCancel: () => void;
  onConfirm: (reason: string) => void | Promise<void>;
}

export default function RejectReasonModal({ open, title = "Reject Vendor", onCancel, onConfirm }: RejectReasonModalProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  async function handleConfirm() {
    if (!reason.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onConfirm(reason.trim());
      setReason("");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    setReason("");
    onCancel();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-[400px] rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-[#F1F5F9] px-6 py-4">
          <h3 className="font-bold text-[#0F172A]">{title}</h3>
          <p className="mt-1 text-xs text-[#64748B]">Provide a reason that will be communicated to the vendor.</p>
        </div>
        <div className="p-6">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="e.g. KYC documents could not be verified. Please re-upload with valid documents."
            className="w-full resize-none rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm outline-none focus:border-[#2563EB]"
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-[#F1F5F9] px-6 py-4">
          <button
            onClick={handleCancel}
            disabled={submitting}
            className="rounded-xl border border-[#E2E8F0] px-4 py-2 text-sm text-[#64748B] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting || !reason.trim()}
            className="rounded-xl bg-[#DC2626] px-5 py-2 text-sm font-bold text-white hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Rejecting…" : "Confirm Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}
