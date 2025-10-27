import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Search, Filter, Phone, Mail, MapPin, Calendar, Clock, ChevronLeft, ChevronRight, Eye, Loader2, RefreshCw, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { orderService } from "@/services/orderService";
import { Order, OrderStatus, PageResponse } from "@/types/order";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

const AdminOrders = () => {
  const { toast } = useToast();
  
  // State management
  const [orders, setOrders] = useState<Order[]>([]);
  const [pageData, setPageData] = useState<PageResponse<Order> | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("orderDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  
  // Ref for polling interval
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const statusColors: Record<OrderStatus, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800", 
    PREPARING: "bg-purple-100 text-purple-800",
    READY: "bg-green-100 text-green-800",
    DELIVERED: "bg-emerald-100 text-emerald-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  const statusOptions = Object.values(OrderStatus);

  // Fetch orders from backend
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderService.getAllOrders({
        page: currentPage,
        size: pageSize,
        sortBy,
        sortDir,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchTerm || undefined,
      });

      if (response.success && response.data) {
        setOrders(response.data.content);
        setPageData(response.data);
        setLastUpdated(new Date());
        console.log('Fetched orders:', response.data.content.map(o => ({ id: o.id, name: o.customerName })));
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to fetch orders",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch orders",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load orders on mount and when filters change
  useEffect(() => {
    fetchOrders();
  }, [currentPage, pageSize, sortBy, sortDir, statusFilter]);

  // Real-time auto-refresh polling
  useEffect(() => {
    if (autoRefresh) {
      // Poll every 5 seconds for real-time updates
      pollingIntervalRef.current = setInterval(() => {
        fetchOrders();
      }, 5000);
    }

    // Cleanup interval on unmount or when autoRefresh changes
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [autoRefresh, currentPage, pageSize, sortBy, sortDir, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 0) {
        fetchOrders();
      } else {
        setCurrentPage(0); // Reset to first page on search
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status as OrderStatus | "all");
    setCurrentPage(0); // Reset to first page
  };

  const updateOrderStatus = async (orderId: number | undefined, newStatus: OrderStatus) => {
    console.log('updateOrderStatus called with:', { orderId, newStatus, type: typeof orderId });
    
    // Validate orderId exists
    if (!orderId) {
      console.error('Order ID is invalid:', orderId);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid order ID. Please refresh the page.",
      });
      return;
    }
    
    // Set updating state
    setUpdatingOrderId(orderId);
    
    // Optimistic update - update UI immediately
    const previousOrders = [...orders];
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, orderStatus: newStatus }
        : order
    ));
    
    try {
      const response = await orderService.updateOrderStatus(orderId, newStatus);
      
      if (response.success) {
        toast({
          title: "Order Updated",
          description: `Order #${orderId} status changed to ${newStatus}.`,
        });
        
        // Fetch fresh data from server to ensure consistency
        await fetchOrders();
      } else {
        // Revert on failure
        setOrders(previousOrders);
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to update order",
        });
      }
    } catch (error) {
      // Revert on error
      setOrders(previousOrders);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update order",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const viewOrderDetails = async (orderId: number | undefined) => {
    // Validate orderId exists
    if (!orderId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid order ID",
      });
      return;
    }
    
    try {
      const response = await orderService.getOrderById(orderId);
      if (response.success && response.data) {
        setSelectedOrder(response.data);
        setDetailsOpen(true);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load order details",
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Order Management</h1>
          <p className="text-black/80">
            Track and manage customer orders
            {lastUpdated && autoRefresh && (
              <span className="text-xs ml-2 text-black/60">
                • Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Auto-refresh toggle */}
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            className="gap-2"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh && !loading ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
          </Button>
          
          {/* Manual refresh */}
          <Button 
            onClick={fetchOrders} 
            disabled={loading}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-black flex items-center gap-2">
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
                  placeholder="Search by customer name, email, cake, or order ID..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-black/10 border-black/20 text-black placeholder-black/60"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-black/10 border-black/20 text-black">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0) + status.slice(1).toLowerCase()}
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
            <CardTitle className="text-black flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Orders {pageData && `(${pageData.totalElements})`}
            </CardTitle>
            <div className="flex items-center gap-4">
              <Select value={pageSize.toString()} onValueChange={(v) => {
                setPageSize(Number(v));
                setCurrentPage(0);
              }}>
                <SelectTrigger className="w-32 bg-black/10 border-black/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <CardDescription className="text-black/70">
            Manage order statuses and customer information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-6 bg-black/5 rounded-xl border border-black/10">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => {
                // Handle both 'items' and 'orderItems' field names from backend
                const orderItems = order.items || order.orderItems || [];
                
                // Debug: Check if order has an ID
                if (!order.id) {
                  console.warn('Order without ID detected:', order);
                }
                
                return (
                  <div key={order.id || `order-${order.customerName}-${order.orderDate}`} className="p-6 bg-black/5 rounded-xl border border-black/10">
                  <div className="grid lg:grid-cols-12 gap-4 items-start">
                    {/* Order Info */}
                    <div className="lg:col-span-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div>
                          <h3 className="font-semibold text-black text-lg">{order.customerName}</h3>
                          <p className="text-sm text-black/60">Order #{order.id}</p>
                        </div>
                        <Badge className={`status-badge ${statusColors[order.orderStatus]}`}>
                          {order.orderStatus}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-black/70">
                          <Mail className="h-4 w-4" />
                          {order.customerEmail}
                        </div>
                        <div className="flex items-center gap-2 text-black/70">
                          <Phone className="h-4 w-4" />
                          {order.customerPhone}
                        </div>
                        <div className="flex items-start gap-2 text-black/70">
                          <MapPin className="h-4 w-4 mt-0.5" />
                          <span className="text-xs">{order.deliveryAddress}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="lg:col-span-3">
                      <h4 className="font-medium text-black mb-2 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Items ({orderItems.length})
                      </h4>
                      <div className="space-y-1 text-sm">
                        {orderItems.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="text-black/90">
                            <div>{item.productName} × {item.quantity}</div>
                            {item.specialInstructions && (
                              <div className="text-xs text-black/60">{item.specialInstructions}</div>
                            )}
                            <div className="text-xs text-black/70">LKR {item.totalPrice?.toLocaleString() || 'N/A'}</div>
                          </div>
                        ))}
                        {orderItems.length > 2 && (
                          <div className="text-black/60 text-xs">
                            +{orderItems.length - 2} more items
                          </div>
                        )}
                        <p className="text-black/70 font-semibold pt-2 border-t border-black/10 mt-2">
                          Total: LKR {order.totalAmount?.toLocaleString() || '0'}
                        </p>
                      </div>
                      {order.specialNotes && (
                        <div className="mt-3 p-2 bg-black/5 rounded text-xs text-black/70">
                          <strong>Notes:</strong> {order.specialNotes}
                        </div>
                      )}
                    </div>

                    {/* Dates */}
                    <div className="lg:col-span-2">
                      <h4 className="font-medium text-black mb-2">Timeline</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-black/70">
                          <Clock className="h-4 w-4" />
                          <div>
                            <p className="text-xs text-black/60">Ordered</p>
                            <p>{formatDate(order.orderDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-black/70">
                          <Calendar className="h-4 w-4" />
                          <div>
                            <p className="text-xs text-black/60">Delivery</p>
                            <p>{formatDate(order.deliveryDate)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="lg:col-span-3">
                      <h4 className="font-medium text-black mb-3">Update Status</h4>
                      <div className="space-y-2">
                        <div className="relative">
                          <Select 
                            key={`order-status-${order.id}-${order.orderStatus}`}
                            value={order.orderStatus} 
                            onValueChange={(value) => {
                              if (value === order.orderStatus) return; // Prevent no-op changes
                              console.log('Select onValueChange triggered:', { orderId: order.id, newStatus: value });
                              updateOrderStatus(order.id, value as OrderStatus);
                            }}
                            disabled={updatingOrderId === order.id || !order.id}
                          >
                            <SelectTrigger className="bg-black/10 border-black/20 text-black">
                              {updatingOrderId === order.id ? (
                                <div className="flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span>Updating...</span>
                                </div>
                              ) : (
                                <SelectValue />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status.charAt(0) + status.slice(1).toLowerCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          size="sm"
                          className="w-full bg-black text-secondary hover:bg-black/90 gap-2"
                          onClick={() => viewOrderDetails(order.id)}
                          disabled={!order.id}
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-black/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">No orders found</h3>
              <p className="text-black/70">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria." 
                  : "Orders will appear here when customers place them."
                }
              </p>
            </div>
          )}

          {/* Pagination */}
          {pageData && pageData.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-black/10">
              <div className="text-sm text-black/70">
                Showing {pageData.currentPage * pageData.pageSize + 1} to{" "}
                {Math.min((pageData.currentPage + 1) * pageData.pageSize, pageData.totalElements)} of{" "}
                {pageData.totalElements} orders
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={!pageData.hasPrevious || loading}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {[...Array(pageData.totalPages)].map((_, idx) => (
                    <Button
                      key={idx}
                      variant={idx === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(idx)}
                      disabled={loading}
                      className={idx === currentPage ? "bg-black text-white" : ""}
                    >
                      {idx + 1}
                    </Button>
                  )).slice(
                    Math.max(0, currentPage - 2),
                    Math.min(pageData.totalPages, currentPage + 3)
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(pageData.totalPages - 1, currentPage + 1))}
                  disabled={!pageData.hasNext || loading}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Complete information about this order
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedOrder.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedOrder.customerPhone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge className={statusColors[selectedOrder.orderStatus]}>
                      {selectedOrder.orderStatus}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Delivery Address</p>
                    <p className="font-medium">{selectedOrder.deliveryAddress}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Order Items</h3>
                <div className="space-y-3">
                  {(selectedOrder.items || selectedOrder.orderItems || []).map((item, idx) => (
                    <div key={idx} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {item.productImage && (
                            <img 
                              src={item.productImage} 
                              alt={item.productName}
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            {item.productDescription && (
                              <p className="text-xs text-muted-foreground">{item.productDescription}</p>
                            )}
                            <p className="text-sm text-muted-foreground">
                              ${item.unitPrice.toFixed(2)} × {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold">${item.totalPrice.toFixed(2)}</p>
                      </div>
                      {item.specialInstructions && (
                        <div className="mt-2 p-2 bg-background rounded text-xs">
                          <strong className="text-muted-foreground">Item Notes:</strong> {item.specialInstructions}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <span className="font-semibold text-lg">Total Amount</span>
                  <span className="font-bold text-xl">${selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Special Notes */}
              {selectedOrder.specialNotes && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Special Notes</h3>
                  <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                    {selectedOrder.specialNotes}
                  </p>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Timeline</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Order Date</p>
                    <p className="font-medium">{formatDateTime(selectedOrder.orderDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Delivery Date</p>
                    <p className="font-medium">{formatDate(selectedOrder.deliveryDate)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;