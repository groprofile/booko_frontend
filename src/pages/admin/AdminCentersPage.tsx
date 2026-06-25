import { useState } from "react";
import { Search, Plus, CheckCircle, X, MapPin, Star } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import StatusBadge from "../../components/admin/StatusBadge";
import { useAdmin, type CenterStatus } from "../../context/AdminContext";

const STATUS_OPTS: Array<{ label: string; value: CenterStatus | "all" }> = [
  { label: "All", value: "all" }, { label: "Live", value: "live" },
  { label: "Pending Approval", value: "pending_approval" }, { label: "Inactive", value: "inactive" }, { label: "Rejected", value: "rejected" },
];

const SERVICES = ["Day Pass", "Meeting Room", "Monthly Pass", "Virtual Office", "Hotel Room", "Hourly Stay", "Full Day Stay", "Private Cabin", "Managed Office", "Event Space"];

export default function AdminCentersPage() {
  const { centers, approveCenterLive, addCenter } = useAdmin();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CenterStatus | "all">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", vendorName: "", businessType: "Coworking Space", city: "", area: "", state: "Maharashtra", address: "", services: [] as string[] });

  const filtered = centers.filter((c) => {
    const q = search.toLowerCase();
    const matchQ = !q || c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q) || c.vendorName.toLowerCase().includes(q) || c.area.toLowerCase().includes(q);
    const matchS = statusFilter === "all" || c.status === statusFilter;
    return matchQ && matchS;
  });

  function toggleService(svc: string) {
    setAddForm((p) => ({
      ...p,
      services: p.services.includes(svc) ? p.services.filter((s) => s !== svc) : [...p.services, svc],
    }));
  }

  function handleAdd() {
    addCenter({ ...addForm });
    setShowAdd(false);
    setAddForm({ name: "", vendorName: "", businessType: "Coworking Space", city: "", area: "", state: "Maharashtra", address: "", services: [] });
  }

  return (
    <AdminLayout title="Center Management" subtitle={`${centers.length} total centers`}>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search center name, vendor, city…"
            className="h-9 w-full rounded-xl border border-[#E2E8F0] bg-white pl-9 pr-4 text-sm outline-none focus:border-[#2563EB]" />
        </div>
        <div className="flex gap-1.5">
          {STATUS_OPTS.map((s) => (
            <button key={s.value} onClick={() => setStatusFilter(s.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${statusFilter === s.value ? "bg-[#2563EB] text-white" : "border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#2563EB]"}`}>
              {s.label}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-bold text-white hover:bg-[#1d4ed8]">
          <Plus size={15} /> Add Center
        </button>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <div key={c.id} className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#0F172A] truncate">{c.name}</p>
                <p className="mt-0.5 text-xs text-[#64748B]">{c.vendorName}</p>
              </div>
              <StatusBadge status={c.status} size="sm" />
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-xs text-[#64748B]">
              <MapPin size={11} />
              {c.area}, {c.city}
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {c.services.slice(0, 3).map((svc) => (
                <span key={svc} className="rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-medium text-[#475569]">{svc}</span>
              ))}
              {c.services.length > 3 && (
                <span className="rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-medium text-[#94A3B8]">+{c.services.length - 3}</span>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="text-[#64748B]">{c.totalBookings} bookings</span>
                {c.rating > 0 && (
                  <span className="flex items-center gap-1 text-[#D97706]">
                    <Star size={10} className="fill-current" /> {c.rating}
                  </span>
                )}
              </div>
              {c.totalRevenue > 0 && (
                <span className="font-bold text-[#0F172A]">₹{(c.totalRevenue / 1000).toFixed(0)}K</span>
              )}
            </div>

            {c.status === "pending_approval" && (
              <div className="mt-3 flex gap-2">
                <button onClick={() => approveCenterLive(c.id)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#2563EB] py-2 text-xs font-bold text-white hover:bg-[#1d4ed8]">
                  <CheckCircle size={12} /> Approve Live
                </button>
                <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] py-2 text-xs font-bold text-[#DC2626] hover:bg-[#FEE2E2]">
                  <X size={12} /> Reject
                </button>
              </div>
            )}
            {c.status === "live" && (
              <div className="mt-3 flex gap-2">
                <button className="flex-1 rounded-xl border border-[#E2E8F0] py-1.5 text-xs text-[#64748B] hover:bg-[#F8FAFC]">Edit</button>
                <button className="flex-1 rounded-xl border border-[#E2E8F0] py-1.5 text-xs text-[#DC2626] hover:bg-[#FEE2E2]">Deactivate</button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 py-16 text-center text-sm text-[#94A3B8]">No centers match the selected filter.</div>
        )}
      </div>

      {/* Add Center Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[540px] rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-[#F1F5F9] px-6 py-4">
              <h3 className="font-bold text-[#0F172A]">Add New Center</h3>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Center Name", key: "name", placeholder: "WorkHub Lower Parel" },
                  { label: "Vendor Name", key: "vendorName", placeholder: "WorkHub Spaces" },
                  { label: "City", key: "city", placeholder: "Mumbai" },
                  { label: "Area / Locality", key: "area", placeholder: "Lower Parel" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="mb-1 block text-xs font-medium text-[#0F172A]">{f.label}</label>
                    <input type="text" value={(addForm as Record<string, string>)[f.key]}
                      onChange={(e) => setAddForm((p) => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#2563EB]" />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-medium text-[#0F172A]">Full Address</label>
                  <input type="text" value={addForm.address}
                    onChange={(e) => setAddForm((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Kamala Mills, Lower Parel, Mumbai 400013"
                    className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#2563EB]" />
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-2 block text-xs font-medium text-[#0F172A]">Services Offered</label>
                <div className="flex flex-wrap gap-2">
                  {SERVICES.map((svc) => (
                    <button key={svc} type="button" onClick={() => toggleService(svc)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${addForm.services.includes(svc) ? "bg-[#2563EB] text-white" : "border border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB]"}`}>
                      {svc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#F1F5F9] px-6 py-4">
              <button onClick={() => setShowAdd(false)} className="rounded-xl border border-[#E2E8F0] px-4 py-2 text-sm text-[#64748B]">Cancel</button>
              <button onClick={handleAdd} className="rounded-xl bg-[#2563EB] px-5 py-2 text-sm font-bold text-white hover:bg-[#1d4ed8]">Add Center</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
