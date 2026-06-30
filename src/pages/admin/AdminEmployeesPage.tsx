import { useState, useEffect } from "react";
import { Users, Plus, ShieldCheck, X, Check, Loader2, Mail } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { apiGet, apiPost, getAdminToken } from "../../lib/api";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
  permissions?: string[];
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  operations_admin: "Operations",
  finance_admin: "Finance",
  support_admin: "Support",
  sales_admin: "Sales",
  content_admin: "Content",
};

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  super_admin: { bg: "#EFF6FF", text: "#2563EB" },
  operations_admin: { bg: "#ECFDF5", text: "#059669" },
  finance_admin: { bg: "#F5F3FF", text: "#7C3AED" },
  support_admin: { bg: "#FEF3C7", text: "#D97706" },
  sales_admin: { bg: "#FEE2E2", text: "#DC2626" },
  content_admin: { bg: "#F1F5F9", text: "#64748B" },
};

const INPUT_CLS = "bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl px-4 py-2.5 text-sm outline-none text-[#0F172A] placeholder:text-[#94A3B8] w-full";

interface CreateModalProps {
  onClose: () => void;
  onCreated: () => void;
}

function CreateEmployeeModal({ onClose, onCreated }: CreateModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "operations_admin",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(key: keyof typeof form, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleCreate() {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) return;
    setSaving(true);
    setError("");
    try {
      const token = getAdminToken() ?? undefined;
      await apiPost("/admin/employees", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      }, token);
      onCreated();
    } catch (err) {
      setError((err as Error).message ?? "Failed to create employee");
    } finally {
      setSaving(false);
    }
  }

  const canSubmit = form.name.trim() && form.email.trim() && form.password.trim() && !saving;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Users size={15} className="text-[#2563EB]" />
            <h3 className="text-sm font-bold text-[#0F172A]">Add Admin Employee</h3>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#0F172A]"><X size={15} /></button>
        </div>
        <div className="p-6 space-y-4">
          {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-xs text-red-600">{error}</p>}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#0F172A]">Full Name *</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Priya Sharma" className={INPUT_CLS} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#0F172A]">Email *</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
              placeholder="employee@bokkoapp.com" className={INPUT_CLS} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#0F172A]">Password *</label>
            <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)}
              placeholder="Minimum 8 characters" className={INPUT_CLS} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#0F172A]">Role *</label>
            <select value={form.role} onChange={(e) => set("role", e.target.value)}
              className={INPUT_CLS}>
              {Object.entries(ROLE_LABELS).filter(([k]) => k !== "super_admin").map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose}
              className="flex-1 rounded-xl border border-[#E2E8F0] py-2.5 text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
              Cancel
            </button>
            <button onClick={handleCreate} disabled={!canSubmit}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors disabled:opacity-50">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              {saving ? "Creating…" : "Create Employee"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  function load() {
    const token = getAdminToken() ?? undefined;
    apiGet<Employee[]>("/admin/employees", token)
      .then((data) => setEmployees(data ?? []))
      .catch((err) => setError((err as Error).message ?? "Failed to load employees"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  const activeCount = employees.filter((e) => e.is_active).length;

  return (
    <AdminLayout title="Admin Employees" subtitle="Manage sub-admin accounts and their permissions">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-[#0F172A]">
            Team Members{" "}
            <span className="ml-1 rounded-full bg-[#E2E8F0] px-2 py-0.5 text-xs text-[#64748B]">{employees.length}</span>
          </h2>
          {activeCount > 0 && (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">{activeCount} active</span>
          )}
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors">
          <Plus size={14} /> Add Employee
        </button>
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      {loading ? (
        <div className="py-16 text-center text-sm text-[#94A3B8]">Loading employees…</div>
      ) : employees.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E2E8F0] p-12 text-center">
          <Users size={32} className="mx-auto text-[#E2E8F0]" />
          <p className="mt-3 text-sm font-semibold text-[#0F172A]">No employees yet</p>
          <p className="mt-1 text-xs text-[#94A3B8]">Add your first sub-admin to delegate responsibilities.</p>
          <button onClick={() => setShowModal(true)}
            className="mt-4 mx-auto flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors">
            <Plus size={14} /> Add Employee
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                  {["Employee", "Role", "Status", "Last Login", "Created"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#64748B]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const roleStyle = ROLE_COLORS[emp.role] ?? { bg: "#F1F5F9", text: "#64748B" };
                  return (
                    <tr key={emp.id} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                            style={{ backgroundColor: roleStyle.text }}>
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-[#0F172A]">{emp.name}</p>
                            <p className="flex items-center gap-1 text-xs text-[#94A3B8]">
                              <Mail size={10} /> {emp.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold w-fit"
                          style={{ backgroundColor: roleStyle.bg, color: roleStyle.text }}>
                          <ShieldCheck size={11} />
                          {ROLE_LABELS[emp.role] ?? emp.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          emp.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}>
                          {emp.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#64748B]">
                        {emp.last_login ? emp.last_login.slice(0, 10) : "Never"}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#64748B]">{emp.created_at.slice(0, 10)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <CreateEmployeeModal
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); load(); }}
        />
      )}
    </AdminLayout>
  );
}
