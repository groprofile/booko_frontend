import { useState } from "react";
import { Save, User, Bell, Building2, CreditCard, Shield } from "lucide-react";
import SuperPartnerLayout from "../../components/partner/SuperPartnerLayout";
import CenterLayout from "../../components/partner/CenterLayout";
import { usePartner } from "../../context/PartnerContext";

type Tab = "profile" | "center" | "notifications" | "payouts" | "security";

const TABS: Array<{ id: Tab; label: string; icon: React.ElementType }> = [
  { id: "profile",       label: "My Profile",     icon: User      },
  { id: "center",        label: "Center Info",    icon: Building2 },
  { id: "notifications", label: "Notifications",  icon: Bell      },
  { id: "payouts",       label: "Payouts & GST",  icon: CreditCard },
  { id: "security",      label: "Security",       icon: Shield    },
];

const inputCls =
  "h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm text-[#0F172A] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 placeholder:text-[#94A3B8]";

function SettingsContent() {
  const { partner } = usePartner();
  const [tab, setTab] = useState<Tab>("profile");
  const [notif, setNotif] = useState({
    newBooking: true,
    cancellation: true,
    specialRequest: true,
    paymentReceived: false,
    weeklyReport: true,
  });
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex gap-5">
      {/* Sidebar tabs */}
      <nav className="w-48 shrink-0">
        <div className="flex flex-col gap-0.5 rounded-2xl border border-[#E2E8F0] bg-white p-2 shadow-sm">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition-colors ${
                tab === t.id ? "bg-[#EFF6FF] text-[#2563EB]" : "text-[#64748B] hover:bg-[#F8FAFC]"
              }`}>
              <t.icon size={14} className="shrink-0" />
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content panel */}
      <div className="flex-1 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        {/* Profile */}
        {tab === "profile" && (
          <div>
            <h3 className="mb-5 text-sm font-bold text-[#0F172A]">My Profile</h3>
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-2xl font-extrabold text-white">
                {partner?.name?.charAt(0) ?? "P"}
              </div>
              <div>
                <p className="font-bold text-[#0F172A]">{partner?.name ?? "Partner"}</p>
                <p className="text-sm text-[#64748B]">{partner?.email ?? "—"}</p>
                <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                  Verified Partner
                </span>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Full Name", value: partner?.name ?? "", placeholder: "Your full name" },
                { label: "Mobile", value: partner?.mobile ?? "", placeholder: "+91 XXXXX XXXXX" },
                { label: "Personal Email", value: partner?.email ?? "", placeholder: "your@email.com" },
                { label: "Business Email", value: partner?.businessEmail ?? "", placeholder: "business@company.com" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">{f.label}</label>
                  <input type="text" defaultValue={f.value} placeholder={f.placeholder} className={inputCls} />
                </div>
              ))}
            </div>
            <button onClick={handleSave}
              className="mt-5 flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1d4ed8]">
              <Save size={13} /> {saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        )}

        {/* Center Info */}
        {tab === "center" && (
          <div>
            <h3 className="mb-5 text-sm font-bold text-[#0F172A]">Center Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Business Name", value: partner?.businessName ?? "" },
                { label: "Business Type", value: partner?.businessType ?? "" },
                { label: "City", value: partner?.city ?? "" },
                { label: "State", value: partner?.state ?? "" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">{f.label}</label>
                  <input type="text" defaultValue={f.value} className={inputCls} />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">Registered Address</label>
                <input type="text" defaultValue={partner?.business?.registeredAddress ?? ""} placeholder="Full registered address" className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">Website</label>
                <input type="url" defaultValue={partner?.business?.website ?? ""} placeholder="https://yourwebsite.com" className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">Instagram</label>
                <input type="text" defaultValue={partner?.business?.instagram ?? ""} placeholder="@yourhandle" className={inputCls} />
              </div>
            </div>
            <button onClick={handleSave}
              className="mt-5 flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1d4ed8]">
              <Save size={13} /> {saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        )}

        {/* Notifications */}
        {tab === "notifications" && (
          <div>
            <h3 className="mb-5 text-sm font-bold text-[#0F172A]">Notification Preferences</h3>
            <div className="flex flex-col gap-3">
              {[
                { key: "newBooking",       label: "New Booking",          desc: "Notify when a new booking is made at your center" },
                { key: "cancellation",     label: "Booking Cancellation", desc: "Notify when a booking is cancelled" },
                { key: "specialRequest",   label: "Special Request",      desc: "Notify when a guest submits a special request" },
                { key: "paymentReceived",  label: "Payment Received",     desc: "Notify when a payment is confirmed" },
                { key: "weeklyReport",     label: "Weekly Summary",       desc: "Receive weekly performance report every Monday" },
              ].map((n) => (
                <div key={n.key} className="flex items-center justify-between rounded-xl border border-[#E2E8F0] p-4">
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A]">{n.label}</p>
                    <p className="text-xs text-[#94A3B8]">{n.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotif((p) => ({ ...p, [n.key]: !p[n.key as keyof typeof p] }))}
                    className={`relative h-5 w-9 rounded-full transition-colors ${(notif as Record<string, boolean>)[n.key] ? "bg-[#2563EB]" : "bg-[#E2E8F0]"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${(notif as Record<string, boolean>)[n.key] ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={handleSave}
              className="mt-5 flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1d4ed8]">
              <Save size={13} /> {saved ? "Saved!" : "Save Preferences"}
            </button>
          </div>
        )}

        {/* Payouts */}
        {tab === "payouts" && (
          <div>
            <h3 className="mb-5 text-sm font-bold text-[#0F172A]">Payouts & GST Details</h3>
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">
              Bank & GST details are managed during KYC. Contact support to update.
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "GSTIN", value: partner?.gstBank?.gstin ?? "—" },
                { label: "Legal Business Name", value: partner?.gstBank?.legalBusinessName ?? "—" },
                { label: "Bank Name", value: partner?.gstBank?.bankName ?? "—" },
                { label: "Account Number", value: partner?.gstBank?.accountNumber ? "••••" + partner.gstBank.accountNumber.slice(-4) : "—" },
                { label: "IFSC Code", value: partner?.gstBank?.ifscCode ?? "—" },
                { label: "Settlement Window", value: "T + 7 days" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">{f.label}</label>
                  <input type="text" value={f.value} readOnly
                    className="h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm text-[#94A3B8] outline-none" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security */}
        {tab === "security" && (
          <div>
            <h3 className="mb-5 text-sm font-bold text-[#0F172A]">Security Settings</h3>
            <div className="flex flex-col gap-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">Current Password</label>
                <input type="password" placeholder="Enter current password" className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">New Password</label>
                <input type="password" placeholder="Min. 8 characters" className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">Confirm New Password</label>
                <input type="password" placeholder="Re-enter new password" className={inputCls} />
              </div>
            </div>
            <button onClick={handleSave}
              className="mt-5 flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1d4ed8]">
              <Save size={13} /> {saved ? "Updated!" : "Update Password"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PartnerSettingsPage() {
  const { partner } = usePartner();
  const isMulti = partner?.centerType === "multiple";

  if (isMulti) {
    return (
      <SuperPartnerLayout title="Settings" subtitle="Manage your profile and preferences">
        <SettingsContent />
      </SuperPartnerLayout>
    );
  }
  return (
    <CenterLayout title="Settings" subtitle="Manage your profile and preferences">
      <SettingsContent />
    </CenterLayout>
  );
}
