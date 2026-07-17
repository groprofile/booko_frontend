import { ShoppingCart, X, Trash2, ArrowRight, MapPin, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const PRODUCT_LABEL: Record<string, string> = {
  "day-pass": "Day Pass",
  "meeting-room": "Meeting Room",
  "virtual-office": "Virtual Office",
  "monthly-pass": "Monthly Pass",
};

const PRODUCT_COLOR: Record<string, string> = {
  "day-pass": "bg-[#ECFDF5] text-[#16A34A]",
  "meeting-room": "bg-[#EFF6FF] text-[#2563EB]",
  "virtual-office": "bg-[#FDF4FF] text-[#9333EA]",
  "monthly-pass": "bg-[#F0FDF4] text-[#16A34A]",
};

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem } = useCart();
  const navigate = useNavigate();

  function goToCheckout(idx: number) {
    const item = items[idx];
    onClose();
    navigate("/checkout", { state: item.checkoutState });
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[200] flex">
          <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm" onClick={onClose} />
          <div className="absolute right-0 top-0 flex h-full w-full max-w-[400px] flex-col bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <ShoppingCart size={20} className="text-[#2563EB]" />
                <span className="text-base font-bold text-[#0F172A]">My Cart</span>
                {items.length > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] text-[11px] font-bold text-white">{items.length}</span>
                )}
              </div>
              <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-[#F1F5F9]">
                <X size={20} className="text-[#64748B]" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F1F5F9]">
                    <ShoppingCart size={28} className="text-[#94A3B8]" />
                  </div>
                  <p className="text-sm font-semibold text-[#64748B]">Your cart is empty</p>
                  <p className="text-xs text-[#94A3B8]">Browse workspaces and add them to cart to book later</p>
                  <button type="button" onClick={onClose}
                    className="rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]">
                    Browse Workspaces
                  </button>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-[#F1F5F9]">
                  {items.map((item, idx) => (
                    <div key={item.id} className="flex gap-3 p-4">
                      <img src={item.image} alt={item.workspaceName}
                        className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${PRODUCT_COLOR[item.productType]}`}>
                              {PRODUCT_LABEL[item.productType]}
                            </span>
                            <p className="mt-0.5 truncate text-sm font-bold text-[#0F172A]">{item.workspaceName}</p>
                          </div>
                          <button type="button" onClick={() => removeItem(item.id)}
                            className="shrink-0 rounded-lg p-1 hover:bg-[#FEE2E2]">
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
                          <button type="button" onClick={() => goToCheckout(idx)}
                            className="flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#1d4ed8]">
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

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-[#E2E8F0] p-4">
                <p className="mb-3 text-xs text-[#94A3B8]">{items.length} workspace{items.length > 1 ? "s" : ""} saved. Book each separately.</p>
                <button type="button" onClick={() => goToCheckout(0)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] py-3.5 text-sm font-bold text-white hover:bg-black">
                  Checkout First Item
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
