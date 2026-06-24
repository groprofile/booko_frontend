import { useRef } from "react";
import { Plus, X, Building2, Upload } from "lucide-react";

export interface DPTeamMember { id: string; name: string; email: string; }

interface DayPassStep2Props {
  primaryName: string; onPrimaryNameChange: (v: string) => void;
  primaryEmail: string; onPrimaryEmailChange: (v: string) => void;
  primaryPhone: string; onPrimaryPhoneChange: (v: string) => void;
  teamMembers: DPTeamMember[];
  onAddTeamMember: () => void;
  onRemoveTeamMember: (id: string) => void;
  onUpdateTeamMember: (id: string, field: "name" | "email", value: string) => void;
  isBusinessBooking: boolean;
  onToggleBusinessBooking: () => void;
  companyName: string; onCompanyNameChange: (v: string) => void;
  gstNumber: string; onGstNumberChange: (v: string) => void;
  billingAddress: string; onBillingAddressChange: (v: string) => void;
  costCenter: string; onCostCenterChange: (v: string) => void;
  onCsvImport: (members: DPTeamMember[]) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">{label}</span>
      {children}
    </label>
  );
}

const inputCls = "h-11 rounded-xl border border-[#D1D5DB] px-3 text-sm font-medium text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-[#E2E8F0] pb-2">
      <h2 className="text-base font-extrabold uppercase tracking-wider text-[#0F172A]">{children}</h2>
      <div className="mt-1 h-0.5 w-8 rounded-full bg-[#2563EB]" />
    </div>
  );
}

export default function DayPassStep2({
  primaryName, onPrimaryNameChange, primaryEmail, onPrimaryEmailChange, primaryPhone, onPrimaryPhoneChange,
  teamMembers, onAddTeamMember, onRemoveTeamMember, onUpdateTeamMember,
  isBusinessBooking, onToggleBusinessBooking,
  companyName, onCompanyNameChange, gstNumber, onGstNumberChange,
  billingAddress, onBillingAddressChange, costCenter, onCostCenterChange,
  onCsvImport,
}: DayPassStep2Props) {
  const csvRef = useRef<HTMLInputElement>(null);

  function handleCsvFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/\r?\n/).filter(Boolean).slice(1); // skip header
      const parsed: DPTeamMember[] = lines.slice(0, 20).map((line, i) => {
        const parts = line.split(",");
        return { id: `csv-${Date.now()}-${i}`, name: parts[0]?.trim() ?? "", email: parts[1]?.trim() ?? "" };
      }).filter((m) => m.name || m.email);
      if (parsed.length > 0) onCsvImport(parsed);
    };
    reader.readAsText(file);
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Primary Guest */}
      <section className="flex flex-col gap-4">
        <SectionLabel>Primary Guest</SectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full Name *">
            <input type="text" value={primaryName} onChange={(e) => onPrimaryNameChange(e.target.value)}
              placeholder="Your full name" className={inputCls} />
          </Field>
          <Field label="Email *">
            <input type="email" value={primaryEmail} onChange={(e) => onPrimaryEmailChange(e.target.value)}
              placeholder="you@company.com" className={inputCls} />
          </Field>
          <Field label="Mobile *">
            <input type="tel" value={primaryPhone} onChange={(e) => onPrimaryPhoneChange(e.target.value)}
              placeholder="10-digit mobile number" maxLength={10} className={inputCls} />
          </Field>
        </div>
      </section>

      {/* Add Team Members */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
          <div>
            <h2 className="text-base font-extrabold uppercase tracking-wider text-[#0F172A]">Add Team Members</h2>
            <div className="mt-1 h-0.5 w-8 rounded-full bg-[#2563EB]" />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => csvRef.current?.click()}
              className="flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] px-3 py-2 text-xs font-semibold text-[#64748B] hover:border-[#94A3B8]"
            >
              <Upload size={13} />
              Upload CSV
            </button>
            <input
              ref={csvRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleCsvFile(e.target.files[0])}
            />
            <button
              type="button"
              onClick={onAddTeamMember}
              className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8]"
            >
              <Plus size={13} />
              Add Member
            </button>
          </div>
        </div>

        {teamMembers.length === 0 ? (
          <p className="py-4 text-center text-sm text-[#94A3B8]">No team members added. Add individually or upload a CSV (Name, Email columns).</p>
        ) : (
          <div className="flex flex-col gap-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => onUpdateTeamMember(member.id, "name", e.target.value)}
                  placeholder="Member name"
                  className="h-9 rounded-lg border border-[#D1D5DB] px-2.5 text-sm font-medium text-[#0F172A] outline-none focus:border-[#2563EB]"
                />
                <input
                  type="email"
                  value={member.email}
                  onChange={(e) => onUpdateTeamMember(member.id, "email", e.target.value)}
                  placeholder="member@company.com"
                  className="h-9 rounded-lg border border-[#D1D5DB] px-2.5 text-sm font-medium text-[#0F172A] outline-none focus:border-[#2563EB]"
                />
                <button type="button" onClick={() => onRemoveTeamMember(member.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#DC2626] hover:bg-red-50">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Business Booking */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
          <div>
            <h2 className="text-base font-extrabold uppercase tracking-wider text-[#0F172A]">Business Booking</h2>
            <div className="mt-1 h-0.5 w-8 rounded-full bg-[#2563EB]" />
          </div>
          <button
            type="button"
            onClick={onToggleBusinessBooking}
            className={
              "relative h-6 w-11 rounded-full transition-colors " +
              (isBusinessBooking ? "bg-[#2563EB]" : "bg-[#CBD5E1]")
            }
          >
            <span className={
              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform " +
              (isBusinessBooking ? "translate-x-5" : "translate-x-0.5")
            } />
          </button>
        </div>

        {isBusinessBooking && (
          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:grid-cols-2">
            <Field label="Company Name">
              <div className="relative">
                <Building2 size={14} className="absolute left-3 top-3.5 text-[#94A3B8]" />
                <input type="text" value={companyName} onChange={(e) => onCompanyNameChange(e.target.value)}
                  placeholder="Acme Pvt Ltd" className={inputCls + " pl-8"} />
              </div>
            </Field>
            <Field label="GST Number">
              <input type="text" value={gstNumber} onChange={(e) => onGstNumberChange(e.target.value)}
                placeholder="27AAAAA0000A1Z5" className={inputCls} />
            </Field>
            <Field label="Billing Address">
              <input type="text" value={billingAddress} onChange={(e) => onBillingAddressChange(e.target.value)}
                placeholder="Street, City, PIN" className={inputCls} />
            </Field>
            <Field label="Cost Center">
              <input type="text" value={costCenter} onChange={(e) => onCostCenterChange(e.target.value)}
                placeholder="e.g. Engineering / Sales" className={inputCls} />
            </Field>
          </div>
        )}
      </section>
    </div>
  );
}
