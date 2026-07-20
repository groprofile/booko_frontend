import { ShoppingCart, X, Trash2, ArrowRight, MapPin, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";

const PRODUCT_LABEL: Record<string, string> = {
  "day-pass": "Day Pass",
  "meeting-room": "Meeting Room",
  "virtual-office": "Virtual Office",
  "monthly-pass": "Monthly Pass",
  hotel: "Hotel",
};

// Distinct tag color per product type (day-pass and monthly-pass no longer
// share the same green; hotel is included; unknown types fall back to slate).
const PRODUCT_COLOR: Record<string, string> = {
  "day-pass": "bg-[#ECFDF5] text-[#16A34A]",
  "meeting-room": "bg-[#EFF6FF] text-[#2563EB]",
  "virtual-office": "bg-[#FDF4FF] text-[#9333EA]",
  "monthly-pass": "bg-[#FFF7ED] text-[#EA580C]",
  hotel: "bg-[#FEF2F2] text-[#E11D48]",
};

const FALLBACK_COLOR = "bg-[#F1F5F9] text-[#475569]";

export default function CartDrawer() {
  const { items, removeItem, isOpen, closeCart, totalPrice } = useCart();
  const navigate = useNavigate();

  function goToCheckout(item: (typeof items)[number]) {
    closeCart();
    navigate("/checkout", { state: item.checkoutState });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex">
      <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm" onClick={closeCart} />
      <div className="glass-panel absolute right-0 top-0 flex h-full w-full max-w-[400px] flex-col border-l border-white/50 shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/50 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="cta-gradient flex h-8 w-8 items-center justify-center rounded-xl">
              <ShoppingCart size={16} className="text-white" />
            </span>
            <span className="text-base font-bold text-[#0F172A]">My Cart</span>
            {items.length > 0 && (
              <span className="cta-gradient flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold text-white">
                {items.length}
              </span>
            )}
          </div>
          <button type="button" onClick={closeCart} className="rounded-lg p-1.5 hover:bg-black/5">
            <X size={20} className="text-[#64748B]" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF6FF]">
                <ShoppingCart size={28} className="text-[#2563EB]" />
              </div>
              <p className="text-sm font-semibold text-[#334155]">Your cart is empty</p>
              <p className="text-xs text-[#94A3B8]">Browse workspaces and add them to cart to book later</p>
              <button
                type="button"
                onClick={closeCart}
                className="cta-gradient rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-[1.06]"
              >
                Browse Workspaces
              </button>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-black/5">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-4">
                  <img src={item.image} alt={item.workspaceName} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${PRODUCT_COLOR[item.productType] ?? FALLBACK_COLOR}`}>
                          {PRODUCT_LABEL[item.productType] ?? "Workspace"}
                        </span>
                        <p className="mt-0.5 truncate text-sm font-bold text-[#0F172A]">{item.workspaceName}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label="Remove from cart"
                        className="shrink-0 rounded-lg p-1 hover:bg-[#FEE2E2]"
                      >
                        <Trash2 size={14} className="text-[#DC2626]" />
                      </button>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#64748B]">
                      <span className="flex items-center gap-1"><MapPin size={10} /> {item.locality}, {item.cityName}</span>
                      {item.date && <span className="flex items-center gap-1"><Calendar size={10} /> {item.date}</span>}
                      {item.passType && <span>{item.passType}</span>}
                      {item.members && item.members > 1 && <span>{item.members} members</span>}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-extrabold text-[#0F172A]">₹{item.price.toLocaleString()}</span>
                      <button
                        type="button"
                        onClick={() => goToCheckout(item)}
                        className="cta-gradient flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-all hover:brightness-[1.06]"
                      >
                        Book Now
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer — honest summary: shows the aggregate total; each item is
            booked from its own row (bookings are created per workspace). */}
        {items.length > 0 && (
          <div className="border-t border-white/50 bg-white/40 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-[#334155]">
                Total ({items.length} item{items.length > 1 ? "s" : ""})
              </span>
              <span className="brand-gradient-text text-lg font-extrabold">₹{totalPrice.toLocaleString()}</span>
            </div>
            <p className="text-xs text-[#94A3B8]">
              Each workspace is booked separately — tap <span className="font-semibold text-[#2563EB]">Book Now</span> on an item to complete its booking.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
