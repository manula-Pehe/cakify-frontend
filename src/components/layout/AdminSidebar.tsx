import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  MessageSquare, 
  BarChart3, 
  LogOut,
  Cake,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { reviewService } from "@/services/reviewService";
import { productService } from "@/services/productService";

const AdminSidebar = () => {
  const location = useLocation();
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);

  useEffect(() => {
    loadPendingReviewsCount();
    // Refresh count every 30 seconds
    const interval = setInterval(loadPendingReviewsCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadPendingReviewsCount = async () => {
    try {
      const products = await productService.getAll();
      const allReviewsPromises = products.map((product) =>
        reviewService.getAllByProduct(product.id)
      );
      const reviewsArrays = await Promise.all(allReviewsPromises);
      const allReviews = reviewsArrays.flat();
      
      // Get rejected reviews from localStorage
      const stored = localStorage.getItem('rejectedReviews');
      const rejectedReviewsSet = stored ? new Set(JSON.parse(stored)) : new Set();
      
      // Count only truly pending reviews (not approved and not rejected)
      const pending = allReviews.filter((r) => !r.approved && !rejectedReviewsSet.has(r.id)).length;
      setPendingReviewsCount(pending);
    } catch (error) {
      console.error("Failed to load pending reviews count:", error);
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: Package, label: "Products", path: "/admin/products" },
    { icon: ShoppingBag, label: "Orders", path: "/admin/orders" },
    { icon: Star, label: "Reviews", path: "/admin/reviews", badge: pendingReviewsCount },
    { icon: MessageSquare, label: "Inquiries", path: "/admin/inquiries" },
    { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="admin-sidebar w-64 min-h-screen p-6 flex flex-col">
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
              className={`flex items-center justify-between space-x-3 px-4 py-3 rounded-xl transition-colors ${
                isActive(item.path)
                  ? "bg-white/20 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <Badge className="bg-red-500 text-white hover:bg-red-600">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="mt-6 pt-6 border-t border-white/20">
        <Button
          variant="ghost"
          className="w-full justify-start px-4 py-3 text-white/70 hover:bg-white/10 hover:text-white transition-colors rounded-xl"
          onClick={() => {
            // Handle logout
            localStorage.removeItem("admin-token");
            window.location.href = "/admin/login";
          }}
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span className="font-medium">Logout</span>
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;