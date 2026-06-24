import { useLocation } from "react-router-dom";
import HotelCheckoutPage from "./HotelCheckoutPage";
import UniversalCheckoutPage from "./UniversalCheckoutPage";
import type { UniversalCheckoutState } from "../data/universalCheckout";

export default function CheckoutPage() {
  const location = useLocation();
  const state = location.state as ({ productType?: string } | undefined);
  const productType = state?.productType;

  if (productType === "day-pass" || productType === "meeting-room" || productType === "virtual-office" || productType === "monthly-pass") {
    return <UniversalCheckoutPage booking={state as UniversalCheckoutState} />;
  }

  return <HotelCheckoutPage />;
}
