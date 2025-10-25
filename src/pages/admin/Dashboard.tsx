import StatsCard from "@/components/admin/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { orders, inquiries, analytics } from "@/data/mockData";
import { 
  ShoppingBag, 
  Package, 
  MessageSquare, 
  TrendingUp, 
  Clock,
  DollarSign,
  Users,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const recentOrders = orders.slice(0, 5);
  const newInquiries = inquiries.filter(i => i.status === "new");
  const pendingOrders = orders.filter(o => o.status === "pending");
  const todayRevenue = 1250; // Mock data

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-purple-100 text-purple-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black mb-2">Dashboard Overview</h1>
        <p className="text-black/80">Welcome back! Here's what's happening with your cake business.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Orders"
          value={analytics.stats.totalOrders}
          icon={ShoppingBag}
          description="All time orders"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Pending Orders"
          value={analytics.stats.pendingOrders}
          icon={Clock}
          description="Awaiting confirmation"
        />
        <StatsCard
          title="Available Cakes"
          value={analytics.stats.totalCakes}
          icon={Package}
          description="Active products"
        />
        <StatsCard
          title="New Inquiries"
          value={analytics.stats.newInquiries}
          icon={MessageSquare}
          description="Unread messages"
        />
      </div>

      {/* Today's Summary */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <DollarSign className="h-5 w-5" />
              Today's Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black mb-2">${todayRevenue}</div>
            <p className="text-black/70 text-sm">+15% from yesterday</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Users className="h-5 w-5" />
              Active Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black mb-2">24</div>
            <p className="text-black/70 text-sm">Customers this week</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <TrendingUp className="h-5 w-5" />
              Growth Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black mb-2">+8.2%</div>
            <p className="text-black/70 text-sm">Monthly growth</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-black">Recent Orders</CardTitle>
              <Button asChild variant="outline" size="sm" className="bg-black/10 border-black/20 text-black">
                <Link to="/admin/orders">View All</Link>
              </Button>
            </div>
            <CardDescription className="text-black/70">
              Latest cake orders from customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-black/5 rounded-xl">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-black">{order.customerName}</span>
                      <Badge className={`status-badge ${getStatusColor(order.status)}`}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-black/70">{order.cakeName} - {order.size}</p>
                    <p className="text-xs text-black/60">Delivery: {order.deliveryDate}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-black">${order.total}</div>
                    <Button asChild variant="ghost" size="sm" className="text-black/70 hover:text-black">
                      <Link to={`/admin/orders`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Inquiries */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-black">New Inquiries</CardTitle>
              <Button asChild variant="outline" size="sm" className="bg-black/10 border-black/20 text-black">
                <Link to="/admin/inquiries">View All</Link>
              </Button>
            </div>
            <CardDescription className="text-black/70">
              Customer questions and requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {newInquiries.slice(0, 3).map((inquiry) => (
                <div key={inquiry.id} className="p-4 bg-black/5 rounded-xl">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-black">{inquiry.name}</span>
                    <span className="text-xs text-black/60">{inquiry.date}</span>
                  </div>
                  <p className="text-sm text-black/70 line-clamp-2 mb-2">
                    {inquiry.message}
                  </p>
                  <Button asChild variant="ghost" size="sm" className="text-black/70 hover:text-black p-0">
                    <Link to={`/admin/inquiries`}>
                      Reply →
                    </Link>
                  </Button>
                </div>
              ))}
              
              {newInquiries.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="h-8 w-8 text-black/50 mx-auto mb-2" />
                  <p className="text-black/70">No new inquiries</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-black">Quick Actions</CardTitle>
          <CardDescription className="text-black/70">
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="bg-black/10 border-black/20 text-black h-20 flex-col">
              <Link to="/admin/products">
                <Package className="h-6 w-6 mb-2" />
                Add New Cake
              </Link>
            </Button>
            <Button asChild variant="outline" className="bg-black/10 border-black/20 text-black h-20 flex-col">
              <Link to="/admin/orders">
                <ShoppingBag className="h-6 w-6 mb-2" />
                Process Orders
              </Link>
            </Button>
            <Button asChild variant="outline" className="bg-black/10 border-black/20 text-black h-20 flex-col">
              <Link to="/admin/inquiries">
                <MessageSquare className="h-6 w-6 mb-2" />
                Reply to Inquiries
              </Link>
            </Button>
            <Button asChild variant="outline" className="bg-black/10 border-black/20 text-black h-20 flex-col">
              <Link to="/admin/analytics">
                <TrendingUp className="h-6 w-6 mb-2" />
                View Analytics
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;