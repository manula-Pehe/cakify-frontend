import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cakes } from "@/data/mockData";
import { ArrowLeft, CheckCircle, Clock, Phone, Mail, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const OrderForm = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    address: "",
    cakeId: searchParams.get("cake") || "",
    size: searchParams.get("size") || "",
    deliveryDate: "",
    notes: "",
  });

  const selectedCake = cakes.find(c => c.id === formData.cakeId);
  const basePrice = selectedCake?.price || 0;
  const sizeMultiplier = formData.size.includes("10") ? 1.3 : formData.size.includes("12") ? 1.7 : 1;
  const totalPrice = Math.round(basePrice * sizeMultiplier);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.customerName || !formData.email || !formData.cakeId || !formData.size || !formData.deliveryDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Simulate API call
    console.log("Order submitted:", formData);
    setIsSubmitted(true);
    
    toast({
      title: "Order Submitted Successfully!",
      description: "We'll contact you within 24 hours to confirm your order.",
    });
  };

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
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Cake:</span> {selectedCake?.name}</p>
                  <p><span className="font-medium">Size:</span> {formData.size}</p>
                  <p><span className="font-medium">Delivery Date:</span> {formData.deliveryDate}</p>
                  <p><span className="font-medium">Total:</span> ${totalPrice}</p>
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
                    <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                      Cake Details
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cakeId">Select Cake *</Label>
                        <Select value={formData.cakeId} onValueChange={(value) => handleInputChange("cakeId", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a cake" />
                          </SelectTrigger>
                          <SelectContent>
                            {cakes.filter(cake => cake.availability).map((cake) => (
                              <SelectItem key={cake.id} value={cake.id}>
                                {cake.name} - ${cake.price}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="size">Cake Size *</Label>
                        <Select value={formData.size} onValueChange={(value) => handleInputChange("size", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose size" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedCake?.sizes.map((size) => (
                              <SelectItem key={size} value={size}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
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
                  </div>

                  <Button type="submit" variant="cake" size="lg" className="w-full">
                    Submit Order Request
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary & Info */}
          <div className="space-y-6">
            {/* Order Summary */}
            {selectedCake && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Cake:</span>
                      <span className="font-medium">{selectedCake.name}</span>
                    </div>
                    {formData.size && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Size:</span>
                        <span className="font-medium">{formData.size}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-3">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-secondary">${totalPrice}</span>
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