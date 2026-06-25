import { Navigate, Outlet } from "react-router-dom";
import { usePartner } from "../../context/PartnerContext";

export default function PartnerRoute() {
  const { partner } = usePartner();
  if (!partner || partner.status !== "approved") return <Navigate to="/partner/signin" replace />;
  return <Outlet />;
}
