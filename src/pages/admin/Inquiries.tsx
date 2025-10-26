import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { inquiries, Inquiry } from "@/data/mockData";
import { MessageSquare, Reply, Trash2, CheckCircle, Mail, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminInquiries = () => {
  const { toast } = useToast();
  const [inquiryList, setInquiryList] = useState<Inquiry[]>(inquiries);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const statusColors = {
    new: "bg-blue-100 text-blue-800",
    replied: "bg-green-100 text-green-800",
    resolved: "bg-gray-100 text-gray-800",
  };

  const filteredInquiries = statusFilter === "all" 
    ? inquiryList 
    : inquiryList.filter(inquiry => inquiry.status === statusFilter);

  const handleReply = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setReplyText("");
    setIsReplyDialogOpen(true);
  };

  const sendReply = () => {
    if (!replyText.trim()) {
      toast({
        title: "Empty Reply",
        description: "Please enter a reply message.",
        variant: "destructive",
      });
      return;
    }

    if (selectedInquiry) {
      const updatedInquiries = inquiryList.map(inquiry =>
        inquiry.id === selectedInquiry.id
          ? { ...inquiry, status: "replied" as const }
          : inquiry
      );
      setInquiryList(updatedInquiries);
      
      toast({
        title: "Reply Sent",
        description: "Your reply has been sent to the customer.",
      });
    }

    setIsReplyDialogOpen(false);
    setSelectedInquiry(null);
    setReplyText("");
  };

  const markAsResolved = (inquiryId: string) => {
    const updatedInquiries = inquiryList.map(inquiry =>
      inquiry.id === inquiryId
        ? { ...inquiry, status: "resolved" as const }
        : inquiry
    );
    setInquiryList(updatedInquiries);
    
    toast({
      title: "Inquiry Resolved",
      description: "Inquiry has been marked as resolved.",
    });
  };

  const deleteInquiry = (inquiryId: string) => {
    if (window.confirm("Are you sure you want to delete this inquiry?")) {
      setInquiryList(inquiryList.filter(inquiry => inquiry.id !== inquiryId));
      toast({
        title: "Inquiry Deleted",
        description: "The inquiry has been deleted.",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Customer Inquiries</h1>
          <p className="text-black/80">Manage customer questions and support requests</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-black/10 border-black/20 text-black">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Inquiries</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="replied">Replied</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">
                  {inquiryList.filter(i => i.status === "new").length}
                </p>
                <p className="text-black/70 text-sm">New Inquiries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <Reply className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">
                  {inquiryList.filter(i => i.status === "replied").length}
                </p>
                <p className="text-black/70 text-sm">Replied</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-gray-500/20 p-2 rounded-lg">
                <CheckCircle className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">
                  {inquiryList.filter(i => i.status === "resolved").length}
                </p>
                <p className="text-black/70 text-sm">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inquiries List */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-black flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Inquiries ({filteredInquiries.length})
          </CardTitle>
          <CardDescription className="text-black/70">
            Customer messages and support requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredInquiries.length > 0 ? (
            <div className="space-y-4">
              {filteredInquiries.map((inquiry) => (
                <div key={inquiry.id} className="p-6 bg-black/5 rounded-xl border border-black/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-semibold text-black text-lg">{inquiry.name}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-black/70 text-sm">
                            <Mail className="h-4 w-4" />
                            {inquiry.email}
                          </div>
                          <div className="flex items-center gap-1 text-black/70 text-sm">
                            <Calendar className="h-4 w-4" />
                            {formatDate(inquiry.date)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge className={`status-badge ${statusColors[inquiry.status]}`}>
                      {inquiry.status}
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <p className="text-black/90 leading-relaxed">{inquiry.message}</p>
                  </div>

                  <div className="flex gap-2">
                    {inquiry.status !== "resolved" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-black/10 border-black/20 text-black hover:bg-black/20"
                        onClick={() => handleReply(inquiry)}
                      >
                        <Reply className="h-4 w-4 mr-2" />
                        Reply
                      </Button>
                    )}
                    
                    {inquiry.status !== "resolved" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
                        onClick={() => markAsResolved(inquiry.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Resolved
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                      onClick={() => deleteInquiry(inquiry.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-black/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">
                {statusFilter === "all" ? "No inquiries yet" : `No ${statusFilter} inquiries`}
              </h3>
              <p className="text-black/70">
                {statusFilter === "all" 
                  ? "Customer inquiries will appear here when they contact you."
                  : `There are no ${statusFilter} inquiries at the moment.`
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Reply to Customer</DialogTitle>
            <DialogDescription>
              Replying to: <strong>{selectedInquiry?.name}</strong> ({selectedInquiry?.email})
            </DialogDescription>
          </DialogHeader>
          
          {selectedInquiry && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Original Message:</h4>
                <p className="text-sm text-muted-foreground">{selectedInquiry.message}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Reply:</label>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply to the customer..."
                  rows={6}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={sendReply}>
              <Mail className="h-4 w-4 mr-2" />
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInquiries;