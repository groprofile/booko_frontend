import { useState } from "react";
import { type ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import ToastContainer from "./Toast";

interface Props {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AdminLayout({ children, title, subtitle }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-wash flex h-screen overflow-hidden">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-5 lg:p-6">
          {children}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
