import { useState, useEffect, useRef } from "react";
import { Plus, Tag, X, Check, Loader2, ImagePlus, Globe, Layers, Store } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import CouponImagePicker from "../../components/CouponImagePicker";
import { apiGet, apiPost, apiPatch, apiUploadFile } from "../../lib/api";

type ScopeType = "GLOBAL" | "CATEGORY" | "CENTER";

interface Coupon {
  id: string;
  code: string;
  discount_type: "PERCENT" | "FLAT";
  discount_value: number;
  min_booking_paise: number;
  max_discount_paise?: number;
  usage_limit: number | null;
  used_count: number;
  valid_from: string;
  valid_to: string | null;
  is_active: boolean;
  description?: string | null;
  image_url?: string | null;
  vendor_id?: string | null;
  vendor_owner_name?: string | null;
  vendor_business_name?: string | null;
  vendor_email?: string | null;
  scope_type?: ScopeType;
  scope_label?: string | null;
  terms?: string | null;
  user_segment?: "ALL" | "NEW";
  per_user_limit?: number;
  priority?: number;
  show_in_offers?: boolean;
  redemptions?: number;
  total_discount_paise?: number;
  created_at: string;
}

interface Totals { redemptions: number; totalDiscountRupees: number }
interface CategoryOption { id: string; name: string }
interface CenterOption { id: string; center_name: string; city: string; locality?: string | null }

const INPUT_CLS = "h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#2563EB] bg-white";

function getAdminToken() {
  return sessionStorage.getItem("bokko_admin_token") ?? localStorage.getItem("bokko_admin_token") ?? undefined;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [totals, setTotals] = useState<Totals>({ redemptions: 0, totalDiscountRupees: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [retryTargetId, setRetryTargetId] = useState<string | null>(null);
  const [uploadingRetry, setUploadingRetry] = useState(false);
  const retryFileRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [centers, setCenters] = useState<CenterOption[]>([]);
  const [centerQuery, setCenterQuery] = useState("");
  const [form, setForm] = useState({
    code: "", discountType: "PERCENT" as "PERCENT" | "FLAT", discountValue: "",
    maxDiscountPaise: "", minBookingPaise: "0",
    validFrom: "", validTo: "", description: "",
    scopeType: "GLOBAL" as ScopeType, categoryId: "", centerId: "",
    terms: "", userSegment: "ALL" as "ALL" | "NEW", perUserLimit: "1", usageLimit: "", priority: "0", showInOffers: true,
  });

  function load() {
    const token = getAdminToken();
    apiGet<{ coupons: Coupon[]; totals?: Totals }>("/admin/coupons", token as string)
      .then((data) => {
        setCoupons(data?.coupons ?? []);
        if (data?.totals) setTotals(data.totals);
      })
      .catch((err) => setError((err as Error).message ?? "Failed to load coupons"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  // Scope pickers need the category and center lists. Fetch them the first time
  // the create modal is opened (cached for the rest of the session).
  useEffect(() => {
    if (!showCreate || (categories.length && centers.length)) return;
    const token = getAdminToken();
    apiGet<CategoryOption[]>("/admin/categories", token as string)
      .then((rows) => setCategories(rows ?? []))
      .catch(() => setCategories([]));
    apiGet<CenterOption[]>("/admin/centers", token as string)
      .then((rows) => setCenters(rows ?? []))
      .catch(() => setCenters([]));
  }, [showCreate, categories.length, centers.length]);

  async function handleCreate() {
    if (!form.code || !form.discountValue || !form.validFrom || !form.validTo) return;
    if (form.scopeType === "CATEGORY" && !form.categoryId) { setError("Select a category for this coupon"); return; }
    if (form.scopeType === "CENTER" && !form.centerId) { setError("Select a center for this coupon"); return; }
    if (form.showInOffers && !imageFile) { setError("A banner image is required for a public offer"); return; }
    setSaving(true);
    setError(null);
    const resetForm = { code: "", discountType: "PERCENT" as const, discountValue: "", maxDiscountPaise: "", minBookingPaise: "0", validFrom: "", validTo: "", description: "", scopeType: "GLOBAL" as ScopeType, categoryId: "", centerId: "", terms: "", userSegment: "ALL" as const, perUserLimit: "1", usageLimit: "", priority: "0", showInOffers: true };
    try {
      const token = getAdminToken();
      const coupon = await apiPost<{ id: string }>("/admin/coupons", {
        code: form.code.toUpperCase(),
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        maxDiscountPaise: form.maxDiscountPaise ? Math.round(parseFloat(form.maxDiscountPaise) * 100) : undefined,
        minBookingPaise: Math.round(parseFloat(form.minBookingPaise || "0") * 100),
        validFrom: form.validFrom,
        validTo: form.validTo,
        description: form.description.trim() || undefined,
        scopeType: form.scopeType,
        categoryId: form.scopeType === "CATEGORY" ? form.categoryId : undefined,
        centerId: form.scopeType === "CENTER" ? form.centerId : undefined,
        terms: form.terms.trim() || undefined,
        userSegment: form.userSegment,
        perUserLimit: parseInt(form.perUserLimit || "1"),
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : undefined,
        priority: parseInt(form.priority || "0"),
        showInOffers: form.showInOffers,
      }, token as string);

      if (imageFile) {
        const fd = new FormData();
        fd.append("image", imageFile);
        try {
          await apiUploadFile(`/admin/coupons/${coupon.id}/image`, fd, token as string);
        } catch {
          setError("Coupon created, but the banner image failed to upload. You can retry from the coupon card.");
          setShowCreate(false);
          setForm(resetForm);
          setCenterQuery("");
          setImageFile(null);
          load();
          return;
        }
      }
      setShowCreate(false);
      setForm(resetForm);
      setCenterQuery("");
      setImageFile(null);
      load();
    } catch (err) {
      setError((err as Error).message ?? "Failed to create coupon");
    } finally {
      setSaving(false);
    }
  }

  // Enable/disable a coupon. Uses PATCH /admin/coupons/:id { isActive } — the
  // single endpoint that toggles both ways. (The old code PATCHed the POST-only
  // /deactivate route, so disable silently 404'd and there was no way to re-enable.)
  async function handleToggleActive(couponId: string, isActive: boolean) {
    const token = getAdminToken();
    try {
      await apiPatch(`/admin/coupons/${couponId}`, { isActive }, token as string);
      load();
    } catch (err) {
      setError((err as Error).message ?? `Failed to ${isActive ? "enable" : "disable"} coupon`);
    }
  }

  function triggerRetryUpload(couponId: string) {
    setRetryTargetId(couponId);
    retryFileRef.current?.click();
  }

  async function handleRetryFile(file: File | null) {
    if (!file || !retryTargetId) return;
    setUploadingRetry(true);
    try {
      const token = getAdminToken();
      const fd = new FormData();
      fd.append("image", file);
      await apiUploadFile(`/admin/coupons/${retryTargetId}/image`, fd, token as string);
      load();
    } catch (err) {
      setError((err as Error).message ?? "Failed to upload banner image");
    } finally {
      setUploadingRetry(false);
      setRetryTargetId(null);
      if (retryFileRef.current) retryFileRef.current.value = "";
    }
  }

  const active = coupons.filter((c) => c.is_active);
  const inactive = coupons.filter((c) => !c.is_active);

  function CouponCard({ coupon }: { coupon: Coupon }) {
    const expired = coupon.valid_to ? new Date(coupon.valid_to) < new Date() : false;
    const live = coupon.is_active && !expired;
    const headline = coupon.discount_type === "PERCENT" ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`;
    const ScopeIcon = coupon.scope_type === "CATEGORY" ? Layers : coupon.scope_type === "CENTER" ? Store : Globe;
    const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : null);

    return (
      <div className={`group overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md ${live ? "border-[#E2E8F0]" : "border-[#F1F5F9] opacity-80"}`}>
        {/* Banner */}
        <div className="relative h-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb] via-[#1d4ed8] to-[#06b6d4]" />
          {coupon.image_url && (
            <>
              <img src={coupon.image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#1d4ed8]/80 to-[#06b6d4]/70" />
            </>
          )}
          <div className="absolute inset-0 flex flex-col justify-between p-4">
            <div className="flex items-start justify-between">
              <div className="flex flex-wrap items-center gap-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                  <ScopeIcon size={9} /> {coupon.scope_label ?? "All centers"}
                </span>
                {coupon.user_segment === "NEW" && (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">First-time users</span>
                )}
                {coupon.show_in_offers === false && (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">Code only</span>
                )}
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${live ? "bg-white text-[#15803D]" : expired ? "bg-[#FEE2E2] text-[#B91C1C]" : "bg-white/90 text-[#64748B]"}`}>
                {expired ? "Expired" : coupon.is_active ? "Active" : "Disabled"}
              </span>
            </div>
            <p className="text-2xl font-extrabold leading-none text-white drop-shadow-sm">{headline}</p>
          </div>
        </div>

        {/* Ticket notch divider */}
        <div className="relative h-0">
          <span className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[#F1F5F9]" />
          <span className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[#F1F5F9]" />
        </div>

        <div className="p-4 pt-4">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-2.5 py-1">
              <Tag size={12} className="text-[#2563EB]" />
              <span className="font-mono text-xs font-extrabold tracking-wide text-[#0F172A]">{coupon.code}</span>
            </span>
            {coupon.max_discount_paise ? (
              <span className="text-[10px] font-medium text-[#94A3B8]">max ₹{coupon.max_discount_paise / 100}</span>
            ) : null}
          </div>

          {coupon.description && <p className="mt-2.5 line-clamp-2 text-xs text-[#64748B]">{coupon.description}</p>}

          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[#F1F5F9] pt-3 text-center">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-[#94A3B8]">Redeemed</p>
              <p className="mt-0.5 text-xs font-bold text-[#0F172A]">{coupon.redemptions ?? coupon.used_count}×{coupon.usage_limit ? `/${coupon.usage_limit}` : ""}</p>
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-[#94A3B8]">Given</p>
              <p className="mt-0.5 text-xs font-bold text-[#0F172A]">₹{((coupon.total_discount_paise ?? 0) / 100).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-[#94A3B8]">Expires</p>
              <p className="mt-0.5 text-xs font-bold text-[#0F172A]">{fmt(coupon.valid_to) ?? "Never"}</p>
            </div>
          </div>
          {coupon.min_booking_paise > 0 && (
            <p className="mt-2 text-[10px] text-[#94A3B8]">Min booking ₹{coupon.min_booking_paise / 100}{coupon.per_user_limit && coupon.per_user_limit !== 1 ? ` · ${coupon.per_user_limit} uses/user` : ""}</p>
          )}

          {!coupon.image_url && (
            <button
              onClick={() => triggerRetryUpload(coupon.id)}
              disabled={uploadingRetry && retryTargetId === coupon.id}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] py-2 text-[11px] font-semibold text-[#2563EB] hover:bg-[#EFF6FF] disabled:opacity-50"
            >
              {uploadingRetry && retryTargetId === coupon.id ? <Loader2 size={12} className="animate-spin" /> : <ImagePlus size={12} />}
              Add banner image
            </button>
          )}

          {live && (
            <button onClick={() => handleToggleActive(coupon.id, false)}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] py-2 text-[11px] font-semibold text-[#DC2626] hover:bg-[#FEE2E2]">
              <X size={12} /> Disable
            </button>
          )}

          {/* Re-enable a manually disabled coupon. Expired coupons can't be
              revived by toggling — their validity window has passed. */}
          {!coupon.is_active && !expired && (
            <button onClick={() => handleToggleActive(coupon.id, true)}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#DCFCE7] bg-[#F0FDF4] py-2 text-[11px] font-semibold text-[#15803D] hover:bg-[#DCFCE7]">
              <Check size={12} /> Enable
            </button>
          )}
        </div>
      </div>
    );
  }

  const activeCount = coupons.filter((c) => c.is_active).length;

  return (
    <AdminLayout title="Coupon Management" subtitle={`${coupons.length} offer${coupons.length === 1 ? "" : "s"} · best auto-applied at checkout`}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Active offers", value: `${activeCount}` },
            { label: "Redemptions", value: `${totals.redemptions}` },
            { label: "Discount given", value: `₹${totals.totalDiscountRupees.toLocaleString()}` },
          ].map((t) => (
            <div key={t.label} className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">{t.label}</p>
              <p className="mt-0.5 text-lg font-extrabold text-[#0F172A]">{t.value}</p>
            </div>
          ))}
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-bold text-white hover:bg-[#1d4ed8]">
          <Plus size={15} /> Create Coupon
        </button>
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      {loading ? (
        <div className="py-16 text-center text-sm text-[#94A3B8]">
          <Loader2 size={20} className="mx-auto mb-2 animate-spin" />
          Loading coupons…
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#64748B]">Active Coupons</p>
              <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {active.map((c) => <CouponCard key={c.id} coupon={c} />)}
              </div>
            </>
          )}
          {inactive.length > 0 && (
            <>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Inactive / Expired</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {inactive.map((c) => <CouponCard key={c.id} coupon={c} />)}
              </div>
            </>
          )}
          {coupons.length === 0 && (
            <div className="py-16 text-center text-sm text-[#94A3B8]">No coupons found</div>
          )}
        </>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[500px] rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-[#F1F5F9] px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-[#0F172A]">Create Admin Coupon</h3>
              <button onClick={() => setShowCreate(false)} className="text-[#94A3B8] hover:text-[#0F172A]"><X size={16} /></button>
            </div>
            <div className="max-h-[75vh] overflow-y-auto grid grid-cols-2 gap-4 p-6">
              {error && <p className="col-span-2 rounded-xl bg-red-50 px-4 py-2.5 text-xs text-red-600">{error}</p>}
              <div className="col-span-2">
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">Coupon Code *</label>
                <input type="text" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="BOKKO20" className={INPUT_CLS} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">Discount Type *</label>
                <select value={form.discountType} onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value as "PERCENT" | "FLAT" }))}
                  className={INPUT_CLS}>
                  <option value="PERCENT">Percentage (%)</option>
                  <option value="FLAT">Flat (₹)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">Discount Value *</label>
                <input type="number" value={form.discountValue} onChange={(e) => setForm((p) => ({ ...p, discountValue: e.target.value }))}
                  placeholder={form.discountType === "PERCENT" ? "20" : "150"} className={INPUT_CLS} />
              </div>
              {form.discountType === "PERCENT" && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#0F172A]">Max Discount (₹)</label>
                  <input type="number" value={form.maxDiscountPaise} onChange={(e) => setForm((p) => ({ ...p, maxDiscountPaise: e.target.value }))}
                    placeholder="200" className={INPUT_CLS} />
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">Min Booking Amount (₹)</label>
                <input type="number" value={form.minBookingPaise} onChange={(e) => setForm((p) => ({ ...p, minBookingPaise: e.target.value }))}
                  placeholder="500" className={INPUT_CLS} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">Valid From *</label>
                <input type="date" value={form.validFrom} onChange={(e) => setForm((p) => ({ ...p, validFrom: e.target.value }))} className={INPUT_CLS} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">Valid Until *</label>
                <input type="date" value={form.validTo} onChange={(e) => setForm((p) => ({ ...p, validTo: e.target.value }))} className={INPUT_CLS} />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">Description</label>
                <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Internal note" className={INPUT_CLS} />
              </div>

              {/* Scope targeting */}
              <div className="col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-[#0F172A]">Applies to</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { key: "GLOBAL", label: "All centers", icon: Globe },
                    { key: "CATEGORY", label: "Category", icon: Layers },
                    { key: "CENTER", label: "Single center", icon: Store },
                  ] as const).map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, scopeType: key, categoryId: "", centerId: "" }))}
                      className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-[11px] font-semibold transition-colors ${
                        form.scopeType === key
                          ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                          : "border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#94A3B8]"
                      }`}
                    >
                      <Icon size={15} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {form.scopeType === "CATEGORY" && (
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-medium text-[#0F172A]">Category *</label>
                  <select value={form.categoryId} onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))} className={INPUT_CLS}>
                    <option value="">Select a category…</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              {form.scopeType === "CENTER" && (
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-medium text-[#0F172A]">Center *</label>
                  <input
                    value={centerQuery}
                    onChange={(e) => setCenterQuery(e.target.value)}
                    placeholder="Search center by name or city…"
                    className={INPUT_CLS}
                  />
                  <div className="mt-1.5 max-h-36 overflow-y-auto rounded-lg border border-[#E2E8F0]">
                    {centers
                      .filter((c) => {
                        const q = centerQuery.trim().toLowerCase();
                        if (!q) return true;
                        return c.center_name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
                      })
                      .slice(0, 30)
                      .map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, centerId: c.id }))}
                          className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs transition-colors ${
                            form.centerId === c.id ? "bg-[#EFF6FF] text-[#2563EB]" : "hover:bg-[#F8FAFC] text-[#0F172A]"
                          }`}
                        >
                          <span className="truncate font-medium">{c.center_name}</span>
                          <span className="shrink-0 text-[10px] text-[#94A3B8]">{c.locality ? `${c.locality}, ` : ""}{c.city}</span>
                        </button>
                      ))}
                    {centers.length === 0 && <p className="px-3 py-2 text-xs text-[#94A3B8]">Loading centers…</p>}
                  </div>
                </div>
              )}

              {/* Targeting & limits */}
              <div className="col-span-2 border-t border-[#F1F5F9] pt-3 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Eligibility &amp; limits</div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">Who can use</label>
                <select value={form.userSegment} onChange={(e) => setForm((p) => ({ ...p, userSegment: e.target.value as "ALL" | "NEW" }))} className={INPUT_CLS}>
                  <option value="ALL">All users</option>
                  <option value="NEW">First-time users only</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">Uses per user</label>
                <input type="number" min="0" value={form.perUserLimit} onChange={(e) => setForm((p) => ({ ...p, perUserLimit: e.target.value }))}
                  placeholder="1" className={INPUT_CLS} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">Total cap (optional)</label>
                <input type="number" min="1" value={form.usageLimit} onChange={(e) => setForm((p) => ({ ...p, usageLimit: e.target.value }))}
                  placeholder="Unlimited" className={INPUT_CLS} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">Priority</label>
                <input type="number" min="0" value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                  placeholder="0" className={INPUT_CLS} />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">Terms &amp; conditions</label>
                <textarea value={form.terms} onChange={(e) => setForm((p) => ({ ...p, terms: e.target.value }))}
                  placeholder="e.g. Valid on bookings above ₹500. Cannot be combined with other offers."
                  rows={2} className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB] bg-white" />
              </div>

              <label className="col-span-2 flex items-center gap-2.5 rounded-xl border border-[#E2E8F0] px-3 py-2.5">
                <input type="checkbox" checked={form.showInOffers} onChange={(e) => setForm((p) => ({ ...p, showInOffers: e.target.checked }))} className="h-4 w-4 accent-[#2563EB]" />
                <span className="text-xs">
                  <span className="font-semibold text-[#0F172A]">Show as a public offer</span>
                  <span className="ml-1 text-[#94A3B8]">— appears in banners &amp; offers (needs an image). Uncheck for a code-only coupon.</span>
                </span>
              </label>

              {form.showInOffers && (
                <div className="col-span-2">
                  <CouponImagePicker file={imageFile} onChange={setImageFile} />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-[#F1F5F9] px-6 py-4">
              <button onClick={() => setShowCreate(false)} className="rounded-xl border border-[#E2E8F0] px-4 py-2 text-sm text-[#64748B]">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.code || !form.discountValue || !form.validFrom || !form.validTo || (form.showInOffers && !imageFile) || (form.scopeType === "CATEGORY" && !form.categoryId) || (form.scopeType === "CENTER" && !form.centerId)}
                className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2 text-sm font-bold text-white hover:bg-[#1d4ed8] disabled:opacity-50">
                {saving ? <Loader2 size={13} className="animate-spin" /> : null}
                {saving ? "Creating…" : "Create Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        ref={retryFileRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={(e) => handleRetryFile(e.target.files?.[0] ?? null)}
      />
    </AdminLayout>
  );
}
