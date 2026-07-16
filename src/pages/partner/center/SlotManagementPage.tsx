import { useState, useEffect } from "react";
import CenterLayout from "../../../components/partner/CenterLayout";
import SuperPartnerLayout from "../../../components/partner/SuperPartnerLayout";
import SlotManagementPanel from "../../../components/partner/SlotManagementPanel";
import { usePartner } from "../../../context/PartnerContext";
import { apiGet, getVendorToken, getCentreId, ApiError } from "../../../lib/api";

// Standalone slot-management page for CENTER MANAGER sessions, who have no
// access to Manage Center (owners reach the same panel via Manage Center →
// Slots & Schedule). Resolves the centre from the manager session, falling
// back to the owner's first centre if an owner lands here directly.
export default function SlotManagementPage() {
  const { partner } = usePartner();
  const isMulti = partner?.centerType === "multiple";
  const Layout = isMulti ? SuperPartnerLayout : CenterLayout;

  const [centerId, setCenterId] = useState<string | null>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);

  useEffect(() => {
    const managerCentre = getCentreId();
    if (partner?.isManager && managerCentre) {
      setCenterId(managerCentre);
      return;
    }
    const token = getVendorToken() ?? undefined;
    apiGet<Array<{ id: string }>>("/vendor/centers", token)
      .then((list) => {
        const first = Array.isArray(list) ? list[0] : undefined;
        if (first?.id) setCenterId(first.id);
        else setResolveError("No center found on your account yet.");
      })
      .catch((err) => setResolveError(err instanceof ApiError ? err.message : "Failed to load your center"));
  }, [partner?.isManager]);

  return (
    <Layout title="Slot Management" subtitle="View, block and manage bookable slots per date">
      {resolveError ? (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-10 text-center text-sm text-[#94A3B8] shadow-sm">
          {resolveError}
        </div>
      ) : centerId ? (
        <SlotManagementPanel centerId={centerId} />
      ) : (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="h-9 w-64 animate-pulse rounded-xl bg-[#E2E8F0]" />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-[74px] animate-pulse rounded-xl bg-[#E2E8F0]" />
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
