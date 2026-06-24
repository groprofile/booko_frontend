import { useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, Circle, ChevronRight, LogOut } from "lucide-react";
import { usePartner, ONBOARDING_STEPS } from "../../context/PartnerContext";

export default function OnboardingLayout() {
  const { partner, isAuthenticated, signout } = usePartner();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!isAuthenticated) { navigate("/partner/signin", { replace: true }); return; }
    if (partner?.status === "email_unverified") { navigate("/partner/verify-email", { replace: true }); return; }
    if (partner?.status === "submitted_for_review" || partner?.status === "under_review") {
      navigate("/partner/pending-review", { replace: true });
    }
  }, [isAuthenticated, partner, navigate]);

  const activeStepNum = ONBOARDING_STEPS.find((s) => pathname.endsWith(s.path))?.num ?? 1;
  const completedSteps = partner?.completedSteps ?? [];
  const totalCompleted = completedSteps.length;
  const pct = Math.round((totalCompleted / 5) * 100);

  function handleSignout() {
    signout();
    navigate("/partner/signin");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      {/* Top header */}
      <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src="/bokko-logo.png" alt="Bokko" style={{ height: 32, width: "auto" }} />
            <span className="hidden text-xs font-semibold text-[#64748B] sm:block">Partner Central</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 sm:flex">
              <div className="h-1.5 w-32 overflow-hidden rounded-full bg-[#E2E8F0]">
                <div className="h-full rounded-full bg-[#2563EB] transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs font-semibold text-[#64748B]">{pct}% complete</span>
            </div>
            <button
              type="button"
              onClick={handleSignout}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Save &amp; Exit</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1280px] flex-1 gap-0 px-4 py-8 sm:px-6 lg:gap-10">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-[#94A3B8]">Onboarding Steps</p>
            <nav className="flex flex-col gap-1">
              {ONBOARDING_STEPS.map((step) => {
                const isDone = completedSteps.includes(step.num);
                const isActive = step.num === activeStepNum;
                const isPending = !isDone && !isActive;
                return (
                  <Link
                    key={step.num}
                    to={`/partner/onboarding/${step.path}`}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${
                      isActive
                        ? "bg-[#EFF6FF] font-semibold text-[#2563EB]"
                        : isDone
                        ? "font-medium text-[#16A34A] hover:bg-[#F0FDF4]"
                        : "font-medium text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                    }`}
                  >
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isDone ? "bg-[#DCFCE7] text-[#16A34A]" : isActive ? "bg-[#2563EB] text-white" : "bg-[#E2E8F0] text-[#64748B]"
                    }`}>
                      {isDone ? <CheckCircle2 size={14} /> : step.num}
                    </span>
                    <span>{step.label}</span>
                    {isActive && <ChevronRight size={14} className="ml-auto" />}
                    {isPending && <Circle size={6} className="ml-auto text-[#CBD5E1]" />}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-8 rounded-2xl border border-[#E2E8F0] bg-white p-4">
              <p className="text-xs font-semibold text-[#0F172A]">Need help?</p>
              <p className="mt-1 text-xs text-[#64748B]">Our partner team is available to assist you through onboarding.</p>
              <a
                href="mailto:partners@bokkoapp.com"
                className="mt-3 block rounded-lg bg-[#F8FAFC] px-3 py-2 text-center text-xs font-semibold text-[#2563EB] hover:bg-[#EFF6FF]"
              >
                Contact Support
              </a>
            </div>
          </div>
        </aside>

        {/* Mobile step bar */}
        <div className="mb-6 block w-full lg:hidden">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {ONBOARDING_STEPS.map((step, i) => {
              const isDone = completedSteps.includes(step.num);
              const isActive = step.num === activeStepNum;
              return (
                <div key={step.num} className="flex items-center gap-1">
                  <Link
                    to={`/partner/onboarding/${step.path}`}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      isDone ? "bg-[#DCFCE7] text-[#16A34A]" : isActive ? "bg-[#2563EB] text-white" : "bg-[#E2E8F0] text-[#64748B]"
                    }`}
                  >
                    {isDone ? <CheckCircle2 size={12} /> : step.num}
                  </Link>
                  {i < ONBOARDING_STEPS.length - 1 && (
                    <div className={`h-px w-5 ${isDone ? "bg-[#16A34A]" : "bg-[#E2E8F0]"}`} />
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-sm font-semibold text-[#0F172A]">
            Step {activeStepNum}: {ONBOARDING_STEPS.find((s) => s.num === activeStepNum)?.label}
          </p>
        </div>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
