import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { UniversalCheckoutState } from "../data/universalCheckout";
import CartDrawer from "../components/cart/CartDrawer";

export interface CartItem {
  id: string;
  productType: "day-pass" | "meeting-room" | "virtual-office" | "monthly-pass" | "hotel";
  workspaceName: string;
  cityName: string;
  locality: string;
  image: string;
  price: number;
  date?: string;
  passType?: string;
  members?: number;
  checkoutState: UniversalCheckoutState;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  // Drawer open state lives here so there's a single source of truth (and a
  // single drawer mount), instead of independent copies in Header + CartButton.
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalPrice: 0,
  isOpen: false,
  openCart: () => {},
  closeCart: () => {},
});

const STORAGE_KEY = "bokko_cart_v1";

// A cart line is unique by workspace + chosen date/pass/party — so the same
// space booked for two different dates coexists instead of silently dropping.
function cartKey(item: CartItem): string {
  return [item.id, item.date ?? "", item.passType ?? "", item.members ?? ""].join("|");
}

function loadInitial(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadInitial);
  const [isOpen, setIsOpen] = useState(false);

  // Persist across refreshes.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage full / disabled — cart just won't persist */
    }
  }, [items]);

  const addItem = useCallback((item: CartItem) => {
    // Normalize the id to the composite key so removal + dedupe are consistent.
    const keyed = { ...item, id: cartKey(item) };
    setItems((prev) => {
      if (prev.some((i) => i.id === keyed.id)) return prev; // already in cart
      return [...prev, keyed];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const totalPrice = useMemo(() => items.reduce((sum, i) => sum + (i.price || 0), 0), [items]);

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      clearCart,
      totalItems: items.length,
      totalPrice,
      isOpen,
      openCart,
      closeCart,
    }),
    [items, addItem, removeItem, clearCart, totalPrice, isOpen, openCart, closeCart],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {/* Single, app-wide drawer mount. */}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
