import { useState, useRef, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Upload, CheckCircle2, ShieldCheck } from "lucide-react";
import { usePartner } from "../../../context/PartnerContext";
import { apiPost, apiPatch, ApiError, getVendorToken } from "../../../lib/api";

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Chandigarh","Jammu & Kashmir","Ladakh",
];
const BANKS = ["State Bank of India","HDFC Bank","ICICI Bank","Axis Bank","Kotak Mahindra Bank","Punjab National Bank","Bank of Baroda","Canara Bank","IndusInd Bank","Yes Bank","Other"];

const BASE = "w-full rounded-xl border px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] transition-colors focus:outline-none focus:ring-2 bg-white";
const NORMAL = `${BASE} border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]/15`;
const ERR_CLS = `${BASE} border-red-400 focus:border-red-400 focus:ring-red-400/15`;

function F({ label, required, error, hint, children }: {
  label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[#0F172A]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-[#94A3B8]">{hint}</p>}
      {error && <p className="mt-1 flex items-center gap-1 text-xs text-red-500"><AlertCircle size={11} />{error}</p>}
    </div>
  );
}

function validateGstin(v: string) {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
}
function validateIfsc(v: string) {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v);
}

export default function BankDetailsPage() {
  const { partner, updatePartner, markStepComplete } = usePartner();
  const navigate = useNavigate();
  const gb = partner?.gstBank ?? {};
  const chequeRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    gstin: gb.gstin ?? "",
    legalBusinessName: gb.legalBusinessName ?? "",
    gstAddress: gb.gstAddress ?? "",
    gstState: gb.gstState ?? "",
    accountHolderName: gb.accountHolderName ?? "",
    bankName: gb.bankName ?? "",
    accountNumber: gb.accountNumber ?? "",
    confirmAccountNumber: gb.confirmAccountNumber ?? "",
    ifscCode: gb.ifscCode ?? "",
    branch: gb.branch ?? "",
    cancelledChequeName: gb.cancelledChequeName ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function set(k: string, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => { const e = { ...p }; delete e[k]; return e; });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.gstin) e.gstin = "GSTIN is required";
    else if (!validateGstin(form.gstin.toUpperCase())) e.gstin = "Invalid GSTIN format (e.g. 27AABCU9603R1ZM)";
    if (!form.legalBusinessName.trim()) e.legalBusinessName = "Legal business name is required";
    if (!form.gstAddress.trim()) e.gstAddress = "GST registered address is required";
    if (!form.gstState) e.gstState = "Select GST state";
    if (!form.accountHolderName.trim()) e.accountHolderName = "Account holder name is required";
    if (!form.bankName) e.bankName = "Select bank name";
    if (!form.accountNumber || form.accountNumber.length < 9) e.accountNumber = "Enter valid account number";
    if (form.accountNumber !== form.confirmAccountNumber) e.confirmAccountNumber = "Account numbers do not match";
    if (!form.ifscCode) e.ifscCode = "IFSC code is required";
    else if (!validateIfsc(form.ifscCode.toUpperCase())) e.ifscCode = "Invalid IFSC format (e.g. SBIN0001234)";
    if (!form.branch.trim()) e.branch = "Branch name is required";
    if (!form.cancelledChequeName) e.cancelledChequeName = "Please upload cancelled cheque";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleCheque(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("File too large. Max 5MB."); return; }
    set("cancelledChequeName", file.name);
    setErrors((p) => { const err = { ...p }; delete err.cancelledChequeName; return err; });
    e.target.value = "";
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    const token = getVendorToken();
    if (!token) { setApiError("Not authenticated — please sign in again"); return; }
    setSubmitting(true);
    setApiError("");
    try {
      await Promise.all([
        apiPatch("/vendor/profile", {
          gstin: form.gstin.toUpperCase(),
          gstLegalName: form.legalBusinessName,
          gstAddress: form.gstAddress,
          gstState: form.gstState,
        }, token),
        apiPost("/vendor/bank-accounts", {
          accountHolder: form.accountHolderName,
          accountNumber: form.accountNumber,
          ifscCode: form.ifscCode.toUpperCase(),
          bankName: form.bankName,
          branchName: form.branch,
        }, token),
      ]);
      updatePartner({ gstBank: { ...form, gstin: form.gstin.toUpperCase(), ifscCode: form.ifscCode.toUpperCase() } });
      markStepComplete(4);
      navigate("/partner/onboarding/review");
    } catch (err) {
      setApiError((err as ApiError).message ?? "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-[720px]">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-[#0F172A]">GST &amp; Bank Details</h2>
        <p className="mt-1 text-sm text-[#64748B]">Required for invoicing, GST compliance and weekly payouts.</p>
      </div>

      <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-5 py-4">
        <ShieldCheck size={20} className="shrink-0 text-[#16A34A]" />
        <p className="text-sm text-[#334155]">Your bank details are encrypted and only used for payout processing. We never share them with third parties.</p>
      </div>

      {apiError && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        {/* GST */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <h3 className="mb-4 text-base font-bold text-[#0F172A]">GST Details</h3>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <F label="GSTIN" required error={errors.gstin} hint="15-character GST Identification Number">
                <input value={form.gstin} onChange={(e: ChangeEvent<HTMLInputElement>) => set("gstin", e.target.value.toUpperCase())}
                  className={errors.gstin ? ERR_CLS : NORMAL} placeholder="27AABCU9603R1ZM" maxLength={15} style={{ fontFamily: "monospace" }} />
              </F>
              <F label="Legal Business Name" required error={errors.legalBusinessName}>
                <input value={form.legalBusinessName} onChange={(e: ChangeEvent<HTMLInputElement>) => set("legalBusinessName", e.target.value)}
                  className={errors.legalBusinessName ? ERR_CLS : NORMAL} placeholder="As per GST registration" />
              </F>
            </div>
            <F label="GST Registered Address" required error={errors.gstAddress}>
              <input value={form.gstAddress} onChange={(e: ChangeEvent<HTMLInputElement>) => set("gstAddress", e.target.value)}
                className={errors.gstAddress ? ERR_CLS : NORMAL} placeholder="Address as per GST certificate" />
            </F>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <F label="GST State" required error={errors.gstState}>
                <select value={form.gstState} onChange={(e: ChangeEvent<HTMLSelectElement>) => set("gstState", e.target.value)}
                  className={errors.gstState ? ERR_CLS : NORMAL}>
                  <option value="">Select state</option>
                  {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </F>
            </div>
          </div>
        </div>

        {/* Bank */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <h3 className="mb-4 text-base font-bold text-[#0F172A]">Bank Account Details</h3>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <F label="Account Holder Name" required error={errors.accountHolderName}>
                <input value={form.accountHolderName} onChange={(e: ChangeEvent<HTMLInputElement>) => set("accountHolderName", e.target.value)}
                  className={errors.accountHolderName ? ERR_CLS : NORMAL} placeholder="As per bank records" />
              </F>
              <F label="Bank Name" required error={errors.bankName}>
                <select value={form.bankName} onChange={(e: ChangeEvent<HTMLSelectElement>) => set("bankName", e.target.value)}
                  className={errors.bankName ? ERR_CLS : NORMAL}>
                  <option value="">Select bank</option>
                  {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </F>
              <F label="Account Number" required error={errors.accountNumber}>
                <input type="password" value={form.accountNumber} onChange={(e: ChangeEvent<HTMLInputElement>) => set("accountNumber", e.target.value)}
                  className={errors.accountNumber ? ERR_CLS : NORMAL} placeholder="Enter account number" autoComplete="off" />
              </F>
              <F label="Confirm Account Number" required error={errors.confirmAccountNumber}>
                <input value={form.confirmAccountNumber} onChange={(e: ChangeEvent<HTMLInputElement>) => set("confirmAccountNumber", e.target.value)}
                  className={errors.confirmAccountNumber ? ERR_CLS : NORMAL} placeholder="Re-enter account number"
                  onPaste={(e) => e.preventDefault()} autoComplete="off" />
              </F>
              <F label="IFSC Code" required error={errors.ifscCode} hint="11-character code (e.g. SBIN0001234)">
                <input value={form.ifscCode} onChange={(e: ChangeEvent<HTMLInputElement>) => set("ifscCode", e.target.value.toUpperCase())}
                  className={errors.ifscCode ? ERR_CLS : NORMAL} placeholder="SBIN0001234" maxLength={11} style={{ fontFamily: "monospace" }} />
              </F>
              <F label="Branch Name" required error={errors.branch}>
                <input value={form.branch} onChange={(e: ChangeEvent<HTMLInputElement>) => set("branch", e.target.value)}
                  className={errors.branch ? ERR_CLS : NORMAL} placeholder="Bandra West, Mumbai" />
              </F>
            </div>

            <F label="Cancelled Cheque" required error={errors.cancelledChequeName}>
              {form.cancelledChequeName ? (
                <div className="flex items-center justify-between rounded-xl border border-[#2563EB]/30 bg-[#EFF6FF] px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#2563EB]">
                    <CheckCircle2 size={15} />
                    {form.cancelledChequeName}
                  </div>
                  <button type="button" onClick={() => { set("cancelledChequeName", ""); chequeRef.current?.click(); }}
                    className="text-xs font-semibold text-[#64748B] hover:text-[#0F172A]">Replace</button>
                </div>
              ) : (
                <button type="button" onClick={() => chequeRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#E2E8F0] py-4 text-sm font-semibold text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors">
                  <Upload size={16} />
                  Upload Cancelled Cheque
                </button>
              )}
              <input ref={chequeRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleCheque} className="hidden" />
            </F>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={() => navigate("/partner/onboarding/kyc")}
            className="rounded-xl border border-[#E2E8F0] bg-white px-5 py-3 text-sm font-semibold text-[#334155] hover:bg-[#F8FAFC]">
            ← Back
          </button>
          <button type="submit" disabled={submitting}
            className="rounded-xl bg-[#2563EB] px-8 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#1d4ed8] disabled:opacity-60">
            {submitting ? "Saving…" : "Save & Continue →"}
          </button>
        </div>
      </form>
    </div>
  );
}
