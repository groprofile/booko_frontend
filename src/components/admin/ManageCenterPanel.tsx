import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  X, MapPin, Building2, Clock, Phone, CheckCircle, XCircle,
  Sparkles, IndianRupee, Loader2, Check,
} from "lucide-react";
import { apiGet, apiPatch, getAdminToken, ApiError } from "../../lib/api";
import { PRODUCT_META, type ProductType } from "../../lib/productTypes";

interface ApiCenter {
  id: string;
  center_name: string;
  city: string;
  locality?: string;
  address?: string;
  approval_status: string;
  is_active: boolean;
  created_at: string;
  contact_phone?: string;
  is_featured?: boolean;
  featured_rank?: number | null;
  vendors?: { business_name?: string; email?: string };
  categories?: { name?: string; commission_percent?: string | number | null };
}

interface Plan {
  id: string;
  name: string;
  product_type: ProductType;
  price: number;
  unit?: string | null;
  is_active: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  rejected: "bg-red-100 text-red-700",
};

interface Props {
  center: ApiCenter;
  onClose: () => void;
  approvingId: string | null;
  featuringId: string | null;
  togglingActiveId: string | null;
  onApprove: (center: ApiCenter) => void;
  onReject: (center: ApiCenter) => void;
  onToggleFeatured: (center: ApiCenter) => void;
  onSetRank: (center: ApiCenter, rank: number | null) => void;
  onToggleActive: (center: ApiCenter) => void;
}

export default function ManageCenterPanel({
  center, onClose, approvingId, featuringId, togglingActiveId,
  onApprove, onReject, onToggleFeatured, onSetRank, onToggleActive,
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  function handleClose() {
    setMounted(false);
    setTimeout(onClose, 200);
  }

  // ── Plans & pricing ────────────────────────────────────────────────────────
  // Every plan's price is an always-visible, always-editable input (not
  // hidden behind a click-to-reveal state) so it's obvious at a glance that
  // admin can change it. `priceDrafts` holds the in-progress text per plan;
  // Save is only enabled once the draft differs from the saved price.
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState("");
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [rankDraft, setRankDraft] = useState(center.featured_rank == null ? "" : String(center.featured_rank));

  const loadPlans = useCallback(() => {
    const token = getAdminToken();
    if (!token) return;
    setPlansLoading(true);
    apiGet<Plan[]>(`/admin/centers/${center.id}/plans`, token)
      .then((rows) => {
        const list = Array.isArray(rows) ? rows : [];
        setPlans(list);
        setPriceDrafts(Object.fromEntries(list.map((p) => [p.id, String(p.price)])));
        setPlansError("");
      })
      .catch((e) => setPlansError(e instanceof ApiError ? e.message : "Failed to load plans"))
      .finally(() => setPlansLoading(false));
  }, [center.id]);

  useEffect(() => { loadPlans(); }, [loadPlans]);
  useEffect(() => { setRankDraft(center.featured_rank == null ? "" : String(center.featured_rank)); }, [center.featured_rank]);

  async function savePrice(p: Plan) {
    const token = getAdminToken();
    if (!token) return;
    const draft = priceDrafts[p.id] ?? String(p.price);
    const price = Number(draft);
    if (!draft.trim() || Number.isNaN(price) || price < 0) {
      setPlansError("Enter a valid price before saving.");
      return;
    }
    setSavingId(p.id);
    setPlansError("");
    const previous = plans;
    setPlans((rows) => rows.map((r) => (r.id === p.id ? { ...r, price } : r)));
    try {
      await apiPatch(`/admin/centers/${center.id}/plans/${p.id}`, { price }, token);
    } catch (e) {
      setPlans(previous);
      setPriceDrafts((d) => ({ ...d, [p.id]: String(previous.find((r) => r.id === p.id)?.price ?? p.price) }));
      setPlansError(e instanceof ApiError ? e.message : "Failed to update price");
    } finally {
      setSavingId(null);
    }
  }

  async function togglePlanActive(p: Plan) {
    const token = getAdminToken();
    if (!token) return;
    const previous = plans;
    setPlans((rows) => rows.map((r) => (r.id === p.id ? { ...r, is_active: !r.is_active } : r)));
    try {
      await apiPatch(`/admin/centers/${center.id}/plans/${p.id}`, { isActive: !p.is_active }, token);
    } catch (e) {
      setPlans(previous);
      setPlansError(e instanceof ApiError ? e.message : "Failed to update plan");
    }
  }

  function commitRank() {
    const trimmed = rankDraft.trim();
    const parsed = trimmed === "" ? null : Math.max(0, Math.floor(Number(trimmed)));
    onSetRank(center, trimmed === "" ? null : Number.isFinite(parsed as number) ? parsed : null);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${mounted ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />
      <div
        className={`relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-200 ${
          mounted ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#F1F5F9] px-6 py-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-extrabold text-[#0F172A]">{center.center_name}</h2>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[center.approval_status] ?? "bg-slate-100 text-slate-500"}`}>
                {center.approval_status.charAt(0).toUpperCase() + center.approval_status.slice(1)}
              </span>
              {center.is_featured && (
                <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-[#2563EB] px-1.5 py-0.5 text-[9px] font-semibold text-white">
                  <Sparkles size={9} /> Promoted{center.featured_rank != null ? ` #${center.featured_rank}` : ""}
                </span>
              )}
            </div>
            <p className="mt-1 truncate text-xs text-[#64748B]">{center.vendors?.business_name ?? "Unknown vendor"}</p>
          </div>
          <button onClick={handleClose} className="shrink-0 rounded-lg p-1.5 text-[#94A3B8] hover:bg-[#F8FAFC]">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Details */}
          <div className="flex flex-col gap-2 text-sm text-[#475569]">
            <div className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 shrink-0 text-[#94A3B8]" />
              <span>{[center.address, center.locality, center.city].filter(Boolean).join(", ")}</span>
            </div>
            {center.categories?.name && (
              <div className="flex items-center gap-2">
                <Building2 size={14} className="shrink-0 text-[#94A3B8]" />
                <span>{center.categories.name}</span>
              </div>
            )}
            {center.contact_phone && (
              <div className="flex items-center gap-2">
                <Phone size={14} className="shrink-0 text-[#94A3B8]" />
                <span>{center.contact_phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock size={14} className="shrink-0 text-[#94A3B8]" />
              <span>Added {new Date(center.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
          </div>

          {/* Commission */}
          <div className="mt-4 flex items-center justify-between rounded-xl bg-[#F8FAFC] px-3.5 py-2.5 text-xs text-[#64748B]">
            <span>
              Commission:{" "}
              {center.categories?.commission_percent != null
                ? `${center.categories.commission_percent}% (${center.categories.name})`
                : "Platform default"}
            </span>
            <Link to="/admin/commissions" className="font-semibold text-[#2563EB] hover:underline">Manage</Link>
          </div>

          {/* Status actions */}
          <div className="mt-5 border-t border-[#F1F5F9] pt-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#94A3B8]">Status &amp; Visibility</p>

            {/* Independent of approval — a way to temporarily hide just this
                center without rejecting it or blocking the whole vendor. */}
            <div className="mb-3 flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5">
              <div>
                <p className="text-xs font-bold text-[#0F172A]">Visible to customers</p>
                <p className="text-[11px] text-[#94A3B8]">
                  {center.is_active ? "Showing in search and listings." : "Hidden — customers can't find or book this center."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onToggleActive(center)}
                disabled={togglingActiveId === center.id}
                aria-pressed={center.is_active}
                aria-label="Toggle visibility to customers"
                className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  center.is_active ? "bg-[#2563EB]" : "bg-[#CBD5E1]"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    center.is_active ? "translate-x-[22px]" : "translate-x-[2px]"
                  }`}
                />
              </button>
            </div>

            {center.approval_status === "pending" && (
              <div className="flex gap-2">
                <button
                  onClick={() => onApprove(center)}
                  disabled={approvingId === center.id}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#2563EB] py-2.5 text-xs font-bold text-white hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors"
                >
                  <CheckCircle size={13} />
                  {approvingId === center.id ? "Approving…" : "Approve Center"}
                </button>
                <button
                  onClick={() => onReject(center)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] py-2.5 text-xs font-bold text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
                >
                  <XCircle size={13} /> Reject Center
                </button>
              </div>
            )}

            {center.approval_status === "approved" && (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] px-3.5 py-2.5 text-xs font-semibold text-emerald-700">
                  ✓ Live on Bokko
                  <button
                    onClick={() => onReject(center)}
                    className="text-[11px] font-semibold text-[#DC2626] hover:underline"
                  >
                    Reject instead
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleFeatured(center)}
                    disabled={featuringId === center.id}
                    aria-pressed={Boolean(center.is_featured)}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition-colors disabled:opacity-50 ${
                      center.is_featured
                        ? "border-[#2563EB] bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                        : "border-[#E2E8F0] text-[#2563EB] hover:bg-[#EFF6FF]"
                    }`}
                  >
                    <Sparkles size={13} />
                    {featuringId === center.id ? "Saving…" : center.is_featured ? "Promoted — Bokko Recommended" : "Promote to Bokko Recommended"}
                  </button>
                </div>
                {center.is_featured && (
                  <label className="flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs text-[#64748B]">
                    <span className="font-semibold text-[#0F172A]">Priority</span>
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={rankDraft}
                      onChange={(e) => setRankDraft(e.target.value)}
                      onBlur={commitRank}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); (e.target as HTMLInputElement).blur(); } }}
                      placeholder="—"
                      title="Lower number shows first. Leave blank for unranked."
                      className="w-14 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-1.5 py-1 text-center text-xs font-bold text-[#2563EB] outline-none focus:border-[#2563EB]"
                    />
                    <span className="text-[11px] text-[#94A3B8]">Lower shows first among promoted centers</span>
                  </label>
                )}
              </div>
            )}

            {center.approval_status === "rejected" && (
              <div className="flex items-center justify-between rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] px-3.5 py-2.5 text-xs font-semibold text-red-600">
                Rejected
                <button onClick={() => onApprove(center)} className="text-[11px] font-semibold text-[#2563EB] hover:underline">
                  Approve instead
                </button>
              </div>
            )}
          </div>

          {/* Plans & Pricing */}
          <div className="mt-5 border-t border-[#F1F5F9] pt-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#94A3B8]">Plans &amp; Pricing</p>

            {plansError && (
              <div className="mb-3 rounded-xl bg-[#FEE2E2] px-3.5 py-2.5 text-xs text-[#B91C1C]">{plansError}</div>
            )}

            {plansLoading ? (
              <div className="py-8 text-center text-sm text-[#94A3B8]"><Loader2 className="mx-auto animate-spin" /></div>
            ) : plans.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#E2E8F0] py-8 text-center">
                <p className="text-sm font-semibold text-[#0F172A]">No plans yet</p>
                <p className="mt-1 text-xs text-[#94A3B8]">This center has no bookable plans configured.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {plans.map((p) => (
                  <div key={p.id} className="rounded-xl border border-[#E2E8F0] p-3.5">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-[#0F172A]">{p.name}</p>
                      <span className="shrink-0 rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#2563EB]">
                        {PRODUCT_META[p.product_type]?.label ?? p.product_type}
                      </span>
                      {!p.is_active && (
                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">Inactive</span>
                      )}
                    </div>

                    <div className="mt-2.5 flex items-end justify-between gap-2">
                      <label className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-[#94A3B8]">
                          Price {p.unit ?? PRODUCT_META[p.product_type]?.unit ? `(per ${p.unit ?? PRODUCT_META[p.product_type]?.unit})` : ""}
                        </span>
                        <div className={`flex items-center gap-1 rounded-lg border bg-white px-2.5 py-1.5 transition-colors ${
                          priceDrafts[p.id] !== String(p.price) ? "border-[#2563EB]" : "border-[#E2E8F0]"
                        }`}>
                          <IndianRupee size={13} className="text-[#64748B]" />
                          <input
                            type="number"
                            className="w-24 bg-transparent text-sm font-bold text-[#0F172A] outline-none"
                            value={priceDrafts[p.id] ?? String(p.price)}
                            onChange={(e) => setPriceDrafts((d) => ({ ...d, [p.id]: e.target.value }))}
                            onKeyDown={(e) => e.key === "Enter" && savePrice(p)}
                          />
                        </div>
                      </label>

                      <div className="flex items-center gap-1.5">
                        {priceDrafts[p.id] !== String(p.price) && (
                          <button
                            onClick={() => savePrice(p)}
                            disabled={savingId === p.id}
                            className="flex items-center gap-1 rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#1D4ED8] disabled:opacity-50"
                          >
                            {savingId === p.id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                            Save
                          </button>
                        )}
                        <button
                          onClick={() => togglePlanActive(p)}
                          className="rounded-lg border border-[#E2E8F0] px-2.5 py-1.5 text-[11px] font-semibold text-[#475569] hover:bg-[#F8FAFC]"
                        >
                          {p.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
