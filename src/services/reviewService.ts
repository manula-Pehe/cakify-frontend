import { apiClient } from './api';

export interface Review {
  id: number;
  productId: number;
  email: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewStats {
  averageRating: number;
  reviewCount: number;
}

export const reviewService = {
  getByProduct: async (productId: string | number): Promise<Review[]> => {
    return apiClient.get(`/products/${productId}/reviews`);
  },

  getStats: async (productId: string | number): Promise<ReviewStats> => {
    return apiClient.get(`/products/${productId}/reviews/stats`);
  },

  delete: async (productId: string | number, reviewId: string | number): Promise<void> => {
    return apiClient.delete(`/products/${productId}/reviews/${reviewId}`);
  },
};


