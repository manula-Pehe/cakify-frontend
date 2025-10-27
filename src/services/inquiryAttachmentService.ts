import { apiClient, API_BASE_URL } from "./api";

// Types matching backend DTOs
export interface InquiryAttachment {
  id: number;
  inquiryId: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  fileSizeFormatted: string;
  uploadedAt: string;
  downloadUrl: string;
  isImage: boolean;
  isPdf: boolean;
  isDocument: boolean;
  fileExtension: string;
}

export interface InquiryAttachmentStats {
  totalAttachments: number;
  totalSize: number;
  imageCount: number;
  documentCount: number;
  formattedTotalSize: string;
}

export interface InquiryWithAttachments {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
  status: "new" | "replied" | "resolved";
  attachments: InquiryAttachment[];
  attachmentCount: number;
}

// API Service
export const inquiryAttachmentService = {
  /**
   * Upload an attachment for an inquiry
   */
  uploadAttachment: async (
    inquiryId: number,
    file: File
  ): Promise<InquiryAttachment> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${API_BASE_URL}/inquiries/${inquiryId}/attachments`,
      {
        method: "POST",
        // Don't set Content-Type header - browser will set it automatically with boundary
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Failed to upload attachment";
      try {
        const error = JSON.parse(errorText);
        errorMessage = error.error || error.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  /**
   * Get all attachments for an inquiry
   */
  getAttachmentsByInquiry: async (
    inquiryId: number
  ): Promise<InquiryAttachment[]> => {
    return apiClient.get(`/inquiries/${inquiryId}/attachments`);
  },

  /**
   * Get a single attachment
   */
  getAttachment: async (
    inquiryId: number,
    attachmentId: number
  ): Promise<InquiryAttachment> => {
    return apiClient.get(`/inquiries/${inquiryId}/attachments/${attachmentId}`);
  },

  /**
   * Get only image attachments
   */
  getImageAttachments: async (
    inquiryId: number
  ): Promise<InquiryAttachment[]> => {
    return apiClient.get(`/inquiries/${inquiryId}/attachments/images`);
  },

  /**
   * Get only document attachments
   */
  getDocumentAttachments: async (
    inquiryId: number
  ): Promise<InquiryAttachment[]> => {
    return apiClient.get(`/inquiries/${inquiryId}/attachments/documents`);
  },

  /**
   * Download an attachment
   */
  downloadAttachment: (fileName: string): string => {
    return `${API_BASE_URL}/inquiries/attachments/download/${fileName}`;
  },

  /**
   * Delete a single attachment
   */
  deleteAttachment: async (
    inquiryId: number,
    attachmentId: number
  ): Promise<void> => {
    return apiClient.delete(
      `/inquiries/${inquiryId}/attachments/${attachmentId}`
    );
  },

  /**
   * Delete all attachments for an inquiry
   */
  deleteAllAttachments: async (inquiryId: number): Promise<void> => {
    return apiClient.delete(`/inquiries/${inquiryId}/attachments`);
  },

  /**
   * Get attachment statistics for an inquiry
   */
  getInquiryAttachmentStats: async (
    inquiryId: number
  ): Promise<InquiryAttachmentStats> => {
    return apiClient.get(`/inquiries/${inquiryId}/attachments/stats`);
  },

  /**
   * Get global attachment statistics
   */
  getGlobalAttachmentStats: async (): Promise<InquiryAttachmentStats> => {
    return apiClient.get(`/inquiries/attachments/stats`);
  },

  /**
   * Get total storage used
   */
  getTotalStorageUsed: async (): Promise<number> => {
    return apiClient.get(`/inquiries/attachments/storage-used`);
  },

  /**
   * Get total attachment count
   */
  getTotalAttachmentCount: async (): Promise<number> => {
    return apiClient.get(`/inquiries/attachments/count`);
  },
};

// Helper functions
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
};

export const isImageFile = (fileName: string): boolean => {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
  return imageExtensions.some((ext) =>
    fileName.toLowerCase().endsWith(ext)
  );
};

export const isPdfFile = (fileName: string): boolean => {
  return fileName.toLowerCase().endsWith(".pdf");
};

export const isDocumentFile = (fileName: string): boolean => {
  const docExtensions = [".doc", ".docx", ".txt", ".rtf"];
  return docExtensions.some((ext) =>
    fileName.toLowerCase().endsWith(ext)
  );
};

export const getFileIcon = (fileName: string): string => {
  if (isImageFile(fileName)) return "🖼️";
  if (isPdfFile(fileName)) return "📄";
  if (isDocumentFile(fileName)) return "📝";
  return "📎";
};

export const getFileTypeLabel = (fileName: string): string => {
  if (isImageFile(fileName)) return "Image";
  if (isPdfFile(fileName)) return "PDF";
  if (isDocumentFile(fileName)) return "Document";
  return "File";
};
