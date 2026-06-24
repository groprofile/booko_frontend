import { businessTypes } from "../../data/universalCheckout";

interface VirtualOfficeStep2Props {
  businessName: string; onBusinessNameChange: (v: string) => void;
  founderName: string; onFounderNameChange: (v: string) => void;
  gstNumber: string; onGstNumberChange: (v: string) => void;
  panNumber: string; onPanNumberChange: (v: string) => void;
  businessType: string; onBusinessTypeChange: (v: string) => void;
  contactEmail: string; onContactEmailChange: (v: string) => void;
  contactPhone: string; onContactPhoneChange: (v: string) => void;
}

const inputCls = "h-11 rounded-xl border border-[#D1D5DB] px-3 text-sm font-medium text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 w-full";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
        {label}{required && " *"}
      </span>
      {children}
    </label>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-[#E2E8F0] pb-2">
      <h2 className="text-base font-extrabold uppercase tracking-wider text-[#0F172A]">{children}</h2>
      <div className="mt-1 h-0.5 w-8 rounded-full bg-[#2563EB]" />
    </div>
  );
}

export default function VirtualOfficeStep2({
  businessName, onBusinessNameChange, founderName, onFounderNameChange,
  gstNumber, onGstNumberChange, panNumber, onPanNumberChange,
  businessType, onBusinessTypeChange,
  contactEmail, onContactEmailChange, contactPhone, onContactPhoneChange,
}: VirtualOfficeStep2Props) {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <SectionLabel>Company Information</SectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Business Name" required>
            <input type="text" value={businessName} onChange={(e) => onBusinessNameChange(e.target.value)}
              placeholder="Acme Technologies Pvt Ltd" className={inputCls} />
          </Field>
          <Field label="Founder / Director Name" required>
            <input type="text" value={founderName} onChange={(e) => onFounderNameChange(e.target.value)}
              placeholder="Your full name" className={inputCls} />
          </Field>
          <Field label="Business Type" required>
            <select value={businessType} onChange={(e) => onBusinessTypeChange(e.target.value)} className={inputCls + " bg-white"}>
              <option value="">Select business type</option>
              {businessTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </Field>
          <Field label="GST Number">
            <input type="text" value={gstNumber} onChange={(e) => onGstNumberChange(e.target.value)}
              placeholder="27AAAAA0000A1Z5 (optional)" className={inputCls} />
          </Field>
          <Field label="PAN Number">
            <input type="text" value={panNumber} onChange={(e) => onPanNumberChange(e.target.value)}
              placeholder="AAAAA0000A" className={inputCls} />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionLabel>Contact Details</SectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Business Email" required>
            <input type="email" value={contactEmail} onChange={(e) => onContactEmailChange(e.target.value)}
              placeholder="hello@acme.com" className={inputCls} />
          </Field>
          <Field label="Contact Mobile" required>
            <input type="tel" value={contactPhone} onChange={(e) => onContactPhoneChange(e.target.value)}
              placeholder="10-digit mobile number" maxLength={10} className={inputCls} />
          </Field>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-sm text-[#64748B]">
          <p className="font-semibold text-[#0F172A]">What happens next?</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 font-bold text-[#2563EB]">1.</span>
              Your application is reviewed within 24–48 hours.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 font-bold text-[#2563EB]">2.</span>
              A Bokko Expert will call you to verify details.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 font-bold text-[#2563EB]">3.</span>
              Your business address goes live + GST registration begins.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
