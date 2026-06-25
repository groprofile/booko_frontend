import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Filter, MoreVertical, Eye, CheckCircle, XCircle, ShieldOff, Shield } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import StatusBadge from "../../components/admin/StatusBadge";
import { useAdmin, type Vendor, type VendorStatus } from "../../context/AdminContext";

const fmt = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;

const STATUS_OPTS: Array<{ label: string; value: VendorStatus | "all" }> = [
  { label: "All", value: "all" }, { label: "Approved", value: "approved" },
  { label: "Pending", value: "pending" }, { label: "Under Review", value: "under_review" },
  { label: "Blocked", value: "blocked" }, { label: "Rejected", value: "rejected" },
];

const BUSINESS_TYPES = ["All Types", "Coworking Space", "Hotel", "Meeting Room Provider", "Virtual Office Provider", "Managed Office", "Event Space"];

export default function AdminVendorsPage() {
  const { vendors, approveVendor, rejectVendor, blockVendor, unblockVendor, addVendor } = useAdmin();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VendorStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ businessName: "", ownerName: "", email: "", mobile: "", businessType: "Coworking Space", city: "", state: "Maharashtra", gstin: "", centerType: "single" as "single" | "multiple" });

  const filtered = vendors.filter((v) => {
    const q = search.toLowerCase();
    const matchSearch = !q || v.businessName.toLowerCase().includes(q) || v.ownerName.toLowerCase().includes(q) || v.email.toLowerCase().includes(q) || v.city.toLowerCase().includes(q) || v.mobile.includes(q);
    const matchStatus = statusFilter === "all" || v.status === statusFilter;
    const matchType = typeFilter === "All Types" || v.businessType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  function handleAdd() {
    addVendor({ ...addForm } as Partial<Vendor>);
    setShowAdd(false);
    setAddForm({ businessName: "", ownerName: "", email: "", mobile: "", businessType: "Coworking Space", city: "", state: "Maharashtra", gstin: "", centerType: "single" });
  }

  return (
    <AdminLayout title="Vendor Management" subtitle={`${vendors.length} total vendors`}>
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendor, email, city, mobile…"
            className="h-9 w-full rounded-xl border border-[#E2E8F0] bg-white pl-9 pr-4 text-sm outline-none focus:border-[#2563EB]" />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[#94A3B8]" />
          <div className="flex gap-1.5">
            {STATUS_OPTS.map((s) => (
              <button key={s.value} onClick={() => setStatusFilter(s.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${statusFilter === s.value ? "bg-[#2563EB] text-white" : "border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#2563EB]"}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="h-9 rounded-xl border border-[#E2E8F0] bg-white px-3 text-sm text-[#0F172A] outline-none focus:border-[#2563EB]">
          {BUSINESS_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-bold text-white hover:bg-[#1d4ed8]">
          <Plus size={15} /> Add Vendor
        </button>
      </div>

      {/* Stats row */}
      <div className="mb-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {STATUS_OPTS.slice(1).map((s) => {
          const count = vendors.filter((v) => v.status === s.value).length;
          return (
            <button key={s.value} onClick={() => setStatusFilter(s.value as VendorStatus)}
              className={`rounded-xl border p-3 text-center transition-colors ${statusFilter === s.value ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1]"}`}>
              <p className="text-xl font-extrabold text-[#0F172A]">{count}</p>
              <StatusBadge status={s.value} size="sm" />
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                {["Vendor", "Type", "City", "Centers", "Bookings", "Revenue", "KYC", "Bank", "Status", "Joined", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#64748B]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold text-[#0F172A]">{v.businessName}</p>
                      <p className="text-xs text-[#94A3B8]">{v.ownerName} · {v.mobile}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#64748B]">{v.businessType}</td>
                  <td className="px-4 py-3 text-xs text-[#64748B]">{v.city}</td>
                  <td className="px-4 py-3 text-center text-xs font-semibold text-[#0F172A]">{v.totalCenters}</td>
                  <td className="px-4 py-3 text-center text-xs font-semibold text-[#0F172A]">{v.totalBookings}</td>
                  <td className="px-4 py-3 text-xs font-bold text-[#0F172A]">{fmt(v.totalRevenue)}</td>
                  <td className="px-4 py-3"><StatusBadge status={v.kycStatus} size="sm" /></td>
                  <td className="px-4 py-3"><StatusBadge status={v.bankStatus} size="sm" /></td>
                  <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                  <td className="px-4 py-3 text-xs text-[#94A3B8]">{v.joinedAt}</td>
                  <td className="px-4 py-3">
                    <div className="relative flex items-center gap-1">
                      <button onClick={() => navigate(`/admin/vendors/${v.id}`)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#EFF6FF] text-[#2563EB]" title="View">
                        <Eye size={14} />
                      </button>
                      <div className="relative">
                        <button onClick={() => setMenuOpen(menuOpen === v.id ? null : v.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#F1F5F9] text-[#64748B]">
                          <MoreVertical size={14} />
                        </button>
                        {menuOpen === v.id && (
                          <div className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-[#E2E8F0] bg-white shadow-xl">
                            {v.status !== "approved" && (
                              <button onClick={() => { approveVendor(v.id); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-[#15803D] hover:bg-[#DCFCE7]">
                                <CheckCircle size={13} /> Approve Vendor
                              </button>
                            )}
                            {v.status !== "rejected" && (
                              <button onClick={() => { rejectVendor(v.id); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-[#DC2626] hover:bg-[#FEE2E2]">
                                <XCircle size={13} /> Reject Vendor
                              </button>
                            )}
                            {v.status === "blocked" ? (
                              <button onClick={() => { unblockVendor(v.id); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-[#2563EB] hover:bg-[#EFF6FF]">
                                <Shield size={13} /> Unblock Vendor
                              </button>
                            ) : (
                              <button onClick={() => { blockVendor(v.id); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-[#64748B] hover:bg-[#F1F5F9]">
                                <ShieldOff size={13} /> Block Vendor
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-sm text-[#94A3B8]">No vendors match the selected filters.</div>
          )}
        </div>
      </div>

      {/* Add Vendor Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[520px] rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-[#F1F5F9] px-6 py-4">
              <h3 className="font-bold text-[#0F172A]">Add Vendor Manually</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 p-6">
              {[
                { label: "Business Name", key: "businessName", placeholder: "WorkHub Spaces" },
                { label: "Owner Name", key: "ownerName", placeholder: "Rahul Sharma" },
                { label: "Email", key: "email", placeholder: "info@business.com" },
                { label: "Mobile", key: "mobile", placeholder: "9876543210" },
                { label: "City", key: "city", placeholder: "Mumbai" },
                { label: "GSTIN", key: "gstin", placeholder: "27AAPFU0939F1ZV" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="mb-1 block text-xs font-medium text-[#0F172A]">{f.label}</label>
                  <input type="text" value={(addForm as Record<string, string>)[f.key]}
                    onChange={(e) => setAddForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#2563EB]" />
                </div>
              ))}
              <div>
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">Business Type</label>
                <select value={addForm.businessType} onChange={(e) => setAddForm((p) => ({ ...p, businessType: e.target.value }))}
                  className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#2563EB] bg-white">
                  {BUSINESS_TYPES.slice(1).map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">Center Type</label>
                <select value={addForm.centerType} onChange={(e) => setAddForm((p) => ({ ...p, centerType: e.target.value as "single" | "multiple" }))}
                  className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#2563EB] bg-white">
                  <option value="single">Single Center</option>
                  <option value="multiple">Multiple Centers</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#F1F5F9] px-6 py-4">
              <button onClick={() => setShowAdd(false)} className="rounded-xl border border-[#E2E8F0] px-4 py-2 text-sm text-[#64748B] hover:bg-[#F8FAFC]">Cancel</button>
              <button onClick={handleAdd} className="rounded-xl bg-[#2563EB] px-5 py-2 text-sm font-bold text-white hover:bg-[#1d4ed8]">Add Vendor</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
