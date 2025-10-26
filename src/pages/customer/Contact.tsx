import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message Sent Successfully!",
      description: "We'll get back to you within 24 hours.",
    });

    setFormData({ name: "", email: "", message: "" });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Contact Cakify
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions about our cakes or need a custom order? We'd love to hear from you!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Send us a Message
                </CardTitle>
                <CardDescription>
                  Fill out the form below and we'll respond within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Your Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter your full name"
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
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Your Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Tell us about your cake needs, special requirements, or any questions you have..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    variant="cake" 
                    size="lg" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">How far in advance should I order?</h4>
                  <p className="text-muted-foreground text-sm">
                    We recommend ordering at least 2-3 days in advance for custom cakes. For wedding cakes or large orders, please contact us 1-2 weeks ahead.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Do you offer delivery?</h4>
                  <p className="text-muted-foreground text-sm">
                    Yes! We deliver within Kadawatha and nearby areas. Delivery fees vary based on distance and cake size. Free delivery for orders over LKR 15,000.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Can you accommodate dietary restrictions?</h4>
                  <p className="text-muted-foreground text-sm">
                    Absolutely! We offer egg-free, dairy-free, and sugar-free options. We can also accommodate gluten-free requirements. Please mention any dietary needs when ordering.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">What's your cancellation policy?</h4>
                  <p className="text-muted-foreground text-sm">
                    Orders can be cancelled up to 48 hours before the delivery date for a full refund. Custom orders require 72 hours notice.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information & Business Hours */}
          <div className="space-y-6">
            {/* Contact Details */}
            <Card>
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Phone className="h-4 w-4 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">+94 71 234 5678</p>
                    <p className="text-sm text-muted-foreground">Call for orders & inquiries</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Phone className="h-4 w-4 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">+94 11 234 5678</p>
                    <p className="text-sm text-muted-foreground">WhatsApp preferred</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Mail className="h-4 w-4 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">cakify.sl@gmail.com</p>
                    <p className="text-sm text-muted-foreground">Email us anytime</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <MapPin className="h-4 w-4 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Kadawatha, Sri Lanka</p>
                    <p className="text-sm text-muted-foreground">Home-based cake service</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monday - Saturday</span>
                  <span className="font-medium">8:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sunday</span>
                  <span className="font-medium">9:00 AM - 6:00 PM</span>
                </div>
                
                <div className="bg-accent/20 p-3 rounded-lg mt-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> Available for custom orders and consultations. Please call or WhatsApp for urgent orders.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Emergency Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Need a cake urgently? We understand that special occasions sometimes come up unexpectedly.
                </p>
                <Button variant="brown" size="sm" className="w-full">
                  Call +94 71 234 5678
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Additional fees may apply for rush orders
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;