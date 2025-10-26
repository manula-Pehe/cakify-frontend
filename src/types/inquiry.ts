// Inquiry Types - Matching backend DTOs closely while keeping UI-safe names

export enum InquiryStatus {
  NEW = 'NEW',
  RESOLVED = 'RESOLVED',
  REOPENED = 'REOPENED',
}

// UI-facing request shape uses inquiryCategoryId to avoid collision with product categories
export interface InquiryRequest {
  name: string;
  email: string;
  subject?: string;
  message: string;
  inquiryCategoryId?: number; // UI-only; will be mapped to backend field `categoryId`
}

export interface AttachmentResponse {
  id: number;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface InquiryResponse {
  id: number;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: InquiryStatus;
  reply?: string;
  categoryId?: number; // backend field
  categoryName?: string;
  attachments: AttachmentResponse[];
  createdAt: string;
  updatedAt?: string;
  repliedAt?: string;
}

export interface InquiryCategoryResponse {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  displayOrder: number;
  inquiryCount: number;
}

export interface InquiryStats {
  totalInquiries: number;
  newInquiries: number;
  resolvedInquiries: number;
  reopenedInquiries: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
