import { useState, useEffect } from "react";
import { Save, User, Bell, Building2, CreditCard, Shield, Loader2, Check } from "lucide-react";
import SuperPartnerLayout from "../../components/partner/SuperPartnerLayout";
import CenterLayout from "../../components/partner/CenterLayout";
import { usePartner } from "../../context/PartnerContext";
import { apiGet, apiPatch, getVendorToken } from "../../lib/api";

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
  const { partner, updatePartner } = usePartner();
  const [tab, setTab] = useState<Tab>("profile");

  // Profile tab state
  const [profileForm, setProfileForm] = useState({
    ownerName: "",
    phone: "",
    contactPerson: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Center tab state
  const [centerForm, setCenterForm] = useState({
    businessName: "",
    businessType: "",
    city: "",
    state: "",
    registeredAddress: "",
    website: "",
    instagram: "",
  });
  const [centerSaving, setCenterSaving] = useState(false);
  const [centerSaved, setCenterSaved] = useState(false);
  const [centerError, setCenterError] = useState("");

  // Security tab state
  const [secForm, setSecForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [secSaving, setSecSaving] = useState(false);
  const [secSaved, setSecSaved] = useState(false);
  const [secError, setSecError] = useState("");

  // Notifications (UI-only)
  const [notif, setNotif] = useState({
    newBooking: true,
    cancellation: true,
    specialRequest: true,
    paymentReceived: false,
    weeklyReport: true,
  });

  // Load profile on mount
  useEffect(() => {
    const token = getVendorToken();
    if (!token) return;
    apiGet<any>("/vendor/profile", token)
      .then((p) => {
        setProfileForm({
          ownerName:      p.owner_name      ?? "",
          phone:          p.phone           ?? "",
          contactPerson:  p.contact_person  ?? "",
        });
        setCenterForm({
          businessName:       p.business_name       ?? "",
          businessType:       p.business_type       ?? "",
          city:               p.city                ?? "",
          state:              p.state               ?? "",
          registeredAddress:  p.registered_address  ?? "",
          website:            p.website             ?? "",
          instagram:          p.instagram           ?? "",
        });
      })
      .catch(() => {});
  }, []);

  async function saveProfile() {
    setProfileSaving(true);
    setProfileError("");
    try {
      const token = getVendorToken();
      await apiPatch("/vendor/profile", {
        ownerName:     profileForm.ownerName     || undefined,
        phone:         profileForm.phone         || undefined,
        contactPerson: profileForm.contactPerson || undefined,
      }, token ?? undefined);
      updatePartner({ name: profileForm.ownerName, mobile: profileForm.phone });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err) {
      setProfileError((err as Error).message ?? "Failed to save profile");
    } finally {
      setProfileSaving(false);
    }
  }

  async function saveCenter() {
    setCenterSaving(true);
    setCenterError("");
    try {
      const token = getVendorToken();
      await apiPatch("/vendor/profile", {
        businessName:      centerForm.businessName      || undefined,
        businessType:      centerForm.businessType      || undefined,
        city:              centerForm.city              || undefined,
        state:             centerForm.state             || undefined,
        registeredAddress: centerForm.registeredAddress || undefined,
        website:           centerForm.website           || undefined,
        instagram:         centerForm.instagram         || undefined,
      }, token ?? undefined);
      updatePartner({
        businessName: centerForm.businessName,
        city: centerForm.city,
        state: centerForm.state,
        businessType: centerForm.businessType,
      });
      setCenterSaved(true);
      setTimeout(() => setCenterSaved(false), 2500);
    } catch (err) {
      setCenterError((err as Error).message ?? "Failed to save center info");
    } finally {
      setCenterSaving(false);
    }
  }

  async function savePassword() {
    setSecError("");
    if (!secForm.currentPassword || !secForm.newPassword || !secForm.confirmPassword) {
      setSecError("All fields are required");
      return;
    }
    if (secForm.newPassword.length < 8) {
      setSecError("New password must be at least 8 characters");
      return;
    }
    if (secForm.newPassword !== secForm.confirmPassword) {
      setSecError("New passwords do not match");
      return;
    }
    setSecSaving(true);
    try {
      const token = getVendorToken();
      await apiPatch("/vendor/change-password", {
        currentPassword: secForm.currentPassword,
        newPassword:     secForm.newPassword,
      }, token ?? undefined);
      setSecForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSecSaved(true);
      setTimeout(() => setSecSaved(false), 2500);
    } catch (err) {
      setSecError((err as Error).message ?? "Failed to update password");
    } finally {
      setSecSaving(false);
    }
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
                {(profileForm.ownerName || partner?.name)?.charAt(0)?.toUpperCase() ?? "P"}
              </div>
              <div>
                <p className="font-bold text-[#0F172A]">{profileForm.ownerName || partner?.name || "Partner"}</p>
                <p className="text-sm text-[#64748B]">{partner?.email ?? "—"}</p>
                <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                  Verified Partner
                </span>
              </div>
            </div>

            {profileError && (
              <p className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-xs text-red-600">{profileError}</p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">Full Name</label>
                <input type="text" value={profileForm.ownerName}
                  onChange={(e) => setProfileForm((p) => ({ ...p, ownerName: e.target.value }))}
                  placeholder="Your full name" className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">Mobile</label>
                <input type="text" value={profileForm.phone}
                  onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+91 XXXXX XXXXX" className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">Email</label>
                <input type="email" value={partner?.email ?? ""}
                  readOnly className="h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm text-[#94A3B8] outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">Contact Person</label>
                <input type="text" value={profileForm.contactPerson}
                  onChange={(e) => setProfileForm((p) => ({ ...p, contactPerson: e.target.value }))}
                  placeholder="Primary contact name" className={inputCls} />
              </div>
            </div>
            <button onClick={saveProfile} disabled={profileSaving}
              className="mt-5 flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1d4ed8] disabled:opacity-60">
              {profileSaving ? <Loader2 size={13} className="animate-spin" /> : profileSaved ? <Check size={13} /> : <Save size={13} />}
              {profileSaving ? "Saving…" : profileSaved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        )}

        {/* Center Info */}
        {tab === "center" && (
          <div>
            <h3 className="mb-5 text-sm font-bold text-[#0F172A]">Center Information</h3>

            {centerError && (
              <p className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-xs text-red-600">{centerError}</p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">Business Name</label>
                <input type="text" value={centerForm.businessName}
                  onChange={(e) => setCenterForm((p) => ({ ...p, businessName: e.target.value }))}
                  className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">Business Type</label>
                <input type="text" value={centerForm.businessType}
                  onChange={(e) => setCenterForm((p) => ({ ...p, businessType: e.target.value }))}
                  className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">City</label>
                <input type="text" value={centerForm.city}
                  onChange={(e) => setCenterForm((p) => ({ ...p, city: e.target.value }))}
                  className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">State</label>
                <input type="text" value={centerForm.state}
                  onChange={(e) => setCenterForm((p) => ({ ...p, state: e.target.value }))}
                  className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">Registered Address</label>
                <input type="text" value={centerForm.registeredAddress}
                  onChange={(e) => setCenterForm((p) => ({ ...p, registeredAddress: e.target.value }))}
                  placeholder="Full registered address" className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">Website</label>
                <input type="url" value={centerForm.website}
                  onChange={(e) => setCenterForm((p) => ({ ...p, website: e.target.value }))}
                  placeholder="https://yourwebsite.com" className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">Instagram</label>
                <input type="text" value={centerForm.instagram}
                  onChange={(e) => setCenterForm((p) => ({ ...p, instagram: e.target.value }))}
                  placeholder="@yourhandle" className={inputCls} />
              </div>
            </div>
            <button onClick={saveCenter} disabled={centerSaving}
              className="mt-5 flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1d4ed8] disabled:opacity-60">
              {centerSaving ? <Loader2 size={13} className="animate-spin" /> : centerSaved ? <Check size={13} /> : <Save size={13} />}
              {centerSaving ? "Saving…" : centerSaved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        )}

        {/* Notifications (UI-only) */}
        {tab === "notifications" && (
          <div>
            <h3 className="mb-1 text-sm font-bold text-[#0F172A]">Notification Preferences</h3>
            <p className="mb-5 text-xs text-[#94A3B8]">These preferences are saved locally on this device.</p>
            <div className="flex flex-col gap-3">
              {[
                { key: "newBooking",      label: "New Booking",          desc: "Notify when a new booking is made at your center" },
                { key: "cancellation",    label: "Booking Cancellation", desc: "Notify when a booking is cancelled" },
                { key: "specialRequest",  label: "Special Request",      desc: "Notify when a guest submits a special request" },
                { key: "paymentReceived", label: "Payment Received",     desc: "Notify when a payment is confirmed" },
                { key: "weeklyReport",    label: "Weekly Summary",       desc: "Receive weekly performance report every Monday" },
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
          </div>
        )}

        {/* Payouts (read-only) */}
        {tab === "payouts" && (
          <div>
            <h3 className="mb-5 text-sm font-bold text-[#0F172A]">Payouts & GST Details</h3>
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">
              Bank & GST details are managed during KYC. Contact support to update.
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "GSTIN",               value: partner?.gstBank?.gstin ?? "—" },
                { label: "Legal Business Name",  value: partner?.gstBank?.legalBusinessName ?? "—" },
                { label: "Bank Name",            value: partner?.gstBank?.bankName ?? "—" },
                { label: "Account Number",       value: partner?.gstBank?.accountNumber ? "••••" + partner.gstBank.accountNumber.slice(-4) : "—" },
                { label: "IFSC Code",            value: partner?.gstBank?.ifscCode ?? "—" },
                { label: "Settlement Window",    value: "T + 7 days" },
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

            {secError && (
              <p className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-xs text-red-600">{secError}</p>
            )}

            <div className="flex flex-col gap-5 max-w-md">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">Current Password</label>
                <input type="password" value={secForm.currentPassword}
                  onChange={(e) => setSecForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  placeholder="Enter current password" className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">New Password</label>
                <input type="password" value={secForm.newPassword}
                  onChange={(e) => setSecForm((p) => ({ ...p, newPassword: e.target.value }))}
                  placeholder="Min. 8 characters" className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">Confirm New Password</label>
                <input type="password" value={secForm.confirmPassword}
                  onChange={(e) => setSecForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Re-enter new password" className={inputCls} />
              </div>
            </div>
            <button onClick={savePassword} disabled={secSaving}
              className="mt-5 flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1d4ed8] disabled:opacity-60">
              {secSaving ? <Loader2 size={13} className="animate-spin" /> : secSaved ? <Check size={13} /> : <Shield size={13} />}
              {secSaving ? "Updating…" : secSaved ? "Password Updated!" : "Update Password"}
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
