import { Order } from '../components/order-card';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Types
export interface OrderItem {
  id: string;
  name: string;
  orderedQuantity: number;
  actualQuantity: number;
  price: number;
  unit: string;
  confirmed: boolean | null;
  image: string;
}

export interface OrderResponse {
  id: string;
  orderCode: string;
  customerName: string;
  itemCount: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'ready';
  deliveryDate: string; // ISO date string from backend
}

// Helper function to handle API errors
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// API Functions

/**
 * Fetch all orders, optionally filtered by date range
 * @param startDate - Start date for filtering orders
 * @param endDate - End date for filtering orders (optional)
 */
export async function fetchOrders(startDate?: Date, endDate?: Date): Promise<Order[]> {
  const url = new URL(`${API_BASE_URL}/orders`);
  
  if (startDate) {
    url.searchParams.append('startDate', startDate.toISOString());
  }
  if (endDate) {
    url.searchParams.append('endDate', endDate.toISOString());
  }

  console.log('🔗 Fetching from URL:', url.toString());

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  console.log('📡 Response status:', response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ API Error Response:', errorText);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: OrderResponse[] = await response.json();
  console.log('📊 Received data:', data.length, 'orders');
  
  // Convert ISO date strings to Date objects
  const orders = data.map(order => ({
    ...order,
    deliveryDate: new Date(order.deliveryDate),
  }));
  
  console.log('✅ Converted orders:', orders);
  return orders;
}

/**
 * Fetch a single order by ID
 * @param orderId - The order ID
 */
export async function fetchOrderById(orderId: string): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data: OrderResponse = await handleResponse<OrderResponse>(response);
  
  return {
    ...data,
    deliveryDate: new Date(data.deliveryDate),
  };
}

/**
 * Fetch order items for a specific order
 * @param orderId - The order ID or order code
 */
export async function fetchOrderItems(orderId: string): Promise<OrderItem[]> {
  const url = `${API_BASE_URL}/orders/${orderId}/items`;
  console.log('🔗 Fetching order items from:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  console.log('📡 Order items response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Order items API Error:', errorText);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log('📦 Received order items:', data.length);
  return data;
}

/**
 * Update order status
 * @param orderId - The order ID
 * @param status - New status
 */
export async function updateOrderStatus(
  orderId: string,
  status: Order['status']
): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  const data: OrderResponse = await handleResponse<OrderResponse>(response);
  
  return {
    ...data,
    deliveryDate: new Date(data.deliveryDate),
  };
}

/**
 * Update order item quantity
 * @param orderId - The order ID
 * @param itemId - The item ID
 * @param actualQuantity - New actual quantity
 */
export async function updateOrderItemQuantity(
  orderId: string,
  itemId: string,
  actualQuantity: number
): Promise<OrderItem> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/items/${itemId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ actualQuantity }),
  });

  return handleResponse<OrderItem>(response);
}

/**
 * Confirm or deny an order item
 * @param orderId - The order ID
 * @param itemId - The item ID
 * @param confirmed - true to confirm, false to deny, null to revert
 */
export async function updateOrderItemConfirmation(
  orderId: string,
  itemId: string,
  confirmed: boolean | null
): Promise<OrderItem> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/items/${itemId}/confirm`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ confirmed }),
  });

  return handleResponse<OrderItem>(response);
}

/**
 * Save all changes for an order (bulk update)
 * @param orderId - The order ID
 * @param items - Array of updated items
 * @param status - Optional status update
 */
export async function saveOrderChanges(
  orderId: string,
  items: Partial<OrderItem>[],
  status?: Order['status']
): Promise<{ order: Order; items: OrderItem[] }> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items, status }),
  });

  const data = await handleResponse<{ order: OrderResponse; items: OrderItem[] }>(response);
  
  return {
    order: {
      ...data.order,
      deliveryDate: new Date(data.order.deliveryDate),
    },
    items: data.items,
  };
}
