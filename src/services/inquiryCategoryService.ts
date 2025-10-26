import { apiClient } from '@/services/api';
import { InquiryCategoryResponse } from '@/types/inquiry';

// Backend endpoint for INQUIRY categories only (product categories are separate)
const INQUIRY_CATEGORY_BASE = '/inquiry-categories';

export const inquiryCategoryService = {
  async getAll(): Promise<InquiryCategoryResponse[]> {
    return apiClient.get(INQUIRY_CATEGORY_BASE);
  },

  async getActiveCategories(): Promise<InquiryCategoryResponse[]> {
    return apiClient.get(`${INQUIRY_CATEGORY_BASE}/active`);
  },
};
