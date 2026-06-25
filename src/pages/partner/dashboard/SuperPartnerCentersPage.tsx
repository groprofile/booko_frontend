import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Copy, Check, ExternalLink, BarChart2, X } from "lucide-react";
import SuperPartnerLayout from "../../../components/partner/SuperPartnerLayout";

interface Center {
  id: string;
  name: string;
  city: string;
  area: string;
  type: string;
  status: "active" | "pending";
  revenue: number;
  bookings: number;
  rating: number;
  reviews: number;
  capacity: number;
  occupancy: number;
  loginId: string | null;
  loginCreated: string | null;
  services: string[];
}

const CENTERS: Center[] = [
  {
    id: "c1", name: "WeWork BKC", city: "Mumbai", area: "Bandra Kurla Complex",
    type: "Coworking", status: "active", revenue: 128400, bookings: 84,
    rating: 4.9, reviews: 312, capacity: 120, occupancy: 78,
    loginId: "bkc@bokkopartner.com", loginCreated: "2024-01-15",
    services: ["Day Pass", "Meeting Rooms", "Virtual Office"],
  },
  {
    id: "c2", name: "91Springboard HSR", city: "Bangalore", area: "HSR Layout",
    type: "Coworking", status: "active", revenue: 96200, bookings: 67,
    rating: 4.8, reviews: 241, capacity: 90, occupancy: 65,
    loginId: "hsr@bokkopartner.com", loginCreated: "2024-02-08",
    services: ["Day Pass", "Hot Desks"],
  },
  {
    id: "c3", name: "Smartworks Cyber City", city: "Gurgaon", area: "Cyber City",
    type: "Coworking", status: "active", revenue: 74800, bookings: 52,
    rating: 4.8, reviews: 187, capacity: 75, occupancy: 58,
    loginId: "cyber@bokkopartner.com", loginCreated: "2024-03-12",
    services: ["Day Pass", "Meeting Rooms"],
  },
  {
    id: "c4", name: "The Hive Powai", city: "Mumbai", area: "Powai",
    type: "Coworking", status: "pending", revenue: 0, bookings: 0,
    rating: 0, reviews: 0, capacity: 60, occupancy: 0,
    loginId: null, loginCreated: null,
    services: ["Day Pass"],
  },
];

function formatINR(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

interface AddCenterModalProps {
  onClose: () => void;
}

function AddCenterModal({ onClose }: AddCenterModalProps) {
  const [centerName, setCenterName] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  function handleCreate() {
    if (!centerName.trim() || !city.trim() || !email.trim()) return;
    setSuccess(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <h3 className="text-sm font-bold text-[#0F172A]">Add New Center</h3>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#0F172A] transition-colors">
            <X size={16} />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-3 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <Check size={24} className="text-emerald-600" />
            </div>
            <p className="text-sm font-bold text-[#0F172A]">Center Created!</p>
            <p className="text-xs text-[#64748B]">
              Login credentials have been sent to <span className="font-semibold text-[#0F172A]">{email}</span>
            </p>
            <button
              onClick={onClose}
              className="mt-2 rounded-xl bg-[#2563EB] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">Center Name</label>
              <input
                value={centerName}
                onChange={(e) => setCenterName(e.target.value)}
                placeholder="e.g. IndiQube Whitefield"
                className="bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl px-4 py-2.5 text-sm outline-none text-[#0F172A] placeholder:text-[#94A3B8]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">City</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Bangalore"
                className="bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl px-4 py-2.5 text-sm outline-none text-[#0F172A] placeholder:text-[#94A3B8]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">Center Manager Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@yourcompany.com"
                type="email"
                className="bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 rounded-xl px-4 py-2.5 text-sm outline-none text-[#0F172A] placeholder:text-[#94A3B8]"
              />
            </div>
            <p className="text-[11px] text-[#94A3B8]">
              A Bokko partner login will be created and credentials sent to this email address.
            </p>
            <button
              onClick={handleCreate}
              disabled={!centerName.trim() || !city.trim() || !email.trim()}
              className="w-full rounded-xl bg-[#2563EB] py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create &amp; Send Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface CenterCardProps {
  center: Center;
}

function CenterCard({ center }: CenterCardProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!center.loginId) return;
    navigator.clipboard.writeText(center.loginId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      {/* Colored strip */}
      <div className={`px-5 pt-4 pb-3 ${center.status === "active" ? "bg-[#2563EB]" : "bg-slate-500"}`}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">{center.name}</h3>
            <p className="mt-0.5 text-xs text-white/70">{center.area}, {center.city}</p>
          </div>
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold text-white">
            {center.type}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* Status + Services */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            center.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          }`}>
            {center.status === "active" ? "Active" : "Pending Setup"}
          </span>
          {center.services.map((s) => (
            <span key={s} className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-0.5 text-[10px] font-medium text-[#64748B]">
              {s}
            </span>
          ))}
        </div>

        {/* Stats */}
        {center.status === "active" ? (
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-[#F8FAFC] p-3 text-center">
              <p className="text-sm font-bold text-[#0F172A]">{formatINR(center.revenue)}</p>
              <p className="text-[10px] text-[#94A3B8]">Revenue</p>
            </div>
            <div className="rounded-xl bg-[#F8FAFC] p-3 text-center">
              <p className="text-sm font-bold text-[#0F172A]">{center.bookings}</p>
              <p className="text-[10px] text-[#94A3B8]">Bookings</p>
            </div>
            <div className="rounded-xl bg-[#F8FAFC] p-3 text-center">
              <p className="text-sm font-bold text-[#0F172A]">{center.rating}</p>
              <p className="text-[10px] text-[#94A3B8]">Rating</p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#E2E8F0] p-3 text-center">
            <p className="text-xs text-[#94A3B8]">Center not yet activated. Complete setup to start accepting bookings.</p>
          </div>
        )}

        {/* Credentials */}
        <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">Center Login</p>
          {center.loginId ? (
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 font-mono text-[11px] text-[#0F172A]">
                {center.loginId}
              </code>
              <button
                onClick={handleCopy}
                className="flex shrink-0 items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
              >
                {copied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-dashed border-[#E2E8F0] bg-white px-3 py-2">
              <span className="text-xs text-[#94A3B8]">Setup Pending — no login assigned yet</span>
            </div>
          )}
          {center.loginId && (
            <button className="mt-2 text-[11px] font-semibold text-[#2563EB] hover:underline">
              Reset Password
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 border-t border-[#E2E8F0] px-5 py-3">
        <Link
          to={`/partner/centers/${center.id}/analytics`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] py-2 text-xs font-semibold text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
        >
          <BarChart2 size={12} />
          View Analytics
        </Link>
        {center.status === "active" && center.loginId && (
          <a
            href="#"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#2563EB] py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
          >
            <ExternalLink size={12} />
            Open Portal
          </a>
        )}
      </div>
    </div>
  );
}

export default function SuperPartnerCentersPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <SuperPartnerLayout title="Your Centers" subtitle="Manage all your workspace centers">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#0F172A]">
          Your Centers <span className="ml-1 rounded-full bg-[#E2E8F0] px-2 py-0.5 text-xs text-[#64748B]">{CENTERS.length}</span>
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
        >
          <Plus size={14} />
          Add New Center
        </button>
      </div>

      {/* Grid */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {CENTERS.map((c) => (
          <CenterCard key={c.id} center={c} />
        ))}
      </div>

      {showModal && <AddCenterModal onClose={() => setShowModal(false)} />}
    </SuperPartnerLayout>
  );
}
