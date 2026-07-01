import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, ChevronDown, ChevronUp, AlertCircle, Building2 } from "lucide-react";
import { usePartner, type CenterData, type BusinessDetails } from "../../../context/PartnerContext";

const CENTER_TYPES = ["Coworking Space","Hotel","Meeting Room","Virtual Office","Managed Office","Event Space","Training Room","Board Room"];
const SERVICES = ["Day Pass","Meeting Rooms","Monthly Pass","Virtual Office","Hotel Rooms","Hourly Stay","Full Day Stay","Private Cabin","Managed Office"];
const AMENITIES = ["WiFi","Parking","Power Backup","AC","Reception","Meeting Room","Cafeteria","Security","Lift","Washroom","CCTV","Locker","Gym","Rooftop"];
const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Chandigarh","Jammu & Kashmir","Ladakh",
];

const BASE = "w-full rounded-xl border px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] transition-colors focus:outline-none focus:ring-2 bg-white";
const NORMAL = `${BASE} border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]/15`;
const ERR = `${BASE} border-red-400 focus:border-red-400 focus:ring-red-400/15`;

// Pre-fill what we already collected in Business Details so vendors don't retype it.
// `fullAddress` also copies the registered address (used for the first / single center,
// which is typically at the business address); additional centers only inherit the
// vendor-level contact person + phone, since their location differs.
function makeCenter(
  business: Partial<BusinessDetails> = {},
  opts: { fullAddress?: boolean } = {},
): CenterData {
  return {
    id: `ctr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: "", type: "",
    address: opts.fullAddress ? (business.registeredAddress ?? "") : "",
    city: opts.fullAddress ? (business.city ?? "") : "",
    state: opts.fullAddress ? (business.state ?? "") : "",
    locality: "", landmark: "", googleMapUrl: "",
    contactPerson: business.contactPerson ?? "",
    phone: business.mobile ?? "",
    services: [], amenities: [], photoNames: [],
  };
}

function CenterForm({ center, index, onChange, onRemove, canRemove, errors }:{
  center: CenterData; index: number; onChange: (c: CenterData) => void;
  onRemove: () => void; canRemove: boolean; errors: Record<string, string>;
}) {
  const [expanded, setExpanded] = useState(true);

  function set(k: keyof CenterData, v: string) { onChange({ ...center, [k]: v }); }
  function toggleService(s: string) {
    onChange({ ...center, services: center.services.includes(s) ? center.services.filter((x) => x !== s) : [...center.services, s] });
  }
  function toggleAmenity(a: string) {
    onChange({ ...center, amenities: center.amenities.includes(a) ? center.amenities.filter((x) => x !== a) : [...center.amenities, a] });
  }

  const key = (k: string) => `${index}_${k}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
      <button type="button" onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4 hover:bg-[#F8FAFC]">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EFF6FF] text-sm font-bold text-[#2563EB]">
            {index + 1}
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-[#0F172A]">{center.name || `Center ${index + 1}`}</p>
            {center.city && <p className="text-xs text-[#64748B]">{center.city}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canRemove && (
            <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-red-50 hover:text-red-500">
              <Trash2 size={15} />
            </button>
          )}
          {expanded ? <ChevronUp size={16} className="text-[#64748B]" /> : <ChevronDown size={16} className="text-[#64748B]" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[#E2E8F0] px-6 pb-6 pt-5">
          <div className="flex flex-col gap-4">
            {/* Basic info */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F172A]">Center Name <span className="text-red-500">*</span></label>
                <input value={center.name} onChange={(e: ChangeEvent<HTMLInputElement>) => set("name", e.target.value)}
                  className={errors[key("name")] ? ERR : NORMAL} placeholder="WorkHub BKC" />
                {errors[key("name")] && <p className="mt-1 text-xs text-red-500 flex gap-1"><AlertCircle size={11} className="mt-0.5" />{errors[key("name")]}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F172A]">Center Type <span className="text-red-500">*</span></label>
                <select value={center.type} onChange={(e: ChangeEvent<HTMLSelectElement>) => set("type", e.target.value)} className={errors[key("type")] ? ERR : NORMAL}>
                  <option value="">Select type</option>
                  {CENTER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors[key("type")] && <p className="mt-1 text-xs text-red-500 flex gap-1"><AlertCircle size={11} className="mt-0.5" />{errors[key("type")]}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F172A]">Contact Person <span className="text-red-500">*</span></label>
                <input value={center.contactPerson} onChange={(e: ChangeEvent<HTMLInputElement>) => set("contactPerson", e.target.value)}
                  className={errors[key("contactPerson")] ? ERR : NORMAL} placeholder="Manager name" />
                {errors[key("contactPerson")] && <p className="mt-1 text-xs text-red-500 flex gap-1"><AlertCircle size={11} className="mt-0.5" />{errors[key("contactPerson")]}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F172A]">Center Phone <span className="text-red-500">*</span></label>
                <input type="tel" value={center.phone} maxLength={10} onChange={(e: ChangeEvent<HTMLInputElement>) => set("phone", e.target.value)}
                  className={errors[key("phone")] ? ERR : NORMAL} placeholder="9876543210" />
                {errors[key("phone")] && <p className="mt-1 text-xs text-red-500 flex gap-1"><AlertCircle size={11} className="mt-0.5" />{errors[key("phone")]}</p>}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#0F172A]">Street Address <span className="text-red-500">*</span></label>
              <input value={center.address} onChange={(e: ChangeEvent<HTMLInputElement>) => set("address", e.target.value)}
                className={errors[key("address")] ? ERR : NORMAL} placeholder="Building, Street, Area" />
              {errors[key("address")] && <p className="mt-1 text-xs text-red-500 flex gap-1"><AlertCircle size={11} className="mt-0.5" />{errors[key("address")]}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F172A]">City <span className="text-red-500">*</span></label>
                <input value={center.city} onChange={(e: ChangeEvent<HTMLInputElement>) => set("city", e.target.value)}
                  className={errors[key("city")] ? ERR : NORMAL} placeholder="Mumbai" />
                {errors[key("city")] && <p className="mt-1 text-xs text-red-500">{errors[key("city")]}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F172A]">State <span className="text-red-500">*</span></label>
                <select value={center.state} onChange={(e: ChangeEvent<HTMLSelectElement>) => set("state", e.target.value)} className={errors[key("state")] ? ERR : NORMAL}>
                  <option value="">State</option>
                  {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors[key("state")] && <p className="mt-1 text-xs text-red-500">{errors[key("state")]}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F172A]">Locality</label>
                <input value={center.locality} onChange={(e: ChangeEvent<HTMLInputElement>) => set("locality", e.target.value)}
                  className={NORMAL} placeholder="BKC" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#0F172A]">Landmark</label>
                <input value={center.landmark} onChange={(e: ChangeEvent<HTMLInputElement>) => set("landmark", e.target.value)}
                  className={NORMAL} placeholder="Near HDFC bank" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#0F172A]">Google Map Link</label>
              <input value={center.googleMapUrl} onChange={(e: ChangeEvent<HTMLInputElement>) => set("googleMapUrl", e.target.value)}
                className={NORMAL} placeholder="https://maps.google.com/..." />
            </div>

            {/* Services */}
            <div>
              <p className="mb-2 text-sm font-medium text-[#0F172A]">Services Offered <span className="text-red-500">*</span></p>
              {errors[key("services")] && <p className="mb-2 text-xs text-red-500 flex gap-1"><AlertCircle size={11} className="mt-0.5" />{errors[key("services")]}</p>}
              <div className="flex flex-wrap gap-2">
                {SERVICES.map((s) => (
                  <button key={s} type="button" onClick={() => toggleService(s)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      center.services.includes(s)
                        ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                        : "border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB]"
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <p className="mb-2 text-sm font-medium text-[#0F172A]">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map((a) => (
                  <button key={a} type="button" onClick={() => toggleAmenity(a)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      center.amenities.includes(a)
                        ? "border-[#16A34A] bg-[#F0FDF4] text-[#16A34A]"
                        : "border-[#E2E8F0] text-[#64748B] hover:border-[#16A34A] hover:text-[#16A34A]"
                    }`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo upload */}
            <div>
              <p className="mb-2 text-sm font-medium text-[#0F172A]">Center Photos</p>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-6 text-center hover:border-[#2563EB] hover:bg-[#EFF6FF] transition-colors">
                <Building2 size={24} className="text-[#94A3B8]" />
                <p className="text-sm font-medium text-[#334155]">Click to upload photos</p>
                <p className="text-xs text-[#94A3B8]">PNG, JPG up to 5MB each. Min. 3 photos recommended.</p>
                <input type="file" multiple accept="image/*" className="hidden"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const files = Array.from(e.target.files ?? []);
                    const names = [...center.photoNames, ...files.map((f) => f.name)].slice(0, 10);
                    onChange({ ...center, photoNames: names });
                  }} />
              </label>
              {center.photoNames.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {center.photoNames.map((n) => (
                    <span key={n} className="flex items-center gap-1 rounded-lg bg-[#EFF6FF] px-2.5 py-1 text-xs font-medium text-[#2563EB]">
                      {n}
                      <button type="button" onClick={() => onChange({ ...center, photoNames: center.photoNames.filter((x) => x !== n) })} className="ml-0.5 text-[#94A3B8] hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CenterSetupPage() {
  const { partner, updatePartner, markStepComplete } = usePartner();
  const navigate = useNavigate();

  const business = partner?.business ?? {};
  const [centers, setCenters] = useState<CenterData[]>(
    partner?.centers?.length ? partner.centers : [makeCenter(business, { fullAddress: true })]
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isMultiple = partner?.centerType === "multiple";

  function updateCenter(i: number, c: CenterData) {
    setCenters((prev) => prev.map((x, idx) => idx === i ? c : x));
    setErrors((prev) => {
      const e = { ...prev };
      Object.keys(e).filter((k) => k.startsWith(`${i}_`)).forEach((k) => delete e[k]);
      return e;
    });
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    centers.forEach((c, i) => {
      if (!c.name.trim()) e[`${i}_name`] = "Center name is required";
      if (!c.type) e[`${i}_type`] = "Center type is required";
      if (!c.address.trim()) e[`${i}_address`] = "Address is required";
      if (!c.city.trim()) e[`${i}_city`] = "City is required";
      if (!c.state) e[`${i}_state`] = "State is required";
      if (!c.contactPerson.trim()) e[`${i}_contactPerson`] = "Contact person is required";
      if (!c.phone || !/^[6-9]\d{9}$/.test(c.phone)) e[`${i}_phone`] = "Valid 10-digit number required";
      if (c.services.length === 0) e[`${i}_services`] = "Select at least one service";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    updatePartner({ centers });
    markStepComplete(2);
    navigate("/partner/onboarding/kyc");
  }

  return (
    <div className="max-w-[720px]">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-[#0F172A]">Center Setup</h2>
        <p className="mt-1 text-sm text-[#64748B]">
          {isMultiple ? "Add all your centers. You can add more later from your dashboard." : "Set up your center details, services and amenities."}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {centers.map((c, i) => (
          <CenterForm key={c.id} center={c} index={i} errors={errors}
            onChange={(updated) => updateCenter(i, updated)}
            onRemove={() => setCenters((prev) => prev.filter((_, idx) => idx !== i))}
            canRemove={centers.length > 1} />
        ))}

        {isMultiple && (
          <button type="button" onClick={() => setCenters((prev) => [...prev, makeCenter(business, { fullAddress: false })])}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#E2E8F0] py-4 text-sm font-semibold text-[#2563EB] hover:border-[#2563EB] hover:bg-[#EFF6FF] transition-colors">
            <Plus size={16} />
            Add Another Center
          </button>
        )}

        <div className="flex items-center justify-between gap-3 pt-2">
          <button type="button" onClick={() => navigate("/partner/onboarding/business")}
            className="rounded-xl border border-[#E2E8F0] bg-white px-5 py-3 text-sm font-semibold text-[#334155] hover:bg-[#F8FAFC]">
            ← Back
          </button>
          <button type="submit"
            className="rounded-xl bg-[#2563EB] px-8 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#1d4ed8]">
            Save &amp; Continue →
          </button>
        </div>
      </form>
    </div>
  );
}
