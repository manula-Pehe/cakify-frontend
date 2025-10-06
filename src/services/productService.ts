import { apiClient } from './api';

// Types matching your frontend Cake interface
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  sizes: string[];
  availability: boolean;
  featured: boolean;
}

// Type for creating/updating products (what we send to backend)
export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  category: string;
  sizes: string[];
  availability: boolean;
  featured: boolean;
  imageUrl?: string;
}

// Product Service - Much cleaner with Axios!
export const productService = {
  // Get all products
  getAll: async (): Promise<Product[]> => {
    return apiClient.get('/products');
  },

  // Get product by ID
  getById: async (id: string): Promise<Product> => {
    return apiClient.get(`/products/${id}`);
  },

  // Create new product
  create: async (productData: ProductRequest): Promise<Product> => {
    return apiClient.post('/products', productData);
  },

  // Update existing product
  update: async (id: string, productData: ProductRequest): Promise<Product> => {
    return apiClient.put(`/products/${id}`, productData);
  },

  // Delete product
  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/products/${id}`);
  },

  // Toggle availability
  toggleAvailability: async (id: string): Promise<Product> => {
    return apiClient.patch(`/products/${id}/availability`);
  },

  // Get available products
  getAvailable: async (): Promise<Product[]> => {
    return apiClient.get('/products/available');
  },

  // Get featured products
  getFeatured: async (): Promise<Product[]> => {
    return apiClient.get('/products/featured');
  },

  // Get products by category
  getByCategory: async (category: string): Promise<Product[]> => {
    return apiClient.get(`/products/category/${category}`);
  },

  // Search products
  search: async (query: string): Promise<Product[]> => {
    return apiClient.get(`/products/search`, {
      params: { q: query }
    });
  },
};