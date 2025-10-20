import { apiClient } from './api';

// Inquiry Status Enum (matches backend InquiryStatus enum)
export enum InquiryStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

// Types matching your backend Inquiry entity
export interface Inquiry {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
}

// Type for creating inquiries (what customers send)
export interface InquiryRequest {
  customerName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

// Type for updating inquiry status (admin only)
export interface InquiryStatusUpdate {
  status: InquiryStatus;
  adminNotes?: string;
}

// Inquiry Service - Following the same pattern as productService
export const inquiryService = {
  // Get all inquiries (admin)
  getAll: async (): Promise<Inquiry[]> => {
    return apiClient.get('/inquiries');
  },

  // Get inquiry by ID
  getById: async (id: string): Promise<Inquiry> => {
    return apiClient.get(`/inquiries/${id}`);
  },

  // Create new inquiry (customer-facing)
  create: async (inquiryData: InquiryRequest): Promise<Inquiry> => {
    return apiClient.post('/inquiries', inquiryData);
  },

  // Update inquiry status (admin)
  updateStatus: async (id: string, statusUpdate: InquiryStatusUpdate): Promise<Inquiry> => {
    return apiClient.patch(`/inquiries/${id}/status`, statusUpdate);
  },

  // Delete inquiry (admin)
  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/inquiries/${id}`);
  },

  // Get inquiries by status (admin)
  getByStatus: async (status: InquiryStatus): Promise<Inquiry[]> => {
    return apiClient.get(`/inquiries/status/${status}`);
  },

  // Get pending inquiries (admin)
  getPending: async (): Promise<Inquiry[]> => {
    return apiClient.get('/inquiries/status/PENDING');
  },

  // Get in-progress inquiries (admin)
  getInProgress: async (): Promise<Inquiry[]> => {
    return apiClient.get('/inquiries/status/IN_PROGRESS');
  },

  // Get resolved inquiries (admin)
  getResolved: async (): Promise<Inquiry[]> => {
    return apiClient.get('/inquiries/status/RESOLVED');
  },

  // Search inquiries by customer name or email (admin)
  search: async (query: string): Promise<Inquiry[]> => {
    return apiClient.get('/inquiries/search', {
      params: { q: query }
    });
  },

  // Get inquiries count by status (useful for dashboard stats)
  getStatusCount: async (): Promise<Record<InquiryStatus, number>> => {
    return apiClient.get('/inquiries/stats/count');
  },

  // Update admin notes
  updateAdminNotes: async (id: string, adminNotes: string): Promise<Inquiry> => {
    return apiClient.patch(`/inquiries/${id}/notes`, { adminNotes });
  },
};
