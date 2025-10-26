import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/layout/AdminSidebar";

const AdminLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated (demo purposes)
    const token = localStorage.getItem("admin-token");
    if (!token) {
      // Auto-login for development
      localStorage.setItem("admin-token", "demo-admin-token");
    }
  }, [navigate]);

  return (
    <div className="flex min-h-screen w-full">
      <AdminSidebar />
      <main className="flex-1 bg-background p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
