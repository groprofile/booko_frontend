import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Building2, MapPin, Clock, Camera, Calendar,
  Ban, Check, X, Upload, Loader2, Plus, Trash2,
} from "lucide-react";
import SuperPartnerLayout from "../../../components/partner/SuperPartnerLayout";
import { apiGet, apiPost, apiPut, apiUploadFile, getVendorToken } from "../../../lib/api";

interface CenterDetail {
  id: string;
  center_name: string;
  city: string;
  address: string;
  locality?: string;
  state: string;
  pincode: string;
  description?: string;
  opening_time: string;
  closing_time: string;
  working_days: string[];
  contact_name?: string;
  contact_phone?: string;
  approval_status: string;
  is_active: boolean;
  categories?: { name?: string };
  center_photos?: { id: string; image_url: string; is_cover: boolean }[];
}

interface Holiday {
  id: string;
  date: string;
  reason?: string;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const INPUT_CLS = "bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl px-4 py-2.5 text-sm outline-none text-[#0F172A] placeholder:text-[#94A3B8] w-full";

type Tab = "details" | "photos" | "schedule";

export default function CenterManagePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [center, setCenter] = useState<CenterDetail | null>(null);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("details");
  const [error, setError] = useState<string | null>(null);

  // Details form
  const [form, setForm] = useState({
    centerName: "",
    description: "",
    address: "",
    locality: "",
    city: "",
    state: "",
    pincode: "",
    openingTime: "",
    closingTime: "",
    contactName: "",
    contactPhone: "",
    workingDays: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Photos
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Holidays
  const [newHoliday, setNewHoliday] = useState({ date: "", reason: "" });
  const [addingHoliday, setAddingHoliday] = useState(false);

  // Block date
  const [blockDate, setBlockDate] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [blocking, setBlocking] = useState(false);

  function load() {
    const token = getVendorToken() ?? undefined;
    setLoading(true);
    Promise.all([
      apiGet<CenterDetail>(`/vendor/centers/${id}`, token),
      apiGet<Holiday[]>(`/vendor/centers/${id}/holidays`, token).catch(() => [] as Holiday[]),
    ])
      .then(([c, h]) => {
        setCenter(c);
        setHolidays(h ?? []);
        setForm({
          centerName: c.center_name ?? "",
          description: c.description ?? "",
          address: c.address ?? "",
          locality: c.locality ?? "",
          city: c.city ?? "",
          state: c.state ?? "",
          pincode: c.pincode ?? "",
          openingTime: c.opening_time ?? "09:00",
          closingTime: c.closing_time ?? "21:00",
          contactName: c.contact_name ?? "",
          contactPhone: c.contact_phone ?? "",
          workingDays: c.working_days ?? [],
        });
      })
      .catch((err) => setError((err as Error).message ?? "Failed to load center"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [id]);

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

  async function handleSave() {
    setSaving(true);
    setSaveSuccess(false);
    setError(null);
    try {
      const token = getVendorToken() ?? undefined;
      await apiPut(`/vendor/centers/${id}`, {
        centerName: form.centerName.trim(),
        description: form.description.trim() || undefined,
        address: form.address.trim(),
        locality: form.locality.trim() || undefined,
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        openingTime: form.openingTime,
        closingTime: form.closingTime,
        contactName: form.contactName.trim() || undefined,
        contactPhone: form.contactPhone.trim() || undefined,
        workingDays: form.workingDays,
      }, token);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError((err as Error).message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const token = getVendorToken() ?? undefined;
      const fd = new FormData();
      fd.append("photo", file);
      await apiUploadFile(`/vendor/centers/${id}/photos`, fd, token);
      load();
    } catch (err) {
      setError((err as Error).message ?? "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleAddHoliday() {
    if (!newHoliday.date) return;
    setAddingHoliday(true);
    try {
      const token = getVendorToken() ?? undefined;
      await apiPost(`/vendor/centers/${id}/holidays`, {
        date: newHoliday.date,
        reason: newHoliday.reason.trim() || undefined,
      }, token);
      setNewHoliday({ date: "", reason: "" });
      load();
    } catch (err) {
      setError((err as Error).message ?? "Failed to add holiday");
    } finally {
      setAddingHoliday(false);
    }
  }

  async function handleBlockDate() {
    if (!blockDate) return;
    setBlocking(true);
    try {
      const token = getVendorToken() ?? undefined;
      await apiPost(`/vendor/centers/${id}/block-date`, {
        date: blockDate,
        reason: blockReason.trim() || undefined,
      }, token);
      setBlockDate("");
      setBlockReason("");
    } catch (err) {
      setError((err as Error).message ?? "Failed to block date");
    } finally {
      setBlocking(false);
    }
  }

  const isActive = center?.approval_status === "approved" && center.is_active;
  const statusColor = isActive ? "bg-emerald-100 text-emerald-700"
    : center?.approval_status === "pending" ? "bg-amber-100 text-amber-700"
    : "bg-slate-100 text-slate-500";

  return (
    <SuperPartnerLayout
      title={center?.center_name ?? "Manage Center"}
      subtitle={center ? `${center.city} · ${center.categories?.name ?? "Workspace"}` : ""}
    >
      {/* Back + status bar */}
      <div className="mb-5 flex items-center gap-4">
        <button
          onClick={() => navigate("/partner/centers")}
          className="flex items-center gap-1.5 text-sm font-medium text-[#64748B] hover:text-[#0F172A] transition-colors"
        >
          <ArrowLeft size={15} /> Back to Centers
        </button>
        {center && (
          <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${statusColor}`}>
            {isActive ? "Active" : center.approval_status === "pending" ? "Pending Approval" : center.approval_status}
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
          <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-sm text-[#94A3B8]">
          <Loader2 size={20} className="animate-spin mr-2" /> Loading center…
        </div>
      ) : !center ? null : (
        <>
          {/* Tabs */}
          <div className="mb-5 flex gap-1 rounded-xl border border-[#E2E8F0] bg-white p-1 shadow-sm w-fit">
            {([
              { key: "details", label: "Details", icon: Building2 },
              { key: "photos",  label: "Photos",  icon: Camera },
              { key: "schedule", label: "Schedule", icon: Calendar },
            ] as { key: Tab; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  tab === key ? "bg-[#2563EB] text-white shadow-sm" : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          {/* ── DETAILS TAB ── */}
          {tab === "details" && (
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Basic Information</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#0F172A]">Center Name *</label>
                  <input value={form.centerName} onChange={(e) => set("centerName", e.target.value)} className={INPUT_CLS} />
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#0F172A]">Description</label>
                  <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3}
                    className={`${INPUT_CLS} resize-none`} placeholder="Brief description…" />
                </div>

                <div className="sm:col-span-2 border-t border-[#E2E8F0] pt-4">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Location</p>
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#0F172A]">Address *</label>
                  <input value={form.address} onChange={(e) => set("address", e.target.value)} className={INPUT_CLS} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#0F172A]">Locality</label>
                  <input value={form.locality} onChange={(e) => set("locality", e.target.value)} placeholder="e.g. Whitefield" className={INPUT_CLS} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#0F172A]">City *</label>
                  <input value={form.city} onChange={(e) => set("city", e.target.value)} className={INPUT_CLS} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#0F172A]">State *</label>
                  <input value={form.state} onChange={(e) => set("state", e.target.value)} className={INPUT_CLS} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#0F172A]">Pincode *</label>
                  <input value={form.pincode} onChange={(e) => set("pincode", e.target.value)} maxLength={6} className={INPUT_CLS} />
                </div>

                <div className="sm:col-span-2 border-t border-[#E2E8F0] pt-4">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Operating Hours</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#0F172A]"><Clock size={11} className="inline mr-1" />Opening Time</label>
                  <input type="time" value={form.openingTime} onChange={(e) => set("openingTime", e.target.value)} className={INPUT_CLS} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#0F172A]"><Clock size={11} className="inline mr-1" />Closing Time</label>
                  <input type="time" value={form.closingTime} onChange={(e) => set("closingTime", e.target.value)} className={INPUT_CLS} />
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#0F172A]">Working Days</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map((day) => (
                      <button key={day} type="button" onClick={() => toggleDay(day)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                          form.workingDays.includes(day)
                            ? "bg-[#2563EB] text-white"
                            : "border border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB]"
                        }`}>
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2 border-t border-[#E2E8F0] pt-4">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Contact (Optional)</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#0F172A]">Contact Name</label>
                  <input value={form.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="Manager name" className={INPUT_CLS} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#0F172A]">Contact Phone</label>
                  <input value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} type="tel" placeholder="+91 XXXXX XXXXX" className={INPUT_CLS} />
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                {saveSuccess && (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                    <Check size={14} /> Saved successfully
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── PHOTOS TAB ── */}
          {tab === "photos" && (
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#0F172A]">Center Photos</p>
                  <p className="text-xs text-[#94A3B8]">{center.center_photos?.length ?? 0} photos uploaded</p>
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
                >
                  {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                  {uploading ? "Uploading…" : "Upload Photo"}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUploadPhoto} />
              </div>

              {(!center.center_photos || center.center_photos.length === 0) ? (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="cursor-pointer rounded-2xl border-2 border-dashed border-[#E2E8F0] p-12 text-center hover:border-[#2563EB] transition-colors"
                >
                  <Camera size={32} className="mx-auto text-[#E2E8F0]" />
                  <p className="mt-3 text-sm font-semibold text-[#0F172A]">No photos yet</p>
                  <p className="mt-1 text-xs text-[#94A3B8]">Click to upload your first center photo</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {center.center_photos.map((photo) => (
                    <div key={photo.id} className="relative group overflow-hidden rounded-xl border border-[#E2E8F0]">
                      <img src={photo.image_url} alt="Center" className="h-32 w-full object-cover group-hover:scale-105 transition-transform duration-200" />
                      {photo.is_cover && (
                        <span className="absolute top-2 left-2 rounded-full bg-[#2563EB] px-2 py-0.5 text-[10px] font-bold text-white">Cover</span>
                      )}
                    </div>
                  ))}
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#E2E8F0] text-[#94A3B8] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
                  >
                    <Plus size={20} />
                    <span className="text-xs font-medium">Add Photo</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── SCHEDULE TAB ── */}
          {tab === "schedule" && (
            <div className="space-y-5">
              {/* Holidays */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                    <Calendar size={15} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0F172A]">Holidays</p>
                    <p className="text-xs text-[#94A3B8]">Days the center will be closed</p>
                  </div>
                </div>

                <div className="mb-4 grid gap-3 sm:grid-cols-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#0F172A]">Date *</label>
                    <input type="date" value={newHoliday.date}
                      onChange={(e) => setNewHoliday((p) => ({ ...p, date: e.target.value }))}
                      className={INPUT_CLS} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#0F172A]">Reason</label>
                    <input value={newHoliday.reason}
                      onChange={(e) => setNewHoliday((p) => ({ ...p, reason: e.target.value }))}
                      placeholder="e.g. Diwali"
                      className={INPUT_CLS} />
                  </div>
                  <div className="flex items-end">
                    <button onClick={handleAddHoliday} disabled={!newHoliday.date || addingHoliday}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition-colors disabled:opacity-50">
                      {addingHoliday ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                      Add Holiday
                    </button>
                  </div>
                </div>

                {holidays.length > 0 ? (
                  <div className="divide-y divide-[#F1F5F9] rounded-xl border border-[#E2E8F0]">
                    {holidays.map((h) => (
                      <div key={h.id} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-[#0F172A]">{h.date}</p>
                          {h.reason && <p className="text-xs text-[#64748B]">{h.reason}</p>}
                        </div>
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">Holiday</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-xs text-[#94A3B8] py-4">No holidays added yet</p>
                )}
              </div>

              {/* Block Date */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                    <Ban size={15} className="text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0F172A]">Block a Date</p>
                    <p className="text-xs text-[#94A3B8]">Prevent new bookings for a specific date</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#0F172A]">Date *</label>
                    <input type="date" value={blockDate}
                      onChange={(e) => setBlockDate(e.target.value)}
                      className={INPUT_CLS} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#0F172A]">Reason</label>
                    <input value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      placeholder="e.g. Private event"
                      className={INPUT_CLS} />
                  </div>
                  <div className="flex items-end">
                    <button onClick={handleBlockDate} disabled={!blockDate || blocking}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50">
                      {blocking ? <Loader2 size={13} className="animate-spin" /> : <Ban size={13} />}
                      Block Date
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </SuperPartnerLayout>
  );
}
