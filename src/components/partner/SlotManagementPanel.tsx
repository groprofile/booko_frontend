import { useState, useEffect, useCallback } from "react";
import {
  CalendarClock, ChevronLeft, ChevronRight, Ban, CalendarOff,
  RotateCcw, Trash2, Info,
} from "lucide-react";
import { showToast } from "../admin/Toast";
import { apiGet, apiPost, apiPatch, apiDelete, getVendorToken, ApiError } from "../../lib/api";

interface Slot {
  id: string;
  plan_id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  price: number;
  capacity: number;
  available_count: number;
  status: "available" | "partial" | "booked" | "blocked" | "holiday";
  plan_name?: string | null;
  product_type?: string | null;
}

const STATUS_STYLE: Record<Slot["status"], { chip: string; dot: string; label: string }> = {
  available: { chip: "border-emerald-200 bg-emerald-50 text-emerald-800", dot: "bg-emerald-500", label: "Available" },
  partial:   { chip: "border-amber-200 bg-amber-50 text-amber-800",       dot: "bg-amber-500",   label: "Partially booked" },
  booked:    { chip: "border-slate-200 bg-slate-100 text-slate-500",      dot: "bg-slate-400",   label: "Fully booked" },
  blocked:   { chip: "border-red-200 bg-red-50 text-red-700",             dot: "bg-red-500",     label: "Blocked" },
  holiday:   { chip: "border-violet-200 bg-violet-50 text-violet-700",    dot: "bg-violet-500",  label: "Holiday" },
};

const fmtTime = (t?: string) => (t ? t.slice(0, 5) : "—");

function todayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

// A slot whose start time has passed can no longer be sold — shown greyed out.
function isPastSlot(s: Slot): boolean {
  const today = todayStr();
  return s.slot_date < today || (s.slot_date === today && s.start_time <= new Date().toTimeString().slice(0, 8));
}

function shiftDate(date: string, days: number): string {
  const d = new Date(date + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Full slot-management surface for one center: date navigation, per-plan slot
// grid with click-to-block, and whole-date bulk actions. Embedded both in the
// owner's Manage Center → Slots tab and the manager's standalone page.
export default function SlotManagementPanel({ centerId }: { centerId: string }) {
  const [date, setDate] = useState(todayStr());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  const loadSlots = useCallback(() => {
    const token = getVendorToken() ?? undefined;
    setLoading(true);
    apiGet<Slot[]>(`/slots/${centerId}/vendor?date=${date}`, token)
      .then((data) => setSlots(Array.isArray(data) ? data : []))
      .catch((err) => {
        setSlots([]);
        showToast(err instanceof ApiError ? err.message : "Failed to load slots", "error");
      })
      .finally(() => setLoading(false));
  }, [centerId, date]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  async function toggleSlot(slot: Slot) {
    if (togglingId) return;
    const blocking = slot.status !== "blocked" && slot.status !== "holiday";
    if (blocking && slot.available_count < slot.capacity) {
      if (!window.confirm("This slot already has bookings. Blocking hides it from new customers but existing bookings stay valid. Block anyway?")) return;
    }
    setTogglingId(slot.id);
    try {
      await apiPatch(`/slots/${centerId}/${slot.id}/status`, { status: blocking ? "blocked" : "available" }, getVendorToken() ?? undefined);
      showToast(blocking ? "Slot blocked" : "Slot re-opened", "success");
      loadSlots();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to update slot", "error");
    } finally {
      setTogglingId(null);
    }
  }

  async function bulkAction(kind: "block" | "holiday" | "unblock" | "delete") {
    if (bulkBusy) return;
    const token = getVendorToken() ?? undefined;
    const confirmations: Record<typeof kind, string> = {
      block: `Block ALL slots on ${date}? Customers won't be able to book this date.`,
      holiday: `Mark ${date} as a holiday? All slots will be hidden from customers.`,
      unblock: `Re-open ${date}? Blocked/holiday slots become bookable again (booked slots stay booked).`,
      delete: `Delete all EMPTY slots on ${date}? Slots with bookings are kept. This cannot be undone.`,
    };
    if (!window.confirm(confirmations[kind])) return;

    setBulkBusy(true);
    try {
      if (kind === "block" || kind === "holiday") {
        const path = kind === "block" ? "block-date" : "holidays";
        const res = await apiPost<{ slotsWithBookings?: number }>(`/vendor/centers/${centerId}/${path}`, { date }, token);
        showToast(
          (res.slotsWithBookings ?? 0) > 0
            ? `Date ${kind === "block" ? "blocked" : "marked as holiday"} — ${res.slotsWithBookings} slot(s) had existing bookings`
            : `Date ${kind === "block" ? "blocked" : "marked as holiday"}`,
          "success",
        );
      } else if (kind === "unblock") {
        const res = await apiPost<{ slotsReopened?: number }>(`/vendor/centers/${centerId}/unblock-date`, { date }, token);
        showToast(`${res.slotsReopened ?? 0} slot(s) re-opened`, "success");
      } else {
        const res = await apiDelete<{ deleted?: number; skippedWithBookings?: number }>(`/slots/${centerId}/date/${date}`, token);
        showToast(
          (res.skippedWithBookings ?? 0) > 0
            ? `${res.deleted ?? 0} slot(s) deleted · ${res.skippedWithBookings} kept (have bookings)`
            : `${res.deleted ?? 0} slot(s) deleted`,
          "success",
        );
      }
      loadSlots();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Action failed", "error");
    } finally {
      setBulkBusy(false);
    }
  }

  // Group slots per plan for sectioned display
  const plans = slots.reduce<Record<string, { name: string; slots: Slot[] }>>((acc, s) => {
    const key = s.plan_id ?? "other";
    if (!acc[key]) acc[key] = { name: s.plan_name ?? "Other slots", slots: [] };
    acc[key].slots.push(s);
    return acc;
  }, {});

  const openCount = slots.filter((s) => !isPastSlot(s) && (s.status === "available" || s.status === "partial")).length;
  const blockedCount = slots.filter((s) => s.status === "blocked" || s.status === "holiday").length;

  const bulkButtons = [
    { kind: "block" as const, label: "Block Date", icon: Ban, cls: "text-[#DC2626] hover:bg-[#FEE2E2]" },
    { kind: "holiday" as const, label: "Mark Holiday", icon: CalendarOff, cls: "text-[#7C3AED] hover:bg-violet-50" },
    { kind: "unblock" as const, label: "Re-open Date", icon: RotateCcw, cls: "text-[#16A34A] hover:bg-emerald-50" },
    { kind: "delete" as const, label: "Delete Empty Slots", icon: Trash2, cls: "text-[#64748B] hover:bg-[#F1F5F9]" },
  ];

  return (
    <div>
      {/* Controls */}
      <div className="mb-5 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <button onClick={() => setDate((d) => shiftDate(d, -1))}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB]">
              <ChevronLeft size={15} />
            </button>
            <input
              type="date"
              value={date}
              onChange={(e) => e.target.value && setDate(e.target.value)}
              className="h-9 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-sm outline-none focus:border-[#2563EB]"
            />
            <button onClick={() => setDate((d) => shiftDate(d, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB]">
              <ChevronRight size={15} />
            </button>
            {date !== todayStr() && (
              <button onClick={() => setDate(todayStr())}
                className="ml-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#2563EB] hover:bg-[#EFF6FF]">
                Today
              </button>
            )}
          </div>

          {!loading && slots.length > 0 && (
            <span className="text-xs text-[#64748B]">
              <span className="font-bold text-[#0F172A]">{openCount}</span> bookable ·{" "}
              <span className="font-bold text-[#0F172A]">{blockedCount}</span> blocked
            </span>
          )}

          <div className="ml-auto flex flex-wrap gap-1.5">
            {bulkButtons.map((b) => (
              <button key={b.kind} onClick={() => bulkAction(b.kind)} disabled={bulkBusy || loading || slots.length === 0}
                className={`flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-40 ${b.cls}`}>
                <b.icon size={13} /> {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-[#F1F5F9] pt-3">
          {Object.entries(STATUS_STYLE).map(([k, v]) => (
            <span key={k} className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
              <span className={`h-2 w-2 rounded-full ${v.dot}`} /> {v.label}
            </span>
          ))}
          <span className="ml-auto flex items-center gap-1 text-[11px] text-[#94A3B8]">
            <Info size={11} /> Click a slot to block / re-open it
          </span>
        </div>
      </div>

      {/* Slots */}
      {loading ? (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="mb-4 h-4 w-40 animate-pulse rounded bg-[#E2E8F0]" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-[74px] animate-pulse rounded-xl bg-[#E2E8F0]" />
            ))}
          </div>
        </div>
      ) : slots.length === 0 ? (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white py-16 text-center shadow-sm">
          <CalendarClock size={32} className="mx-auto text-[#E2E8F0]" />
          <p className="mt-3 text-sm font-semibold text-[#0F172A]">No slots on this date</p>
          <p className="mt-1 text-xs text-[#94A3B8]">
            Slots are generated per plan from the Rooms &amp; Pricing tab.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {Object.entries(plans).map(([planId, group]) => (
            <div key={planId} className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-bold text-[#0F172A]">{group.name}</p>
                <p className="text-xs text-[#94A3B8]">{group.slots.length} slot(s)</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {group.slots.map((s) => {
                  const past = isPastSlot(s);
                  const style = STATUS_STYLE[s.status] ?? STATUS_STYLE.available;
                  const busy = togglingId === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => !past && toggleSlot(s)}
                      disabled={busy || past}
                      title={past ? "This slot's time has passed" : `${style.label} — click to ${s.status === "blocked" || s.status === "holiday" ? "re-open" : "block"}`}
                      className={`rounded-xl border p-3 text-left transition-all disabled:cursor-not-allowed ${
                        past
                          ? "border-[#E2E8F0] bg-[#F8FAFC] text-[#94A3B8] opacity-60"
                          : `hover:-translate-y-0.5 hover:shadow-md ${style.chip} ${busy ? "opacity-50" : ""}`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">
                          {fmtTime(s.start_time)}–{fmtTime(s.end_time)}
                        </span>
                        <span className={`h-2 w-2 shrink-0 rounded-full ${past ? "bg-[#CBD5E1]" : style.dot}`} />
                      </div>
                      <p className="mt-1.5 text-[11px] opacity-80">
                        ₹{Number(s.price).toLocaleString("en-IN")} · {s.available_count}/{s.capacity} left
                      </p>
                      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide opacity-70">
                        {busy ? "Updating…" : past ? "Past" : style.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
