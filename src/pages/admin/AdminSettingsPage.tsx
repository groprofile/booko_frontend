import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Save, User, Shield, Bell, Database, Globe } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { showToast } from "../../components/admin/Toast";
import { apiGet, apiPatch, getAdminToken, ApiError } from "../../lib/api";
import { useAdmin, ROLE_LABELS } from "../../context/AdminContext";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

const EMPLOYEE_ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin", VENDOR_APPROVAL_TEAM: "Operations", FINANCE_TEAM: "Finance",
  SUPPORT_TEAM: "Support", OPERATIONS_TEAM: "Operations", CONTENT_MANAGER: "Content", CITY_MANAGER: "City Manager",
};

const ROLE_PERMISSIONS_DISPLAY = [
  { role: "Super Admin",      perms: "Full access to all modules, settings, and configurations" },
  { role: "Operations Admin", perms: "Vendors, Approvals, Centers, Bookings" },
  { role: "Finance Admin",    perms: "Revenue, Settlements, Bookings (view only)" },
  { role: "Support Admin",    perms: "Users, Bookings, Support tickets" },
  { role: "Sales Admin",      perms: "Vendors, Vendor Approvals" },
  { role: "Content Admin",    perms: "Centers, Coupons" },
];

export default function AdminSettingsPage() {
  const { admin } = useAdmin();
  const [activeTab, setActiveTab] = useState<"profile" | "team" | "roles" | "notifications" | "platform">("profile");
  const [notifSettings, setNotifSettings] = useState({
    newVendor: true, kycSubmitted: true, bookingReceived: false,
    paymentFailed: true, refundRequested: true, settlementDue: true,
  });

  const isSuperAdmin = admin?.role === "super_admin";

  const [globalCommission, setGlobalCommission] = useState("10");
  const [commissionSaving, setCommissionSaving] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    const token = getAdminToken();
    if (!token) return;
    apiGet<Employee[]>("/admin/employees", token)
      .then((r) => setEmployees(Array.isArray(r) ? r : []))
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    const token = getAdminToken();
    if (!token) return;
    apiGet<{ rate_percent: string | null }>("/admin/commission-config", token)
      .then((r) => { if (r.rate_percent != null) setGlobalCommission(String(r.rate_percent)); })
      .catch(console.error);
  }, [isSuperAdmin]);

  async function handleSaveCommission() {
    const token = getAdminToken();
    if (!token) return;
    const rate = Number(globalCommission);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      showToast("Enter a commission rate between 0 and 100", "error");
      return;
    }
    setCommissionSaving(true);
    try {
      // apiPatch matches the backend's real HTTP verb for this route
      // (PATCH /admin/commission-config) — the rest of this app uses apiPost
      // for mutations, but this one is genuinely idempotent.
      await apiPatch("/admin/commission-config", { ratePercent: rate }, token);
      showToast("Platform commission rate updated", "success");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to update commission rate", "error");
    } finally {
      setCommissionSaving(false);
    }
  }

  const tabs = [
    { id: "profile" as const, label: "My Profile", icon: User },
    ...(isSuperAdmin ? [
      { id: "team" as const, label: "Team", icon: Shield },
      { id: "roles" as const, label: "Roles & Access", icon: Database },
      { id: "notifications" as const, label: "Notifications", icon: Bell },
      { id: "platform" as const, label: "Platform", icon: Globe },
    ] : [
      { id: "notifications" as const, label: "Notifications", icon: Bell },
    ]),
  ];

  return (
    <AdminLayout title="Settings">
      <div className="flex gap-5">
        {/* Sidebar */}
        <div className="w-52 shrink-0">
          <nav className="flex flex-col gap-1 rounded-2xl border border-[#E2E8F0] bg-white p-2 shadow-sm">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-left transition-colors ${activeTab === tab.id ? "bg-[#EFF6FF] text-[#2563EB]" : "text-[#64748B] hover:bg-[#F8FAFC]"}`}>
                <tab.icon size={15} className="shrink-0" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          {activeTab === "profile" && admin && (
            <div>
              <h3 className="mb-5 text-base font-bold text-[#0F172A]">My Profile</h3>
              <div className="mb-5 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2563EB] text-2xl font-extrabold text-white">
                  {admin.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-[#0F172A]">{admin.name}</p>
                  <p className="text-sm text-[#64748B]">{ROLE_LABELS[admin.role]}</p>
                  <p className="text-xs text-[#94A3B8]">Member since {admin.joinedAt}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Full Name", value: admin.name },
                  { label: "Email", value: admin.email },
                  { label: "Role", value: ROLE_LABELS[admin.role] },
                  { label: "Member Since", value: admin.joinedAt },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="mb-1.5 block text-xs font-medium text-[#64748B]">{f.label}</label>
                    <input type="text" defaultValue={f.value} readOnly={f.label === "Role" || f.label === "Member Since"}
                      className="h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm text-[#0F172A] outline-none focus:border-[#2563EB] read-only:text-[#94A3B8]" />
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-medium text-[#64748B]">New Password</label>
                <input type="password" placeholder="Leave blank to keep current password"
                  className="h-10 w-full rounded-xl border border-[#E2E8F0] px-4 text-sm outline-none focus:border-[#2563EB]" />
              </div>
              <button className="mt-4 flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1d4ed8]">
                <Save size={14} /> Save Changes
              </button>
            </div>
          )}

          {activeTab === "team" && isSuperAdmin && (
            <div>
              <h3 className="mb-5 text-base font-bold text-[#0F172A]">Admin Team</h3>
              <div className="overflow-hidden rounded-xl border border-[#E2E8F0]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                      {["Name", "Email", "Role", "Status"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#64748B]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {employees.length === 0 && (
                      <tr><td colSpan={4} className="py-10 text-center text-xs text-[#94A3B8]">No team members found.</td></tr>
                    )}
                    {employees.map((u) => (
                      <tr key={u.id} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white">
                              {u.name?.charAt(0) ?? "?"}
                            </div>
                            <span className="font-semibold text-[#0F172A]">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#64748B]">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-[#EFF6FF] px-2.5 py-1 text-xs font-semibold text-[#2563EB]">
                            {EMPLOYEE_ROLE_LABELS[u.role] ?? u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${u.is_active ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#F1F5F9] text-[#64748B]"}`}>
                            {u.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "roles" && isSuperAdmin && (
            <div>
              <h3 className="mb-5 text-base font-bold text-[#0F172A]">Role Permissions</h3>
              <div className="flex flex-col gap-3">
                {ROLE_PERMISSIONS_DISPLAY.map((r) => (
                  <div key={r.role} className="flex items-start gap-4 rounded-xl border border-[#E2E8F0] p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF]">
                      <Shield size={15} className="text-[#2563EB]" />
                    </div>
                    <div>
                      <p className="font-bold text-[#0F172A]">{r.role}</p>
                      <p className="mt-0.5 text-xs text-[#64748B]">{r.perms}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div>
              <h3 className="mb-5 text-base font-bold text-[#0F172A]">Notification Preferences</h3>
              <div className="flex flex-col gap-4">
                {[
                  { key: "newVendor", label: "New Partner Signup", desc: "Notify when a new vendor registers" },
                  { key: "kycSubmitted", label: "KYC Documents Submitted", desc: "Notify when KYC is ready for review" },
                  { key: "bookingReceived", label: "New Booking", desc: "Notify on every booking (may be noisy)" },
                  { key: "paymentFailed", label: "Payment Failure", desc: "Notify when a payment fails" },
                  { key: "refundRequested", label: "Refund Requested", desc: "Notify when a customer requests a refund" },
                  { key: "settlementDue", label: "Settlement Due", desc: "Notify when vendor settlements are due" },
                ].map((n) => (
                  <div key={n.key} className="flex items-center justify-between rounded-xl border border-[#E2E8F0] p-4">
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A]">{n.label}</p>
                      <p className="text-xs text-[#94A3B8]">{n.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifSettings((p) => ({ ...p, [n.key]: !p[n.key as keyof typeof p] }))}
                      className={`relative h-5 w-9 rounded-full transition-colors ${(notifSettings as Record<string, boolean>)[n.key] ? "bg-[#2563EB]" : "bg-[#E2E8F0]"}`}>
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${(notifSettings as Record<string, boolean>)[n.key] ? "translate-x-4" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>
              <button className="mt-4 flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1d4ed8]">
                <Save size={14} /> Save Preferences
              </button>
            </div>
          )}

          {activeTab === "platform" && isSuperAdmin && (
            <div>
              <h3 className="mb-5 text-base font-bold text-[#0F172A]">Platform Settings</h3>
              <div className="flex flex-col gap-4">
                {[
                  { label: "Platform Name", value: "Bokko" },
                  { label: "Company Legal Name", value: "Grofeed Technology India Pvt Ltd" },
                  { label: "Support Email", value: "Hello@bokkoapp.com" },
                  { label: "Support Phone", value: "+91 83690 29490" },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-4">
                    <label className="w-56 shrink-0 text-sm font-medium text-[#64748B]">{f.label}</label>
                    <input type="text" defaultValue={f.value}
                      className="h-9 flex-1 rounded-xl border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#2563EB]" />
                  </div>
                ))}
                <div className="flex items-start gap-4">
                  <label className="w-56 shrink-0 pt-2 text-sm font-medium text-[#64748B]">Default Commission Rate (%)</label>
                  <div className="flex-1">
                    <input type="number" min="0" max="100" value={globalCommission}
                      onChange={(e) => setGlobalCommission(e.target.value)}
                      className="h-9 w-full rounded-xl border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#2563EB]" />
                    <p className="mt-1 text-xs text-[#94A3B8]">
                      Applies to every category unless it has its own rate — see{" "}
                      <Link to="/admin/commissions" className="font-semibold text-[#2563EB] hover:underline">Commission Management</Link>.
                    </p>
                  </div>
                </div>
                {[
                  { label: "Settlement Window (days)", value: "7" },
                  { label: "GST Rate on Commission", value: "18%" },
                  { label: "TDS Rate", value: "2%" },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-4">
                    <label className="w-56 shrink-0 text-sm font-medium text-[#64748B]">{f.label}</label>
                    <input type="text" defaultValue={f.value}
                      className="h-9 flex-1 rounded-xl border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#2563EB]" />
                  </div>
                ))}
              </div>
              <button onClick={handleSaveCommission} disabled={commissionSaving}
                className="mt-5 flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1d4ed8] disabled:opacity-60">
                <Save size={14} /> {commissionSaving ? "Saving…" : "Save Platform Settings"}
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
