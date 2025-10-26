import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare,
  Mail,
  Calendar,
  Paperclip,
  Upload as UploadIcon,
} from "lucide-react";
import InquiryAttachmentUpload from "./InquiryAttachmentUpload";
import InquiryAttachmentList from "./InquiryAttachmentList";
import {
  InquiryAttachment,
  inquiryAttachmentService,
} from "@/services/inquiryAttachmentService";
import { InquiryResponse } from "@/services/inquiryService";

interface InquiryDetailDialogProps {
  inquiry: InquiryResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InquiryDetailDialog: React.FC<InquiryDetailDialogProps> = ({
  inquiry,
  open,
  onOpenChange,
}) => {
  const [attachments, setAttachments] = useState<InquiryAttachment[]>([]);
  const [loading, setLoading] = useState(false);

  const statusColors = {
    NEW: "bg-blue-100 text-blue-800",
    RESOLVED: "bg-green-100 text-green-800",
  };

  useEffect(() => {
    if (inquiry && open) {
      loadAttachments();
    }
  }, [inquiry, open]);

  const loadAttachments = async () => {
    if (!inquiry) return;

    setLoading(true);
    try {
      const inquiryId = inquiry.id; // Direct numeric ID from backend
      const data = await inquiryAttachmentService.getAttachmentsByInquiry(
        inquiryId
      );
      setAttachments(data);
    } catch (error) {
      console.error("Failed to load attachments:", error);
      setAttachments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (newAttachment: InquiryAttachment) => {
    setAttachments([...attachments, newAttachment]);
  };

  const handleAttachmentDeleted = (attachmentId: number) => {
    setAttachments(attachments.filter((att) => att.id !== attachmentId));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!inquiry) return null;

  const inquiryId = inquiry.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-black mb-2">
                Inquiry Details
              </DialogTitle>
              <DialogDescription>
                View and manage inquiry information and attachments
              </DialogDescription>
            </div>
            <Badge className={`status-badge ${statusColors[inquiry.status]}`}>
              {inquiry.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Customer Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4 p-4 bg-black/5 rounded-lg">
              <div>
                <label className="text-sm font-medium text-black/70">Name</label>
                <p className="text-black font-medium">{inquiry.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-black/70 flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <p className="text-black font-medium">{inquiry.email}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-black/70 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Date Submitted
                </label>
                <p className="text-black font-medium">{formatDate(inquiry.createdAt)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Message */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-black">Message</h3>
            <div className="p-4 bg-black/5 rounded-lg border border-black/10">
              <p className="text-black/90 leading-relaxed whitespace-pre-wrap">
                {inquiry.message}
              </p>
            </div>
          </div>

          <Separator />

          {/* Attachments Section with Tabs */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black flex items-center gap-2">
              <Paperclip className="h-5 w-5" />
              Attachments
              {attachments.length > 0 && (
                <Badge className="bg-blue-100 text-blue-800">
                  {attachments.length}
                </Badge>
              )}
            </h3>

            <Tabs defaultValue="view" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="view" className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  View Attachments
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <UploadIcon className="h-4 w-4" />
                  Upload New
                </TabsTrigger>
              </TabsList>

              <TabsContent value="view" className="mt-4">
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-black/60">Loading attachments...</p>
                  </div>
                ) : (
                  <InquiryAttachmentList
                    inquiryId={inquiryId}
                    attachments={attachments}
                    onAttachmentDeleted={handleAttachmentDeleted}
                    onRefresh={loadAttachments}
                  />
                )}
              </TabsContent>

              <TabsContent value="upload" className="mt-4">
                <InquiryAttachmentUpload
                  inquiryId={inquiryId}
                  onUploadSuccess={handleUploadSuccess}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InquiryDetailDialog;
