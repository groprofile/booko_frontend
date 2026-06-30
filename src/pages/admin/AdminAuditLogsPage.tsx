import { useState, useEffect } from "react";
import { ScrollText, Search, Shield, User, Building2, CreditCard, Settings } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { apiGet, getAdminToken } from "../../lib/api";

interface AuditLog {
  id: string;
  actor_id: string;
  actor_name?: string;
  actor_role?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  description?: string;
  ip_address?: string;
  created_at: string;
}

const RESOURCE_ICONS: Record<string, React.ElementType> = {
  vendor: Building2,
  center: Building2,
  user: User,
  payment: CreditCard,
  admin: Shield,
  settings: Settings,
};

const ACTION_STYLE: Record<string, string> = {
  create: "bg-emerald-100 text-emerald-700",
  update: "bg-blue-100 text-blue-700",
  delete: "bg-red-100 text-red-700",
  approve: "bg-violet-100 text-violet-700",
  reject: "bg-orange-100 text-orange-700",
  login: "bg-slate-100 text-slate-600",
};

function getActionStyle(action: string): string {
  const key = Object.keys(ACTION_STYLE).find((k) => action.toLowerCase().includes(k));
  return key ? ACTION_STYLE[key] : "bg-slate-100 text-slate-600";
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = getAdminToken() ?? undefined;
    apiGet<AuditLog[]>("/admin/audit-logs", token)
      .then((data) => setLogs(data ?? []))
      .catch((err) => setError((err as Error).message ?? "Failed to load audit logs"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter((log) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      (log.actor_name?.toLowerCase().includes(q)) ||
      (log.description?.toLowerCase().includes(q)) ||
      log.resource_type.toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout title="Audit Logs" subtitle="Complete history of admin actions on the platform">
      {/* Stats row */}
      <div className="mb-5 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Actions", value: logs.length },
          { label: "Today", value: logs.filter((l) => l.created_at.startsWith(new Date().toISOString().slice(0, 10))).length },
          { label: "This Week", value: logs.filter((l) => {
              const d = new Date(l.created_at);
              const now = new Date();
              return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
            }).length },
          { label: "Unique Actors", value: new Set(logs.map((l) => l.actor_id)).size },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
            <p className="text-xs text-[#64748B]">{m.label}</p>
            <p className="mt-2 text-xl font-extrabold text-[#2563EB]">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by action, actor, or resource…"
          className="w-full rounded-xl border border-[#E2E8F0] bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 text-[#0F172A] placeholder:text-[#94A3B8] shadow-sm"
        />
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      {loading ? (
        <div className="py-16 text-center text-sm text-[#94A3B8]">Loading audit logs…</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <ScrollText size={32} className="mx-auto text-[#E2E8F0]" />
              <p className="mt-3 text-sm font-semibold text-[#0F172A]">No logs found</p>
              <p className="mt-1 text-xs text-[#94A3B8]">{search ? "Try a different search term" : "No audit logs recorded yet"}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm">
                <thead>
                  <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                    {["Timestamp", "Actor", "Action", "Resource", "Description", "IP"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#64748B]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((log) => {
                    const ResourceIcon = RESOURCE_ICONS[log.resource_type] ?? ScrollText;
                    return (
                      <tr key={log.id} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-4 py-3 text-xs text-[#64748B] whitespace-nowrap">
                          <p>{log.created_at.slice(0, 10)}</p>
                          <p className="text-[10px] text-[#94A3B8]">{log.created_at.slice(11, 19)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-xs font-bold text-[#2563EB]">
                              {(log.actor_name ?? "?").charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-[#0F172A]">{log.actor_name ?? log.actor_id.slice(0, 8)}</p>
                              {log.actor_role && <p className="text-[10px] text-[#94A3B8] capitalize">{log.actor_role.replace(/_/g, " ")}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${getActionStyle(log.action)}`}>
                            {log.action.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5 text-xs text-[#64748B]">
                            <ResourceIcon size={12} className="shrink-0" />
                            <span className="capitalize">{log.resource_type}</span>
                            {log.resource_id && (
                              <span className="font-mono text-[10px] text-[#94A3B8]">{log.resource_id.slice(0, 8)}</span>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-[250px]">
                          <p className="truncate text-xs text-[#64748B]">{log.description ?? "—"}</p>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-[#94A3B8]">{log.ip_address ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
