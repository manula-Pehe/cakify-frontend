import { apiClient } from './api';

// Types matching your backend Order entity
export interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  orderDate: string;
  deliveryDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  specialNotes?: string;
  orderItems?: OrderItem[];
}

export interface OrderItem {
  id?: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialRequirements?: string;
}

export interface OrderRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  orderDate: string;
  deliveryDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  specialNotes?: string;
  orderItems?: Omit<OrderItem, 'id'>[];
}

export interface OrdersResponse {
  content: Order[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  pageable?: any;
  sort?: any;
}

// If your api.ts has response interceptor that returns response.data:
export const orderService = {
  getAll: async (page: number = 0, size: number = 10, sort: string = 'orderDate,desc'): Promise<OrdersResponse> => {
    return apiClient.get('/orders/paginated', {
      params: { page, size, sort }
    });
  },

  getById: async (id: number): Promise<Order> => {
    return apiClient.get(`/orders/${id}`);
  },

  create: async (orderData: OrderRequest): Promise<Order> => {
    return apiClient.post('/orders', orderData);
  },

  update: async (id: number, orderData: Partial<OrderRequest>): Promise<Order> => {
    return apiClient.put(`/orders/${id}`, orderData);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/orders/${id}`);
  },

  updateStatus: async (id: number, status: Order['status']): Promise<Order> => {
    return apiClient.put(`/orders/${id}/status`, { status });
  },
};

// OR if your api.ts DOES NOT have response interceptor:
/*
export const orderService = {
  getAll: async (page: number = 0, size: number = 10, sort: string = 'orderDate,desc'): Promise<OrdersResponse> => {
    const response = await apiClient.get('/orders/paginated', {
      params: { page, size, sort }
    });
    return response.data; // ✅ Explicitly extract .data
  },

  getById: async (id: number): Promise<Order> => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  create: async (orderData: OrderRequest): Promise<Order> => {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },

  update: async (id: number, orderData: Partial<OrderRequest>): Promise<Order> => {
    const response = await apiClient.put(`/orders/${id}`, orderData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/orders/${id}`);
  },

  updateStatus: async (id: number, status: Order['status']): Promise<Order> => {
    const response = await apiClient.put(`/orders/${id}/status`, { status });
    return response.data;
  },
};
*/