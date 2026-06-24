import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Building2, FileText, Landmark, User } from "lucide-react";
import { usePartner } from "../../../context/PartnerContext";

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4 hover:bg-[#F8FAFC]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFF6FF]">
            <Icon size={18} className="text-[#2563EB]" />
          </div>
          <span className="text-sm font-bold text-[#0F172A]">{title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-[#64748B]" /> : <ChevronDown size={16} className="text-[#64748B]" />}
      </button>
      {open && <div className="border-t border-[#E2E8F0] px-6 pb-5 pt-4">{children}</div>}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#F1F5F9] py-2.5 last:border-0">
      <span className="text-xs text-[#64748B]">{label}</span>
      <span className="text-right text-xs font-semibold text-[#0F172A]">{value || <span className="text-[#94A3B8]">—</span>}</span>
    </div>
  );
}

export default function ReviewSubmitPage() {
  const { partner, submitForReview, markStepComplete } = usePartner();
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const biz = partner?.business ?? {};
  const gb = partner?.gstBank ?? {};
  const centers = partner?.centers ?? [];
  const kyc = partner?.kyc ?? [];
  const uploadedDocs = kyc.filter((d) => d.status !== "pending");
  const requiredMissing = kyc.filter((d) => d.required && d.status === "pending");

  function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!confirmed) { setError("Please confirm that all information is correct before submitting."); return; }
    if (requiredMissing.length > 0) { setError(`Missing required documents: ${requiredMissing.map((d) => d.label).join(", ")}`); return; }
    setSubmitting(true);
    setTimeout(() => {
      submitForReview();
      markStepComplete(5);
      navigate("/partner/pending-review");
    }, 1200);
  }

  const incompleteSteps = [];
  if (!biz.businessName) incompleteSteps.push("Business Details");
  if (centers.length === 0) incompleteSteps.push("Center Setup");
  if (requiredMissing.length > 0) incompleteSteps.push("KYC Documents");
  if (!gb.gstin) incompleteSteps.push("GST & Bank Details");

  return (
    <div className="max-w-[720px]">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-[#0F172A]">Review &amp; Submit</h2>
        <p className="mt-1 text-sm text-[#64748B]">Review all your information before submitting for verification.</p>
      </div>

      {incompleteSteps.length > 0 && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#FEF3C7] bg-[#FFFBEB] px-5 py-4">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-[#D97706]" />
          <div>
            <p className="text-sm font-semibold text-[#92400E]">Some sections are incomplete</p>
            <p className="mt-0.5 text-xs text-[#B45309]">Please complete: {incompleteSteps.join(", ")}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Section title="Business Details" icon={Building2}>
          <Row label="Business Name" value={biz.businessName} />
          <Row label="Business Type" value={biz.businessType} />
          <Row label="Business Email" value={biz.businessEmail} />
          <Row label="Contact Person" value={biz.contactPerson} />
          <Row label="Mobile" value={biz.mobile} />
          <Row label="Registered Address" value={[biz.registeredAddress, biz.city, biz.state, biz.pincode].filter(Boolean).join(", ")} />
          {biz.website && <Row label="Website" value={biz.website} />}
        </Section>

        <Section title="Centers" icon={Building2}>
          {centers.length === 0
            ? <p className="text-sm text-[#94A3B8]">No centers added yet.</p>
            : centers.map((c, i) => (
                <div key={c.id} className={i > 0 ? "mt-4 border-t border-[#F1F5F9] pt-4" : ""}>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#2563EB]">{c.name || `Center ${i + 1}`}</p>
                  <Row label="Type" value={c.type} />
                  <Row label="Location" value={[c.city, c.state].filter(Boolean).join(", ")} />
                  <Row label="Services" value={c.services.join(", ") || undefined} />
                  <Row label="Amenities" value={c.amenities.length > 0 ? `${c.amenities.length} selected` : undefined} />
                  <Row label="Photos" value={c.photoNames.length > 0 ? `${c.photoNames.length} uploaded` : undefined} />
                </div>
              ))
          }
        </Section>

        <Section title="Documents" icon={FileText}>
          {uploadedDocs.length === 0
            ? <p className="text-sm text-[#94A3B8]">No documents uploaded.</p>
            : uploadedDocs.map((d) => (
                <div key={d.docType} className="flex items-center justify-between border-b border-[#F1F5F9] py-2.5 last:border-0">
                  <span className="text-xs text-[#64748B]">{d.label}</span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-[#16A34A]">
                    <CheckCircle2 size={11} /> Uploaded
                  </span>
                </div>
              ))
          }
          {requiredMissing.map((d) => (
            <div key={d.docType} className="flex items-center justify-between border-b border-[#F1F5F9] py-2.5 last:border-0">
              <span className="text-xs text-[#64748B]">{d.label}</span>
              <span className="flex items-center gap-1 text-xs font-semibold text-red-500">
                <AlertCircle size={11} /> Missing
              </span>
            </div>
          ))}
        </Section>

        <Section title="GST &amp; Bank Details" icon={Landmark}>
          <Row label="GSTIN" value={gb.gstin} />
          <Row label="Legal Business Name" value={gb.legalBusinessName} />
          <Row label="Bank" value={gb.bankName} />
          <Row label="Account Holder" value={gb.accountHolderName} />
          <Row label="Account Number" value={gb.accountNumber ? `••••${gb.accountNumber.slice(-4)}` : undefined} />
          <Row label="IFSC" value={gb.ifscCode} />
          <Row label="Branch" value={gb.branch} />
        </Section>

        <Section title="Partner Details" icon={User}>
          <Row label="Name" value={partner?.name} />
          <Row label="Email" value={partner?.email} />
          <Row label="Mobile" value={partner?.mobile} />
          <Row label="Business Type" value={partner?.businessType} />
          <Row label="Center Type" value={partner?.centerType === "multiple" ? "Multiple Centers" : "Single Center"} />
        </Section>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={confirmed} onChange={(e) => { setConfirmed(e.target.checked); setError(""); }}
              className="mt-0.5 h-4 w-4 rounded accent-[#2563EB]" />
            <span className="text-sm text-[#475569]">
              I confirm that all information provided is accurate and complete. I understand that submitting false or misleading information may result in rejection or termination of the partner account.
            </span>
          </label>
          {error && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-red-500">
              <AlertCircle size={12} /> {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={() => navigate("/partner/onboarding/bank")}
            className="rounded-xl border border-[#E2E8F0] bg-white px-5 py-3 text-sm font-semibold text-[#334155] hover:bg-[#F8FAFC]">
            ← Back
          </button>
          <button type="submit" disabled={submitting || incompleteSteps.length > 0}
            className="rounded-xl bg-[#2563EB] px-8 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#1d4ed8] disabled:opacity-60">
            {submitting ? "Submitting…" : "Submit For Review →"}
          </button>
        </div>
      </form>
    </div>
  );
}
