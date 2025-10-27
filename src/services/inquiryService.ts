import { apiClient } from "./api";

/**
 * Inquiry API Service
 * Handles all inquiry-related API calls
 */

// Types matching backend DTOs
export interface InquiryRequest {
  name: string;
  email: string;
  message: string;
}

export interface InquiryResponse {
  id: number;
  name: string;
  email: string;
  message: string;
  status: "NEW" | "RESOLVED";
  reply: string | null;
  createdAt: string;
  attachmentCount: number;
}

export interface InquiryStats {
  total: number;
  new: number;
  resolved: number;
}

/**
 * Create a new inquiry (Customer submits)
 */
export const createInquiry = async (
  data: InquiryRequest
): Promise<InquiryResponse> => {
  return apiClient.post<InquiryResponse>("/inquiries", data);
};

/**
 * Get all inquiries (Admin view)
 */
export const getAllInquiries = async (): Promise<InquiryResponse[]> => {
  return apiClient.get<InquiryResponse[]>("/inquiries");
};

/**
 * Get inquiries filtered by status
 */
export const getInquiriesByStatus = async (
  status: "NEW" | "RESOLVED"
): Promise<InquiryResponse[]> => {
  return apiClient.get<InquiryResponse[]>(`/inquiries?status=${status.toLowerCase()}`);
};

/**
 * Get a single inquiry by ID
 */
export const getInquiryById = async (
  id: number
): Promise<InquiryResponse> => {
  return apiClient.get<InquiryResponse>(`/inquiries/${id}`);
};

/**
 * Reply to an inquiry (Admin action - automatically marks as RESOLVED)
 */
export const replyToInquiry = async (
  id: number,
  reply: string
): Promise<InquiryResponse> => {
  return apiClient.put<InquiryResponse>(`/inquiries/${id}/reply`, { reply });
};

/**
 * Search inquiries by keyword
 */
export const searchInquiries = async (
  searchTerm: string
): Promise<InquiryResponse[]> => {
  return apiClient.get<InquiryResponse[]>(
    `/inquiries/search?q=${encodeURIComponent(searchTerm)}`
  );
};

/**
 * Get inquiry statistics
 */
export const getInquiryStats = async (): Promise<InquiryStats> => {
  return apiClient.get<InquiryStats>("/inquiries/stats");
};

/**
 * Get inquiries by customer email
 */
export const getInquiriesByEmail = async (
  email: string
): Promise<InquiryResponse[]> => {
  return apiClient.get<InquiryResponse[]>(`/inquiries/customer/${email}`);
};

/**
 * Delete an inquiry (Admin action)
 */
export const deleteInquiry = async (id: number): Promise<void> => {
  return apiClient.delete<void>(`/inquiries/${id}`);
};

/**
 * Reopen a resolved inquiry (Admin action)
 */
export const reopenInquiry = async (
  id: number
): Promise<InquiryResponse> => {
  return apiClient.put<InquiryResponse>(`/inquiries/${id}/reopen`);
};

/**
 * Get only NEW inquiries (shortcut)
 */
export const getNewInquiries = async (): Promise<InquiryResponse[]> => {
  return apiClient.get<InquiryResponse[]>("/inquiries/new");
};

/**
 * Get only RESOLVED inquiries (shortcut)
 */
export const getResolvedInquiries = async (): Promise<InquiryResponse[]> => {
  return apiClient.get<InquiryResponse[]>("/inquiries/resolved");
};

/**
 * Helper function to format inquiry date
 */
export const formatInquiryDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Helper function to get status badge color
 */
export const getStatusColor = (
  status: "NEW" | "RESOLVED"
): { bg: string; text: string } => {
  return status === "NEW"
    ? { bg: "bg-blue-100", text: "text-blue-800" }
    : { bg: "bg-green-100", text: "text-green-800" };
};

// Export all functions as default
export default {
  createInquiry,
  getAllInquiries,
  getInquiriesByStatus,
  getInquiryById,
  replyToInquiry,
  searchInquiries,
  getInquiryStats,
  getInquiriesByEmail,
  deleteInquiry,
  reopenInquiry,
  getNewInquiries,
  getResolvedInquiries,
  formatInquiryDate,
  getStatusColor,
};
