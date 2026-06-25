import { useState } from "react";
import { Plus, Tag, X } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { useAdmin, type Coupon } from "../../context/AdminContext";

const CATEGORIES = ["", "Day Pass", "Meeting Room", "Monthly Pass", "Virtual Office", "Hotel Room", "Hourly Stay"];

export default function AdminCouponsPage() {
  const { coupons, createCoupon, disableCoupon } = useAdmin();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    code: "", discountType: "percentage" as "percentage" | "flat", value: "", maxDiscount: "", minBooking: "0",
    city: "", category: "", startDate: "", endDate: "", usageLimit: "100", active: true,
  });

  function handleCreate() {
    if (!form.code || !form.value || !form.startDate || !form.endDate) return;
    createCoupon({
      code: form.code.toUpperCase(),
      discountType: form.discountType,
      value: Number(form.value),
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
      minBooking: Number(form.minBooking),
      city: form.city || undefined,
      category: form.category || undefined,
      startDate: form.startDate,
      endDate: form.endDate,
      usageLimit: Number(form.usageLimit),
      active: true,
    });
    setShowCreate(false);
    setForm({ code: "", discountType: "percentage", value: "", maxDiscount: "", minBooking: "0", city: "", category: "", startDate: "", endDate: "", usageLimit: "100", active: true });
  }

  const active = coupons.filter((c) => c.active);
  const inactive = coupons.filter((c) => !c.active);

  function CouponCard({ coupon }: { coupon: Coupon }) {
    const pct = (coupon.usageCount / coupon.usageLimit) * 100;
    const expired = new Date(coupon.endDate) < new Date();
    return (
      <div className={`rounded-2xl border p-5 shadow-sm ${coupon.active && !expired ? "border-[#E2E8F0] bg-white" : "border-[#F1F5F9] bg-[#F8FAFC]"}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${coupon.active ? "bg-[#EFF6FF]" : "bg-[#F1F5F9]"}`}>
              <Tag size={16} className={coupon.active ? "text-[#2563EB]" : "text-[#94A3B8]"} />
            </div>
            <div>
              <p className="font-mono text-sm font-extrabold text-[#0F172A]">{coupon.code}</p>
              <p className="text-[11px] text-[#94A3B8]">
                {coupon.discountType === "percentage" ? `${coupon.value}% off` : `₹${coupon.value} off`}
                {coupon.maxDiscount ? ` (max ₹${coupon.maxDiscount})` : ""}
              </p>
            </div>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${coupon.active && !expired ? "bg-[#DCFCE7] text-[#15803D]" : expired ? "bg-[#FEE2E2] text-[#B91C1C]" : "bg-[#F1F5F9] text-[#64748B]"}`}>
            {expired ? "Expired" : coupon.active ? "Active" : "Disabled"}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[#64748B]">
          {coupon.city && <span className="rounded-md bg-[#F1F5F9] px-2 py-0.5">{coupon.city}</span>}
          {coupon.category && <span className="rounded-md bg-[#F1F5F9] px-2 py-0.5">{coupon.category}</span>}
          <span className="rounded-md bg-[#F1F5F9] px-2 py-0.5">Min ₹{coupon.minBooking}</span>
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-[11px] text-[#94A3B8] mb-1">
            <span>Usage: {coupon.usageCount}/{coupon.usageLimit}</span>
            <span>{coupon.startDate} → {coupon.endDate}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F1F5F9]">
            <div className="h-full rounded-full bg-[#2563EB]" style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
        </div>

        {coupon.active && !expired && (
          <button onClick={() => disableCoupon(coupon.id)}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] py-2 text-xs text-[#DC2626] hover:bg-[#FEE2E2]">
            <X size={12} /> Disable Coupon
          </button>
        )}
      </div>
    );
  }

  return (
    <AdminLayout title="Coupon Management" subtitle={`${coupons.length} coupons · ${active.length} active`}>
      <div className="mb-5 flex justify-end">
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-bold text-white hover:bg-[#1d4ed8]">
          <Plus size={15} /> Create Coupon
        </button>
      </div>

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

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[500px] rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-[#F1F5F9] px-6 py-4">
              <h3 className="font-bold text-[#0F172A]">Create New Coupon</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 p-6">
              <div className="col-span-2">
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">Coupon Code</label>
                <input type="text" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="BOKKO20" className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 font-mono text-sm uppercase outline-none focus:border-[#2563EB]" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">Discount Type</label>
                <select value={form.discountType} onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value as "percentage" | "flat" }))}
                  className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#2563EB] bg-white">
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat (₹)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">Discount Value</label>
                <input type="number" value={form.value} onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
                  placeholder={form.discountType === "percentage" ? "20" : "150"}
                  className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#2563EB]" />
              </div>
              {form.discountType === "percentage" && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#0F172A]">Max Discount (₹)</label>
                  <input type="number" value={form.maxDiscount} onChange={(e) => setForm((p) => ({ ...p, maxDiscount: e.target.value }))}
                    placeholder="200" className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#2563EB]" />
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">Min Booking Amount (₹)</label>
                <input type="number" value={form.minBooking} onChange={(e) => setForm((p) => ({ ...p, minBooking: e.target.value }))}
                  placeholder="500" className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#2563EB]" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">Category (optional)</label>
                <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#2563EB] bg-white">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c || "All Categories"}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">City (optional)</label>
                <input type="text" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                  placeholder="Mumbai" className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#2563EB]" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">Start Date</label>
                <input type="date" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                  className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#2563EB]" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">End Date</label>
                <input type="date" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                  className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#2563EB]" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#0F172A]">Usage Limit</label>
                <input type="number" value={form.usageLimit} onChange={(e) => setForm((p) => ({ ...p, usageLimit: e.target.value }))}
                  placeholder="100" className="h-9 w-full rounded-lg border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#2563EB]" />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#F1F5F9] px-6 py-4">
              <button onClick={() => setShowCreate(false)} className="rounded-xl border border-[#E2E8F0] px-4 py-2 text-sm text-[#64748B]">Cancel</button>
              <button onClick={handleCreate} className="rounded-xl bg-[#2563EB] px-5 py-2 text-sm font-bold text-white hover:bg-[#1d4ed8]">Create Coupon</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
