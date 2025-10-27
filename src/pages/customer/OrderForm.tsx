import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Clock, Phone, Mail, MapPin, Loader2, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { productService, Product } from "@/services/productService";
import { orderService } from "@/services/orderService";
import { Order, OrderStatus } from "@/types/order";
import { getImageUrl } from "@/services/api";

// Type for cart items
interface CartItem {
  id: string; // Unique ID for the cart item
  cakeId: string;
  cakeName: string;
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

const OrderForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cakes, setCakes] = useState<Product[]>([]);
  
  // Cart state for multiple items
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  // Current item being added
  const [currentItem, setCurrentItem] = useState({
    cakeId: searchParams.get("cake") || "",
    size: searchParams.get("size") || "",
    quantity: 1,
  });
  
  // Customer information
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    address: "",
    deliveryDate: "",
    notes: "",
  });

  // Load all available cakes
  useEffect(() => {
    loadCakes();
  }, []);

  const loadCakes = async () => {
    try {
      setIsLoading(true);
      const availableCakes = await productService.getAvailable();
      setCakes(availableCakes);
    } catch (error) {
      toast({
        title: "Error Loading Cakes",
        description: "Failed to load available cakes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCake = cakes.find(c => c.id === currentItem.cakeId || c.id.toString() === currentItem.cakeId);
  const basePrice = selectedCake?.price || 0;
  
  // Size-based pricing multipliers
  const getSizeMultiplier = (size: string): number => {
    const sizeInches = size.toLowerCase();
    if (sizeInches.includes("6") || sizeInches.includes("6 inch")) return 1.0;
    if (sizeInches.includes("8") || sizeInches.includes("8 inch")) return 1.2;
    if (sizeInches.includes("10") || sizeInches.includes("10 inch")) return 1.5;
    if (sizeInches.includes("12") || sizeInches.includes("12 inch")) return 2.0;
    return 1.0; // default
  };
  
  const sizeMultiplier = currentItem.size ? getSizeMultiplier(currentItem.size) : 1.0;
  const calculatedPrice = Math.round(basePrice * sizeMultiplier);
  
  // Calculate cart total
  const cartTotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  // Add item to cart
  const handleAddToCart = () => {
    if (!currentItem.cakeId || !currentItem.size || currentItem.quantity < 1) {
      toast({
        title: "Missing Information",
        description: "Please select a cake, size, and quantity.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCake) {
      toast({
        title: "Error",
        description: "Selected cake not found.",
        variant: "destructive",
      });
      return;
    }

    const itemTotalPrice = calculatedPrice * currentItem.quantity;
    
    const newCartItem: CartItem = {
      id: `${Date.now()}-${Math.random()}`, // Unique ID
      cakeId: currentItem.cakeId,
      cakeName: selectedCake.name,
      size: currentItem.size,
      quantity: currentItem.quantity,
      unitPrice: calculatedPrice,
      totalPrice: itemTotalPrice,
    };

    setCartItems(prev => [...prev, newCartItem]);
    
    // Reset current item
    setCurrentItem({
      cakeId: "",
      size: "",
      quantity: 1,
    });

    toast({
      title: "Item Added to Cart",
      description: `${selectedCake.name} (${currentItem.size}) added successfully.`,
    });
  };

  // Remove item from cart
  const handleRemoveFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    toast({
      title: "Item Removed",
      description: "Item removed from cart.",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCurrentItemChange = (field: string, value: string | number) => {
    setCurrentItem(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.customerName || !formData.email || !formData.deliveryDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required customer information fields.",
        variant: "destructive",
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add at least one item to your cart.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare order data for backend - matching OrderDTO fields exactly
      const orderData = {
        customerName: formData.customerName,
        customerEmail: formData.email,
        customerPhone: formData.phone || "",
        deliveryAddress: formData.address || "",
        deliveryDate: `${formData.deliveryDate}T10:00:00`, // Convert to LocalDateTime format
        status: "PENDING",
        totalAmount: cartTotal,
        quantity: cartItems.reduce((sum, item) => sum + item.quantity, 0), // Total quantity of all items
        specialNotes: formData.notes || "",
        orderItems: cartItems.map(item => {
          const cake = cakes.find(c => c.id === item.cakeId || c.id.toString() === item.cakeId);
          return {
            productId: parseInt(item.cakeId),
            productName: cake?.name || item.cakeName,
            productDescription: cake?.description || "",
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            totalPrice: item.totalPrice,
            specialInstructions: `Size: ${item.size}`
          };
        })
      };

      console.log("Submitting order data:", orderData);

      // Save order to database
      const response = await orderService.createOrder(orderData as any);
      
      console.log("Order response:", response);

      if (response.success) {
        setIsSubmitted(true);
        
        toast({
          title: "Order Submitted Successfully! 🎉",
          description: "We'll contact you within 24 hours to confirm your order.",
        });
      } else {
        throw new Error(response.message || "Failed to create order");
      }

    } catch (error) {
      console.error("Order submission error:", error);
      
      let errorMessage = "Failed to submit order. Please try again.";
      let errorTitle = "Order Failed";
      
      if (error instanceof Error) {
        if (error.message === "Failed to fetch") {
          errorTitle = "Connection Error";
          errorMessage = "Cannot connect to the server. Please check if the backend is running on port 9090 or check your internet connection.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="glass-card text-center p-8">
            <div className="space-y-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Order Submitted Successfully!
                </h2>
                <p className="text-muted-foreground">
                  Thank you for your order! We'll contact you within 24 hours to confirm 
                  the details and arrange payment.
                </p>
              </div>
              
              <div className="glass-card p-6 text-left space-y-3">
                <h4 className="font-semibold text-foreground">Order Summary:</h4>
                <div className="text-sm space-y-2">
                  <p><span className="font-medium">Customer:</span> {formData.customerName}</p>
                  <p><span className="font-medium">Email:</span> {formData.email}</p>
                  <p><span className="font-medium">Delivery Date:</span> {formData.deliveryDate}</p>
                  
                  <div className="pt-2 border-t border-border">
                    <p className="font-medium mb-2">Items:</p>
                    {cartItems.map((item, index) => (
                      <div key={index} className="pl-4 py-1 text-muted-foreground">
                        • {item.cakeName} ({item.size}) × {item.quantity} - LKR {item.totalPrice.toLocaleString()}
                      </div>
                    ))}
                  </div>
                  
                  <p className="pt-2 border-t border-border font-semibold text-base">
                    <span className="font-medium">Total:</span> LKR {cartTotal.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/">
                  <Button variant="cake">Continue Shopping</Button>
                </Link>
                <Link to="/cakes">
                  <Button variant="outline">Browse More Cakes</Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link to="/cakes">
            <Button variant="ghost" className="pl-0">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cakes
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Order Your Cake</CardTitle>
                <CardDescription>
                  Please fill in your details and we'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Customer Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                      Customer Information
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="customerName">Full Name *</Label>
                        <Input
                          id="customerName"
                          value={formData.customerName}
                          onChange={(e) => handleInputChange("customerName", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="deliveryDate">Delivery Date *</Label>
                        <Input
                          id="deliveryDate"
                          type="date"
                          value={formData.deliveryDate}
                          onChange={(e) => handleInputChange("deliveryDate", e.target.value)}
                          required
                          min={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Delivery Address</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Enter your full delivery address"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Cake Selection */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b pb-2 flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Add Items to Cart
                    </h3>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="cakeId">Select Cake *</Label>
                        <Select value={currentItem.cakeId} onValueChange={(value) => handleCurrentItemChange("cakeId", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a cake" />
                          </SelectTrigger>
                          <SelectContent>
                            {cakes.filter(cake => cake.availability).map((cake) => (
                              <SelectItem key={cake.id} value={cake.id.toString()}>
                                {cake.name} - Base: LKR {Number(cake.price).toLocaleString()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedCake && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Base price (6 inch): LKR {basePrice.toLocaleString()}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="size">Cake Size *</Label>
                        <Select value={currentItem.size} onValueChange={(value) => handleCurrentItemChange("size", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose size" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedCake?.sizes && selectedCake.sizes.length > 0 ? (
                              selectedCake.sizes.map((size) => {
                                const sizePrice = Math.round(basePrice * getSizeMultiplier(size));
                                return (
                                  <SelectItem key={size} value={size}>
                                    {size} - LKR {sizePrice.toLocaleString()}
                                  </SelectItem>
                                );
                              })
                            ) : (
                              <>
                                <SelectItem value="Small (6 inch)">
                                  Small (6 inch) - LKR {Math.round(basePrice * 1.0).toLocaleString()}
                                </SelectItem>
                                <SelectItem value="Medium (8 inch)">
                                  Medium (8 inch) - LKR {Math.round(basePrice * 1.2).toLocaleString()}
                                </SelectItem>
                                <SelectItem value="Large (10 inch)">
                                  Large (10 inch) - LKR {Math.round(basePrice * 1.5).toLocaleString()}
                                </SelectItem>
                                <SelectItem value="Extra Large (12 inch)">
                                  Extra Large (12 inch) - LKR {Math.round(basePrice * 2.0).toLocaleString()}
                                </SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                        {currentItem.size && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Price: <span className="font-semibold text-primary">LKR {calculatedPrice.toLocaleString()}</span>
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="quantity">Quantity *</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          max="50"
                          value={currentItem.quantity}
                          onChange={(e) => handleCurrentItemChange("quantity", parseInt(e.target.value) || 1)}
                        />
                        {currentItem.size && currentItem.quantity > 0 && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Subtotal: <span className="font-semibold text-primary">LKR {(calculatedPrice * currentItem.quantity).toLocaleString()}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={handleAddToCart}
                      className="w-full"
                      variant="outline"
                      disabled={!currentItem.cakeId || !currentItem.size || currentItem.quantity < 1}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </div>

                  {/* Shopping Cart */}
                  {cartItems.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground border-b pb-2 flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Your Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                      </h3>
                      
                      <div className="space-y-3">
                        {cartItems.map((item) => (
                          <Card key={item.id} className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground">{item.cakeName}</h4>
                                <div className="text-sm text-muted-foreground space-y-1 mt-1">
                                  <p>Size: {item.size}</p>
                                  <p>Quantity: {item.quantity}</p>
                                  <p>Unit Price: LKR {item.unitPrice.toLocaleString()}</p>
                                  <p className="font-semibold text-foreground">
                                    Total: LKR {item.totalPrice.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => handleRemoveFromCart(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>

                      <div className="glass-card p-4 bg-primary/5">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">Cart Total:</span>
                          <span className="text-2xl font-bold text-primary">
                            LKR {cartTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="notes">Special Instructions</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      placeholder="Any special requests, decorations, or dietary requirements..."
                      rows={4}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    variant="cake" 
                    size="lg" 
                    className="w-full"
                    disabled={isSubmitting || cartItems.length === 0}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting Order...
                      </>
                    ) : (
                      "Submit Order Request"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary & Info */}
          <div className="space-y-6">
            {/* Pricing Guide */}
            {selectedCake && (
              <Card className="bg-gradient-to-br from-secondary/10 to-primary/10 border-secondary/20">
                <CardHeader>
                  <CardTitle className="text-sm">Size & Pricing Guide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between p-2 bg-white/50 rounded">
                      <span>6 inch:</span>
                      <span className="font-semibold">LKR {Math.round(basePrice * 1.0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white/50 rounded">
                      <span>8 inch:</span>
                      <span className="font-semibold">LKR {Math.round(basePrice * 1.2).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white/50 rounded">
                      <span>10 inch:</span>
                      <span className="font-semibold">LKR {Math.round(basePrice * 1.5).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white/50 rounded">
                      <span>12 inch:</span>
                      <span className="font-semibold">LKR {Math.round(basePrice * 2.0).toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    * Prices vary based on cake size
                  </p>
                </CardContent>
              </Card>
            )}
            
            {/* Current Item Preview */}
            {selectedCake && currentItem.size && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Item</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cake Image */}
                  <div className="relative w-full h-40 rounded-lg overflow-hidden">
                    <img
                      src={getImageUrl(selectedCake.image)}
                      alt={selectedCake.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Cake:</span>
                      <span className="font-medium">{selectedCake.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Base Price:</span>
                      <span className="font-medium">LKR {basePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Size:</span>
                      <span className="font-medium">{currentItem.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Size Multiplier:</span>
                      <span className="font-medium">×{sizeMultiplier.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Quantity:</span>
                      <span className="font-medium">{currentItem.quantity}</span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="font-semibold">Item Total:</span>
                      <span className="font-bold text-secondary text-lg">LKR {(calculatedPrice * currentItem.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="bg-accent/20 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-secondary" />
                      <span className="font-medium text-sm">Preparation Time</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      2-3 business days required for custom orders
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-secondary" />
                  <span className="text-sm">(555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-secondary" />
                  <span className="text-sm">orders@sweetdelights.com</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-secondary mt-0.5" />
                  <span className="text-sm">123 Baker Street<br />Springfield, ST 12345</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;