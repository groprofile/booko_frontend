import { useState, useEffect } from "react";
import { ScrollText, Search, User, Building2 } from "lucide-react";
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
  created_at: string;
}

const PER_PAGE = 50;

// The audit-log union only ever emits these two resource types today.
const RESOURCE_ICONS: Record<string, React.ElementType> = {
  vendor: Building2,
  user: User,
};

const RESOURCE_FILTERS = [
  { label: "All", value: "all" },
  { label: "Vendors", value: "vendor" },
  { label: "Users", value: "user" },
] as const;

const ACTION_STYLE: Record<string, string> = {
  create: "bg-emerald-100 text-emerald-700",
  update: "bg-blue-100 text-blue-700",
  delete: "bg-red-100 text-red-700",
  approve: "bg-violet-100 text-violet-700",
  reject: "bg-orange-100 text-orange-700",
  active: "bg-emerald-100 text-emerald-700",
  blocked: "bg-red-100 text-red-700",
  suspended: "bg-orange-100 text-orange-700",
};

function getActionStyle(action: string): string {
  const key = Object.keys(ACTION_STYLE).find((k) => action.toLowerCase().includes(k));
  return key ? ACTION_STYLE[key] : "bg-slate-100 text-slate-600";
}

function fmtDate(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  };
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [resourceFilter, setResourceFilter] = useState<"all" | "vendor" | "user">("all");

  useEffect(() => {
    const token = getAdminToken() ?? undefined;
    setLoading(true);
    apiGet<{ logs: AuditLog[]; total: number }>(`/admin/audit-logs?page=${page}&limit=${PER_PAGE}`, token)
      .then((data) => {
        setLogs(data.logs ?? []);
        setTotal(data.total ?? 0);
      })
      .catch((err) => setError((err as Error).message ?? "Failed to load audit logs"))
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const filtered = logs.filter((log) => {
    if (resourceFilter !== "all" && log.resource_type !== resourceFilter) return false;
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
          { label: "Total Actions", value: total },
          { label: "Today (this page)", value: logs.filter((l) => new Date(l.created_at).toDateString() === new Date().toDateString()).length },
          { label: "This Week (this page)", value: logs.filter((l) => Date.now() - new Date(l.created_at).getTime() < 7 * 24 * 60 * 60 * 1000).length },
          { label: "Unique Actors (this page)", value: new Set(logs.map((l) => l.actor_id)).size },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
            <p className="text-xs text-[#64748B]">{m.label}</p>
            <p className="mt-2 text-xl font-extrabold text-[#2563EB]">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, actor, or resource…"
            className="w-full rounded-xl border border-[#E2E8F0] bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 text-[#0F172A] placeholder:text-[#94A3B8] shadow-sm"
          />
        </div>
        {RESOURCE_FILTERS.map((f) => (
          <button key={f.value} onClick={() => setResourceFilter(f.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              resourceFilter === f.value
                ? "bg-[#2563EB] text-white"
                : "border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#2563EB]"
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
        {!loading && filtered.length === 0 ? (
          <div className="py-16 text-center">
            <ScrollText size={32} className="mx-auto text-[#E2E8F0]" />
            <p className="mt-3 text-sm font-semibold text-[#0F172A]">No logs found</p>
            <p className="mt-1 text-xs text-[#94A3B8]">{search || resourceFilter !== "all" ? "Try a different search or filter" : "No audit logs recorded yet"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-sm">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                  {["Timestamp", "Actor", "Action", "Resource", "Description"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#64748B]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-[#F8FAFC]">
                      <td className="px-4 py-3">
                        <div className="h-3 w-20 animate-pulse rounded bg-[#E2E8F0]" />
                        <div className="mt-1.5 h-2.5 w-12 animate-pulse rounded bg-[#E2E8F0]" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 shrink-0 animate-pulse rounded-full bg-[#E2E8F0]" />
                          <div className="h-3 w-24 animate-pulse rounded bg-[#E2E8F0]" />
                        </div>
                      </td>
                      {Array.from({ length: 3 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-3 w-20 animate-pulse rounded bg-[#E2E8F0]" /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.map((log) => {
                  const ResourceIcon = RESOURCE_ICONS[log.resource_type] ?? ScrollText;
                  const { date, time } = fmtDate(log.created_at);
                  return (
                    <tr key={log.id} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3 text-xs text-[#64748B] whitespace-nowrap">
                        <p>{date}</p>
                        <p className="text-[10px] text-[#94A3B8]">{time}</p>
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
                      <td className="px-4 py-3 max-w-[320px]">
                        <p className="truncate text-xs text-[#64748B]" title={log.description ?? undefined}>{log.description ?? "—"}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#F1F5F9] px-4 py-3">
            <p className="text-xs text-[#94A3B8]">{total} actions · Page {page} of {totalPages}</p>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`h-7 w-7 rounded-lg text-xs font-medium ${page === i + 1 ? "bg-[#2563EB] text-white" : "text-[#64748B] hover:bg-[#F1F5F9]"}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
