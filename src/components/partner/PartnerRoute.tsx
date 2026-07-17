import { Navigate, Outlet } from "react-router-dom";
import { usePartner } from "../../context/PartnerContext";

export default function PartnerRoute() {
  const { partner } = usePartner();
  if (!partner) return <Navigate to="/partner/signin" replace />;
  if (partner.status !== "approved") return <Navigate to="/partner/pending-review" replace />;
  return <Outlet />;
}
