import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Percent, Pencil, X, Check, ArrowRight, Settings } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import StatusBadge from "../../components/admin/StatusBadge";
import { showToast } from "../../components/admin/Toast";
import { apiGet, apiPatch, getAdminToken, ApiError } from "../../lib/api";

interface Category {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
  commission_percent: string | number | null;
}

export default function AdminCommissionsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalRate, setGlobalRate] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    apiGet<Category[]>("/admin/categories", token)
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
    apiGet<{ rate_percent: string }>("/admin/commission-config", token)
      .then((r) => setGlobalRate(Number(r.rate_percent)))
      .catch(console.error);
  }, []);

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditValue(cat.commission_percent != null ? String(cat.commission_percent) : "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue("");
  }

  async function handleSave(categoryId: string) {
    const token = getAdminToken();
    if (!token) return;
    const trimmed = editValue.trim();
    const commissionPercent = trimmed === "" ? null : Number(trimmed);
    if (commissionPercent !== null && (isNaN(commissionPercent) || commissionPercent < 0 || commissionPercent > 100)) {
      showToast("Enter a value between 0 and 100, or leave blank to clear", "error");
      return;
    }
    setSaving(categoryId);
    try {
      await apiPatch(`/admin/categories/${categoryId}/commission`, { commissionPercent }, token);
      showToast("Commission rate updated", "success");
      setCategories((prev) => prev.map((c) => c.id === categoryId ? { ...c, commission_percent: commissionPercent } : c));
      setEditingId(null);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to update commission", "error");
    } finally {
      setSaving(null);
    }
  }

  return (
    <AdminLayout title="Commission Management" subtitle="Set commission rates per category">
      {/* Hierarchy explainer + platform default */}
      <div className="mb-5 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[#64748B]">
              Commission resolves in order: a center's own override wins first, then its
              category's rate below, then the platform default.
            </p>
            <Link to="/admin/centers" className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline">
              Manage per-center overrides <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-[#F8FAFC] px-4 py-2.5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">Platform Default</p>
              <p className="text-lg font-extrabold text-[#0F172A]">{globalRate != null ? `${globalRate}%` : "—"}</p>
            </div>
            <Link to="/admin/settings" className="flex items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB]">
              <Settings size={11} /> Manage
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                {["Category", "Slug", "Status", "Commission Rate", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#64748B]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#F8FAFC]">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-3 w-20 animate-pulse rounded bg-[#E2E8F0]" /></td>
                    ))}
                  </tr>
                ))
              ) : categories.map((cat) => (
                <tr key={cat.id} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF]">
                        <Percent size={13} className="text-[#2563EB]" />
                      </div>
                      <p className="font-semibold text-[#0F172A]">{cat.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#64748B]">{cat.slug}</td>
                  <td className="px-4 py-3"><StatusBadge status={cat.is_active ? "active" : "inactive"} size="sm" /></td>
                  <td className="px-4 py-3">
                    {editingId === cat.id ? (
                      <input
                        type="number" min="0" max="100" autoFocus
                        placeholder="Platform default"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-8 w-32 rounded-lg border border-[#E2E8F0] px-2.5 text-xs outline-none focus:border-[#2563EB]"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-[#0F172A]">
                        {cat.commission_percent != null
                          ? `${cat.commission_percent}%`
                          : <span className="font-normal text-[#94A3B8]">Platform default{globalRate != null ? ` (${globalRate}%)` : ""}</span>}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === cat.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleSave(cat.id)} disabled={saving === cat.id}
                          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#DCFCE7] text-[#16A34A] disabled:opacity-50" title="Save">
                          <Check size={13} />
                        </button>
                        <button onClick={cancelEdit} disabled={saving === cat.id}
                          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#F1F5F9] text-[#64748B] disabled:opacity-50" title="Cancel">
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(cat)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#EFF6FF] text-[#2563EB]" title="Edit">
                        <Pencil size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && categories.length === 0 && (
            <div className="py-16 text-center text-sm text-[#94A3B8]">No categories found.</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
