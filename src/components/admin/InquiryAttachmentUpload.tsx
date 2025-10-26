import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, FileIcon, Image, FileText } from "lucide-react";
import {
  inquiryAttachmentService,
  InquiryAttachment,
  formatFileSize,
  getFileIcon,
} from "@/services/inquiryAttachmentService";

interface InquiryAttachmentUploadProps {
  inquiryId: number;
  onUploadSuccess?: (attachment: InquiryAttachment) => void;
  maxFileSize?: number; // in MB
  maxFiles?: number;
  allowedTypes?: string[];
}

const InquiryAttachmentUpload: React.FC<InquiryAttachmentUploadProps> = ({
  inquiryId,
  onUploadSuccess,
  maxFileSize = 10, // 10MB default
  maxFiles = 5,
  allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return "File type not allowed";
    }

    return null;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else if (selectedFiles.length + newFiles.length < maxFiles) {
        newFiles.push(file);
      } else {
        errors.push(`Maximum ${maxFiles} files allowed`);
      }
    });

    if (errors.length > 0) {
      toast({
        title: "Upload Errors",
        description: errors.join(", "),
        variant: "destructive",
      });
    }

    if (newFiles.length > 0) {
      setSelectedFiles([...selectedFiles, ...newFiles]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const totalFiles = selectedFiles.length;
      let uploadedCount = 0;

      for (const file of selectedFiles) {
        try {
          const attachment = await inquiryAttachmentService.uploadAttachment(
            inquiryId,
            file
          );
          uploadedCount++;
          setUploadProgress((uploadedCount / totalFiles) * 100);

          if (onUploadSuccess) {
            onUploadSuccess(attachment);
          }

          toast({
            title: "Upload Successful",
            description: `${file.name} uploaded successfully`,
          });
        } catch (error) {
          toast({
            title: "Upload Failed",
            description: `Failed to upload ${file.name}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
            variant: "destructive",
          });
        }
      }

      setSelectedFiles([]);
      setUploadProgress(0);
    } catch (error) {
      toast({
        title: "Upload Error",
        description:
          error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getFileTypeIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <Image className="h-5 w-5 text-blue-500" />;
    } else if (file.type === "application/pdf") {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else {
      return <FileIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Area */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-black/20 bg-black/5"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-8">
          <div className="text-center">
            <Upload
              className={`h-12 w-12 mx-auto mb-4 ${
                dragActive ? "text-primary" : "text-black/50"
              }`}
            />
            <h3 className="text-lg font-semibold text-black mb-2">
              {dragActive ? "Drop files here" : "Upload Attachments"}
            </h3>
            <p className="text-sm text-black/70 mb-4">
              Drag & drop files here or click to browse
            </p>
            <p className="text-xs text-black/60 mb-4">
              Max {maxFiles} files • Up to {maxFileSize}MB each • Images, PDFs,
              Documents
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || selectedFiles.length >= maxFiles}
              className="bg-black/10 border-black/20 text-black hover:bg-black/20"
            >
              <Upload className="h-4 w-4 mr-2" />
              Select Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={allowedTypes.join(",")}
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-black">
                Selected Files ({selectedFiles.length})
              </h4>
              <Button
                size="sm"
                onClick={() => setSelectedFiles([])}
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
              >
                Clear All
              </Button>
            </div>

            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-black/5 rounded-lg"
                >
                  {getFileTypeIcon(file)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-black/60">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="mt-4 space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-center text-black/70">
                  Uploading... {Math.round(uploadProgress)}%
                </p>
              </div>
            )}

            {/* Upload Button */}
            <Button
              onClick={uploadFiles}
              disabled={uploading || selectedFiles.length === 0}
              className="w-full mt-4"
            >
              {uploading ? "Uploading..." : `Upload ${selectedFiles.length} File(s)`}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InquiryAttachmentUpload;
