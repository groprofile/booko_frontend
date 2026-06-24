import { useState } from "react";
import { Plus, X } from "lucide-react";

interface MeetingRoomStep2Props {
  organizerName: string; onOrganizerNameChange: (v: string) => void;
  organizerEmail: string; onOrganizerEmailChange: (v: string) => void;
  organizerPhone: string; onOrganizerPhoneChange: (v: string) => void;
  attendeeCount: number;
  invitedEmails: string[];
  onAddEmail: (email: string) => void;
  onRemoveEmail: (email: string) => void;
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

export default function MeetingRoomStep2({
  organizerName, onOrganizerNameChange, organizerEmail, onOrganizerEmailChange,
  organizerPhone, onOrganizerPhoneChange, attendeeCount,
  invitedEmails, onAddEmail, onRemoveEmail,
}: MeetingRoomStep2Props) {
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");

  function handleAddEmail() {
    const email = emailInput.trim();
    if (!email.includes("@")) { setEmailError("Enter a valid email address."); return; }
    if (invitedEmails.includes(email)) { setEmailError("Already added."); return; }
    onAddEmail(email);
    setEmailInput("");
    setEmailError("");
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Organizer Details */}
      <section className="flex flex-col gap-4">
        <SectionLabel>Organizer Details</SectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Full Name *</span>
            <input type="text" value={organizerName} onChange={(e) => onOrganizerNameChange(e.target.value)}
              placeholder="Your full name" className={inputCls} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Email *</span>
            <input type="email" value={organizerEmail} onChange={(e) => onOrganizerEmailChange(e.target.value)}
              placeholder="you@company.com" className={inputCls} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Mobile *</span>
            <input type="tel" value={organizerPhone} onChange={(e) => onOrganizerPhoneChange(e.target.value)}
              placeholder="10-digit mobile number" maxLength={10} className={inputCls} />
          </label>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">Number of Attendees</span>
            <div className="flex h-11 items-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-sm font-semibold text-[#0F172A]">
              {attendeeCount} attendees
            </div>
          </div>
        </div>
      </section>

      {/* Invite Guests */}
      <section className="flex flex-col gap-4">
        <SectionLabel>Invite Guests (Optional)</SectionLabel>
        <p className="text-sm text-[#64748B]">Add guest emails — they'll receive a calendar invite with the room details.</p>

        <div className="flex gap-2">
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddEmail())}
            placeholder="colleague@company.com"
            className="h-11 flex-1 rounded-xl border border-[#D1D5DB] px-3 text-sm font-medium text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
          />
          <button type="button" onClick={handleAddEmail}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white hover:bg-[#1d4ed8]">
            <Plus size={18} />
          </button>
        </div>
        {emailError && <p className="text-xs font-medium text-[#DC2626]">{emailError}</p>}

        {invitedEmails.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {invitedEmails.map((email) => (
              <span key={email} className="flex items-center gap-1.5 rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1 text-sm font-medium text-[#2563EB]">
                {email}
                <button type="button" onClick={() => onRemoveEmail(email)}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
