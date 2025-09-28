import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  MessageSquare, 
  BarChart3, 
  LogOut,
  Cake
} from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: Package, label: "Products", path: "/admin/products" },
    { icon: ShoppingBag, label: "Orders", path: "/admin/orders" },
    { icon: MessageSquare, label: "Inquiries", path: "/admin/inquiries" },
    { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="admin-sidebar w-64 min-h-screen p-6">
      {/* Logo */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="bg-white/20 p-2 rounded-xl">
          <Cake className="h-6 w-6 text-white" />
        </div>
        <span className="font-bold text-xl text-white">Admin Panel</span>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                isActive(item.path)
                  ? "bg-white/20 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-6 left-6 right-6">
        <Button
          variant="outline"
          className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
          onClick={() => {
            // Handle logout
            window.location.href = "/admin/login";
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;