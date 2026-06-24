import { useState, useRef, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, CheckCircle2, AlertCircle, RefreshCw, Shield, Eye } from "lucide-react";
import { usePartner, type KycDocumentRecord } from "../../../context/PartnerContext";

const STATUS_STYLES: Record<KycDocumentRecord["status"], { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-[#F1F5F9]", text: "text-[#64748B]", label: "Pending" },
  uploaded: { bg: "bg-[#EFF6FF]", text: "text-[#2563EB]", label: "Uploaded" },
  verified: { bg: "bg-[#DCFCE7]", text: "text-[#16A34A]", label: "Verified" },
  rejected: { bg: "bg-[#FEE2E2]", text: "text-red-600", label: "Rejected" },
};

function DocCard({ doc, onUpload }: { doc: KycDocumentRecord; onUpload: (d: KycDocumentRecord) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const st = STATUS_STYLES[doc.status];
  const uploaded = doc.status === "uploaded" || doc.status === "verified";

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("File too large. Max 5MB allowed."); return; }
    onUpload({ ...doc, fileName: file.name, status: "uploaded" });
    e.target.value = "";
  }

  return (
    <div className={`rounded-2xl border p-5 transition-colors ${
      uploaded ? "border-[#2563EB]/30 bg-[#EFF6FF]/40" : "border-[#E2E8F0] bg-white"
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-[#0F172A]">{doc.label}</p>
            {!doc.required && (
              <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-semibold text-[#64748B]">Optional</span>
            )}
            {doc.required && (
              <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-semibold text-[#D97706]">Required</span>
            )}
          </div>
          {doc.fileName && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-[#64748B]">
              <Eye size={11} />
              {doc.fileName}
            </p>
          )}
        </div>
        <span className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${st.bg} ${st.text}`}>
          {doc.status === "uploaded" && <CheckCircle2 size={11} />}
          {doc.status === "verified" && <CheckCircle2 size={11} />}
          {doc.status === "rejected" && <AlertCircle size={11} />}
          {st.label}
        </span>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-colors ${
            uploaded
              ? "border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB]"
              : "border-[#2563EB] bg-[#2563EB] text-white hover:bg-[#1d4ed8]"
          }`}
        >
          {uploaded ? <RefreshCw size={14} /> : <Upload size={14} />}
          {uploaded ? "Replace" : "Upload"}
        </button>
        {uploaded && (
          <button type="button" onClick={() => onUpload({ ...doc, fileName: "", status: "pending" })}
            className="rounded-xl border border-[#E2E8F0] px-3 text-[#94A3B8] hover:border-red-300 hover:text-red-500">
            ×
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFile} className="hidden" />
    </div>
  );
}

export default function KycDocumentsPage() {
  const { partner, updatePartner, markStepComplete } = usePartner();
  const navigate = useNavigate();
  const [docs, setDocs] = useState<KycDocumentRecord[]>(partner?.kyc ?? []);
  const [error, setError] = useState("");

  function updateDoc(updated: KycDocumentRecord) {
    setDocs((prev) => prev.map((d) => d.docType === updated.docType ? updated : d));
    setError("");
  }

  function validate() {
    const missing = docs.filter((d) => d.required && d.status === "pending");
    if (missing.length > 0) {
      setError(`Please upload required documents: ${missing.map((d) => d.label).join(", ")}`);
      return false;
    }
    return true;
  }

  function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    updatePartner({ kyc: docs });
    markStepComplete(3);
    navigate("/partner/onboarding/bank");
  }

  const requiredDocs = docs.filter((d) => d.required);
  const optionalDocs = docs.filter((d) => !d.required);
  const uploadedCount = docs.filter((d) => d.status !== "pending").length;

  return (
    <div className="max-w-[720px]">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-[#0F172A]">KYC Documents</h2>
        <p className="mt-1 text-sm text-[#64748B]">Upload your business verification documents. All documents are encrypted and securely stored.</p>
      </div>

      <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-5 py-4">
        <Shield size={20} className="shrink-0 text-[#2563EB]" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#0F172A]">Secure Document Upload</p>
          <p className="text-xs text-[#64748B]">256-bit encrypted · Accessible only to Bokko verification team · PDF, JPG, PNG up to 5MB</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-extrabold text-[#0F172A]">{uploadedCount}/{docs.length}</p>
          <p className="text-[11px] text-[#94A3B8]">Uploaded</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <section className="mb-6">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#334155]">Required Documents</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {requiredDocs.map((doc) => (
              <DocCard key={doc.docType} doc={doc} onUpload={updateDoc} />
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-[#334155]">Optional Documents</h3>
          <p className="mb-3 text-xs text-[#94A3B8]">Upload if applicable to your business type</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {optionalDocs.map((doc) => (
              <DocCard key={doc.docType} doc={doc} onUpload={updateDoc} />
            ))}
          </div>
        </section>

        <div className="flex items-center justify-between gap-3 pt-2">
          <button type="button" onClick={() => navigate("/partner/onboarding/centers")}
            className="rounded-xl border border-[#E2E8F0] bg-white px-5 py-3 text-sm font-semibold text-[#334155] hover:bg-[#F8FAFC]">
            ← Back
          </button>
          <button type="submit"
            className="rounded-xl bg-[#2563EB] px-8 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#1d4ed8]">
            Save &amp; Continue →
          </button>
        </div>
      </form>
    </div>
  );
}
