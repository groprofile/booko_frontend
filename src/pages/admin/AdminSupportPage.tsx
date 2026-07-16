import { useCallback, useEffect, useState } from "react";
import { Search, CheckCircle, X, Loader2, PlayCircle } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import StatusBadge from "../../components/admin/StatusBadge";
import { showToast } from "../../components/admin/Toast";
import { apiGet, apiPatch, getAdminToken, ApiError } from "../../lib/api";

const TYPE_LABELS: Record<string, string> = {
  booking_issue: "Booking Issue", payment_issue: "Payment Issue", refund_issue: "Refund Issue",
  vendor_issue: "Vendor Issue", kyc_issue: "KYC Issue", complaint: "Complaint", general: "General",
};

interface Ticket {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  user_id?: string | null;
  vendor_id?: string | null;
  created_at: string;
  updated_at?: string;
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Ticket["status"] | "all">("all");
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(() => {
    const token = getAdminToken();
    if (!token) return;
    setLoading(true);
    apiGet<{ tickets: Ticket[] }>("/admin/support/tickets?limit=100", token)
      .then((r) => setTickets(r.tickets ?? []))
      .catch((err) => showToast(err instanceof ApiError ? err.message : "Failed to load tickets", "error"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(ticket: Ticket, status: Ticket["status"]) {
    const token = getAdminToken();
    if (!token) return;
    setUpdating(true);
    try {
      await apiPatch(`/support/tickets/${ticket.id}`, { status }, token);
      showToast(`Ticket marked ${status.replace(/_/g, " ")}`, "success");
      setTickets((prev) => prev.map((t) => (t.id === ticket.id ? { ...t, status } : t)));
      setSelected((prev) => (prev && prev.id === ticket.id ? { ...prev, status } : prev));
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to update ticket", "error");
    } finally {
      setUpdating(false);
    }
  }

  const filtered = tickets.filter((t) => {
    const q = search.toLowerCase();
    const matchQ = !q || t.name.toLowerCase().includes(q) || t.message.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
    const matchS = statusFilter === "all" || t.status === statusFilter;
    return matchQ && matchS;
  });

  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length;

  return (
    <AdminLayout title="Support Dashboard" subtitle={`${openCount} open · ${inProgressCount} in progress`}>
      {/* KPIs */}
      <div className="mb-5 grid grid-cols-4 gap-3">
        {[
          { label: "Open", value: openCount, color: "#D97706" },
          { label: "In Progress", value: inProgressCount, color: "#2563EB" },
          { label: "Resolved", value: resolvedCount, color: "#16A34A" },
          { label: "Total Tickets", value: tickets.length, color: "#64748B" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm text-center">
            <p className="text-2xl font-extrabold" style={{ color: m.color }}>{loading ? "—" : m.value}</p>
            <p className="mt-1 text-xs text-[#64748B]">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-5">
        {/* Ticket list */}
        <div className="flex w-[380px] shrink-0 flex-col gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets…"
              className="h-9 w-full rounded-xl border border-[#E2E8F0] bg-white pl-9 pr-4 text-sm outline-none focus:border-[#2563EB]" />
          </div>
          <div className="flex gap-1.5">
            {(["all", "open", "in_progress", "resolved", "closed"] as const).map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${statusFilter === s ? "bg-[#2563EB] text-white" : "border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#2563EB]"}`}>
                {s === "all" ? "All" : s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-320px)]">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-[#E2E8F0] bg-white p-4">
                  <div className="h-3 w-32 animate-pulse rounded bg-[#E2E8F0]" />
                  <div className="mt-2 h-2.5 w-48 animate-pulse rounded bg-[#E2E8F0]" />
                </div>
              ))
            ) : (
              filtered.map((t) => (
                <button key={t.id} onClick={() => setSelected(t)}
                  className={`w-full rounded-xl border p-4 text-left transition-all ${selected?.id === t.id ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1]"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold text-[#64748B]">{TYPE_LABELS[t.type] ?? t.type}</span>
                      </div>
                      <p className="truncate text-xs font-semibold text-[#0F172A]">{t.message}</p>
                      <p className="mt-0.5 text-[11px] text-[#94A3B8]">{t.name} · {timeAgo(t.created_at)}</p>
                    </div>
                    <StatusBadge status={t.status} size="sm" />
                  </div>
                </button>
              ))
            )}
            {!loading && filtered.length === 0 && (
              <p className="py-8 text-center text-xs text-[#94A3B8]">No tickets match the filter.</p>
            )}
          </div>
        </div>

        {/* Ticket detail */}
        {selected ? (
          <div className="flex flex-1 flex-col rounded-2xl border border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
            <div className="flex items-start justify-between border-b border-[#F1F5F9] px-5 py-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-[#2563EB]">{selected.id.slice(0, 8)}</span>
                  <StatusBadge status={selected.status} size="sm" />
                </div>
                <p className="font-bold text-[#0F172A]">{TYPE_LABELS[selected.type] ?? selected.type}</p>
              </div>
              <button onClick={() => setSelected(null)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                <X size={14} className="text-[#64748B]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {/* Customer info */}
              <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl bg-[#F8FAFC] p-4 text-xs">
                {[
                  { label: "Name", value: selected.name },
                  { label: "Email", value: selected.email ?? "—" },
                  { label: "Mobile", value: selected.phone ?? "—" },
                  { label: "Raised By", value: selected.vendor_id ? "Vendor" : "Customer" },
                ].map((r) => (
                  <div key={r.label}>
                    <p className="text-[#94A3B8]">{r.label}</p>
                    <p className="mt-0.5 font-semibold text-[#0F172A]">{r.value}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="mb-4 rounded-xl border border-[#E2E8F0] p-4">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Message</p>
                <p className="text-sm text-[#0F172A] leading-relaxed">{selected.message}</p>
                <p className="mt-2 text-[11px] text-[#94A3B8]">Reported: {new Date(selected.created_at).toLocaleString("en-IN")}</p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {selected.status === "open" && (
                  <button onClick={() => setStatus(selected, "in_progress")} disabled={updating}
                    className="flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] px-3 py-2 text-xs font-bold text-[#2563EB] hover:bg-[#EFF6FF] disabled:opacity-50">
                    {updating ? <Loader2 size={12} className="animate-spin" /> : <PlayCircle size={12} />} Start Working
                  </button>
                )}
                {(selected.status === "open" || selected.status === "in_progress") && (
                  <button onClick={() => setStatus(selected, "resolved")} disabled={updating}
                    className="flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] px-3 py-2 text-xs font-bold text-[#16A34A] hover:bg-[#DCFCE7] disabled:opacity-50">
                    <CheckCircle size={12} /> Mark Resolved
                  </button>
                )}
                {selected.status !== "closed" && (
                  <button onClick={() => setStatus(selected, "closed")} disabled={updating}
                    className="flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] px-3 py-2 text-xs font-bold text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-50">
                    <X size={12} /> Close Ticket
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-[#E2E8F0] bg-white">
            <p className="text-sm text-[#94A3B8]">Select a ticket to view details</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
