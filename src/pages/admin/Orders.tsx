import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Order, OrdersResponse, orderService } from "@/services/orderService";
import { ShoppingBag, Search, Filter, Phone, Mail, MapPin, Calendar, Clock, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminOrders = () => {
  const { toast } = useToast();
  
  // State management - API driven
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  // Status colors mapping - matches backend OrderStatus enum
  const statusColors: Record<Order['status'], string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800", 
    IN_PROGRESS: "bg-purple-100 text-purple-800",
    READY: "bg-green-100 text-green-800",
    DELIVERED: "bg-gray-100 text-gray-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  const statusOptions: Order['status'][] = ["PENDING", "CONFIRMED", "IN_PROGRESS", "READY", "DELIVERED", "CANCELLED"];

  // Fetch orders from API
  const fetchOrders = async (page: number = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      const response: OrdersResponse = await orderService.getAll(page, 20, 'orderDate,desc');
      
      setOrderList(response.content);
      setFilteredOrders(response.content);
      setCurrentPage(response.number);
      setTotalPages(response.totalPages);
      setTotalOrders(response.totalElements);
      
      console.log('✅ Orders fetched successfully:', response.content.length, 'orders');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(errorMessage);
      console.error('❌ Error fetching orders:', err);
      
      toast({
        title: "Error",
        description: "Failed to load orders. Please check your backend connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load orders on component mount
  useEffect(() => {
    fetchOrders(0);
  }, []);

  // Filter orders locally after fetching
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

    // Search filter
    if (term.trim()) {
      const searchTerm = term.toLowerCase();
      filtered = filtered.filter(order => 
        order.customerName?.toLowerCase().includes(searchTerm) ||
        order.customerEmail?.toLowerCase().includes(searchTerm) ||
        order.customerPhone?.toLowerCase().includes(searchTerm) ||
        order.id?.toString().includes(searchTerm) ||
        order.orderItems?.some(item => 
          item.productName?.toLowerCase().includes(searchTerm)
        )
      );
    }

    // Status filter
    if (status !== "all") {
      filtered = filtered.filter(order => order.status === status);
    }

    setFilteredOrders(filtered);
  };

  // Update order status using API
  const updateOrderStatus = async (orderId: number, newStatus: Order['status']) => {
    try {
      console.log(`🔄 Updating order ${orderId} status to ${newStatus}`);
      
      // Optimistic update
      const updatedOrders = orderList.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrderList(updatedOrders);
      
      // Make API call - backend expects PUT /orders/{id}/status with { "status": "NEW_STATUS" }
      await orderService.updateStatus(orderId, newStatus);
      
      console.log('✅ Order status updated successfully');
      
      toast({
        title: "Order Updated",
        description: `Order #${orderId} status changed to ${newStatus.replace('_', ' ')}.`,
      });
      
      // Refresh data to ensure consistency
      await fetchOrders(currentPage);
      
    } catch (err) {
      console.error('❌ Error updating order status:', err);
      
      // Revert optimistic update on error
      await fetchOrders(currentPage);
      
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
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

  const handleRefresh = () => {
    fetchOrders(currentPage);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchOrders(newPage);
    }
  };

  // Loading state
  if (loading && orderList.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading orders from backend...</p>
          <p className="text-xs text-gray-500 mt-2">Connecting to http://localhost:9090/api/orders/paginated</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && orderList.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <h3 className="text-xl font-semibold mb-2">Error Loading Orders</h3>
          <p className="text-sm mb-4">{error}</p>
          <p className="text-xs text-gray-600 mb-4">
            Make sure your backend is running:<br />
            <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:9090</code>
          </p>
        </div>
        <Button onClick={() => fetchOrders(0)} variant="outline">
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
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className="text-sm text-gray-600 mt-2">
            Total Orders: {totalOrders.toLocaleString()}
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
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="READY">Ready</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
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
              Orders ({filteredOrders.length} of {totalOrders})
            </CardTitle>
            <div className="text-gray-700 text-sm">
              Total Revenue: LKR {orderList.reduce((sum, order) => sum + (order.totalAmount || 0), 0).toLocaleString()}
            </div>
          </div>
          <CardDescription className="text-gray-600">
            Real-time data from your Spring Boot backend
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrders.length > 0 ? (
            <>
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all">
                    <div className="grid lg:grid-cols-12 gap-4 items-start">
                      {/* Order Info */}
                      <div className="lg:col-span-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {order.customerName || 'Unknown Customer'}
                            </h3>
                            <p className="text-sm text-gray-600">Order #{order.id}</p>
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
                              <p>{formatDate(order.deliveryDate)}</p>
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
                            onValueChange={(value) => order.id && updateOrderStatus(order.id, value as Order['status'])}
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
                            <Button 
                              size="sm"
                              className="flex-1 bg-white text-secondary hover:bg-white/90"
                              onClick={() => setSelectedOrder(order)}
                            >
                              Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                  <div className="text-sm text-gray-600">
                    Page {currentPage + 1} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0 || loading}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1 || loading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
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
                <Button onClick={handleRefresh} variant="outline">
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