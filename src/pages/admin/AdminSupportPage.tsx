import { useState } from "react";
import { Search, MessageSquare, CheckCircle, UserCheck, X } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import StatusBadge from "../../components/admin/StatusBadge";
import { useAdmin, type SupportTicket, type TicketStatus, type TicketPriority } from "../../context/AdminContext";

const TYPE_LABELS: Record<string, string> = {
  booking_issue: "Booking Issue", payment_issue: "Payment Issue", refund_issue: "Refund Issue",
  vendor_issue: "Vendor Issue", kyc_issue: "KYC Issue", complaint: "Complaint", general: "General",
};

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const PRIORITY_ORDER: Record<TicketPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

export default function AdminSupportPage() {
  const { tickets, closeTicket, assignTicket, admin } = useAdmin();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");

  const filtered = tickets.filter((t) => {
    const q = search.toLowerCase();
    const matchQ = !q || t.customerName.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
    const matchS = statusFilter === "all" || t.status === statusFilter;
    return matchQ && matchS;
  }).sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length;

  return (
    <AdminLayout title="Support Dashboard" subtitle={`${openCount} open · ${inProgressCount} in progress`}>
      {/* KPIs */}
      <div className="mb-5 grid grid-cols-4 gap-3">
        {[
          { label: "Open", value: openCount, color: "#D97706", bg: "#FEF3C7" },
          { label: "In Progress", value: inProgressCount, color: "#2563EB", bg: "#EFF6FF" },
          { label: "Resolved", value: resolvedCount, color: "#16A34A", bg: "#DCFCE7" },
          { label: "Total Tickets", value: tickets.length, color: "#64748B", bg: "#F1F5F9" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm text-center">
            <p className="text-2xl font-extrabold" style={{ color: m.color }}>{m.value}</p>
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
            {filtered.map((t) => (
              <button key={t.id} onClick={() => setSelected(t)}
                className={`w-full rounded-xl border p-4 text-left transition-all ${selected?.id === t.id ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1]"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={t.priority} size="sm" />
                      <span className="text-[10px] text-[#94A3B8]">{TYPE_LABELS[t.type]}</span>
                    </div>
                    <p className="truncate text-xs font-semibold text-[#0F172A]">{t.subject}</p>
                    <p className="mt-0.5 text-[11px] text-[#94A3B8]">{t.customerName} · {timeAgo(t.createdAt)}</p>
                  </div>
                  <StatusBadge status={t.status} size="sm" />
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
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
                  <span className="font-mono text-xs font-bold text-[#2563EB]">{selected.id}</span>
                  <StatusBadge status={selected.priority} size="sm" />
                  <StatusBadge status={selected.status} size="sm" />
                </div>
                <p className="font-bold text-[#0F172A]">{selected.subject}</p>
              </div>
              <button onClick={() => setSelected(null)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#F1F5F9]">
                <X size={14} className="text-[#64748B]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {/* Customer info */}
              <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl bg-[#F8FAFC] p-4 text-xs">
                {[
                  { label: "Customer", value: selected.customerName },
                  { label: "Email", value: selected.customerEmail },
                  { label: "Mobile", value: selected.customerMobile },
                  { label: "Booking ID", value: selected.bookingId ?? "—" },
                  { label: "Ticket Type", value: TYPE_LABELS[selected.type] },
                  { label: "Assigned To", value: selected.assignedTo ?? "Unassigned" },
                ].map((r) => (
                  <div key={r.label}>
                    <p className="text-[#94A3B8]">{r.label}</p>
                    <p className="mt-0.5 font-semibold text-[#0F172A]">{r.value}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="mb-4 rounded-xl border border-[#E2E8F0] p-4">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Issue Description</p>
                <p className="text-sm text-[#0F172A] leading-relaxed">{selected.description}</p>
                <p className="mt-2 text-[11px] text-[#94A3B8]">Reported: {new Date(selected.createdAt).toLocaleString("en-IN")}</p>
              </div>

              {/* Reply box */}
              <div className="mb-4">
                <label className="mb-2 block text-xs font-bold text-[#0F172A]">Reply to Customer</label>
                <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={3}
                  placeholder="Type your response here…"
                  className="w-full rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm outline-none focus:border-[#2563EB] resize-none" />
                <div className="mt-2 flex gap-2">
                  <button className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-3 py-2 text-xs font-bold text-white hover:bg-[#1d4ed8]">
                    <MessageSquare size={12} /> Send Reply
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {selected.status !== "in_progress" && admin && (
                  <button onClick={() => assignTicket(selected.id, admin.name)}
                    className="flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] px-3 py-2 text-xs font-bold text-[#0F172A] hover:bg-[#F8FAFC]">
                    <UserCheck size={12} /> Assign to Me
                  </button>
                )}
                {selected.status !== "closed" && (
                  <button onClick={() => { closeTicket(selected.id); setSelected(null); }}
                    className="flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] px-3 py-2 text-xs font-bold text-[#16A34A] hover:bg-[#DCFCE7]">
                    <CheckCircle size={12} /> Close Ticket
                  </button>
                )}
                <button className="flex items-center gap-1.5 rounded-xl border border-[#FCA5A5] px-3 py-2 text-xs font-bold text-[#DC2626] hover:bg-[#FEE2E2]">
                  Escalate
                </button>
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
