import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../../context/CartContext";
import CartDrawer from "./CartDrawer";

export default function CartButton() {
  const { totalItems } = useCart();
  const [open, setOpen] = useState(false);

  if (totalItems === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-5 z-[150] flex h-14 w-14 items-center justify-center rounded-full bg-[#2563EB] shadow-[0_8px_24px_rgba(37,99,235,0.5)] transition-transform hover:scale-110 lg:bottom-8"
      >
        <ShoppingCart size={22} className="text-white" />
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#DC2626] text-[11px] font-bold text-white">
          {totalItems}
        </span>
      </button>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
