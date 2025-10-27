import { Order, OrderStatus, ApiResponse, PageResponse, OrderStats, OrderFilters, PaginationParams } from '@/types/order';

const API_BASE_URL = 'http://localhost:9090/api/orders';

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('admin-token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const orderService = {
  /**
   * Get all orders with pagination and filtering
   */
  async getAllOrders(
    params: PaginationParams & OrderFilters = {}
  ): Promise<ApiResponse<PageResponse<Order>>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page !== undefined) queryParams.append('page', params.page.toString());
      if (params.size !== undefined) queryParams.append('size', params.size.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDir) queryParams.append('sortDir', params.sortDir);
      if (params.status) queryParams.append('status', params.status);
      if (params.search) queryParams.append('search', params.search);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const response = await fetch(`${API_BASE_URL}?${queryParams.toString()}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to fetch orders';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to server. Please ensure the backend is running.');
      }
      throw error;
    }
  },

  /**
   * Get order by ID
   */
  async getOrderById(id: number): Promise<ApiResponse<Order>> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to fetch order details';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to server. Please ensure the backend is running.');
      }
      throw error;
    }
  },

  /**
   * Create a new order
   */
  async createOrder(order: Order): Promise<ApiResponse<Order>> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(order),
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to create order';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to server at http://localhost:9090. Please ensure the backend is running.');
      }
      throw error;
    }
  },

  /**
   * Update order status
   */
  async updateOrderStatus(id: number, status: OrderStatus): Promise<ApiResponse<Order>> {
    try {
      // Validate inputs
      if (!id || isNaN(id)) {
        throw new Error(`Invalid order ID: ${id}`);
      }
      if (!status) {
        throw new Error('Order status is required');
      }
      
      console.log('Updating order status:', { id, status });
      
      const response = await fetch(`${API_BASE_URL}/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to update order status';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      // Check if response has content
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      
      // Return success response for empty responses
      return {
        success: true,
        message: 'Order status updated successfully',
        data: null as any
      };
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to server. Please ensure the backend is running.');
      }
      throw error;
    }
  },

  /**
   * Update entire order
   */
  async updateOrder(id: number, order: Order): Promise<ApiResponse<Order>> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(order),
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to update order';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      // Check if response has content
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      
      // Return success response for empty responses
      return {
        success: true,
        message: 'Order updated successfully',
        data: null as any
      };
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to server. Please ensure the backend is running.');
      }
      throw error;
    }
  },

  /**
   * Delete an order
   */
  async deleteOrder(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to delete order';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      // Check if response has content
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      
      // Return success response for empty responses (like 204 No Content)
      return {
        success: true,
        message: 'Order deleted successfully',
        data: undefined as any
      };
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to server. Please ensure the backend is running.');
      }
      throw error;
    }
  },

  /**
   * Get order statistics for dashboard
   */
  async getOrderStats(): Promise<ApiResponse<OrderStats>> {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to fetch order statistics';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to server. Please ensure the backend is running.');
      }
      throw error;
    }
  },

  /**
   * Get orders by status
   */
  async getOrdersByStatus(status: OrderStatus, params: PaginationParams = {}): Promise<ApiResponse<PageResponse<Order>>> {
    return this.getAllOrders({ ...params, status });
  },

  /**
   * Search orders
   */
  async searchOrders(searchTerm: string, params: PaginationParams = {}): Promise<ApiResponse<PageResponse<Order>>> {
    return this.getAllOrders({ ...params, search: searchTerm });
  },
};
