import { useState } from "react";
import { Search, ShieldOff, Shield, Eye, Users } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import StatusBadge from "../../components/admin/StatusBadge";
import { useAdmin } from "../../context/AdminContext";

const fmt = (n: number) => n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;

export default function AdminUsersPage() {
  const { users, bookings, blockUser, unblockUser } = useAdmin();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "blocked">("all");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.mobile.includes(q) || u.city.toLowerCase().includes(q);
    const matchS = statusFilter === "all" || u.status === statusFilter;
    return matchQ && matchS;
  });

  const selectedUser = users.find((u) => u.id === selected);
  const userBookings = selectedUser ? bookings.filter((b) => b.customerId === selectedUser.id) : [];

  return (
    <AdminLayout title="User Management" subtitle={`${users.length} registered users`}>
      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, mobile, city…"
            className="h-9 w-full rounded-xl border border-[#E2E8F0] bg-white pl-9 pr-4 text-sm outline-none focus:border-[#2563EB]" />
        </div>
        {(["all", "active", "blocked"] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${statusFilter === s ? "bg-[#2563EB] text-white" : "border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#2563EB]"}`}>
            {s === "all" ? `All (${users.length})` : s === "active" ? `Active (${users.filter(u => u.status === "active").length})` : `Blocked (${users.filter(u => u.status === "blocked").length})`}
          </button>
        ))}
      </div>

      <div className="flex gap-5">
        {/* Table */}
        <div className="flex-1 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                  {["User", "City", "Bookings", "Total Spend", "Last Booking", "Signup Date", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#64748B]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}
                    onClick={() => setSelected(u.id)}
                    className={`cursor-pointer border-b border-[#F8FAFC] transition-colors ${selected === u.id ? "bg-[#EFF6FF]" : "hover:bg-[#F8FAFC]"}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0F172A] text-xs font-bold text-white">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#0F172A]">{u.name}</p>
                          <p className="text-xs text-[#94A3B8]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#64748B]">{u.city}</td>
                    <td className="px-4 py-3 text-center text-xs font-semibold text-[#0F172A]">{u.totalBookings}</td>
                    <td className="px-4 py-3 text-xs font-bold text-[#0F172A]">{fmt(u.totalSpend)}</td>
                    <td className="px-4 py-3 text-xs text-[#94A3B8]">{u.lastBookingDate ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-[#94A3B8]">{u.signupDate}</td>
                    <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); setSelected(u.id); }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#EFF6FF] text-[#2563EB]" title="View">
                          <Eye size={13} />
                        </button>
                        {u.status === "active" ? (
                          <button onClick={(e) => { e.stopPropagation(); blockUser(u.id); }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#FEE2E2] text-[#DC2626]" title="Block">
                            <ShieldOff size={13} />
                          </button>
                        ) : (
                          <button onClick={(e) => { e.stopPropagation(); unblockUser(u.id); }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#DCFCE7] text-[#16A34A]" title="Unblock">
                            <Shield size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-16 text-center text-sm text-[#94A3B8]">No users match your search.</div>
            )}
          </div>
        </div>

        {/* User detail panel */}
        {selectedUser && (
          <div className="w-[280px] shrink-0 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0F172A] text-lg font-extrabold text-white">
              {selectedUser.name.charAt(0)}
            </div>
            <p className="mt-3 font-bold text-[#0F172A]">{selectedUser.name}</p>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={selectedUser.status} size="sm" />
              <span className="text-xs text-[#94A3B8]">{selectedUser.city}</span>
            </div>
            <div className="mt-4 flex flex-col gap-2 text-xs">
              {[
                { label: "Email", value: selectedUser.email },
                { label: "Mobile", value: selectedUser.mobile },
                { label: "Signup", value: selectedUser.signupDate },
                { label: "Bookings", value: selectedUser.totalBookings.toString() },
                { label: "Total Spend", value: fmt(selectedUser.totalSpend) },
                { label: "Last Booking", value: selectedUser.lastBookingDate ?? "—" },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between border-b border-[#F8FAFC] pb-2 last:border-0">
                  <span className="text-[#64748B]">{r.label}</span>
                  <span className="font-semibold text-[#0F172A] text-right">{r.value}</span>
                </div>
              ))}
            </div>

            <p className="mt-4 mb-2 text-xs font-bold text-[#0F172A]">Recent Bookings</p>
            {userBookings.length === 0 ? (
              <p className="text-xs text-[#94A3B8]">No bookings found.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {userBookings.slice(0, 4).map((b) => (
                  <div key={b.id} className="rounded-lg bg-[#F8FAFC] px-3 py-2">
                    <p className="text-[11px] font-semibold text-[#0F172A]">{b.product}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#94A3B8]">{b.date}</span>
                      <span className="text-[10px] font-bold text-[#0F172A]">₹{b.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex gap-2">
              {selectedUser.status === "active" ? (
                <button onClick={() => blockUser(selectedUser.id)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#FEE2E2] py-2 text-xs font-bold text-[#DC2626] hover:bg-[#FECACA]">
                  <ShieldOff size={12} /> Block User
                </button>
              ) : (
                <button onClick={() => unblockUser(selectedUser.id)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#DCFCE7] py-2 text-xs font-bold text-[#16A34A] hover:bg-[#BBF7D0]">
                  <Shield size={12} /> Unblock
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
