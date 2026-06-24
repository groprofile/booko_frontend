import { Plus, X } from "lucide-react";
import { titleOptions } from "../../data/checkoutConfig";
import SectionLabel from "./SectionLabel";

export interface PrimaryGuest {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
}

export interface AdditionalGuest {
  id: string;
  type: "Adult" | "Child" | "Infant";
}

interface GuestDetailsSectionProps {
  primaryGuest: PrimaryGuest;
  onChangePrimaryGuest: (patch: Partial<PrimaryGuest>) => void;
  additionalGuests: AdditionalGuest[];
  onAddGuest: (type: AdditionalGuest["type"]) => void;
  onRemoveGuest: (id: string) => void;
  isBusinessBooking: boolean;
  onToggleBusinessBooking: () => void;
  gstNumber: string;
  onGstNumberChange: (value: string) => void;
  companyName: string;
  onCompanyNameChange: (value: string) => void;
  billingAddress: string;
  onBillingAddressChange: (value: string) => void;
}

function FieldLabel({ children }: { children: string }) {
  return <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">{children}</span>;
}

const inputClass =
  "h-11 rounded-xl border border-[#D1D5DB] px-3 text-sm font-medium text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15";

export default function GuestDetailsSection({
  primaryGuest,
  onChangePrimaryGuest,
  additionalGuests,
  onAddGuest,
  onRemoveGuest,
  isBusinessBooking,
  onToggleBusinessBooking,
  gstNumber,
  onGstNumberChange,
  companyName,
  onCompanyNameChange,
  billingAddress,
  onBillingAddressChange,
}: GuestDetailsSectionProps) {
  return (
    <section>
      <SectionLabel title="Guest Details" />

      <p className="mb-3 text-sm font-bold text-[#0F172A]">Primary Guest</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <FieldLabel>Title</FieldLabel>
          <select
            value={primaryGuest.title}
            onChange={(event) => onChangePrimaryGuest({ title: event.target.value })}
            className={inputClass + " bg-white"}
          >
            {titleOptions.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>
        </label>
        <div />
        <label className="flex flex-col gap-1">
          <FieldLabel>First Name</FieldLabel>
          <input
            type="text"
            value={primaryGuest.firstName}
            onChange={(event) => onChangePrimaryGuest({ firstName: event.target.value })}
            placeholder="First name"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1">
          <FieldLabel>Last Name</FieldLabel>
          <input
            type="text"
            value={primaryGuest.lastName}
            onChange={(event) => onChangePrimaryGuest({ lastName: event.target.value })}
            placeholder="Last name"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1">
          <FieldLabel>Email</FieldLabel>
          <input
            type="email"
            value={primaryGuest.email}
            onChange={(event) => onChangePrimaryGuest({ email: event.target.value })}
            placeholder="you@example.com"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1">
          <FieldLabel>Mobile Number</FieldLabel>
          <input
            type="tel"
            value={primaryGuest.mobile}
            onChange={(event) => onChangePrimaryGuest({ mobile: event.target.value })}
            placeholder="10-digit mobile number"
            className={inputClass}
          />
        </label>
      </div>

      <div className="mt-6 border-t border-[#E2E8F0] pt-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-[#0F172A]">Additional Guests</p>
          <div className="flex gap-2">
            {(["Adult", "Child", "Infant"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onAddGuest(type)}
                className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] px-2.5 py-1.5 text-xs font-semibold text-[#334155] hover:border-[#2563EB] hover:text-[#2563EB]"
              >
                <Plus size={12} />
                {type}
              </button>
            ))}
          </div>
        </div>

        {additionalGuests.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {additionalGuests.map((guest) => (
              <span
                key={guest.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#F8FAFC] px-3 py-1.5 text-xs font-semibold text-[#334155]"
              >
                {guest.type}
                <button type="button" onClick={() => onRemoveGuest(guest.id)} aria-label={`Remove ${guest.type}`}>
                  <X size={12} className="text-[#94A3B8] hover:text-[#DC2626]" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 border-t border-[#E2E8F0] pt-5">
        <label className="flex cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            checked={isBusinessBooking}
            onChange={onToggleBusinessBooking}
            className="h-4 w-4 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
          />
          <span className="text-sm font-bold text-[#0F172A]">This is a Business Booking (GST Invoice)</span>
        </label>

        {isBusinessBooking && (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <FieldLabel>GST Number</FieldLabel>
              <input
                type="text"
                value={gstNumber}
                onChange={(event) => onGstNumberChange(event.target.value)}
                placeholder="22AAAAA0000A1Z5"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1">
              <FieldLabel>Company Name</FieldLabel>
              <input
                type="text"
                value={companyName}
                onChange={(event) => onCompanyNameChange(event.target.value)}
                placeholder="Company name"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <FieldLabel>Billing Address</FieldLabel>
              <input
                type="text"
                value={billingAddress}
                onChange={(event) => onBillingAddressChange(event.target.value)}
                placeholder="Billing address"
                className={inputClass}
              />
            </label>
          </div>
        )}
      </div>
    </section>
  );
}
