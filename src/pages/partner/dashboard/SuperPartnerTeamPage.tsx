import { useState } from "react";
import { Plus, Eye, EyeOff, RefreshCw, ToggleLeft, ToggleRight, X, Check, ChevronDown } from "lucide-react";
import SuperPartnerLayout from "../../../components/partner/SuperPartnerLayout";

type LoginStatus = "active" | "inactive" | "pending";

interface CenterLogin {
  id: string;
  center: string;
  city: string;
  email: string | null;
  lastLogin: string | null;
  status: LoginStatus;
  centerId: string;
}

const LOGINS: CenterLogin[] = [
  { id: "l1", center: "WeWork BKC", city: "Mumbai", email: "bkc@bokkopartner.com", lastLogin: "25 Jun 2024, 09:14 AM", status: "active", centerId: "c1" },
  { id: "l2", center: "91Springboard HSR", city: "Bangalore", email: "hsr@bokkopartner.com", lastLogin: "24 Jun 2024, 02:30 PM", status: "active", centerId: "c2" },
  { id: "l3", center: "Smartworks Cyber City", city: "Gurgaon", email: "cyber@bokkopartner.com", lastLogin: "23 Jun 2024, 11:05 AM", status: "inactive", centerId: "c3" },
  { id: "l4", center: "The Hive Powai", city: "Mumbai", email: null, lastLogin: null, status: "pending", centerId: "c4" },
];

const STATUS_STYLES: Record<LoginStatus, string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-slate-100 text-slate-500",
  pending: "bg-amber-100 text-amber-700",
};

const STATUS_LABELS: Record<LoginStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  pending: "Pending Setup",
};

const FAKE_PASSWORD = "Center@2024";

interface RowState {
  passwordVisible: boolean;
  resetSuccess: boolean;
  enabled: boolean;
}

interface AddLoginModalProps {
  onClose: () => void;
}

function AddLoginModal({ onClose }: AddLoginModalProps) {
  const [selectedCenter, setSelectedCenter] = useState("");
  const [email, setEmail] = useState("");
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [success, setSuccess] = useState(false);

  const CENTERS = [
    { id: "c1", name: "WeWork BKC" },
    { id: "c2", name: "91Springboard HSR" },
    { id: "c3", name: "Smartworks Cyber City" },
    { id: "c4", name: "The Hive Powai" },
  ];

  function handleCreate() {
    if (!selectedCenter || !email.trim()) return;
    setSuccess(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <h3 className="text-sm font-bold text-[#0F172A]">Add Center Login</h3>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#0F172A] transition-colors">
            <X size={16} />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-3 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <Check size={24} className="text-emerald-600" />
            </div>
            <p className="text-sm font-bold text-[#0F172A]">Login Created!</p>
            <p className="text-xs text-[#64748B]">
              Credentials have been sent to <span className="font-semibold text-[#0F172A]">{email}</span>
            </p>
            {autoGenerate && (
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                <p className="text-[10px] text-[#94A3B8]">Generated password</p>
                <code className="font-mono text-sm font-bold text-[#0F172A]">{FAKE_PASSWORD}</code>
              </div>
            )}
            <button
              onClick={onClose}
              className="mt-2 rounded-xl bg-[#2563EB] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">Select Center</label>
              <div className="relative">
                <select
                  value={selectedCenter}
                  onChange={(e) => setSelectedCenter(e.target.value)}
                  className="w-full appearance-none bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl pl-4 pr-8 py-2.5 text-sm outline-none text-[#0F172A] cursor-pointer"
                >
                  <option value="">Choose a center...</option>
                  {CENTERS.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">Login Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@yourcompany.com"
                type="email"
                className="bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl px-4 py-2.5 text-sm outline-none text-[#0F172A] placeholder:text-[#94A3B8]"
              />
            </div>

            <button
              type="button"
              onClick={() => setAutoGenerate((v) => !v)}
              className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-left transition-colors hover:border-[#2563EB]/30"
            >
              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${autoGenerate ? "border-[#2563EB] bg-[#2563EB]" : "border-[#E2E8F0] bg-white"}`}>
                {autoGenerate && <Check size={10} className="text-white" />}
              </div>
              <div>
                <p className="text-xs font-semibold text-[#0F172A]">Auto-generate password</p>
                <p className="text-[10px] text-[#94A3B8]">A secure password will be generated and emailed</p>
              </div>
            </button>

            {!autoGenerate && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#0F172A]">Set Password</label>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  className="bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl px-4 py-2.5 text-sm outline-none text-[#0F172A] placeholder:text-[#94A3B8]"
                />
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={!selectedCenter || !email.trim()}
              className="w-full rounded-xl bg-[#2563EB] py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SuperPartnerTeamPage() {
  const [showModal, setShowModal] = useState(false);
  const [rowStates, setRowStates] = useState<Record<string, RowState>>(() =>
    Object.fromEntries(
      LOGINS.map((l) => [
        l.id,
        { passwordVisible: false, resetSuccess: false, enabled: l.status === "active" },
      ])
    )
  );

  function togglePassword(id: string) {
    setRowStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], passwordVisible: !prev[id].passwordVisible },
    }));
  }

  function resetPassword(id: string) {
    setRowStates((prev) => ({ ...prev, [id]: { ...prev[id], resetSuccess: true } }));
    setTimeout(() => {
      setRowStates((prev) => ({ ...prev, [id]: { ...prev[id], resetSuccess: false } }));
    }, 3000);
  }

  function toggleEnabled(id: string) {
    setRowStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], enabled: !prev[id].enabled },
    }));
  }

  return (
    <SuperPartnerLayout title="Team &amp; Center Access" subtitle="Manage login credentials for each center">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#0F172A]">Center Logins</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
        >
          <Plus size={14} />
          Add Center Login
        </button>
      </div>

      {/* Info card */}
      <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-xs font-semibold text-blue-800">Access Control</p>
        <p className="mt-0.5 text-xs text-blue-600">
          Each center has its own login. Center managers can only see their own center's bookings, revenue, and data — they cannot access other centers or super-partner settings.
        </p>
      </div>

      {/* Table */}
      <div className="mt-4 rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                <th className="px-5 py-3.5 text-left font-semibold text-[#64748B]">Center</th>
                <th className="px-4 py-3.5 text-left font-semibold text-[#64748B]">Login Email</th>
                <th className="px-4 py-3.5 text-left font-semibold text-[#64748B]">Password</th>
                <th className="px-4 py-3.5 text-left font-semibold text-[#64748B]">Last Login</th>
                <th className="px-4 py-3.5 text-left font-semibold text-[#64748B]">Status</th>
                <th className="px-4 py-3.5 text-center font-semibold text-[#64748B]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {LOGINS.map((login) => {
                const state = rowStates[login.id];
                const isPending = login.status === "pending";
                const isDisabled = !state.enabled;

                return (
                  <tr
                    key={login.id}
                    className={`border-b border-[#F1F5F9] last:border-0 transition-colors ${isPending || isDisabled ? "opacity-60" : "hover:bg-[#F8FAFC]"}`}
                  >
                    {/* Center */}
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#0F172A]">{login.center}</p>
                      <p className="text-[10px] text-[#94A3B8]">{login.city}</p>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-4">
                      {login.email ? (
                        <code className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 font-mono text-[11px] text-[#0F172A]">
                          {login.email}
                        </code>
                      ) : (
                        <span className="text-[#94A3B8]">Not assigned</span>
                      )}
                    </td>

                    {/* Password */}
                    <td className="px-4 py-4">
                      {login.email ? (
                        <div className="flex items-center gap-2">
                          <code className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 font-mono text-[11px] text-[#0F172A]">
                            {state.passwordVisible ? FAKE_PASSWORD : "••••••••••"}
                          </code>
                          <button
                            onClick={() => togglePassword(login.id)}
                            className="text-[#94A3B8] hover:text-[#64748B] transition-colors"
                            title={state.passwordVisible ? "Hide password" : "Show password"}
                          >
                            {state.passwordVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[#94A3B8]">—</span>
                      )}
                    </td>

                    {/* Last Login */}
                    <td className="px-4 py-4">
                      {login.lastLogin ? (
                        <span className="text-[#64748B]">{login.lastLogin}</span>
                      ) : (
                        <span className="text-[#94A3B8]">Never</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        isDisabled && !isPending
                          ? "bg-slate-100 text-slate-500"
                          : STATUS_STYLES[login.status]
                      }`}>
                        {isDisabled && !isPending ? "Disabled" : STATUS_LABELS[login.status]}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      {isPending ? (
                        <div className="flex items-center justify-center gap-2">
                          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">
                            Pending Setup
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          {/* Reset password */}
                          <button
                            onClick={() => resetPassword(login.id)}
                            title="Reset Password"
                            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                              state.resetSuccess
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB]"
                            }`}
                          >
                            {state.resetSuccess ? (
                              <>
                                <Check size={11} />
                                Sent
                              </>
                            ) : (
                              <>
                                <RefreshCw size={11} />
                                Reset
                              </>
                            )}
                          </button>

                          {/* Disable toggle */}
                          <button
                            onClick={() => toggleEnabled(login.id)}
                            title={state.enabled ? "Disable access" : "Enable access"}
                            className={`flex items-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                              state.enabled
                                ? "border-[#E2E8F0] text-[#64748B] hover:border-red-200 hover:text-red-500"
                                : "border-emerald-200 text-emerald-600 hover:border-emerald-300"
                            }`}
                          >
                            {state.enabled ? (
                              <>
                                <ToggleRight size={14} className="text-emerald-500" />
                                <span>On</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft size={14} className="text-slate-400" />
                                <span>Off</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Access Policy note */}
      <div className="mt-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <h3 className="text-xs font-bold text-[#0F172A]">Access Policy</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {[
            { title: "Center Login", desc: "Can view only their center's bookings, revenue, and listings. Cannot edit super-partner settings." },
            { title: "Super Partner", desc: "Full access across all centers. Can create/disable center logins and view consolidated reports." },
            { title: "Password Reset", desc: "Sends a reset link to the center's registered email. Old password is invalidated immediately." },
          ].map((item) => (
            <div key={item.title} className="rounded-xl bg-[#F8FAFC] p-3">
              <p className="text-[11px] font-bold text-[#0F172A]">{item.title}</p>
              <p className="mt-1 text-[10px] leading-relaxed text-[#64748B]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {showModal && <AddLoginModal onClose={() => setShowModal(false)} />}
    </SuperPartnerLayout>
  );
}
