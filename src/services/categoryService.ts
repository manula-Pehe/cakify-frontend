import { apiClient } from './api';

export interface Category {
  id: number;
  name: string;
}

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    return apiClient.get('/categories');
  },

  getById: async (id: number): Promise<Category> => {
    return apiClient.get(`/categories/${id}`);
  },

  create: async (name: string): Promise<Category> => {
    return apiClient.post('/categories', { name });
  },

  update: async (id: number, name: string): Promise<Category> => {
    return apiClient.put(`/categories/${id}`, { name });
  },

  delete: async (id: number): Promise<void> => {
    return apiClient.delete(`/categories/${id}`);
  },
};


