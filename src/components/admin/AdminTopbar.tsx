import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { useAdmin, ROLE_LABELS } from "../../context/AdminContext";
import { apiGet, getAdminToken } from "../../lib/api";

interface Props { title: string; subtitle?: string; }

export default function AdminTopbar({ title, subtitle }: Props) {
  const { admin, logout, vendors } = useAdmin();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [openTickets, setOpenTickets] = useState(0);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    apiGet<{ total: number }>("/admin/support/tickets?status=open&limit=1", token)
      .then((r) => setOpenTickets(r.total ?? 0))
      .catch(() => {});
  }, []);

  const pendingApprovals = vendors.filter((v) => v.status === "under_review" || v.status === "pending").length;
  const notifCount = pendingApprovals + openTickets;

  const NOTIFICATIONS = [
    ...(pendingApprovals > 0 ? [{ id: "n1", text: `${pendingApprovals} vendor approvals pending`, link: "/admin/vendor-approvals", dot: "#F59E0B" }] : []),
    ...(openTickets > 0 ? [{ id: "n2", text: `${openTickets} support tickets open`, link: "/admin/support", dot: "#DC2626" }] : []),
  ];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) return;
    if (/^BK/i.test(search)) navigate("/admin/bookings");
    else if (/^\d{10}$/.test(search)) navigate("/admin/users");
    else navigate("/admin/vendors");
    setSearch("");
    setShowSearch(false);
  }

  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center justify-between border-b border-[#E2E8F0] bg-white px-5">
      {/* Left: title */}
      <div>
        <h1 className="text-sm font-bold text-[#0F172A]">{title}</h1>
        {subtitle && <p className="text-xs text-[#94A3B8]">{subtitle}</p>}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <form onSubmit={handleSearch} className={`flex items-center transition-all ${showSearch ? "w-64" : "w-9"}`}>
          <div className="relative w-full">
            {showSearch ? (
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onBlur={() => !search && setShowSearch(false)}
                placeholder="Search booking ID, mobile, vendor…"
                className="h-8 w-full rounded-lg border border-[#E2E8F0] pl-3 pr-8 text-xs text-[#0F172A] outline-none focus:border-[#2563EB]"
              />
            ) : null}
            <button
              type={showSearch ? "submit" : "button"}
              onClick={() => !showSearch && setShowSearch(true)}
              className="absolute right-1 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
            >
              <Search size={15} />
            </button>
          </div>
        </form>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif((v) => !v); setShowProfile(false); }}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
          >
            <Bell size={16} />
            {notifCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#DC2626] text-[9px] font-bold text-white">
                {notifCount}
              </span>
            )}
          </button>
          {showNotif && (
            <div className="absolute right-0 top-10 z-50 w-72 rounded-xl border border-[#E2E8F0] bg-white shadow-xl">
              <div className="border-b border-[#F1F5F9] px-4 py-3">
                <p className="text-xs font-bold text-[#0F172A]">Notifications</p>
              </div>
              {NOTIFICATIONS.length === 0 && (
                <p className="px-4 py-4 text-center text-xs text-[#94A3B8]">Nothing needs your attention right now.</p>
              )}
              {NOTIFICATIONS.map((n) => (
                <button
                  key={n.id}
                  onClick={() => { navigate(n.link); setShowNotif(false); }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#F8FAFC]"
                >
                  <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: n.dot }} />
                  <p className="text-xs text-[#0F172A]">{n.text}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        {admin && (
          <div className="relative">
            <button
              onClick={() => { setShowProfile((v) => !v); setShowNotif(false); }}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[#F1F5F9]"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white">
                {admin.name.charAt(0)}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-semibold text-[#0F172A]">{admin.name}</p>
                <p className="text-[10px] text-[#94A3B8]">{ROLE_LABELS[admin.role]}</p>
              </div>
              <ChevronDown size={12} className="text-[#94A3B8]" />
            </button>
            {showProfile && (
              <div className="absolute right-0 top-10 z-50 w-48 rounded-xl border border-[#E2E8F0] bg-white shadow-xl">
                <button onClick={() => navigate("/admin/settings")} className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-[#0F172A] hover:bg-[#F8FAFC]">
                  <Settings size={14} className="text-[#64748B]" /> Settings
                </button>
                <button className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-[#0F172A] hover:bg-[#F8FAFC]">
                  <User size={14} className="text-[#64748B]" /> My Profile
                </button>
                <div className="border-t border-[#F1F5F9]" />
                <button onClick={logout} className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-[#DC2626] hover:bg-[#FEF2F2]">
                  <LogOut size={14} /> Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
