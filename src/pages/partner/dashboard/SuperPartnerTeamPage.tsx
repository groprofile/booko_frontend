import { useState, useEffect } from "react";
import { Plus, X, Check, ChevronDown } from "lucide-react";
import SuperPartnerLayout from "../../../components/partner/SuperPartnerLayout";
import { apiGet, apiPost, getVendorToken } from "../../../lib/api";

interface ApiStaff {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  center_id: string;
  created_at?: string;
  centers?: { center_name?: string };
}

interface ApiCenter {
  id: string;
  center_name: string;
  city?: string;
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-slate-100 text-slate-500",
  pending: "bg-amber-100 text-amber-700",
};

interface AddLoginModalProps {
  centers: ApiCenter[];
  onClose: () => void;
  onCreated: () => void;
}

function AddLoginModal({ centers, onClose, onCreated }: AddLoginModalProps) {
  const [selectedCenter, setSelectedCenter] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!selectedCenter || !name.trim() || !email.trim() || !password.trim()) return;
    setSaving(true);
    setError("");
    try {
      const token = getVendorToken() ?? undefined;
      await apiPost(
        "/vendor/staff",
        { centreId: selectedCenter, name, email, phone: phone || undefined, password },
        token,
      );
      setSuccess(true);
      onCreated();
    } catch (err) {
      setError((err as Error).message ?? "Failed to create login");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <h3 className="text-sm font-bold text-[#0F172A]">Add Center Manager</h3>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#0F172A] transition-colors">
            <X size={16} />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-3 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <Check size={24} className="text-emerald-600" />
            </div>
            <p className="text-sm font-bold text-[#0F172A]">Manager Created!</p>
            <p className="text-xs text-[#64748B]">
              Login credentials set for <span className="font-semibold text-[#0F172A]">{email}</span>
            </p>
            <button
              onClick={onClose}
              className="mt-2 rounded-xl bg-[#2563EB] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-6">
            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-2.5 text-xs text-red-600">{error}</p>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">Select Center</label>
              <div className="relative">
                <select
                  value={selectedCenter}
                  onChange={(e) => setSelectedCenter(e.target.value)}
                  className="w-full appearance-none bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl pl-4 pr-8 py-2.5 text-sm outline-none text-[#0F172A] cursor-pointer"
                >
                  <option value="">Choose a center…</option>
                  {centers.map((c) => (
                    <option key={c.id} value={c.id}>{c.center_name}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">Manager Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl px-4 py-2.5 text-sm outline-none text-[#0F172A] placeholder:text-[#94A3B8]"
              />
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

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">Phone (optional)</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                type="tel"
                className="bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl px-4 py-2.5 text-sm outline-none text-[#0F172A] placeholder:text-[#94A3B8]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                type="password"
                className="bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl px-4 py-2.5 text-sm outline-none text-[#0F172A] placeholder:text-[#94A3B8]"
              />
            </div>

            <button
              onClick={handleCreate}
              disabled={!selectedCenter || !name.trim() || !email.trim() || !password.trim() || saving}
              className="w-full rounded-xl bg-[#2563EB] py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Creating…" : "Create Login"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SuperPartnerTeamPage() {
  const [staff, setStaff] = useState<ApiStaff[]>([]);
  const [centers, setCenters] = useState<ApiCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  function load() {
    const token = getVendorToken() ?? undefined;
    setLoading(true);
    Promise.all([
      apiGet<ApiStaff[]>("/vendor/staff", token),
      apiGet<ApiCenter[]>("/vendor/centers", token),
    ])
      .then(([s, c]) => {
        setStaff(s ?? []);
        setCenters(c ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <SuperPartnerLayout title="Team &amp; Center Access" subtitle="Manage login credentials for each center">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#0F172A]">Center Managers</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
        >
          <Plus size={14} />
          Add Manager
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-xs font-semibold text-blue-800">Access Control</p>
        <p className="mt-0.5 text-xs text-blue-600">
          Each center has its own manager login. Managers can only see their assigned center's bookings and check-in data.
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                <th className="px-5 py-3.5 text-left font-semibold text-[#64748B]">Manager</th>
                <th className="px-4 py-3.5 text-left font-semibold text-[#64748B]">Center</th>
                <th className="px-4 py-3.5 text-left font-semibold text-[#64748B]">Login Email</th>
                <th className="px-4 py-3.5 text-left font-semibold text-[#64748B]">Phone</th>
                <th className="px-4 py-3.5 text-left font-semibold text-[#64748B]">Created</th>
                <th className="px-4 py-3.5 text-left font-semibold text-[#64748B]">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-[#94A3B8]">Loading…</td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-[#94A3B8]">
                    No managers yet. Add one to give center-level access.
                  </td>
                </tr>
              ) : (
                staff.map((s) => (
                  <tr key={s.id} className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#0F172A]">{s.name}</p>
                      <p className="text-[10px] text-[#94A3B8] capitalize">{s.role.replace("_", " ")}</p>
                    </td>
                    <td className="px-4 py-4 text-[#64748B]">
                      {s.centers?.center_name ?? "—"}
                    </td>
                    <td className="px-4 py-4">
                      <code className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 font-mono text-[11px] text-[#0F172A]">
                        {s.email}
                      </code>
                    </td>
                    <td className="px-4 py-4 text-[#64748B]">{s.phone ?? "—"}</td>
                    <td className="px-4 py-4 text-[#64748B]">
                      {s.created_at
                        ? new Date(s.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[s.status] ?? "bg-slate-100 text-slate-500"}`}>
                        {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <h3 className="text-xs font-bold text-[#0F172A]">Access Policy</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {[
            { title: "Center Manager Login", desc: "Can view only their center's bookings and perform OTP check-ins. Cannot access other centers or super-partner settings." },
            { title: "Super Partner", desc: "Full access across all centers. Can create center managers and view consolidated reports." },
            { title: "Password Reset", desc: "Contact your admin to reset a manager's password via PATCH /vendor/staff/:id/credentials." },
          ].map((item) => (
            <div key={item.title} className="rounded-xl bg-[#F8FAFC] p-3">
              <p className="text-[11px] font-bold text-[#0F172A]">{item.title}</p>
              <p className="mt-1 text-[10px] leading-relaxed text-[#64748B]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <AddLoginModal
          centers={centers}
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            load();
          }}
        />
      )}
    </SuperPartnerLayout>
  );
}
