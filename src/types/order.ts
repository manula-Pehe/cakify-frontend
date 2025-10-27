// Order and OrderItem TypeScript types matching backend DTOs

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface OrderItem {
  id?: number;
  productId: number;
  productName: string;
  productDescription?: string;
  productImage?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  specialInstructions?: string; // Item-level notes (e.g., "Size: 8 inch")
}

export interface Order {
  id?: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  specialNotes?: string; // Order-level notes from customer
  orderStatus: OrderStatus;
  totalAmount: number;
  orderDate?: string;
  deliveryDate?: string;
  items: OrderItem[];
  orderItems?: OrderItem[]; // Alias for compatibility
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp?: string;
}

export interface PageResponse<T> {
  content: T[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface OrderStats {
  totalOrders: number;
  pendingCount: number;
  confirmedCount: number;
  preparingCount: number;
  readyCount: number;
  deliveredCount: number;
  cancelledCount: number;
}

export interface OrderFilters {
  status?: OrderStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
