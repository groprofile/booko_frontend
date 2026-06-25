import { Navigate, Outlet } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";

export default function AdminRoute() {
  const { admin } = useAdmin();
  if (!admin) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}
