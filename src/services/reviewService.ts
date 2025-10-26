import { apiClient } from './api';

export interface Review {
  id: number;
  productId: number;
  email: string;
  rating: number;
  comment: string;
  createdAt: string;
  approved?: boolean;
}

export interface ReviewStats {
  averageRating: number;
  reviewCount: number;
}

export interface ReviewRequest {
  email: string;
  rating: number;
  comment: string;
}

export const reviewService = {
  // Get only approved reviews (for customers)
  getByProduct: async (productId: string | number): Promise<Review[]> => {
    return apiClient.get(`/products/${productId}/reviews`);
  },

  // Get ALL reviews including unapproved (for admin)
  getAllByProduct: async (productId: string | number): Promise<Review[]> => {
    return apiClient.get(`/products/${productId}/reviews/all`);
  },

  getStats: async (productId: string | number): Promise<ReviewStats> => {
    return apiClient.get(`/products/${productId}/reviews/stats`);
  },

  create: async (productId: string | number, reviewData: ReviewRequest): Promise<Review> => {
    return apiClient.post(`/products/${productId}/reviews`, reviewData);
  },

  delete: async (productId: string | number, reviewId: string | number): Promise<void> => {
    return apiClient.delete(`/products/${productId}/reviews/${reviewId}`);
  },

  // Approve or reject a review (admin only)
  updateApprovalStatus: async (
    productId: string | number, 
    reviewId: string | number, 
    approved: boolean
  ): Promise<Review> => {
    return apiClient.patch(`/products/${productId}/reviews/${reviewId}/approve?approved=${approved}`);
  },
};

