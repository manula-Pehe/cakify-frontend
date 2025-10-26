import { apiClient } from '@/services/api';
import {
  InquiryRequest,
  InquiryResponse,
  InquiryStats,
  PaginatedResponse,
} from '@/types/inquiry';

const INQUIRY_BASE = '/inquiries';

// Map UI request to backend payload: inquiryCategoryId -> categoryId
const mapToBackendRequest = (data: InquiryRequest): Record<string, any> => {
  const { inquiryCategoryId, ...rest } = data as any;
  return {
    ...rest,
    ...(inquiryCategoryId ? { categoryId: inquiryCategoryId } : {}),
  };
};

export const inquiryService = {
  // Public
  async createInquiry(data: InquiryRequest): Promise<InquiryResponse> {
    const payload = mapToBackendRequest(data);
    return apiClient.post(INQUIRY_BASE, payload);
  },

  async getInquiryById(id: number): Promise<InquiryResponse> {
    return apiClient.get(`${INQUIRY_BASE}/${id}`);
  },

  // Admin
  async getAllInquiries(status?: string): Promise<InquiryResponse[]> {
    const params = status ? { status } : {};
    return apiClient.get(INQUIRY_BASE, { params });
  },

  async getInquiriesPaginated(
    page = 0,
    size = 10,
    status?: string
  ): Promise<PaginatedResponse<InquiryResponse>> {
    const params: any = { page, size };
    if (status) params.status = status;
    return apiClient.get(`${INQUIRY_BASE}/paginated`, { params });
  },

  // Best-effort search: try server-side; fallback to client filter
  async searchInquiries(term: string): Promise<InquiryResponse[]> {
    try {
      return await apiClient.get(`${INQUIRY_BASE}/search`, { params: { q: term } });
    } catch {
      // Fallback: fetch all (first 1000) and filter locally
      const page1 = await this.getInquiriesPaginated(0, 1000);
      const t = term.toLowerCase();
      return page1.content.filter((i: InquiryResponse) =>
        [i.name, i.email, i.subject || '', i.message].join(' ').toLowerCase().includes(t)
      );
    }
  },

  async deleteInquiry(id: number): Promise<void> {
    await apiClient.delete(`${INQUIRY_BASE}/${id}`);
  },

  async replyToInquiry(id: number, reply: string): Promise<InquiryResponse> {
    return apiClient.put(`${INQUIRY_BASE}/${id}/reply`, { reply });
  },

  async reopenInquiry(id: number): Promise<InquiryResponse> {
    return apiClient.put(`${INQUIRY_BASE}/${id}/reopen`, {});
  },

  async resolveInquiry(id: number): Promise<InquiryResponse> {
    return apiClient.post(`${INQUIRY_BASE}/${id}/resolve`, {});
  },

  // Stats
  async getDashboardStatistics(): Promise<InquiryStats> {
    return apiClient.get(`${INQUIRY_BASE}/stats`);
  },
};
