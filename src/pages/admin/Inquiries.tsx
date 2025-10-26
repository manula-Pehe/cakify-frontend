import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { inquiryService } from "@/services/inquiryService";
import { InquiryResponse, InquiryStatus } from "@/types/inquiry";
import { MessageSquare, Reply, Trash2, CheckCircle, Mail, Calendar, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminInquiries = () => {
  const { toast } = useToast();
  const [inquiryList, setInquiryList] = useState<InquiryResponse[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryResponse | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status color mapping for backend status values
  const statusColors: Record<InquiryStatus, string> = {
    [InquiryStatus.NEW]: "bg-blue-100 text-blue-800",
    [InquiryStatus.RESOLVED]: "bg-green-100 text-green-800",
    [InquiryStatus.REOPENED]: "bg-yellow-100 text-yellow-800",
  };

  // Fetch inquiries from backend
  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await inquiryService.getAllInquiries();
      setInquiryList(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch inquiries";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInquiries = statusFilter === "all" 
    ? inquiryList 
    : inquiryList.filter(inquiry => inquiry.status === statusFilter);

  const handleReply = (inquiry: InquiryResponse) => {
    setSelectedInquiry(inquiry);
    setReplyText("");
    setIsReplyDialogOpen(true);
  };

  const sendReply = async () => {
    if (!replyText.trim()) {
      toast({
        title: "Empty Reply",
        description: "Please enter a reply message.",
        variant: "destructive",
      });
      return;
    }

    if (selectedInquiry) {
      try {
        // Send reply to the inquiry
        await inquiryService.replyToInquiry(selectedInquiry.id, replyText);
        
        // Refresh the inquiry list
        await fetchInquiries();
        
        toast({
          title: "Reply Sent",
          description: "Your reply has been sent to the customer.",
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to send reply";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }

    setIsReplyDialogOpen(false);
    setSelectedInquiry(null);
    setReplyText("");
  };

  const markAsResolved = async (inquiryId: number) => {
    try {
      await inquiryService.resolveInquiry(inquiryId);
      
      // Refresh the inquiry list
      await fetchInquiries();
      
      toast({
        title: "Inquiry Resolved",
        description: "Inquiry has been marked as resolved.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update status";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const deleteInquiry = async (inquiryId: number) => {
    if (window.confirm("Are you sure you want to delete this inquiry?")) {
      try {
        await inquiryService.deleteInquiry(inquiryId);
        
        // Refresh the inquiry list
        await fetchInquiries();
        
        toast({
          title: "Inquiry Deleted",
          description: "The inquiry has been deleted.",
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete inquiry";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-700">Loading inquiries...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Inquiries</h3>
          <p className="text-gray-700 mb-4">{error}</p>
          <Button onClick={fetchInquiries}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Inquiries</h1>
          <p className="text-gray-700">Manage customer questions and support requests</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-white border-gray-300">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Inquiries</SelectItem>
            <SelectItem value={InquiryStatus.PENDING}>Pending</SelectItem>
            <SelectItem value={InquiryStatus.IN_PROGRESS}>In Progress</SelectItem>
            <SelectItem value={InquiryStatus.RESOLVED}>Resolved</SelectItem>
            <SelectItem value={InquiryStatus.CLOSED}>Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {inquiryList.filter(i => i.status === InquiryStatus.PENDING).length}
                </p>
                <p className="text-gray-700 text-sm">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500/20 p-2 rounded-lg">
                <Reply className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {inquiryList.filter(i => i.status === InquiryStatus.IN_PROGRESS).length}
                </p>
                <p className="text-gray-700 text-sm">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {inquiryList.filter(i => i.status === InquiryStatus.RESOLVED).length}
                </p>
                <p className="text-gray-700 text-sm">Resolved</p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {inquiryList.filter(i => i.status === InquiryStatus.CLOSED).length}
                </p>
                <p className="text-gray-700 text-sm">Closed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inquiries List */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Inquiries ({filteredInquiries.length})
          </CardTitle>
          <CardDescription className="text-gray-700">
            Customer messages and support requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredInquiries.length > 0 ? (
            <div className="space-y-4">
              {filteredInquiries.map((inquiry) => (
                <div key={inquiry.id} className="p-6 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{inquiry.customerName}</h3>
                        <div className="flex items-center gap-4 mt-1 flex-wrap">
                          <div className="flex items-center gap-1 text-gray-700 text-sm">
                            <Mail className="h-4 w-4" />
                            {inquiry.email}
                          </div>
                          {inquiry.phone && (
                            <div className="text-gray-700 text-sm">
                              📞 {inquiry.phone}
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-gray-700 text-sm">
                            <Calendar className="h-4 w-4" />
                            {formatDate(inquiry.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge className={`status-badge ${statusColors[inquiry.status]}`}>
                      {inquiry.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  {inquiry.subject && (
                    <div className="mb-2">
                      <h4 className="font-semibold text-gray-900 text-sm">Subject:</h4>
                      <p className="text-gray-800">{inquiry.subject}</p>
                    </div>
                  )}

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">Message:</h4>
                    <p className="text-gray-800 leading-relaxed">{inquiry.message}</p>
                  </div>

                  {inquiry.adminNotes && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">Admin Notes:</h4>
                      <p className="text-gray-700 text-sm">{inquiry.adminNotes}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {inquiry.status !== InquiryStatus.RESOLVED && inquiry.status !== InquiryStatus.CLOSED && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReply(inquiry)}
                      >
                        <Reply className="h-4 w-4 mr-2" />
                        {inquiry.adminNotes ? 'Update Notes' : 'Add Notes'}
                      </Button>
                    )}
                    
                    {inquiry.status !== InquiryStatus.RESOLVED && inquiry.status !== InquiryStatus.CLOSED && (
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
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {statusFilter === "all" ? "No inquiries yet" : `No ${statusFilter} inquiries`}
              </h3>
              <p className="text-gray-700">
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
            <DialogTitle>Add Admin Notes</DialogTitle>
            <DialogDescription>
              Adding notes for: <strong>{selectedInquiry?.customerName}</strong> ({selectedInquiry?.email})
            </DialogDescription>
          </DialogHeader>
          
          {selectedInquiry && (
            <div className="space-y-4">
              {selectedInquiry.subject && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-1">Subject:</h4>
                  <p className="text-sm text-muted-foreground">{selectedInquiry.subject}</p>
                </div>
              )}
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Customer Message:</h4>
                <p className="text-sm text-muted-foreground">{selectedInquiry.message}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Notes:</label>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Add internal notes about this inquiry..."
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  These notes are for internal use and will mark the inquiry as "In Progress"
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={sendReply}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInquiries;
