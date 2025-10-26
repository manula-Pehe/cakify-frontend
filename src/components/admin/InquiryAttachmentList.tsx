import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Download,
  Trash2,
  FileIcon,
  Image,
  FileText,
  Paperclip,
  AlertCircle,
} from "lucide-react";
import {
  inquiryAttachmentService,
  InquiryAttachment,
  formatFileSize,
  getFileTypeLabel,
} from "@/services/inquiryAttachmentService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface InquiryAttachmentListProps {
  inquiryId: number;
  attachments: InquiryAttachment[];
  onAttachmentDeleted?: (attachmentId: number) => void;
  onRefresh?: () => void;
}

const InquiryAttachmentList: React.FC<InquiryAttachmentListProps> = ({
  inquiryId,
  attachments: initialAttachments,
  onAttachmentDeleted,
  onRefresh,
}) => {
  const { toast } = useToast();
  const [attachments, setAttachments] = useState<InquiryAttachment[]>(
    initialAttachments
  );
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    setAttachments(initialAttachments);
  }, [initialAttachments]);

  const getFileTypeIcon = (fileName: string) => {
    const lowerName = fileName.toLowerCase();
    if (
      lowerName.endsWith(".jpg") ||
      lowerName.endsWith(".jpeg") ||
      lowerName.endsWith(".png") ||
      lowerName.endsWith(".gif")
    ) {
      return <Image className="h-5 w-5 text-blue-500" />;
    } else if (lowerName.endsWith(".pdf")) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else {
      return <FileIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleDownload = (attachment: InquiryAttachment) => {
    try {
      const downloadUrl = inquiryAttachmentService.downloadAttachment(
        attachment.fileName
      );
      window.open(downloadUrl, "_blank");

      toast({
        title: "Download Started",
        description: `Downloading ${attachment.fileName}`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description:
          error instanceof Error ? error.message : "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (attachmentId: number) => {
    setDeleting(attachmentId);
    try {
      await inquiryAttachmentService.deleteAttachment(inquiryId, attachmentId);

      setAttachments(attachments.filter((att) => att.id !== attachmentId));

      if (onAttachmentDeleted) {
        onAttachmentDeleted(attachmentId);
      }

      toast({
        title: "Attachment Deleted",
        description: "The attachment has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description:
          error instanceof Error ? error.message : "Failed to delete attachment",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await inquiryAttachmentService.deleteAllAttachments(inquiryId);
      setAttachments([]);

      if (onRefresh) {
        onRefresh();
      }

      toast({
        title: "All Attachments Deleted",
        description: "All attachments have been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete attachments",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (attachments.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8">
          <div className="text-center">
            <Paperclip className="h-12 w-12 text-black/30 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-black mb-2">
              No Attachments
            </h3>
            <p className="text-sm text-black/60">
              This inquiry doesn't have any attachments yet
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-black flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            Attachments ({attachments.length})
          </CardTitle>
          {attachments.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 border-red-500/30 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    Delete All Attachments?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all {attachments.length}{" "}
                    attachment(s) for this inquiry. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAll}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-4 p-4 bg-black/5 rounded-lg border border-black/10 hover:bg-black/10 transition-colors"
            >
              {/* File Icon */}
              <div className="flex-shrink-0">
                {getFileTypeIcon(attachment.fileName)}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-black truncate">
                    {attachment.fileName}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {getFileTypeLabel(attachment.fileName)}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-black/60">
                  <span>{formatFileSize(attachment.fileSize)}</span>
                  <span>•</span>
                  <span>{formatDate(attachment.uploadedAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(attachment)}
                  className="bg-blue-500/10 border-blue-500/30 text-blue-600 hover:bg-blue-500/20"
                >
                  <Download className="h-4 w-4" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={deleting === attachment.id}
                      className="bg-red-500/10 border-red-500/30 text-red-600 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        Delete Attachment?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{attachment.fileName}"?
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(attachment.id)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InquiryAttachmentList;
