import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, MapPin, Phone, Mail, CreditCard, CheckCircle, XCircle, ShieldOff, Shield, FileText } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import StatusBadge from "../../components/admin/StatusBadge";
import { useAdmin } from "../../context/AdminContext";

const fmt = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;

const KYC_DOCS = ["Company PAN", "Aadhaar", "GST Certificate", "Shop Establishment", "Business Registration", "Cancelled Cheque", "Address Proof"];

export default function AdminVendorDetailPage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const { vendors, centers, bookings, approveVendor, rejectVendor, blockVendor, unblockVendor } = useAdmin();

  const vendor = vendors.find((v) => v.id === vendorId);
  if (!vendor) return (
    <AdminLayout title="Vendor Detail">
      <div className="text-center py-24 text-[#94A3B8]">Vendor not found.</div>
    </AdminLayout>
  );

  const vCenters = centers.filter((c) => c.vendorId === vendorId);
  const vBookings = bookings.filter((b) => b.vendorId === vendorId);
  const vRevenue = vBookings.filter((b) => b.paymentStatus === "paid").reduce((a, b) => a + b.amount, 0);

  return (
    <AdminLayout title={vendor.businessName} subtitle={`${vendor.businessType} · ${vendor.city}`}>
      {/* Back */}
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#0F172A]">
        <ArrowLeft size={14} /> Back to Vendors
      </button>

      {/* Header card */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm mb-5">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F172A] text-xl font-extrabold text-white">
            {vendor.businessName.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-extrabold text-[#0F172A]">{vendor.businessName}</h2>
              <StatusBadge status={vendor.status} />
            </div>
            <p className="mt-0.5 text-sm text-[#64748B]">{vendor.businessType} · {vendor.city}, {vendor.state}</p>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-[#64748B]">
              <span className="flex items-center gap-1"><Mail size={11} />{vendor.businessEmail}</span>
              <span className="flex items-center gap-1"><Phone size={11} />{vendor.mobile}</span>
              <span className="flex items-center gap-1"><FileText size={11} />GSTIN: {vendor.gstin}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {vendor.status !== "approved" && (
              <button onClick={() => approveVendor(vendor.id)} className="flex items-center gap-1.5 rounded-xl bg-[#DCFCE7] px-3 py-2 text-xs font-bold text-[#15803D] hover:bg-[#BBF7D0]">
                <CheckCircle size={13} /> Approve
              </button>
            )}
            {vendor.status !== "rejected" && (
              <button onClick={() => rejectVendor(vendor.id)} className="flex items-center gap-1.5 rounded-xl bg-[#FEE2E2] px-3 py-2 text-xs font-bold text-[#B91C1C] hover:bg-[#FECACA]">
                <XCircle size={13} /> Reject
              </button>
            )}
            {vendor.status === "blocked" ? (
              <button onClick={() => unblockVendor(vendor.id)} className="flex items-center gap-1.5 rounded-xl bg-[#EFF6FF] px-3 py-2 text-xs font-bold text-[#2563EB] hover:bg-[#DBEAFE]">
                <Shield size={13} /> Unblock
              </button>
            ) : (
              <button onClick={() => blockVendor(vendor.id)} className="flex items-center gap-1.5 rounded-xl bg-[#F1F5F9] px-3 py-2 text-xs font-bold text-[#64748B] hover:bg-[#E2E8F0]">
                <ShieldOff size={13} /> Block
              </button>
            )}
          </div>
        </div>

        {/* Metrics */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total Revenue", value: fmt(vRevenue) },
            { label: "Total Bookings", value: vBookings.length.toString() },
            { label: "Centers", value: vCenters.length.toString() },
            { label: "Commission Rate", value: `${vendor.commissionRate}%` },
          ].map((m) => (
            <div key={m.label} className="rounded-xl bg-[#F8FAFC] p-3 text-center">
              <p className="text-lg font-extrabold text-[#0F172A]">{m.value}</p>
              <p className="text-[11px] text-[#94A3B8]">{m.label}</p>
            </div>
          ))}
        </div>

        {vendor.notes && (
          <div className="mt-4 rounded-xl bg-[#FEF9C3] px-4 py-3 text-xs text-[#92400E]">
            <span className="font-bold">Note:</span> {vendor.notes}
          </div>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* KYC Status */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-bold text-[#0F172A]">KYC Documents</p>
            <StatusBadge status={vendor.kycStatus} />
          </div>
          <div className="flex flex-col gap-2">
            {KYC_DOCS.map((doc) => {
              const approved = vendor.kycStatus === "approved";
              const submitted = vendor.kycStatus === "submitted" || vendor.kycStatus === "approved";
              return (
                <div key={doc} className={`flex items-center justify-between rounded-xl border px-4 py-3 ${approved ? "border-[#DCFCE7] bg-[#F0FDF4]" : submitted ? "border-[#DBEAFE] bg-[#EFF6FF]" : "border-[#E2E8F0] bg-[#F8FAFC]"}`}>
                  <div className="flex items-center gap-2.5">
                    <FileText size={13} className={approved ? "text-[#16A34A]" : submitted ? "text-[#2563EB]" : "text-[#94A3B8]"} />
                    <span className="text-xs font-medium text-[#0F172A]">{doc}</span>
                  </div>
                  <StatusBadge status={approved ? "approved" : submitted ? "submitted" : "not_submitted"} size="sm" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Bank Details */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-bold text-[#0F172A]">Bank Details</p>
            <StatusBadge status={vendor.bankStatus} />
          </div>
          {vendor.bankStatus !== "not_submitted" ? (
            <div className="flex flex-col gap-3">
              {[
                { label: "Account Holder", value: vendor.ownerName },
                { label: "Account Number", value: "XXXX XXXX 9456" },
                { label: "IFSC Code", value: "HDFC0001234" },
                { label: "Bank Name", value: "HDFC Bank" },
                { label: "Branch", value: "Andheri West, Mumbai" },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between border-b border-[#F8FAFC] pb-3 last:border-0 last:pb-0">
                  <span className="text-xs text-[#64748B]">{r.label}</span>
                  <span className="text-xs font-semibold text-[#0F172A]">{r.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CreditCard size={28} className="text-[#E2E8F0]" />
              <p className="mt-2 text-sm text-[#94A3B8]">Bank details not submitted yet</p>
            </div>
          )}
        </div>

        {/* Centers */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <p className="mb-4 font-bold text-[#0F172A]">Centers ({vCenters.length})</p>
          {vCenters.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#94A3B8]">No centers added yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {vCenters.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF6FF]">
                    <Building2 size={14} className="text-[#2563EB]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-semibold text-[#0F172A]">{c.name}</p>
                    <p className="flex items-center gap-1 text-[11px] text-[#94A3B8]"><MapPin size={9} />{c.area}, {c.city}</p>
                  </div>
                  <StatusBadge status={c.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <p className="mb-4 font-bold text-[#0F172A]">Recent Bookings ({vBookings.length})</p>
          {vBookings.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#94A3B8]">No bookings yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {vBookings.slice(0, 6).map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-xl border border-[#F1F5F9] bg-[#F8FAFC] px-3 py-2.5">
                  <div>
                    <p className="text-xs font-semibold text-[#0F172A]">{b.customerName}</p>
                    <p className="text-[11px] text-[#94A3B8]">{b.product} · {b.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#0F172A]">₹{b.amount}</p>
                    <StatusBadge status={b.paymentStatus} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
