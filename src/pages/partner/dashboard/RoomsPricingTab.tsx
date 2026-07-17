import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Loader2, CalendarClock, Ban, Check, X, IndianRupee, Pencil } from "lucide-react";
import { apiGet, apiPost, apiPatch, apiDelete, getVendorToken, ApiError } from "../../../lib/api";
import { PRODUCT_META, typesForCategory, isSlotBased, type ProductType } from "../../../lib/productTypes";

interface Plan {
  id: string;
  name: string;
  product_type: ProductType;
  plan_type?: string | null;
  price: number;
  unit?: string | null;
  capacity?: number | null;
  duration_days?: number | null;
  duration_hours?: number | null;
  description?: string | null;
  is_active: boolean;
  active_bookings?: number;
}

interface Slot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  price: number;
  capacity: number;
  available_count: number;
  status: string;
}

const INPUT = "bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl px-3 py-2 text-sm outline-none text-[#0F172A] placeholder:text-[#94A3B8] w-full";
const LABEL = "block text-xs font-semibold text-[#475569] mb-1";

export default function RoomsPricingTab({ centerId, categoryName }: { centerId: string; categoryName?: string }) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [manageSlotsFor, setManageSlotsFor] = useState<Plan | null>(null);

  const allowed = typesForCategory(categoryName);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await apiGet<Plan[]>(`/vendor/centers/${centerId}/plans`, getVendorToken() ?? undefined);
      setPlans(Array.isArray(rows) ? rows : []);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load plans");
    } finally {
      setLoading(false);
    }
  }, [centerId]);

  useEffect(() => { load(); }, [load]);

  async function toggleActive(p: Plan) {
    await apiPatch(`/vendor/centers/${centerId}/plans/${p.id}`, { isActive: !p.is_active }, getVendorToken() ?? undefined);
    load();
  }

  async function remove(p: Plan) {
    if (!confirm(`Delete "${p.name}"? If it has bookings it will be deactivated instead.`)) return;
    await apiDelete(`/vendor/centers/${centerId}/plans/${p.id}`, getVendorToken() ?? undefined);
    load();
  }

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-[#0F172A]">Rooms &amp; Pricing</p>
          <p className="text-xs text-[#94A3B8]">
            {categoryName ? `${categoryName} — ` : ""}the bookable rooms/passes customers see and book
          </p>
        </div>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
        >
          <Plus size={15} /> Add
        </button>
      </div>

      {showAdd && (
        <AddPlanForm
          centerId={centerId}
          allowed={allowed}
          onClose={() => setShowAdd(false)}
          onCreated={() => { setShowAdd(false); load(); }}
        />
      )}

      {loading ? (
        <div className="py-10 text-center text-sm text-[#94A3B8]"><Loader2 className="mx-auto animate-spin" /></div>
      ) : error ? (
        <div className="py-6 text-center text-sm text-red-500">{error}</div>
      ) : plans.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E2E8F0] py-10 text-center">
          <p className="text-sm font-semibold text-[#0F172A]">No rooms/plans yet</p>
          <p className="mt-1 text-xs text-[#94A3B8]">Add your first bookable product so customers can find and book this center.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {plans.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-[#0F172A] truncate">{p.name}</p>
                  <span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#2563EB]">
                    {PRODUCT_META[p.product_type]?.label ?? p.product_type}{p.plan_type ? ` · ${p.plan_type}` : ""}
                  </span>
                  {!p.is_active && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">Inactive</span>}
                </div>
                <p className="mt-1 text-xs text-[#64748B]">
                  <IndianRupee size={11} className="inline -mt-0.5" />{p.price}/{p.unit ?? PRODUCT_META[p.product_type]?.unit}
                  {" · "}{p.capacity ?? 1} {isSlotBased(p) ? "capacity" : "units"}
                  {p.duration_hours ? ` · ${p.duration_hours}h` : ""}
                  {p.active_bookings ? ` · ${p.active_bookings} active bookings` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isSlotBased(p) && (
                  <button onClick={() => setManageSlotsFor(p)} className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-semibold text-[#2563EB] hover:bg-[#EFF6FF]">
                    <CalendarClock size={13} /> Slots
                  </button>
                )}
                <button onClick={() => toggleActive(p)} className="rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC]">
                  {p.is_active ? "Deactivate" : "Activate"}
                </button>
                <button onClick={() => remove(p)} className="rounded-lg border border-[#E2E8F0] p-1.5 text-[#94A3B8] hover:bg-red-50 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {manageSlotsFor && (
        <SlotManager centerId={centerId} plan={manageSlotsFor} onClose={() => setManageSlotsFor(null)} />
      )}
    </div>
  );
}

// ── Add-plan form ──────────────────────────────────────────────────────────────
function AddPlanForm({ centerId, allowed, onClose, onCreated }: {
  centerId: string; allowed: ProductType[]; onClose: () => void; onCreated: () => void;
}) {
  const [productType, setProductType] = useState<ProductType>(allowed[0]);
  const [name, setName] = useState("");
  const [planType, setPlanType] = useState("");
  const [price, setPrice] = useState("");
  const [capacity, setCapacity] = useState("1");
  const [durationHours, setDurationHours] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const isHotel = productType === "hotel_room";
  const hourly = isHotel && planType === "hourly";

  async function submit() {
    if (!name.trim()) { setErr("Name is required"); return; }
    if (!price || Number(price) < 0) { setErr("Enter a valid price"); return; }
    if (hourly && !durationHours) { setErr("Enter day-use duration (hours)"); return; }
    setSaving(true); setErr("");
    try {
      await apiPost(`/vendor/centers/${centerId}/plans`, {
        name: name.trim(),
        productType,
        planType: isHotel ? (planType || "nightly") : (planType || undefined),
        price: Math.round(Number(price)),
        unit: hourly ? "hour" : PRODUCT_META[productType].unit,
        capacity: Math.max(1, Number(capacity) || 1),
        durationHours: hourly ? Number(durationHours) : undefined,
        durationDays: productType === "coworking_monthly_pass" ? 30 : undefined,
        description: description.trim() || undefined,
      }, getVendorToken() ?? undefined);
      onCreated();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Failed to add");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mb-5 rounded-xl border border-[#BFDBFE] bg-[#F8FAFF] p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={LABEL}>Type</label>
          <select className={INPUT} value={productType} onChange={(e) => { setProductType(e.target.value as ProductType); setPlanType(""); }}>
            {allowed.map((t) => <option key={t} value={t}>{PRODUCT_META[t].label}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL}>Name</label>
          <input className={INPUT} value={name} onChange={(e) => setName(e.target.value)} placeholder={isHotel ? "Deluxe Room" : "e.g. Conference Room A"} />
        </div>

        {isHotel && (
          <div>
            <label className={LABEL}>Booking mode</label>
            <select className={INPUT} value={planType || "nightly"} onChange={(e) => setPlanType(e.target.value)}>
              <option value="nightly">Per night (stay)</option>
              <option value="hourly">Day-use (hourly)</option>
            </select>
          </div>
        )}
        {hourly && (
          <div>
            <label className={LABEL}>Day-use duration</label>
            <select className={INPUT} value={durationHours} onChange={(e) => setDurationHours(e.target.value)}>
              <option value="">Select</option>
              <option value="3">3 hours</option>
              <option value="6">6 hours</option>
              <option value="12">12 hours</option>
            </select>
          </div>
        )}

        <div>
          <label className={LABEL}>Price (₹ per {hourly ? "slot" : PRODUCT_META[productType].unit})</label>
          <input className={INPUT} type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="3500" />
        </div>
        <div>
          <label className={LABEL}>{isSlotBased({ product_type: productType, plan_type: planType }) ? "Capacity per slot" : "Inventory (units available)"}</label>
          <input className={INPUT} type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="5" />
        </div>
        <div className="sm:col-span-2">
          <label className={LABEL}>Description (optional)</label>
          <input className={INPUT} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="King bed, city view, breakfast included" />
        </div>
      </div>

      {err && <p className="mt-2 text-xs text-red-500">{err}</p>}
      <div className="mt-3 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#475569] hover:bg-white">Cancel</button>
        <button onClick={submit} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] disabled:opacity-60">
          {saving && <Loader2 size={14} className="animate-spin" />} Save
        </button>
      </div>
    </div>
  );
}

// ── Per-plan slot manager (generate + view + block) ────────────────────────────
function SlotManager({ centerId, plan, onClose }: { centerId: string; plan: Plan; onClose: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [viewDate, setViewDate] = useState(today);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [gen, setGen] = useState({ startDate: today, endDate: today, slotStartTime: "09:00", slotEndTime: "18:00", slotDurationMins: plan.duration_hours ? plan.duration_hours * 60 : 60 });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editCapacity, setEditCapacity] = useState("");
  const [editBusy, setEditBusy] = useState(false);

  const loadSlots = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await apiGet<Slot[]>(`/slots/${centerId}/vendor?date=${viewDate}&planId=${plan.id}`, getVendorToken() ?? undefined);
      setSlots(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setSlots([]);
      setMsg(e instanceof ApiError ? e.message : "Failed to load slots");
    } finally {
      setLoading(false);
    }
  }, [centerId, plan.id, viewDate]);

  useEffect(() => { loadSlots(); }, [loadSlots]);

  async function generate() {
    setBusy(true); setMsg("");
    try {
      const res = await apiPost<{ count: number }>(`/slots/${centerId}/generate`, { planId: plan.id, ...gen }, getVendorToken() ?? undefined);
      setMsg(`${res.count} slots generated`);
      setViewDate(gen.startDate);
      loadSlots();
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "Failed to generate");
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(slot: Slot, status: "blocked" | "available") {
    try {
      await apiPatch(`/slots/${centerId}/${slot.id}/status`, { status }, getVendorToken() ?? undefined);
      loadSlots();
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "Failed to update slot");
    }
  }

  // A slot whose start time already passed can't be sold anymore — show it
  // greyed out instead of pretending it's still actionable.
  function isPast(s: Slot): boolean {
    const now = new Date();
    const todayLocal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const nowTime = now.toTimeString().slice(0, 8);
    return s.slot_date < todayLocal || (s.slot_date === todayLocal && s.start_time <= nowTime);
  }

  const SLOT_STATUS_CHIP: Record<string, string> = {
    available: "border-emerald-200 bg-emerald-50",
    partial: "border-amber-200 bg-amber-50",
    booked: "border-slate-200 bg-slate-100 opacity-70",
    blocked: "border-red-200 bg-red-50",
    holiday: "border-violet-200 bg-violet-50",
  };

  function startEdit(s: Slot) {
    setEditingSlotId(s.id);
    setEditPrice(String(s.price));
    setEditCapacity(String(s.capacity));
  }

  async function saveEdit(s: Slot) {
    if (!editPrice || !editCapacity) return;
    setEditBusy(true);
    try {
      await apiPatch(`/slots/${centerId}/${s.id}`, { price: Number(editPrice), capacity: Number(editCapacity) }, getVendorToken() ?? undefined);
      setEditingSlotId(null);
      loadSlots();
    } catch {
      // error is silent — slot card stays open so user can retry
    } finally {
      setEditBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[#0F172A]">Manage Slots — {plan.name}</p>
            <p className="text-xs text-[#94A3B8]">Generate bookable time slots, then block any you don't want sold.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-slate-100"><X size={18} /></button>
        </div>

        {/* Generate */}
        <div className="rounded-xl border border-[#E2E8F0] p-4">
          <p className="mb-2 text-xs font-bold text-[#0F172A]">Generate slots</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div><label className={LABEL}>From date</label><input type="date" className={INPUT} value={gen.startDate} onChange={(e) => setGen({ ...gen, startDate: e.target.value })} /></div>
            <div><label className={LABEL}>To date</label><input type="date" className={INPUT} value={gen.endDate} onChange={(e) => setGen({ ...gen, endDate: e.target.value })} /></div>
            <div><label className={LABEL}>Duration (mins)</label><input type="number" className={INPUT} value={gen.slotDurationMins} onChange={(e) => setGen({ ...gen, slotDurationMins: Number(e.target.value) })} /></div>
            <div><label className={LABEL}>Open time</label><input type="time" className={INPUT} value={gen.slotStartTime} onChange={(e) => setGen({ ...gen, slotStartTime: e.target.value })} /></div>
            <div><label className={LABEL}>Close time</label><input type="time" className={INPUT} value={gen.slotEndTime} onChange={(e) => setGen({ ...gen, slotEndTime: e.target.value })} /></div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-[#64748B]">{msg}</span>
            <button onClick={generate} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] disabled:opacity-60">
              {busy && <Loader2 size={14} className="animate-spin" />} Generate
            </button>
          </div>
        </div>

        {/* View + block */}
        <div className="mt-4">
          <div className="mb-2 flex items-center gap-2">
            <label className={LABEL + " !mb-0"}>View date</label>
            <input type="date" className={INPUT + " !w-auto"} value={viewDate} onChange={(e) => setViewDate(e.target.value)} />
          </div>
          {loading ? (
            <div className="py-6 text-center text-sm text-[#94A3B8]"><Loader2 className="mx-auto animate-spin" /></div>
          ) : slots.length === 0 ? (
            <p className="py-6 text-center text-xs text-[#94A3B8]">No slots for this date. Generate some above.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {slots.map((s) =>
                editingSlotId === s.id ? (
                  <div key={s.id} className="rounded-lg border border-[#2563EB]/40 bg-[#F8FAFF] px-3 py-2">
                    <p className="mb-2 text-xs font-semibold text-[#0F172A]">{s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}</p>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-[#475569]">Price ₹</label>
                        <input
                          type="number"
                          className="mt-0.5 w-full rounded-lg border border-[#E2E8F0] bg-white px-2 py-1 text-xs outline-none focus:border-[#2563EB]"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-[#475569]">Cap</label>
                        <input
                          type="number"
                          className="mt-0.5 w-full rounded-lg border border-[#E2E8F0] bg-white px-2 py-1 text-xs outline-none focus:border-[#2563EB]"
                          value={editCapacity}
                          onChange={(e) => setEditCapacity(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end gap-1">
                      <button onClick={() => setEditingSlotId(null)} className="rounded p-1 text-[#94A3B8] hover:bg-slate-100" title="Cancel"><X size={13} /></button>
                      <button onClick={() => saveEdit(s)} disabled={editBusy} className="rounded p-1 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50" title="Save">
                        {editBusy ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div key={s.id}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                      isPast(s) ? "border-[#E2E8F0] bg-[#F8FAFC] opacity-60" : SLOT_STATUS_CHIP[s.status] ?? "border-[#E2E8F0]"
                    }`}>
                    <div>
                      <p className="text-xs font-semibold text-[#0F172A]">{s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}</p>
                      <p className="text-[10px] text-[#64748B]">
                        {isPast(s) ? "Past" : s.status === "blocked" ? "Blocked" : s.status === "holiday" ? "Holiday" : `${s.available_count}/${s.capacity} left`} · ₹{s.price}
                      </p>
                    </div>
                    {!isPast(s) && (
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => startEdit(s)} className="rounded p-1 text-[#94A3B8] hover:bg-white hover:text-[#2563EB]" title="Edit price/capacity"><Pencil size={12} /></button>
                        {s.status === "blocked" || s.status === "holiday" ? (
                          <button onClick={() => setStatus(s, "available")} className="rounded p-1 text-emerald-600 hover:bg-emerald-50" title="Re-open"><Check size={14} /></button>
                        ) : (
                          <button onClick={() => setStatus(s, "blocked")} className="rounded p-1 text-[#94A3B8] hover:bg-red-50 hover:text-red-500" title="Block"><Ban size={14} /></button>
                        )}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
