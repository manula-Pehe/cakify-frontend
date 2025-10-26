import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { InquiryResponse, InquiryStatus } from '@/types/inquiry';
import { formatDate } from '@/lib/formatters';
import { inquiryService } from '@/services/inquiryService';
import { useToast } from '@/hooks/use-toast';
import { Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  inquiry: InquiryResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

export default function InquiryDetailModal({ inquiry, open, onOpenChange, onUpdate }: Props) {
  const { toast } = useToast();
  const [reply, setReply] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  const handleSendReply = async () => {
    if (!reply.trim()) {
      toast({
        title: "Empty Reply",
        description: "Please enter a reply message",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSending(true);
      await inquiryService.replyToInquiry(inquiry.id, reply);
      toast({
        title: "✅ Reply Sent",
        description: "Email reply has been sent to the customer successfully",
      });
      setReply('');
      onUpdate?.();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error Sending Reply",
        description: error instanceof Error ? error.message : "Failed to send reply",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleMarkResolved = async () => {
    try {
      setIsResolving(true);
      await inquiryService.resolveInquiry(inquiry.id);
      toast({
        title: "✅ Marked as Resolved",
        description: "Inquiry status updated successfully",
      });
      onUpdate?.();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error Updating Status",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setIsResolving(false);
    }
  };

  const handleReopen = async () => {
    try {
      await inquiryService.reopenInquiry(inquiry.id);
      toast({
        title: "✅ Inquiry Reopened",
        description: "Inquiry has been reopened successfully",
      });
      onUpdate?.();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error Reopening Inquiry",
        description: error instanceof Error ? error.message : "Failed to reopen inquiry",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case InquiryStatus.NEW:
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" /> New</Badge>;
      case InquiryStatus.RESOLVED:
        return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle2 className="h-3 w-3" /> Resolved</Badge>;
      case InquiryStatus.REOPENED:
        return <Badge variant="secondary" className="gap-1"><Mail className="h-3 w-3" /> Reopened</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">Inquiry #{inquiry.id}</DialogTitle>
            {getStatusBadge(inquiry.status)}
          </div>
          <DialogDescription>
            From <strong>{inquiry.name}</strong> ({inquiry.email}) • {formatDate(inquiry.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Subject */}
          {inquiry.subject && (
            <div className="glass-card p-4">
              <div className="text-sm font-semibold text-muted-foreground mb-1">Subject</div>
              <div className="font-medium text-foreground">{inquiry.subject}</div>
            </div>
          )}

          {/* Category */}
          {inquiry.categoryName && (
            <div className="glass-card p-4">
              <div className="text-sm font-semibold text-muted-foreground mb-1">Category</div>
              <Badge variant="outline">{inquiry.categoryName}</Badge>
            </div>
          )}

          {/* Message */}
          <div className="glass-card p-4">
            <div className="text-sm font-semibold text-muted-foreground mb-2">Customer Message</div>
            <div className="whitespace-pre-wrap text-foreground bg-accent/20 p-3 rounded-lg border">
              {inquiry.message}
            </div>
          </div>

          {/* Previous Reply (if exists) */}
          {inquiry.reply && (
            <div className="glass-card p-4 bg-green-50 border-green-200">
              <div className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Your Previous Reply
                {inquiry.repliedAt && (
                  <span className="text-xs font-normal text-green-600">
                    • {formatDate(inquiry.repliedAt)}
                  </span>
                )}
              </div>
              <div className="whitespace-pre-wrap text-green-900 bg-white p-3 rounded-lg border border-green-200">
                {inquiry.reply}
              </div>
            </div>
          )}

          {/* Reply Form (only show for NEW or REOPENED) */}
          {(inquiry.status === InquiryStatus.NEW || inquiry.status === InquiryStatus.REOPENED) && (
            <div className="glass-card p-4">
              <div className="text-sm font-semibold text-muted-foreground mb-2">
                Send Email Reply
              </div>
              <Textarea 
                rows={5} 
                value={reply} 
                onChange={(e) => setReply(e.target.value)} 
                placeholder="Type your reply here... This will be sent as an email to the customer."
                className="mb-3"
              />
              <Button 
                onClick={handleSendReply} 
                disabled={isSending || !reply.trim()}
                className="w-full"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending Email...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email Reply
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            
            {inquiry.status === InquiryStatus.RESOLVED && (
              <Button variant="secondary" onClick={handleReopen}>
                Reopen Inquiry
              </Button>
            )}
            
            {inquiry.status !== InquiryStatus.RESOLVED && (
              <Button 
                onClick={handleMarkResolved}
                disabled={isResolving}
                className="bg-green-600 hover:bg-green-700"
              >
                {isResolving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark as Resolved
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
