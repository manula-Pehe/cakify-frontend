import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, Upload, X, FileText, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createInquiry } from "@/services/inquiryService";
import { inquiryAttachmentService } from "@/services/inquiryAttachmentService";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file count (max 5 files)
    if (selectedFiles.length + files.length > 5) {
      toast({
        title: "Too Many Files",
        description: "You can upload a maximum of 5 files.",
        variant: "destructive",
      });
      return;
    }

    // Validate file sizes (max 10MB per file)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      toast({
        title: "File Too Large",
        description: `Maximum file size is 10MB. ${oversizedFiles[0].name} is too large.`,
        variant: "destructive",
      });
      return;
    }

    // Validate file types
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid File Type",
        description: "Only images (JPG, PNG, GIF, WEBP), PDFs, and Word documents are allowed.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
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

    try {
      // Call the real API to create inquiry
      const inquiry = await createInquiry({
        name: formData.name,
        email: formData.email,
        message: formData.message,
      });
      
      // Upload attachments if any
      if (selectedFiles.length > 0 && inquiry.id) {
        let uploadedCount = 0;
        let failedCount = 0;

        for (const file of selectedFiles) {
          try {
            await inquiryAttachmentService.uploadAttachment(inquiry.id, file);
            uploadedCount++;
          } catch (error) {
            console.error(`Failed to upload ${file.name}:`, error);
            failedCount++;
          }
        }

        if (failedCount > 0) {
          toast({
            title: "Message Sent with Partial Attachments",
            description: `Your message was sent successfully, but ${failedCount} of ${selectedFiles.length} attachments failed to upload.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Message Sent Successfully!",
            description: `We received your message with ${uploadedCount} attachment(s). We'll get back to you within 24 hours.`,
          });
        }
      } else {
        toast({
          title: "Message Sent Successfully!",
          description: "We'll get back to you within 24 hours.",
        });
      }

      setFormData({ name: "", email: "", message: "" });
      setSelectedFiles([]);
    } catch (error) {
      console.error("Failed to submit inquiry:", error);
      toast({
        title: "Failed to Send Message",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Contact Sweet Delights
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

                  {/* File Upload Section */}
                  <div>
                    <Label htmlFor="attachments">Attachments (Optional)</Label>
                    <div className="mt-2">
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="file-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Images, PDFs, or Documents (Max 10MB per file, up to 5 files)
                            </p>
                          </div>
                          <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            multiple
                            accept="image/*,.pdf,.doc,.docx"
                            onChange={handleFileSelect}
                            disabled={isSubmitting}
                          />
                        </label>
                      </div>

                      {/* Selected Files List */}
                      {selectedFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-sm font-medium text-foreground">
                            Selected Files ({selectedFiles.length}/5)
                          </p>
                          <div className="space-y-2">
                            {selectedFiles.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="flex-shrink-0 text-muted-foreground">
                                    {getFileIcon(file)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                      {file.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatFileSize(file.size)}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  disabled={isSubmitting}
                                  className="flex-shrink-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
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
                        {selectedFiles.length > 0 && ` with ${selectedFiles.length} file(s)`}
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
                    We recommend ordering at least 3 days in advance for custom cakes. For wedding cakes or large orders, please contact us 2-3 weeks ahead.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Do you offer delivery?</h4>
                  <p className="text-muted-foreground text-sm">
                    Yes! We deliver within a 15-mile radius of our bakery. Delivery fees vary based on distance and cake size.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Can you accommodate dietary restrictions?</h4>
                  <p className="text-muted-foreground text-sm">
                    Absolutely! We offer gluten-free, dairy-free, and sugar-free options. Please mention any dietary requirements when ordering.
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
                    <p className="font-medium text-foreground">(555) 123-4567</p>
                    <p className="text-sm text-muted-foreground">Call for immediate assistance</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Mail className="h-4 w-4 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">hello@sweetdelights.com</p>
                    <p className="text-sm text-muted-foreground">Email us anytime</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <MapPin className="h-4 w-4 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">123 Baker Street</p>
                    <p className="text-sm text-muted-foreground">Springfield, ST 12345</p>
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
                  <span className="text-muted-foreground">Monday - Friday</span>
                  <span className="font-medium">8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saturday</span>
                  <span className="font-medium">9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sunday</span>
                  <span className="font-medium">Closed</span>
                </div>
                
                <div className="bg-accent/20 p-3 rounded-lg mt-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> We're also available for cake pickups by appointment outside business hours.
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
                  Call (555) 123-RUSH
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