import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { orders, Order } from "@/data/mockData";
import { ShoppingBag, Search, Filter, Phone, Mail, MapPin, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminOrders = () => {
  const { toast } = useToast();
  const [orderList, setOrderList] = useState<Order[]>(orders);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(orders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800", 
    preparing: "bg-purple-100 text-purple-800",
    ready: "bg-green-100 text-green-800",
    delivered: "bg-gray-100 text-gray-800",
  };

  const statusOptions: Order['status'][] = ["pending", "confirmed", "preparing", "ready", "delivered"];

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterOrders(term, statusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    filterOrders(searchTerm, status);
  };

  const filterOrders = (term: string, status: string) => {
    let filtered = orderList;

    if (term) {
      filtered = filtered.filter(order => 
        order.customerName.toLowerCase().includes(term.toLowerCase()) ||
        order.email.toLowerCase().includes(term.toLowerCase()) ||
        order.cakeName.toLowerCase().includes(term.toLowerCase()) ||
        order.id.toLowerCase().includes(term.toLowerCase())
      );
    }

    if (status !== "all") {
      filtered = filtered.filter(order => order.status === status);
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    const updatedOrders = orderList.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrderList(updatedOrders);
    filterOrders(searchTerm, statusFilter);
    
    toast({
      title: "Order Updated",
      description: `Order ${orderId} status changed to ${newStatus}.`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black mb-2">Order Management</h1>
        <p className="text-black/80">Track and manage customer orders</p>
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
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
              Orders ({filteredOrders.length})
            </CardTitle>
            <div className="text-black/70 text-sm">
              Total Revenue: ${orderList.reduce((sum, order) => sum + order.total, 0)}
            </div>
          </div>
          <CardDescription className="text-black/70">
            Manage order statuses and customer information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="p-6 bg-black/5 rounded-xl border border-black/10">
                  <div className="grid lg:grid-cols-12 gap-4 items-start">
                    {/* Order Info */}
                    <div className="lg:col-span-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div>
                          <h3 className="font-semibold text-black text-lg">{order.customerName}</h3>
                          <p className="text-sm text-black/60">Order #{order.id}</p>
                        </div>
                        <Badge className={`status-badge ${statusColors[order.status]}`}>
                          {order.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-black/70">
                          <Mail className="h-4 w-4" />
                          {order.email}
                        </div>
                        {order.phone && (
                          <div className="flex items-center gap-2 text-black/70">
                            <Phone className="h-4 w-4" />
                            {order.phone}
                          </div>
                        )}
                        {order.address && (
                          <div className="flex items-start gap-2 text-black/70">
                            <MapPin className="h-4 w-4 mt-0.5" />
                            <span className="text-xs">{order.address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cake Details */}
                    <div className="lg:col-span-3">
                      <h4 className="font-medium text-black mb-2">Cake Details</h4>
                      <div className="space-y-1 text-sm">
                        <p className="text-black/90">{order.cakeName}</p>
                        <p className="text-black/70">Size: {order.size}</p>
                        <p className="text-black/70 font-semibold">${order.total}</p>
                      </div>
                      {order.notes && (
                        <div className="mt-3 p-2 bg-black/5 rounded text-xs text-black/70">
                          <strong>Notes:</strong> {order.notes}
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
                        <Select 
                          value={order.status} 
                          onValueChange={(value) => updateOrderStatus(order.id, value as Order['status'])}
                        >
                          <SelectTrigger className="bg-black/10 border-black/20 text-black">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1 bg-black/10 border-black/20 text-black hover:bg-black/20"
                          >
                            Contact
                          </Button>
                          <Button 
                            size="sm"
                            className="flex-1 bg-black text-secondary hover:bg-black/90"
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
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrders;