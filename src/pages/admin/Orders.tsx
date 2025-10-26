import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { orderService, Order } from "@/services/orderService";
import { ShoppingBag, Search, Filter, Phone, Mail, MapPin, Calendar, Clock, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminOrders = () => {
  const { toast } = useToast();
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const statusColors: Record<Order['status'], string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-purple-100 text-purple-800",
    READY: "bg-green-100 text-green-800",
    DELIVERED: "bg-gray-100 text-gray-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  const statusOptions: Order['status'][] = [
    "PENDING", "CONFIRMED", "IN_PROGRESS", "READY", "DELIVERED", "CANCELLED"
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getAll(0, 20, "orderDate,desc");
      setOrderList(response.content || []);
      setFilteredOrders(response.content || []);
    } catch (err) {
      setError("Failed to load orders");
      toast({
        title: "Error",
        description: "Failed to load orders from backend.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterOrders(searchTerm, statusFilter);
  }, [orderList, searchTerm, statusFilter]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  const filterOrders = (term: string, status: string) => {
    let filtered = orderList;
    if (term.trim()) {
      const searchTerm = term.toLowerCase();
      filtered = filtered.filter(order =>
        order.customerName?.toLowerCase().includes(searchTerm) ||
        order.customerEmail?.toLowerCase().includes(searchTerm) ||
        order.customerPhone?.toLowerCase().includes(searchTerm) ||
        order.orderId?.toString().includes(searchTerm) ||
        order.orderItems?.some(item =>
          item.productName?.toLowerCase().includes(searchTerm)
        )
      );
    }
    if (status !== "all") {
      filtered = filtered.filter(order => order.status === status);
    }
    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId: number, newStatus: Order['status']) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      toast({
        title: "Order Updated",
        description: `Order #${orderId} status changed to ${newStatus.replace('_', ' ')}.`,
      });
      fetchOrders();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-gray-600">Loading orders from backend...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <h3 className="text-xl font-semibold mb-2">Error Loading Orders</h3>
          <p className="text-sm mb-4">{error}</p>
        </div>
        <Button onClick={fetchOrders} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
          <p className="text-gray-700">Track and manage customer orders from your database</p>
        </div>
        <div className="text-right">
          <Button onClick={fetchOrders} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2${loading ? ' animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className="text-sm text-gray-600 mt-2">
            Total Orders: {orderList.length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Search Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer name, email, phone, product, or order ID..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-gray-900 placeholder-gray-600"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-white/10 border-white/20 text-gray-900">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Orders ({filteredOrders.length} of {orderList.length})
            </CardTitle>
          </div>
          <CardDescription className="text-gray-600">
            Real-time data from your Spring Boot backend
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.orderId} className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all">
                  <div className="grid lg:grid-cols-12 gap-4 items-start">
                    {/* Order Info */}
                    <div className="lg:col-span-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {order.customerName || 'Unknown Customer'}
                          </h3>
                          <p className="text-sm text-gray-600">Order #{order.orderId}</p>
                        </div>
                        <Badge className={`status-badge ${statusColors[order.status]}`}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail className="h-4 w-4" />
                          {order.customerEmail || 'No email'}
                        </div>
                        {order.customerPhone && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Phone className="h-4 w-4" />
                            {order.customerPhone}
                          </div>
                        )}
                        {order.deliveryAddress && (
                          <div className="flex items-start gap-2 text-gray-700">
                            <MapPin className="h-4 w-4 mt-0.5" />
                            <span className="text-xs">{order.deliveryAddress}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Product Details */}
                    <div className="lg:col-span-3">
                      <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
                      <div className="space-y-1 text-sm">
                        {order.orderItems && order.orderItems.length > 0 ? (
                          order.orderItems.map((item, index) => (
                            <div key={index} className="mb-2">
                              <p className="text-gray-900 font-medium">{item.productName}</p>
                              <p className="text-gray-700">
                                Qty: {item.quantity} × LKR {item.unitPrice?.toLocaleString()}
                              </p>
                              {item.specialRequirements && (
                                <p className="text-xs text-gray-600 italic">{item.specialRequirements}</p>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-700">No items</p>
                        )}
                        <p className="text-orange-600 font-semibold border-t pt-2 mt-2">
                          Total: LKR {(order.totalAmount || 0).toLocaleString()}
                        </p>
                      </div>
                      {order.specialNotes && (
                        <div className="mt-3 p-2 bg-white/5 rounded text-xs text-gray-700">
                          <strong>Notes:</strong> {order.specialNotes}
                        </div>
                      )}
                    </div>
                    {/* Dates */}
                    <div className="lg:col-span-2">
                      <h4 className="font-medium text-gray-900 mb-2">Timeline</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="h-4 w-4" />
                          <div>
                            <p className="text-xs text-gray-600">Ordered</p>
                            <p>{formatDate(order.orderDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="h-4 w-4" />
                          <div>
                            <p className="text-xs text-gray-600">Delivery</p>
                            <p>{formatDate(order.deliveryDate || "")}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="lg:col-span-3">
                      <h4 className="font-medium text-gray-900 mb-3">Update Status</h4>
                      <div className="space-y-2">
                        <Select
                          value={order.status}
                          onValueChange={(value) => order.orderId && updateOrderStatus(order.orderId, value as Order['status'])}
                        >
                          <SelectTrigger className="bg-white/10 border-white/20 text-gray-900">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.replace('_', ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 bg-white/10 border-white/20 text-gray-900 hover:bg-white/20"
                            onClick={() => window.open(`mailto:${order.customerEmail}`)}
                          >
                            Contact
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Orders will appear here when customers place them."}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button onClick={fetchOrders} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrders;