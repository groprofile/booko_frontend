import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import CenterLayout from "../../../components/partner/CenterLayout";
import { apiGet, getVendorToken, ApiError } from "../../../lib/api";

// Single-center vendors have no centers-list page — this resolves their one
// center and forwards to the shared manage screen at /partner/centers/:id.
export default function CenterManageRedirect() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getVendorToken() ?? undefined;
    apiGet<Array<{ id: string }>>("/vendor/centers", token)
      .then((centers) => {
        const first = Array.isArray(centers) ? centers[0] : undefined;
        if (first?.id) {
          navigate(`/partner/centers/${first.id}`, { replace: true });
        } else {
          setError("No center found on your account yet. Complete onboarding to add one.");
        }
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load your center"));
  }, [navigate]);

  return (
    <CenterLayout title="Manage Center" subtitle="Loading your center…">
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Building2 size={32} className="text-[#E2E8F0]" />
        <p className="mt-3 text-sm text-[#94A3B8]">{error ?? "Opening your center…"}</p>
      </div>
    </CenterLayout>
  );
}
