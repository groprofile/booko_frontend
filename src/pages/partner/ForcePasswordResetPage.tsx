import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, Loader2 } from "lucide-react";
import { usePartner } from "../../context/PartnerContext";
import { apiPatch, getVendorToken, ApiError } from "../../lib/api";

const INPUT = "w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] transition-colors focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15";

export default function ForcePasswordResetPage() {
  const { partner, updatePartner } = usePartner();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function redirectAfterReset() {
    if (!partner) { navigate("/partner/signin"); return; }
    if (partner.status === "approved") {
      navigate(partner.centerType === "multiple" ? "/partner/dashboard" : "/partner/center/overview");
    } else {
      navigate("/partner/onboarding");
    }
  }

  async function handleSubmit() {
    setError("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    setSaving(true);
    try {
      const token = getVendorToken();
      await apiPatch("/vendor/change-password", { currentPassword, newPassword }, token ?? undefined);
      updatePartner({ mustChangePassword: false });
      redirectAfterReset();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update password");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="w-full max-w-[440px]">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-sm">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF6FF]">
              <ShieldAlert size={28} className="text-[#2563EB]" />
            </div>
          </div>
          <h1 className="mt-6 text-center text-xl font-extrabold text-[#0F172A]">Set a New Password</h1>
          <p className="mt-2 text-center text-sm leading-relaxed text-[#64748B]">
            For security, you need to set your own password before continuing. Enter the temporary password you were given, then choose a new one.
          </p>

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-xs text-red-600">{error}</p>
          )}

          <div className="mt-6 flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">Temporary Password</label>
              <input type="password" value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter the password you were given" className={INPUT} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">New Password</label>
              <input type="password" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters" className={INPUT} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#1E293B]">Confirm New Password</label>
              <input type="password" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password" className={INPUT} />
            </div>
          </div>

          <button type="button" onClick={handleSubmit} disabled={saving}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#1d4ed8] disabled:opacity-60">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Updating…" : "Set Password & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
