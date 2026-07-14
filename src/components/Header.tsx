import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, User, BookOpen, Headphones, LogOut, ShoppingCart } from "lucide-react";
import Logo from "./Logo";
import LoginModal from "./LoginModal";
import CartDrawer from "./cart/CartDrawer";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserAuthContext";

const navLinks = [
  { label: "Hotels", to: "/mumbai/hotels" },
  { label: "Coworking", to: "/mumbai/coworking-spaces" },
  { label: "Day Pass", to: "/mumbai/day-pass" },
  { label: "Meeting Rooms", to: "/mumbai/meeting-rooms" },
  { label: "Virtual Office", to: "/mumbai/virtual-office" },
  { label: "Monthly Pass", to: "/mumbai/monthly-pass" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { totalItems } = useCart();
  const { isLoggedIn, user, logout } = useUser();
  const location = useLocation();

  async function handleLogout() {
    setDropdownOpen(false);
    await logout();
  }

  return (
    <header
      id="top"
      className="sticky top-0 z-50 h-20 w-full border-b border-[#E2E8F0] bg-white/95 backdrop-blur-sm"
    >
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {navLinks.map((link) => {
            const isActive = location.pathname.includes(link.to.split("/").pop() ?? "");
            return (
              <Link key={link.label} to={link.to}
                className={"text-sm font-medium transition-colors hover:text-[#2563EB] " +
                  (isActive ? "font-bold text-[#2563EB]" : "text-[#334155]")}>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isLoggedIn ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-[#E2E8F0] py-1.5 pl-1.5 pr-3 transition-colors hover:bg-[#F8FAFC]"
                aria-expanded={dropdownOpen}
                aria-haspopup="menu"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EFF6FF] text-sm font-semibold text-[#2563EB]">
                  {user?.name ? user.name[0].toUpperCase() : user?.phone?.slice(-2) ?? "U"}
                </span>
                <ChevronDown size={16} className="text-[#64748B]" />
              </button>
              {dropdownOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+8px)] w-56 rounded-2xl border border-[#E2E8F0] bg-white p-2 shadow-soft-lg"
                >
                  <a
                    href="#bookings"
                    role="menuitem"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#334155] hover:bg-[#F8FAFC]"
                  >
                    <BookOpen size={18} className="text-[#64748B]" />
                    My Bookings
                  </a>
                  <a
                    href="#profile"
                    role="menuitem"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#334155] hover:bg-[#F8FAFC]"
                  >
                    <User size={18} className="text-[#64748B]" />
                    Profile
                  </a>
                  <a
                    href="#support"
                    role="menuitem"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#334155] hover:bg-[#F8FAFC]"
                  >
                    <Headphones size={18} className="text-[#64748B]" />
                    Support
                  </a>
                  <div className="my-1 h-px bg-[#E2E8F0]" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#DC2626] hover:bg-[#FEF2F2]"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button type="button" onClick={() => setCartOpen(true)}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E8F0] text-[#334155] hover:border-[#2563EB] hover:text-[#2563EB]">
                <ShoppingCart size={18} />
                {totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#2563EB] text-[10px] font-bold text-white">{totalItems}</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setLoginOpen(true)}
                className="text-sm font-semibold text-[#334155] transition-colors hover:text-[#2563EB]"
              >
                Sign In
              </button>
              <Link
                to="/partner/signup"
                className="cta-gradient rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-transform hover:scale-[1.02]"
              >
                List Your Space
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#0F172A] lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="absolute left-0 right-0 top-20 z-50 border-b border-[#E2E8F0] bg-white px-4 py-4 shadow-soft-lg lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium text-[#334155] hover:bg-[#F8FAFC]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-[#E2E8F0] pt-3">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setLoginOpen(true);
              }}
              className="rounded-xl px-3 py-3 text-center text-sm font-semibold text-[#334155] hover:bg-[#F8FAFC]"
            >
              Sign In
            </button>
            <Link
              to="/partner/signup"
              onClick={() => setMobileOpen(false)}
              className="cta-gradient rounded-full px-5 py-3 text-center text-sm font-semibold text-white"
            >
              List Your Space
            </Link>
          </div>
        </div>
      )}

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
