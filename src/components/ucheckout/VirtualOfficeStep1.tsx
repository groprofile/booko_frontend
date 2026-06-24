import { useRef } from "react";
import { CheckCircle2, XCircle, Upload, Check } from "lucide-react";
import type { VirtualOfficeCheckoutState } from "../../data/universalCheckout";
import { billingTierLabels, billingTierMultipliers } from "../../data/universalCheckout";

const ALL_SERVICES = [
  "Business Address",
  "GST Registration",
  "Mail Handling",
  "Courier Management",
  "Meeting Room Credits",
  "Company Registration",
];

interface VirtualOfficeStep1Props {
  booking: VirtualOfficeCheckoutState;
  planKey: string; onPlanChange: (v: string) => void;
  billingKey: "monthly" | "quarterly" | "yearly"; onBillingChange: (v: "monthly" | "quarterly" | "yearly") => void;
  documents: Record<string, File | null>;
  onDocumentChange: (docKey: string, file: File | null) => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-[#E2E8F0] pb-2">
      <h2 className="text-base font-extrabold uppercase tracking-wider text-[#0F172A]">{children}</h2>
      <div className="mt-1 h-0.5 w-8 rounded-full bg-[#2563EB]" />
    </div>
  );
}

const DOC_TYPES = [
  { key: "pan", label: "PAN Card" },
  { key: "gst", label: "GST Certificate" },
  { key: "aadhaar", label: "Aadhaar Card" },
  { key: "companyReg", label: "Company Registration" },
];

export default function VirtualOfficeStep1({
  booking, planKey, onPlanChange, billingKey, onBillingChange, documents, onDocumentChange,
}: VirtualOfficeStep1Props) {
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const selectedPlan = booking.plans.find((p) => p.key === planKey) ?? booking.plans[0];
  const multiplier = billingTierMultipliers[billingKey] ?? 1;
  const totalPrice = Math.round(selectedPlan.price * multiplier);

  return (
    <div className="flex flex-col gap-8">
      {/* Workspace Info */}
      <section className="flex flex-col gap-4">
        <SectionLabel>Virtual Office Details</SectionLabel>
        <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
          <img src={booking.image} alt={booking.centerName} className="h-40 w-full object-cover" />
          <div className="grid grid-cols-2 gap-px bg-[#E2E8F0] border-t border-[#E2E8F0]">
            {[
              { label: "Centre", value: booking.centerName },
              { label: "Location", value: `${booking.area}, ${booking.cityName}` },
              { label: "Business Address", value: booking.businessAddressAvailable ? "✅ Available" : "❌ Not Available" },
              { label: "GST Eligible", value: booking.gstEligible ? "✅ Yes" : "❌ No" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{label}</p>
                <p className="mt-0.5 text-sm font-semibold text-[#0F172A]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plan Selection */}
      <section className="flex flex-col gap-4">
        <SectionLabel>Plan Selection</SectionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {booking.plans.map((plan) => {
            const selected = plan.key === planKey;
            return (
              <button key={plan.key} type="button" onClick={() => onPlanChange(plan.key)}
                className={
                  "flex flex-col rounded-2xl border p-4 text-left transition-all " +
                  (selected ? "border-[#2563EB] bg-[#EFF6FF] shadow-md" : "border-[#E2E8F0] bg-white hover:border-[#94A3B8]")
                }>
                <div className="flex items-start justify-between">
                  <p className="text-sm font-bold text-[#0F172A]">{plan.name}</p>
                  {selected && <CheckCircle2 size={16} className="shrink-0 text-[#2563EB]" />}
                </div>
                <p className="mt-1 text-[11px] text-[#64748B]">{plan.description}</p>
                <p className="mt-3 text-lg font-extrabold text-[#0F172A]">₹{plan.price.toLocaleString()}<span className="text-xs font-normal text-[#94A3B8]">/mo</span></p>
              </button>
            );
          })}
        </div>

        {/* Billing cycle */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Billing Cycle</span>
          <div className="flex gap-3">
            {(["monthly", "quarterly", "yearly"] as const).map((key) => {
              const sel = key === billingKey;
              const mult = billingTierMultipliers[key];
              const savings = key === "yearly" ? "Save 20%" : key === "quarterly" ? "Save 10%" : "";
              return (
                <button key={key} type="button" onClick={() => onBillingChange(key)}
                  className={
                    "flex flex-1 flex-col items-center rounded-xl border px-3 py-3 transition-colors " +
                    (sel ? "border-[#2563EB] bg-[#2563EB] text-white" : "border-[#E2E8F0] bg-white text-[#0F172A] hover:border-[#94A3B8]")
                  }>
                  <span className="text-sm font-bold">{billingTierLabels[key]}</span>
                  <span className={"text-xs " + (sel ? "text-white/80" : "text-[#64748B]")}>
                    ₹{Math.round(selectedPlan.price * mult).toLocaleString()}
                  </span>
                  {savings && <span className={
                    "mt-1 rounded-full px-2 py-0.5 text-[10px] font-bold " +
                    (sel ? "bg-white/20 text-white" : "bg-[#DCFCE7] text-[#16A34A]")
                  }>{savings}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-[#F0FDF4] px-4 py-3">
          <span className="text-sm font-semibold text-[#0F172A]">Total ({billingTierLabels[billingKey]})</span>
          <span className="text-xl font-extrabold text-[#0F172A]">₹{totalPrice.toLocaleString()}</span>
        </div>
      </section>

      {/* Services Included */}
      <section className="flex flex-col gap-4">
        <SectionLabel>Services Included</SectionLabel>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ALL_SERVICES.map((service) => {
            const included = booking.servicesIncluded.includes(service);
            return (
              <div key={service} className={
                "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 " +
                (included ? "border-[#BBF7D0] bg-[#F0FDF4]" : "border-[#E2E8F0] bg-[#F8FAFC]")
              }>
                {included
                  ? <Check size={14} className="shrink-0 text-[#16A34A]" />
                  : <XCircle size={14} className="shrink-0 text-[#CBD5E1]" />}
                <span className={
                  "text-sm font-medium " + (included ? "text-[#15803D]" : "text-[#94A3B8] line-through")
                }>{service}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Document Upload */}
      <section className="flex flex-col gap-4">
        <SectionLabel>Document Upload</SectionLabel>
        <p className="text-sm text-[#64748B]">Upload required KYC documents. Verification completed within 24–48 hours of booking confirmation.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {DOC_TYPES.map(({ key, label }) => {
            const file = documents[key];
            return (
              <div key={key} className={
                "flex items-center justify-between rounded-xl border px-4 py-3 " +
                (file ? "border-[#BBF7D0] bg-[#F0FDF4]" : "border-[#E2E8F0] bg-white")
              }>
                <div className="flex items-center gap-2.5">
                  {file
                    ? <CheckCircle2 size={16} className="shrink-0 text-[#16A34A]" />
                    : <Upload size={16} className="shrink-0 text-[#94A3B8]" />}
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A]">{label}</p>
                    {file && <p className="text-[11px] text-[#16A34A]">{file.name}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => fileRefs.current[key]?.click()}
                    className="text-xs font-semibold text-[#2563EB] hover:underline">
                    {file ? "Change" : "Upload"}
                  </button>
                  {file && (
                    <button type="button" onClick={() => onDocumentChange(key, null)}
                      className="text-xs font-semibold text-[#DC2626]">Remove</button>
                  )}
                </div>
                <input
                  ref={(el) => { fileRefs.current[key] = el; }}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => onDocumentChange(key, e.target.files?.[0] ?? null)}
                />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
