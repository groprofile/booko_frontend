import { useEffect, useState } from "react";
import { Search, ShieldOff, Shield, Eye, ArrowUp, ArrowDown, Wallet, LifeBuoy } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import StatusBadge from "../../components/admin/StatusBadge";
import { showToast } from "../../components/admin/Toast";
import { useAdmin } from "../../context/AdminContext";
import { apiGet, apiPost, getAdminToken, ApiError } from "../../lib/api";

const fmt = (n: number) => n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;

interface UserBooking {
  id: string;
  centerName: string;
  categoryName: string | null;
  totalPaise: number;
  createdAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeUserBooking(raw: any): UserBooking {
  const paise = typeof raw.total_paise === "string" ? parseInt(raw.total_paise, 10) : (raw.total_paise ?? 0);
  return {
    id: raw.id,
    centerName: raw.center_name ?? "—",
    categoryName: raw.category_name ?? null,
    totalPaise: paise,
    createdAt: raw.created_at ?? "",
  };
}

interface UserWallet {
  walletBalancePaise: number;
}

interface UserTicket {
  id: string;
  type: string;
  message: string;
  status: string;
  created_at: string;
}

type SortKey = "name" | "totalBookings" | "totalSpend" | "signupDate";

export default function AdminUsersPage() {
  const { users, usersLoading, blockUser, unblockUser } = useAdmin();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "blocked">("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [detailBookings, setDetailBookings] = useState<UserBooking[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailWallet, setDetailWallet] = useState<UserWallet | null>(null);
  const [detailTickets, setDetailTickets] = useState<UserTicket[]>([]);

  const [walletFormOpen, setWalletFormOpen] = useState(false);
  const [walletAmount, setWalletAmount] = useState("");
  const [walletReason, setWalletReason] = useState("");
  const [walletBusy, setWalletBusy] = useState(false);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.mobile.includes(q) || u.city.toLowerCase().includes(q);
    const matchS = statusFilter === "all" || u.status === statusFilter;
    return matchQ && matchS;
  });

  const sorted = sortKey ? [...filtered].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
    return sortDir === "asc" ? cmp : -cmp;
  }) : filtered;

  const paginated = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const selectedUser = users.find((u) => u.id === selected);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function fetchDetail(userId: string, token: string) {
    setDetailLoading(true);
    Promise.all([
      apiGet<{ bookings: unknown[] }>(`/admin/users/${userId}/bookings?limit=5`, token)
        .then((r) => setDetailBookings((r.bookings ?? []).map(normalizeUserBooking)))
        .catch(console.error),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      apiGet<any>(`/admin/users/${userId}`, token)
        .then((r) => setDetailWallet({
          walletBalancePaise: r.wallet_balance_paise ?? 0,
        }))
        .catch(console.error),
      apiGet<UserTicket[]>(`/admin/users/${userId}/tickets?limit=5`, token)
        .then((r) => setDetailTickets(Array.isArray(r) ? r : []))
        .catch(console.error),
    ]).finally(() => setDetailLoading(false));
  }

  useEffect(() => {
    setWalletFormOpen(false);
    setWalletAmount("");
    setWalletReason("");
    if (!selected) {
      setDetailBookings([]);
      setDetailWallet(null);
      setDetailTickets([]);
      return;
    }
    const token = getAdminToken();
    if (!token) return;
    fetchDetail(selected, token);
  }, [selected]);

  async function handleBlock(id: string, name: string) {
    if (!window.confirm(`Block ${name}? They will be signed out and unable to use the app until unblocked.`)) return;
    try {
      await blockUser(id);
      showToast(`${name} has been blocked`, "success");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to block user", "error");
    }
  }

  async function handleUnblock(id: string, name: string) {
    if (!window.confirm(`Unblock ${name}?`)) return;
    try {
      await unblockUser(id);
      showToast(`${name} has been unblocked`, "success");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to unblock user", "error");
    }
  }

  async function handleWalletAdjust(direction: "credit" | "debit") {
    const token = getAdminToken();
    if (!token || !selectedUser) return;
    const amountRupees = Number(walletAmount);
    if (!amountRupees || amountRupees <= 0) {
      showToast("Enter a valid amount", "error");
      return;
    }
    if (!walletReason.trim()) {
      showToast("A reason is required", "error");
      return;
    }
    setWalletBusy(true);
    try {
      await apiPost(`/admin/users/${selectedUser.id}/wallet/${direction}`, { amountRupees, reason: walletReason }, token);
      showToast(`Wallet ${direction === "credit" ? "credited" : "debited"} successfully`, "success");
      setWalletFormOpen(false);
      setWalletAmount("");
      setWalletReason("");
      fetchDetail(selectedUser.id, token);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : `Failed to ${direction} wallet`, "error");
    } finally {
      setWalletBusy(false);
    }
  }

  return (
    <AdminLayout title="User Management" subtitle={`${users.length} registered users`}>
      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name, email, mobile, city…"
            className="h-9 w-full rounded-xl border border-[#E2E8F0] bg-white pl-9 pr-4 text-sm outline-none focus:border-[#2563EB]" />
        </div>
        {(["all", "active", "blocked"] as const).map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
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
                  {(["name", "city", "totalBookings", "totalSpend", "lastBookingDate", "signupDate", "status", "actions"] as const).map((col) => {
                    const sortable = (["name", "totalBookings", "totalSpend", "signupDate"] as const).includes(col as SortKey);
                    const label = col === "name" ? "User" : col === "city" ? "City" : col === "totalBookings" ? "Bookings"
                      : col === "totalSpend" ? "Total Spend" : col === "lastBookingDate" ? "Last Booking"
                      : col === "signupDate" ? "Signup Date" : col === "status" ? "Status" : "Actions";
                    return (
                      <th key={col} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                        {sortable ? (
                          <button className="flex items-center gap-1 hover:text-[#2563EB]" onClick={() => toggleSort(col as SortKey)}>
                            {label}
                            {sortKey === col && (sortDir === "asc" ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}
                          </button>
                        ) : label}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-[#F8FAFC]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 shrink-0 animate-pulse rounded-full bg-[#E2E8F0]" />
                          <div className="space-y-1.5">
                            <div className="h-3 w-24 animate-pulse rounded bg-[#E2E8F0]" />
                            <div className="h-2.5 w-32 animate-pulse rounded bg-[#E2E8F0]" />
                          </div>
                        </div>
                      </td>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-3 w-16 animate-pulse rounded bg-[#E2E8F0]" /></td>
                      ))}
                    </tr>
                  ))
                ) : paginated.map((u) => (
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
                          <button onClick={(e) => { e.stopPropagation(); handleBlock(u.id, u.name); }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#FEE2E2] text-[#DC2626]" title="Block">
                            <ShieldOff size={13} />
                          </button>
                        ) : (
                          <button onClick={(e) => { e.stopPropagation(); handleUnblock(u.id, u.name); }}
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
            {!usersLoading && filtered.length === 0 && (
              <div className="py-16 text-center text-sm text-[#94A3B8]">No users match your search.</div>
            )}
          </div>
          {!usersLoading && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[#F1F5F9] px-4 py-3">
              <p className="text-xs text-[#94A3B8]">{filtered.length} users · Page {page} of {totalPages}</p>
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
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between border-b border-[#F8FAFC] pb-2 last:border-0">
                  <span className="text-[#64748B]">{r.label}</span>
                  <span className="font-semibold text-[#0F172A] text-right">{r.value}</span>
                </div>
              ))}
            </div>

            {/* Wallet */}
            <div className="mt-4 rounded-xl border border-[#E2E8F0] p-3">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A]">
                  <Wallet size={13} className="text-[#2563EB]" /> Wallet
                </p>
                <button onClick={() => setWalletFormOpen((v) => !v)}
                  className="text-[10px] font-semibold text-[#2563EB] hover:underline">
                  {walletFormOpen ? "Cancel" : "Adjust"}
                </button>
              </div>
              {detailLoading ? (
                <div className="mt-2 h-3 w-24 animate-pulse rounded bg-[#E2E8F0]" />
              ) : (
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-[#64748B]">Balance</span>
                  <span className="font-semibold text-[#0F172A]">₹{Math.round((detailWallet?.walletBalancePaise ?? 0) / 100)}</span>
                </div>
              )}

              {walletFormOpen && (
                <div className="mt-3 flex flex-col gap-2 border-t border-[#F1F5F9] pt-3">
                  <input type="number" min="1" placeholder="Amount (₹)" value={walletAmount}
                    onChange={(e) => setWalletAmount(e.target.value)}
                    className="h-8 w-full rounded-lg border border-[#E2E8F0] px-2.5 text-xs outline-none focus:border-[#2563EB]" />
                  <textarea placeholder="Reason (required)" value={walletReason} rows={2}
                    onChange={(e) => setWalletReason(e.target.value)}
                    className="w-full resize-none rounded-lg border border-[#E2E8F0] px-2.5 py-1.5 text-xs outline-none focus:border-[#2563EB]" />
                  <div className="flex gap-2">
                    <button disabled={walletBusy} onClick={() => handleWalletAdjust("credit")}
                      className="flex-1 rounded-lg bg-[#DCFCE7] py-1.5 text-xs font-bold text-[#16A34A] hover:bg-[#BBF7D0] disabled:opacity-50">
                      Credit
                    </button>
                    <button disabled={walletBusy} onClick={() => handleWalletAdjust("debit")}
                      className="flex-1 rounded-lg bg-[#FEE2E2] py-1.5 text-xs font-bold text-[#DC2626] hover:bg-[#FECACA] disabled:opacity-50">
                      Debit
                    </button>
                  </div>
                </div>
              )}
            </div>

            <p className="mt-4 mb-2 text-xs font-bold text-[#0F172A]">Recent Bookings</p>
            {detailLoading ? (
              <div className="flex flex-col gap-1.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-lg bg-[#F8FAFC] px-3 py-2">
                    <div className="h-2.5 w-24 animate-pulse rounded bg-[#E2E8F0]" />
                    <div className="mt-1.5 flex items-center justify-between">
                      <div className="h-2 w-16 animate-pulse rounded bg-[#E2E8F0]" />
                      <div className="h-2 w-10 animate-pulse rounded bg-[#E2E8F0]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : detailBookings.length === 0 ? (
              <p className="text-xs text-[#94A3B8]">No bookings found.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {detailBookings.map((b) => (
                  <div key={b.id} className="rounded-lg bg-[#F8FAFC] px-3 py-2">
                    <p className="text-[11px] font-semibold text-[#0F172A]">{b.categoryName ?? b.centerName}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#94A3B8]">{b.createdAt?.slice(0, 10) ?? "—"}</span>
                      <span className="text-[10px] font-bold text-[#0F172A]">₹{Math.round(b.totalPaise / 100)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="mt-4 mb-2 flex items-center gap-1.5 text-xs font-bold text-[#0F172A]">
              <LifeBuoy size={13} className="text-[#2563EB]" /> Recent Tickets
            </p>
            {detailLoading ? (
              <div className="h-3 w-24 animate-pulse rounded bg-[#E2E8F0]" />
            ) : detailTickets.length === 0 ? (
              <p className="text-xs text-[#94A3B8]">No support tickets.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {detailTickets.map((t) => (
                  <div key={t.id} className="rounded-lg bg-[#F8FAFC] px-3 py-2">
                    <p className="truncate text-[11px] font-semibold text-[#0F172A]">{t.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] capitalize text-[#94A3B8]">{t.type.replace(/_/g, " ")}</span>
                      <StatusBadge status={t.status} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex gap-2">
              {selectedUser.status === "active" ? (
                <button onClick={() => handleBlock(selectedUser.id, selectedUser.name)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#FEE2E2] py-2 text-xs font-bold text-[#DC2626] hover:bg-[#FECACA]">
                  <ShieldOff size={12} /> Block User
                </button>
              ) : (
                <button onClick={() => handleUnblock(selectedUser.id, selectedUser.name)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#DCFCE7] py-2 text-xs font-bold text-[#16A34A] hover:bg-[#BBF7D0]">
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
