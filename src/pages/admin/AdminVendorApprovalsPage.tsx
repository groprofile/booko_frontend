import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, MessageSquare, Eye, Clock, FileText, CreditCard, Building2 } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import StatusBadge from "../../components/admin/StatusBadge";
import RejectReasonModal from "../../components/admin/RejectReasonModal";
import { showToast } from "../../components/admin/Toast";
import { useAdmin, type Vendor } from "../../context/AdminContext";
import { ApiError } from "../../lib/api";

export default function AdminVendorApprovalsPage() {
  const { vendors, approveVendor, rejectVendor, centers } = useAdmin();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Vendor | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);

  const pending = vendors.filter((v) => v.status === "pending" || v.status === "under_review");

  async function handleApprove(id: string) {
    try {
      await approveVendor(id);
      showToast("Vendor approved", "success");
      setSelected(null);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to approve vendor", "error");
    }
  }

  async function handleReject(reason: string) {
    if (!rejectTarget) return;
    try {
      await rejectVendor(rejectTarget, reason);
      showToast("Vendor rejected", "success");
      setShowRejectModal(false);
      if (selected?.id === rejectTarget) setSelected(null);
      setRejectTarget(null);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to reject vendor", "error");
    }
  }

  return (
    <AdminLayout title="Vendor Approvals" subtitle={`${pending.length} pending review`}>
      {pending.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#DCFCE7]">
            <CheckCircle size={28} className="text-[#16A34A]" />
          </div>
          <p className="mt-4 text-base font-bold text-[#0F172A]">All clear!</p>
          <p className="mt-1 text-sm text-[#94A3B8]">No vendors pending review at this time.</p>
        </div>
      ) : (
        <div className="flex gap-5">
          {/* List */}
          <div className="flex w-[340px] shrink-0 flex-col gap-3">
            {pending.map((v) => {
              const vCenters = centers.filter((c) => c.vendorId === v.id);
              return (
                <button key={v.id} onClick={() => setSelected(v)}
                  className={`w-full rounded-2xl border p-4 text-left transition-all ${selected?.id === v.id ? "border-[#2563EB] bg-[#EFF6FF] shadow-md" : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1] shadow-sm"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-[#0F172A]">{v.businessName}</p>
                      <p className="mt-0.5 text-xs text-[#64748B]">{v.businessType} · {v.city}</p>
                    </div>
                    <StatusBadge status={v.status} size="sm" />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <div className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold ${v.kycStatus === "approved" ? "bg-[#DCFCE7] text-[#15803D]" : v.kycStatus === "submitted" ? "bg-[#DBEAFE] text-[#1D4ED8]" : "bg-[#F1F5F9] text-[#94A3B8]"}`}>
                      <FileText size={9} /> KYC: {v.kycStatus.replace("_", " ")}
                    </div>
                    <div className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold ${v.bankStatus === "verified" ? "bg-[#DCFCE7] text-[#15803D]" : v.bankStatus === "submitted" ? "bg-[#DBEAFE] text-[#1D4ED8]" : "bg-[#F1F5F9] text-[#94A3B8]"}`}>
                      <CreditCard size={9} /> Bank: {v.bankStatus.replace("_", " ")}
                    </div>
                    <div className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold ${vCenters.length > 0 ? "bg-[#DBEAFE] text-[#1D4ED8]" : "bg-[#F1F5F9] text-[#94A3B8]"}`}>
                      <Building2 size={9} /> {vCenters.length} center{vCenters.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[11px] text-[#94A3B8]">
                    <Clock size={10} /> Submitted {v.joinedAt}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detail panel */}
          {selected ? (
            <div className="flex-1 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-[#0F172A]">{selected.businessName}</h3>
                  <p className="text-sm text-[#64748B]">{selected.businessType} · {selected.city}, {selected.state}</p>
                </div>
                <StatusBadge status={selected.status} />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: "Owner Name", value: selected.ownerName },
                  { label: "Mobile", value: selected.mobile },
                  { label: "Email", value: selected.email },
                  { label: "Business Email", value: selected.businessEmail },
                  { label: "GSTIN", value: selected.gstin },
                  { label: "Center Type", value: selected.centerType === "single" ? "Single Center" : "Multiple Centers" },
                  { label: "KYC Status", value: <StatusBadge status={selected.kycStatus} size="sm" /> },
                  { label: "Bank Status", value: <StatusBadge status={selected.bankStatus} size="sm" /> },
                ].map((r) => (
                  <div key={r.label} className="rounded-xl border border-[#F1F5F9] bg-[#F8FAFC] p-3">
                    <p className="text-[11px] text-[#94A3B8]">{r.label}</p>
                    <div className="mt-1 text-xs font-semibold text-[#0F172A]">{r.value}</div>
                  </div>
                ))}
              </div>

              {/* KYC review */}
              <div className="mt-5">
                <p className="mb-3 text-sm font-bold text-[#0F172A]">KYC Document Review</p>
                <div className="grid grid-cols-2 gap-2">
                  {["Company PAN", "Aadhaar", "GST Certificate", "Cancelled Cheque", "Business Registration", "Address Proof"].map((doc) => {
                    const ok = selected.kycStatus === "approved";
                    const sub = selected.kycStatus !== "not_submitted";
                    return (
                      <div key={doc} className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${ok ? "border-[#DCFCE7] bg-[#F0FDF4]" : sub ? "border-[#DBEAFE] bg-[#EFF6FF]" : "border-[#E2E8F0]"}`}>
                        <div className="flex items-center gap-2">
                          <FileText size={11} className={ok ? "text-[#16A34A]" : sub ? "text-[#2563EB]" : "text-[#94A3B8]"} />
                          <span className="text-[11px] font-medium text-[#0F172A]">{doc}</span>
                        </div>
                        <span className={`text-[10px] font-bold ${ok ? "text-[#16A34A]" : sub ? "text-[#2563EB]" : "text-[#94A3B8]"}`}>
                          {ok ? "✓ Verified" : sub ? "Submitted" : "Missing"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-wrap gap-2 border-t border-[#F1F5F9] pt-5">
                <button onClick={() => handleApprove(selected.id)}
                  className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1d4ed8]">
                  <CheckCircle size={15} /> Approve Vendor
                </button>
                <button onClick={() => { setRejectTarget(selected.id); setShowRejectModal(true); }}
                  className="flex items-center gap-2 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-2.5 text-sm font-bold text-[#DC2626] hover:bg-[#FEE2E2]">
                  <XCircle size={15} /> Reject
                </button>
                <button onClick={() => navigate(`/admin/vendors/${selected.id}`)}
                  className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] px-4 py-2.5 text-sm font-bold text-[#64748B] hover:bg-[#F8FAFC]">
                  <Eye size={15} /> Full Profile
                </button>
                <button className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] px-4 py-2.5 text-sm font-bold text-[#64748B] hover:bg-[#F8FAFC]">
                  <MessageSquare size={15} /> Ask for Info
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-[#E2E8F0] bg-white">
              <p className="text-sm text-[#94A3B8]">Select a vendor to review details</p>
            </div>
          )}
        </div>
      )}

      <RejectReasonModal
        open={showRejectModal}
        onCancel={() => { setShowRejectModal(false); setRejectTarget(null); }}
        onConfirm={handleReject}
      />
    </AdminLayout>
  );
}
