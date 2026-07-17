import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Gift, LogOut, User, Wallet } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useUser } from "../context/UserAuthContext";
import { apiPatch, getUserToken } from "../lib/api";

export default function ProfilePage() {
  const { user, loading, refreshUser, logout } = useUser();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "My Profile | Bokko";
  }, []);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name ?? "");
      setEmail(user.email ?? "");
    }
  }, [user]);

  async function handleSave() {
    const token = getUserToken();
    if (!token) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await apiPatch("/users/me", { fullName, email: email || undefined }, token);
      await refreshUser();
      setMessage("Profile updated.");
    } catch (e) {
      setError((e as Error).message ?? "Could not update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  if (!loading && !user) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
          <p className="text-xl font-bold text-[#0F172A]">You're not signed in</p>
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
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-3xl">My Profile</h1>

          {loading && <p className="mt-6 text-sm text-[#64748B]">Loading…</p>}

          {!loading && user && (
            <div className="mt-6 flex flex-col gap-6">
              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EFF6FF] text-xl font-bold text-[#2563EB]">
                    {user.full_name ? user.full_name[0].toUpperCase() : <User size={22} />}
                  </span>
                  <div>
                    <p className="text-base font-bold text-[#0F172A]">{user.full_name || "Bokko User"}</p>
                    <p className="text-sm text-[#64748B]">{user.phone}</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#334155]">
                    Full Name
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-11 rounded-xl border border-[#D1D5DB] px-3 text-sm font-medium text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#334155]">
                    Email
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 rounded-xl border border-[#D1D5DB] px-3 text-sm font-medium text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
                    />
                  </label>
                </div>

                {message && <p className="mt-3 text-sm font-semibold text-[#16A34A]">{message}</p>}
                {error && <p className="mt-3 text-sm font-semibold text-[#DC2626]">{error}</p>}

                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="mt-5 rounded-xl bg-[#111111] px-6 py-2.5 text-sm font-bold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Link to="/my-bookings" className="flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-5 hover:border-[#BFDBFE]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                    <Wallet size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#0F172A]">My Bookings</p>
                    <p className="text-xs text-[#64748B]">View your booking history</p>
                  </div>
                </Link>
                <Link to="/refer-earn" className="flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-5 hover:border-[#BFDBFE]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFFBEB] text-[#D97706]">
                    <Gift size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#0F172A]">Refer &amp; Earn</p>
                    <p className="text-xs text-[#64748B]">Share your referral code</p>
                  </div>
                </Link>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 rounded-2xl border border-[#FECACA] bg-white py-3 text-sm font-bold text-[#DC2626] hover:bg-[#FEF2F2]"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
