// orders.ts - Order Service for Cakify Frontend

export interface Order {
  id?: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  orderDate: string; // ISO string format
  deliveryDate: string; // ISO string format
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  specialNotes?: string;
  orderItems?: OrderItem[];
}

export interface OrderItem {
  id?: number;
  orderId?: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialRequirements?: string;
}

export interface CreateOrderRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  orderDate: string;
  deliveryDate: string;
  status: string;
  totalAmount: number;
  specialNotes?: string;
}

export interface OrdersResponse {
  content: Order[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

class OrderService {
  private baseUrl = 'http://localhost:8081/api'; // Your backend URL
  
  // Basic auth credentials (use the generated password from your Spring Boot logs)
  private getAuthHeaders() {
    const credentials = btoa('user:c36bc809-2097-4002-83f3-b294595b4f87'); // Replace with current password
    return {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${credentials}`
    };
  }

  // Get all orders with pagination
  async getAllOrders(page: number = 0, size: number = 10, sort: string = 'orderDate,desc'): Promise<OrdersResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/orders?page=${page}&size=${size}&sort=${sort}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  // Get single order by ID
  async getOrderById(id: number): Promise<Order> {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Order not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  // Create new order
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    try {
      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Update order
  async updateOrder(id: number, orderData: Partial<Order>): Promise<Order> {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update order');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  // Delete order
  async deleteOrder(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }

  // Get order items for a specific order
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/orderItems?orderId=${orderId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching order items:', error);
      throw error;
    }
  }

  // Add item to order
  async addOrderItem(orderItem: Omit<OrderItem, 'id'>): Promise<OrderItem> {
    try {
      const response = await fetch(`${this.baseUrl}/orderItems`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(orderItem)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add order item');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding order item:', error);
      throw error;
    }
  }

  // Update order status
  async updateOrderStatus(id: number, status: Order['status']): Promise<Order> {
    return this.updateOrder(id, { status });
  }

  // Search orders by customer email
  async searchOrdersByEmail(email: string): Promise<Order[]> {
    try {
      const response = await fetch(`${this.baseUrl}/orders?customerEmail=${email}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.content || data; // Handle both paginated and non-paginated responses
    } catch (error) {
      console.error('Error searching orders:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const orderService = new OrderService();

// Export the class as well for testing
export default OrderService;