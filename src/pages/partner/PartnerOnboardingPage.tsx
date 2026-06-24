import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePartner, ONBOARDING_STEPS } from "../../context/PartnerContext";

export default function PartnerOnboardingPage() {
  const { partner, isAuthenticated } = usePartner();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) { navigate("/partner/signin", { replace: true }); return; }
    if (!partner) return;
    if (partner.status === "email_unverified") { navigate("/partner/verify-email", { replace: true }); return; }
    if (partner.status === "submitted_for_review" || partner.status === "under_review") {
      navigate("/partner/pending-review", { replace: true }); return;
    }
    const completed = new Set(partner.completedSteps);
    const firstIncomplete = ONBOARDING_STEPS.find((s) => !completed.has(s.num));
    navigate(`/partner/onboarding/${firstIncomplete?.path ?? "business"}`, { replace: true });
  }, [isAuthenticated, partner, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E2E8F0] border-t-[#2563EB]" />
    </div>
  );
}
