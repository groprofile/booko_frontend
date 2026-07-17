import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, Gift, Share2, Users, Wallet } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useUser } from "../context/UserAuthContext";
import { apiGet, getUserToken } from "../lib/api";

interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  earnedFromReferrals: number;
}

export default function ReferEarnPage() {
  const { user, loading: userLoading } = useUser();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "Refer & Earn | Bokko";
  }, []);

  useEffect(() => {
    const token = getUserToken();
    if (!token) return;
    apiGet<ReferralStats>("/users/me/referrals", token)
      .then(setStats)
      .catch(() => setStats(null));
  }, [user]);

  const referralCode = stats?.referralCode ?? user?.referral_code ?? "";
  const shareText = referralCode
    ? `Use my Bokko referral code ${referralCode} and get rewarded on your first booking!`
    : "";

  async function handleCopy() {
    if (!referralCode) return;
    await navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    if (!referralCode) return;
    if (navigator.share) {
      await navigator.share({ title: "Bokko Refer & Earn", text: shareText }).catch(() => {});
    } else {
      await handleCopy();
    }
  }

  if (!userLoading && !user) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
          <p className="text-xl font-bold text-[#0F172A]">Sign in to view your referral code</p>
          <Link to="/" className="rounded-xl bg-[#111111] px-5 py-2.5 text-sm font-semibold text-white hover:bg-black">
            Go to Home
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-[720px] px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-3xl">Refer &amp; Earn</h1>
          <p className="mt-2 text-sm text-[#64748B]">
            Share your code with friends — you both get rewarded when they complete their first booking.
          </p>

          <div className="mt-6 overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-gradient-to-br from-[#2563EB] to-[#1E1B4B] p-6 text-white">
            <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
              <Gift size={16} />
              Your Referral Code
            </div>
            <p className="mt-2 text-3xl font-extrabold tracking-widest">{referralCode || "—"}</p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!referralCode}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy Code"}
              </button>
              <button
                type="button"
                onClick={handleShare}
                disabled={!referralCode}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#1E1B4B] hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Share2 size={16} />
                Share
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                <Users size={18} />
              </span>
              <div>
                <p className="text-lg font-extrabold text-[#0F172A]">{stats?.totalReferrals ?? 0}</p>
                <p className="text-xs text-[#64748B]">Friends Referred</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#16A34A]">
                <Wallet size={18} />
              </span>
              <div>
                <p className="text-lg font-extrabold text-[#0F172A]">{stats?.earnedFromReferrals ?? 0}</p>
                <p className="text-xs text-[#64748B]">Rewards Earned</p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-6">
            <p className="text-sm font-bold text-[#0F172A]">How it works</p>
            <ol className="mt-3 flex flex-col gap-2 text-sm text-[#64748B]">
              <li>1. Share your referral code with friends.</li>
              <li>2. They sign up on Bokko using your code.</li>
              <li>3. You both get rewarded after their first booking.</li>
            </ol>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
