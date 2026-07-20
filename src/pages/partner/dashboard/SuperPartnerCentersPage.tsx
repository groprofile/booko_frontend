import { useState, useEffect } from "react";
import { Plus, Check, X, Building2, Clock, MapPin, ArrowRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SuperPartnerLayout from "../../../components/partner/SuperPartnerLayout";
import { apiGet, apiPost, getVendorToken } from "../../../lib/api";

interface ApiCenter {
  id: string;
  center_name: string;
  city: string;
  address?: string;
  locality?: string;
  approval_status: string;
  is_active: boolean;
  rating?: number;
  categories?: { name?: string };
  center_photos?: { image_url: string; is_cover: boolean }[];
}

interface ApiStaff {
  id: string;
  name: string;
  email: string;
  center_id: string;
  status: string;
  centers?: { center_name?: string };
}

interface ApiCategory {
  id: string;
  name: string;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface AddCenterModalProps {
  onClose: () => void;
  onCreated: () => void;
}

function AddCenterModal({ onClose, onCreated }: AddCenterModalProps) {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [form, setForm] = useState({
    categoryId: "",
    centerName: "",
    description: "",
    address: "",
    locality: "",
    city: "",
    state: "",
    pincode: "",
    googleMapUrl: "",
    openingTime: "09:00",
    closingTime: "21:00",
    contactName: "",
    contactPhone: "",
    workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<ApiCategory[]>("/categories")
      .then(setCategories)
      .catch(() => {});
  }, []);

  function set(key: keyof typeof form, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function toggleDay(day: string) {
    setForm((p) => ({
      ...p,
      workingDays: p.workingDays.includes(day)
        ? p.workingDays.filter((d) => d !== day)
        : [...p.workingDays, day],
    }));
  }

  async function handleCreate() {
    const { categoryId, centerName, address, city, state, pincode, openingTime, closingTime } = form;
    if (!categoryId || !centerName.trim() || !address.trim() || !city.trim() || !state.trim() || !pincode.trim() || !openingTime || !closingTime) return;
    setSaving(true);
    setError("");
    try {
      const token = getVendorToken() ?? undefined;
      await apiPost(
        "/vendor/centers",
        {
          categoryId: form.categoryId,
          centerName: form.centerName.trim(),
          description: form.description.trim() || undefined,
          address: form.address.trim(),
          locality: form.locality.trim() || undefined,
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
          googleMapUrl: form.googleMapUrl.trim() || undefined,
          openingTime: form.openingTime,
          closingTime: form.closingTime,
          contactName: form.contactName.trim() || undefined,
          contactPhone: form.contactPhone.trim() || undefined,
          workingDays: form.workingDays,
        },
        token,
      );
      setSuccess(true);
      onCreated();
    } catch (err) {
      setError((err as Error).message ?? "Failed to create center");
    } finally {
      setSaving(false);
    }
  }

  const canSubmit =
    form.categoryId &&
    form.centerName.trim() &&
    form.address.trim() &&
    form.city.trim() &&
    form.state.trim() &&
    form.pincode.trim() &&
    form.openingTime &&
    form.closingTime &&
    !saving;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-[#E2E8F0] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Building2 size={16} className="text-[#2563EB]" />
            <h3 className="text-sm font-bold text-[#0F172A]">Add New Center</h3>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#0F172A] transition-colors">
            <X size={16} />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-3 p-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <Check size={24} className="text-emerald-600" />
            </div>
            <p className="text-sm font-bold text-[#0F172A]">Center Created!</p>
            <p className="text-xs text-[#64748B]">It is pending admin approval and will go live once approved.</p>
            <button
              onClick={onClose}
              className="mt-2 rounded-xl bg-[#2563EB] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="max-h-[75vh] overflow-y-auto p-6">
            {error && (
              <p className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-xs text-red-600">{error}</p>
            )}

            {/* Section: Category & Basic Info */}
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Basic Information</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#0F172A]">Category <span className="text-red-500">*</span></label>
                <select
                  value={form.categoryId}
                  onChange={(e) => set("categoryId", e.target.value)}
                  className="bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl px-4 py-2.5 text-sm outline-none text-[#0F172A]"
                >
                  <option value="">Select a category…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#0F172A]">Center Name <span className="text-red-500">*</span></label>
                <input
                  value={form.centerName}
                  onChange={(e) => set("centerName", e.target.value)}
                  placeholder="e.g. IndiQube Whitefield"
                  className="bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl px-4 py-2.5 text-sm outline-none text-[#0F172A] placeholder:text-[#94A3B8]"
                />
              </div>

              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#0F172A]">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Brief description of your center…"
                  rows={2}
                  className="bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl px-4 py-2.5 text-sm outline-none text-[#0F172A] placeholder:text-[#94A3B8] resize-none"
                />
              </div>
            </div>

            {/* Section: Location */}
            <p className="mb-3 mt-5 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Location</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#0F172A]">Full Address <span className="text-red-500">*</span></label>
                <input
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="Street address"
                  className="bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl px-4 py-2.5 text-sm outline-none text-[#0F172A] placeholder:text-[#94A3B8]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#0F172A]">Locality / Area</label>
                <input
                  value={form.locality}
                  onChange={(e) => set("locality", e.target.value)}
                  placeholder="e.g. Whitefield"
                  className="bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl px-4 py-2.5 text-sm outline-none text-[#0F172A] placeholder:text-[#94A3B8]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#0F172A]">City <span className="text-red-500">*</span></label>
                <input
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="e.g. Bangalore"
                  className="bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl px-4 py-2.5 text-sm outline-none text-[#0F172A] placeholder:text-[#94A3B8]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#0F172A]">State <span className="text-red-500">*</span></label>
                <input
                  value={form.state}
                  onChange={(e) => set("state", e.target.value)}
                  placeholder="e.g. Karnataka"
                  className="bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl px-4 py-2.5 text-sm outline-none text-[#0F172A] placeholder:text-[#94A3B8]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#0F172A]">Pincode <span className="text-red-500">*</span></label>
                <input
                  value={form.pincode}
                  onChange={(e) => set("pincode", e.target.value)}
                  placeholder="e.g. 560066"
                  maxLength={6}
                  className="bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl px-4 py-2.5 text-sm outline-none text-[#0F172A] placeholder:text-[#94A3B8]"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">Google Maps URL</label>
              <input
                value={form.googleMapUrl}
                onChange={(e) => set("googleMapUrl", e.target.value)}
                placeholder="https://maps.google.com/…"
                className="bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl px-4 py-2.5 text-sm outline-none text-[#0F172A] placeholder:text-[#94A3B8]"
              />
              <p className="text-[11px] text-[#94A3B8]">Used to pin your exact location so customers find you in Nearby search.</p>
            </div>

            {/* Section: Timings */}
            <p className="mb-3 mt-5 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Operating Hours</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#0F172A]">
                  <Clock size={11} className="inline mr-1" />Opening Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={form.openingTime}
                  onChange={(e) => set("openingTime", e.target.value)}
                  className="bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl px-4 py-2.5 text-sm outline-none text-[#0F172A]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#0F172A]">
                  <Clock size={11} className="inline mr-1" />Closing Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={form.closingTime}
                  onChange={(e) => set("closingTime", e.target.value)}
                  className="bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl px-4 py-2.5 text-sm outline-none text-[#0F172A]"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">Working Days</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      form.workingDays.includes(day)
                        ? "bg-[#2563EB] text-white"
                        : "border border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB]"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Section: Contact */}
            <p className="mb-3 mt-5 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Contact (optional)</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#0F172A]">Contact Name</label>
                <input
                  value={form.contactName}
                  onChange={(e) => set("contactName", e.target.value)}
                  placeholder="Manager name"
                  className="bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl px-4 py-2.5 text-sm outline-none text-[#0F172A] placeholder:text-[#94A3B8]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#0F172A]">Contact Phone</label>
                <input
                  value={form.contactPhone}
                  onChange={(e) => set("contactPhone", e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  type="tel"
                  className="bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl px-4 py-2.5 text-sm outline-none text-[#0F172A] placeholder:text-[#94A3B8]"
                />
              </div>
            </div>

            <p className="mt-4 text-[11px] text-[#94A3B8]">
              The center will be in <strong>pending</strong> status and require admin approval before going live.
            </p>

            <div className="mt-5 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-[#E2E8F0] py-2.5 text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!canSubmit}
                className="flex-1 rounded-xl bg-[#2563EB] py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Creating…" : "Create Center"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface CenterCardProps {
  center: ApiCenter;
  managerEmail?: string;
  onManage: () => void;
}

function CenterCard({ center, managerEmail, onManage }: CenterCardProps) {
  const isActive = center.approval_status === "approved" && center.is_active;
  const isPending = center.approval_status === "pending";
  const coverPhoto = center.center_photos?.find((p) => p.is_cover)?.image_url;

  const headerColor = isActive ? "bg-gradient-to-br from-[#2563EB] to-[#1D4ED8]"
    : isPending ? "bg-gradient-to-br from-[#D97706] to-[#B45309]"
    : "bg-gradient-to-br from-slate-500 to-slate-600";

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col group">
      {/* Cover Photo */}
      <div className="relative h-36 w-full overflow-hidden">
        {coverPhoto ? (
          <img src={coverPhoto} alt={center.center_name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#0F172A] to-[#1E3A5F] flex items-center justify-center">
            <Building2 size={36} className="text-white/20" />
          </div>
        )}
        {/* Status pill floating */}
        <span className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold backdrop-blur-sm ${
          isActive ? "bg-emerald-500/90 text-white" : isPending ? "bg-amber-500/90 text-white" : "bg-slate-500/90 text-white"
        }`}>
          {isActive ? "Active" : isPending ? "Pending" : center.approval_status}
        </span>
        {isActive && center.rating != null && (
          <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-[#0F172A]">
            <Star size={9} className="fill-amber-400 text-amber-400" />
            {Number(center.rating).toFixed(1)}
          </span>
        )}
      </div>

      {/* Colored header bar */}
      <div className={`${headerColor} px-5 pt-4 pb-3`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-white">{center.center_name}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-white/70">
              <MapPin size={10} className="shrink-0" />
              <span className="truncate">{center.locality ?? center.address ?? "—"}, {center.city}</span>
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold text-white">
            {center.categories?.name ?? "Workspace"}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Manager */}
        <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">Manager</p>
          {managerEmail ? (
            <code className="block truncate font-mono text-[11px] text-[#0F172A]">{managerEmail}</code>
          ) : (
            <p className="text-xs text-[#94A3B8]">No manager assigned</p>
          )}
        </div>

        {isPending && (
          <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50 px-3 py-2 text-center">
            <p className="text-xs text-amber-700">Awaiting admin approval to go live</p>
          </div>
        )}

        {/* Manage button */}
        <button
          onClick={onManage}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
        >
          Manage Center
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

export default function SuperPartnerCentersPage() {
  const [centers, setCenters] = useState<ApiCenter[]>([]);
  const [staff, setStaff] = useState<ApiStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  function load() {
    const token = getVendorToken() ?? undefined;
    setLoading(true);
    setError(null);
    Promise.all([
      apiGet<ApiCenter[]>("/vendor/centers", token),
      apiGet<ApiStaff[]>("/vendor/staff", token),
    ])
      .then(([c, s]) => {
        setCenters(c ?? []);
        setStaff(s ?? []);
      })
      .catch((err) => setError((err as Error).message ?? "Failed to load centers"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const managerByCenterId = Object.fromEntries(
    staff.map((s) => [s.center_id, s.email])
  );

  const activeCount = centers.filter((c) => c.approval_status === "approved" && c.is_active).length;
  const pendingCount = centers.filter((c) => c.approval_status === "pending").length;

  return (
    <SuperPartnerLayout title="Your Centers" subtitle="Manage all your workspace centers">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-[#0F172A]">
            All Centers{" "}
            <span className="ml-1 rounded-full bg-[#E2E8F0] px-2 py-0.5 text-xs text-[#64748B]">
              {centers.length}
            </span>
          </h2>
          {pendingCount > 0 && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              {pendingCount} pending
            </span>
          )}
          {activeCount > 0 && (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              {activeCount} active
            </span>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
        >
          <Plus size={14} />
          Add New Center
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden">
              <div className="h-36 bg-[#E2E8F0]" />
              <div className="h-16 bg-[#F1F5F9]" />
              <div className="p-5 space-y-3">
                <div className="h-10 rounded-xl bg-[#F1F5F9]" />
                <div className="h-10 rounded-xl bg-[#2563EB]/10" />
              </div>
            </div>
          ))}
        </div>
      ) : centers.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-[#E2E8F0] p-10 text-center">
          <Building2 size={32} className="mx-auto text-[#E2E8F0]" />
          <p className="mt-3 text-sm font-semibold text-[#0F172A]">No centers yet</p>
          <p className="mt-1 text-xs text-[#94A3B8]">Add your first center to start accepting bookings.</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors mx-auto"
          >
            <Plus size={14} />
            Add Center
          </button>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {centers.map((c) => (
            <CenterCard
              key={c.id}
              center={c}
              managerEmail={managerByCenterId[c.id]}
              onManage={() => navigate(`/partner/centers/${c.id}`)}
            />
          ))}
        </div>
      )}

      {showModal && (
        <AddCenterModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            load();
          }}
        />
      )}
    </SuperPartnerLayout>
  );
}
