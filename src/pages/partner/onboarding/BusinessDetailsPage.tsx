import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Save, Loader2 } from "lucide-react";
import { usePartner } from "../../../context/PartnerContext";
import { apiGet, apiPatch, ApiError, getVendorToken } from "../../../lib/api";

const BUSINESS_TYPES = [
  "Coworking Space","Hotel","Meeting Room Provider","Virtual Office Provider","Managed Office","Event Space",
];
const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Chandigarh","Jammu & Kashmir","Ladakh",
];

const BASE = "w-full rounded-xl border px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] transition-colors focus:outline-none focus:ring-2";
const NORMAL = `${BASE} border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]/15 bg-white`;
const ERR = `${BASE} border-red-400 focus:border-red-400 focus:ring-red-400/15 bg-white`;

function F({ label, required, error, hint, children }: {
  label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[#0F172A]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-[#94A3B8]">{hint}</p>}
      {error && <p className="mt-1 flex items-center gap-1 text-xs text-red-500"><AlertCircle size={11} />{error}</p>}
    </div>
  );
}

export default function BusinessDetailsPage() {
  const { partner, updatePartner, markStepComplete } = usePartner();
  const navigate = useNavigate();
  const biz = partner?.business ?? {};

  const [form, setForm] = useState({
    businessName: biz.businessName ?? "",
    businessType: biz.businessType ?? "",
    businessEmail: biz.businessEmail ?? "",
    registeredAddress: biz.registeredAddress ?? "",
    city: biz.city ?? "",
    state: biz.state ?? "",
    pincode: biz.pincode ?? "",
    contactPerson: biz.contactPerson ?? "",
    mobile: biz.mobile ?? "",
    website: biz.website ?? "",
    instagram: biz.instagram ?? "",
    linkedin: biz.linkedin ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [apiError, setApiError] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const token = getVendorToken();
    if (!token) { setProfileLoading(false); return; }
    apiGet<Record<string, string>>('/vendor/profile', token)
      .then((p) => {
        setForm({
          businessName:      p.business_name      ?? "",
          businessType:      p.business_type      ?? "",
          businessEmail:     p.email              ?? "",
          registeredAddress: p.registered_address ?? "",
          city:              p.city               ?? "",
          state:             p.state              ?? "",
          pincode:           p.pincode            ?? "",
          contactPerson:     p.contact_person     ?? "",
          mobile:            p.phone              ?? "",
          website:           p.website            ?? "",
          instagram:         p.instagram          ?? "",
          linkedin:          p.linkedin           ?? "",
        });
      })
      .catch(() => { /* keep localStorage-seeded form on error */ })
      .finally(() => setProfileLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set(k: string, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => { const e = { ...p }; delete e[k]; return e; });
    setSaved(false);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.businessName.trim()) e.businessName = "Business name is required";
    if (!form.businessType) e.businessType = "Select your business type";
    if (!form.registeredAddress.trim()) e.registeredAddress = "Registered address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.state) e.state = "Select state";
    if (!form.pincode || !/^\d{6}$/.test(form.pincode)) e.pincode = "Enter valid 6-digit pincode";
    if (!form.contactPerson.trim()) e.contactPerson = "Contact person name is required";
    if (!form.mobile || !/^[6-9]\d{9}$/.test(form.mobile)) e.mobile = "Enter valid 10-digit mobile";
    if (form.website && !/^https?:\/\/.+/.test(form.website)) e.website = "Enter valid URL starting with https://";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function saveToBackend() {
    const token = getVendorToken();
    if (!token) return;
    await apiPatch('/vendor/profile', {
      businessName: form.businessName,
      businessType: form.businessType,
      phone: form.mobile,
      contactPerson: form.contactPerson,
      registeredAddress: form.registeredAddress,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      website: form.website || undefined,
      instagram: form.instagram || undefined,
      linkedin: form.linkedin || undefined,
    }, token);
  }

  async function handleSave() {
    updatePartner({ business: { ...partner?.business, ...form } });
    setSaving(true);
    setApiError("");
    try {
      await saveToBackend();
      setSaved(true);
    } catch (err) {
      setApiError((err as ApiError).message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setApiError("");
    try {
      await saveToBackend();
      updatePartner({ business: { ...partner?.business, ...form } });
      markStepComplete(1);
      navigate("/partner/onboarding/centers");
    } catch (err) {
      setApiError((err as ApiError).message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#2563EB]" size={28} />
      </div>
    );
  }

  return (
    <div className="max-w-[720px]">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-[#0F172A]">Business Details</h2>
        <p className="mt-1 text-sm text-[#64748B]">Tell us about your business. This information will be used for verification.</p>
      </div>

      {apiError && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        {/* Business Identity */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <h3 className="mb-4 text-base font-bold text-[#0F172A]">Business Identity</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <F label="Business Name" required error={errors.businessName}>
              <input value={form.businessName} onChange={(e: ChangeEvent<HTMLInputElement>) => set("businessName", e.target.value)}
                className={errors.businessName ? ERR : NORMAL} placeholder="WorkHub Spaces Pvt. Ltd." />
            </F>
            <F label="Business Type" required error={errors.businessType}>
              <select value={form.businessType} onChange={(e: ChangeEvent<HTMLSelectElement>) => set("businessType", e.target.value)}
                className={errors.businessType ? ERR : NORMAL}>
                <option value="">Select type</option>
                {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </F>
            <F label="Business Email" hint="Set at signup — contact support to change">
              <input type="email" value={form.businessEmail} readOnly
                className={`${NORMAL} cursor-default bg-[#F8FAFC] text-[#64748B]`} />
            </F>
            <F label="Contact Person" required error={errors.contactPerson}>
              <input value={form.contactPerson} onChange={(e: ChangeEvent<HTMLInputElement>) => set("contactPerson", e.target.value)}
                className={errors.contactPerson ? ERR : NORMAL} placeholder="Full name" />
            </F>
            <F label="Mobile Number" required error={errors.mobile}>
              <input type="tel" value={form.mobile} maxLength={10}
                onChange={(e: ChangeEvent<HTMLInputElement>) => set("mobile", e.target.value)}
                className={errors.mobile ? ERR : NORMAL} placeholder="9876543210" />
            </F>
          </div>
        </div>

        {/* Registered Address */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <h3 className="mb-4 text-base font-bold text-[#0F172A]">Registered Business Address</h3>
          <div className="flex flex-col gap-4">
            <F label="Street Address" required error={errors.registeredAddress}>
              <input value={form.registeredAddress} onChange={(e: ChangeEvent<HTMLInputElement>) => set("registeredAddress", e.target.value)}
                className={errors.registeredAddress ? ERR : NORMAL} placeholder="Building, Street, Area" />
            </F>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <F label="City" required error={errors.city}>
                <input value={form.city} onChange={(e: ChangeEvent<HTMLInputElement>) => set("city", e.target.value)}
                  className={errors.city ? ERR : NORMAL} placeholder="Mumbai" />
              </F>
              <F label="State" required error={errors.state}>
                <select value={form.state} onChange={(e: ChangeEvent<HTMLSelectElement>) => set("state", e.target.value)}
                  className={errors.state ? ERR : NORMAL}>
                  <option value="">Select</option>
                  {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </F>
              <F label="Pincode" required error={errors.pincode}>
                <input value={form.pincode} maxLength={6} onChange={(e: ChangeEvent<HTMLInputElement>) => set("pincode", e.target.value)}
                  className={errors.pincode ? ERR : NORMAL} placeholder="400001" />
              </F>
            </div>
          </div>
        </div>

        {/* Online Presence */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <h3 className="mb-1 text-base font-bold text-[#0F172A]">Online Presence</h3>
          <p className="mb-4 text-xs text-[#94A3B8]">Optional — helps customers find and trust your business</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <F label="Website" error={errors.website}>
              <input value={form.website} onChange={(e: ChangeEvent<HTMLInputElement>) => set("website", e.target.value)}
                className={errors.website ? ERR : NORMAL} placeholder="https://yoursite.com" />
            </F>
            <F label="Instagram">
              <input value={form.instagram} onChange={(e: ChangeEvent<HTMLInputElement>) => set("instagram", e.target.value)}
                className={NORMAL} placeholder="@yourbrand" />
            </F>
            <F label="LinkedIn">
              <input value={form.linkedin} onChange={(e: ChangeEvent<HTMLInputElement>) => set("linkedin", e.target.value)}
                className={NORMAL} placeholder="linkedin.com/company/..." />
            </F>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-5 py-3 text-sm font-semibold text-[#334155] hover:bg-[#F8FAFC] disabled:opacity-60">
            <Save size={15} />
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save Draft"}
          </button>
          <button type="submit" disabled={saving}
            className="rounded-xl bg-[#2563EB] px-8 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#1d4ed8] disabled:opacity-60">
            {saving ? "Saving…" : "Save & Continue →"}
          </button>
        </div>
      </form>
    </div>
  );
}
