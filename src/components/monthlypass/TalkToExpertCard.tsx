import { useState } from "react";
import { CheckCircle2, PhoneCall, UserRound } from "lucide-react";

const benefits = [
  "Lower rates for 6+ month plans",
  "Dedicated account manager",
  "Free site visits before you book",
];

export default function TalkToExpertCard() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [requested, setRequested] = useState(false);

  const isValid = name.trim().length >= 2 && phone.length === 10 && email.includes("@");

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
          <UserRound size={22} strokeWidth={1.8} />
        </span>
        <div>
          <p className="text-sm font-bold text-[#0F172A]">Talk to a Bokko Expert</p>
          <p className="text-xs text-[#64748B]">Get a better deal on your plan</p>
        </div>
      </div>

      <ul className="mt-4 flex flex-col gap-2 border-t border-[#E2E8F0] pt-4">
        {benefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2 text-sm text-[#334155]">
            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#16A34A]" />
            {benefit}
          </li>
        ))}
      </ul>

      {requested ? (
        <div className="mt-4 rounded-xl bg-[#ECFDF5] px-4 py-3 text-sm font-semibold text-[#16A34A]">
          Thanks, {name}! Our expert will call you shortly.
        </div>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (isValid) setRequested(true);
          }}
          className="mt-4 flex flex-col gap-2.5"
        >
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your full name"
            className="h-11 w-full rounded-xl border border-[#D1D5DB] px-3.5 text-sm font-medium text-[#0F172A] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
          />
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="Mobile number"
            className="h-11 w-full rounded-xl border border-[#D1D5DB] px-3.5 text-sm font-medium text-[#0F172A] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
          />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email address"
            className="h-11 w-full rounded-xl border border-[#D1D5DB] px-3.5 text-sm font-medium text-[#0F172A] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
          />
          <button
            type="submit"
            disabled={!isValid}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#111111] text-sm font-bold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:bg-[#E5E7EB] disabled:text-[#94A3B8]"
          >
            <PhoneCall size={16} />
            Request a Callback
          </button>
        </form>
      )}
    </div>
  );
}
