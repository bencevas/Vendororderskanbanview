import { Order } from '../components/order-card';
import { supabase, isSupabaseConfigured } from './supabase';
import type { Order as DbOrder, OrderItem as DbOrderItem } from '../types/database';

// API Configuration - used as fallback when Supabase is not configured
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

// Helper function to parse "YYYY-MM-DD" as local date, not UTC
// This prevents timezone shifts (e.g., Feb 8 UTC becoming Feb 7 local)
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Helper function to format Date as "YYYY-MM-DD" in LOCAL time (not UTC!)
// Using toISOString() would convert to UTC first, causing date shifts
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper function to convert DB order to frontend Order
function dbOrderToOrder(dbOrder: DbOrder & { item_count?: number }): Order {
  return {
    id: dbOrder.id,
    orderCode: dbOrder.order_code,
    customerName: dbOrder.customer_name,
    itemCount: dbOrder.item_count || 0,
    totalAmount: Number(dbOrder.total_amount),
    status: dbOrder.status,
    deliveryDate: parseLocalDate(dbOrder.delivery_date),
  };
}

// Helper function to convert DB order item to frontend OrderItem
function dbOrderItemToOrderItem(dbItem: DbOrderItem): OrderItem {
  return {
    id: dbItem.id,
    name: dbItem.product_name,
    orderedQuantity: Number(dbItem.ordered_quantity),
    actualQuantity: Number(dbItem.actual_quantity),
    price: Number(dbItem.price),
    unit: dbItem.unit,
    confirmed: dbItem.confirmed,
    image: dbItem.image_url || '',
  };
}

// Helper function to handle REST API errors (fallback)
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// ============================================================================
// SUPABASE API FUNCTIONS
// ============================================================================

async function fetchOrdersFromSupabase(startDate?: Date, endDate?: Date): Promise<Order[]> {
  let query = supabase
    .from('orders')
    .select(`
      *,
      order_items(count)
    `)
    .order('delivery_date', { ascending: true })
    .order('order_code', { ascending: true });

  if (startDate) {
    query = query.gte('delivery_date', formatLocalDate(startDate));
  }
  if (endDate) {
    query = query.lte('delivery_date', formatLocalDate(endDate));
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ Supabase error:', error);
    throw new Error(error.message);
  }

  return (data || []).map(order => ({
    ...dbOrderToOrder(order),
    itemCount: order.order_items?.[0]?.count || 0,
  }));
}

async function fetchOrderByIdFromSupabase(orderId: string): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(count)
    `)
    .eq('id', orderId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    ...dbOrderToOrder(data),
    itemCount: data.order_items?.[0]?.count || 0,
  };
}

async function fetchOrderItemsFromSupabase(orderId: string): Promise<OrderItem[]> {
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(dbOrderItemToOrderItem);
}

async function updateOrderStatusInSupabase(orderId: string, status: Order['status']): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return dbOrderToOrder(data);
}

async function updateOrderItemQuantityInSupabase(
  orderId: string,
  itemId: string,
  actualQuantity: number
): Promise<OrderItem> {
  const { data, error } = await supabase
    .from('order_items')
    .update({ actual_quantity: actualQuantity })
    .eq('id', itemId)
    .eq('order_id', orderId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return dbOrderItemToOrderItem(data);
}

async function updateOrderItemConfirmationInSupabase(
  orderId: string,
  itemId: string,
  confirmed: boolean | null
): Promise<OrderItem> {
  const { data, error } = await supabase
    .from('order_items')
    .update({ confirmed })
    .eq('id', itemId)
    .eq('order_id', orderId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return dbOrderItemToOrderItem(data);
}

async function saveOrderChangesInSupabase(
  orderId: string,
  items: Partial<OrderItem>[],
  status?: Order['status']
): Promise<{ order: Order; items: OrderItem[] }> {
  // Update order status if provided
  if (status) {
    const { error: statusError } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (statusError) {
      throw new Error(statusError.message);
    }
  }

  // Update items
  for (const item of items) {
    if (item.id) {
      const { error: itemError } = await supabase
        .from('order_items')
        .update({
          actual_quantity: item.actualQuantity,
          confirmed: item.confirmed,
        })
        .eq('id', item.id)
        .eq('order_id', orderId);

      if (itemError) {
        throw new Error(itemError.message);
      }
    }
  }

  // Fetch updated order and items
  const order = await fetchOrderByIdFromSupabase(orderId);
  const updatedItems = await fetchOrderItemsFromSupabase(orderId);

  return { order, items: updatedItems };
}

// ============================================================================
// REST API FUNCTIONS (FALLBACK)
// ============================================================================

async function fetchOrdersFromRest(startDate?: Date, endDate?: Date): Promise<Order[]> {
  const url = new URL(`${API_BASE_URL}/orders`);

  if (startDate) {
    url.searchParams.append('startDate', startDate.toISOString());
  }
  if (endDate) {
    url.searchParams.append('endDate', endDate.toISOString());
  }

  console.log('🔗 Fetching from REST URL:', url.toString());

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: OrderResponse[] = await response.json();
  return data.map(order => ({
    ...order,
    deliveryDate: new Date(order.deliveryDate),
  }));
}

async function fetchOrderByIdFromRest(orderId: string): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const data: OrderResponse = await handleResponse<OrderResponse>(response);
  return { ...data, deliveryDate: new Date(data.deliveryDate) };
}

async function fetchOrderItemsFromRest(orderId: string): Promise<OrderItem[]> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/items`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

async function updateOrderStatusFromRest(orderId: string, status: Order['status']): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  const data: OrderResponse = await handleResponse<OrderResponse>(response);
  return { ...data, deliveryDate: new Date(data.deliveryDate) };
}

async function updateOrderItemQuantityFromRest(
  orderId: string,
  itemId: string,
  actualQuantity: number
): Promise<OrderItem> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/items/${itemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actualQuantity }),
  });

  return handleResponse<OrderItem>(response);
}

async function updateOrderItemConfirmationFromRest(
  orderId: string,
  itemId: string,
  confirmed: boolean | null
): Promise<OrderItem> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/items/${itemId}/confirm`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirmed }),
  });

  return handleResponse<OrderItem>(response);
}

async function saveOrderChangesFromRest(
  orderId: string,
  items: Partial<OrderItem>[],
  status?: Order['status']
): Promise<{ order: Order; items: OrderItem[] }> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, status }),
  });

  const data = await handleResponse<{ order: OrderResponse; items: OrderItem[] }>(response);
  return {
    order: { ...data.order, deliveryDate: new Date(data.order.deliveryDate) },
    items: data.items,
  };
}

// ============================================================================
// EXPORTED API FUNCTIONS (Auto-switch between Supabase and REST)
// ============================================================================

const useSupabase = isSupabaseConfigured();

if (useSupabase) {
  console.log('🚀 Using Supabase backend');
} else {
  console.log('📡 Using REST API backend (mock server)');
}

/**
 * Fetch all orders, optionally filtered by date range
 */
export async function fetchOrders(startDate?: Date, endDate?: Date): Promise<Order[]> {
  if (useSupabase) {
    return fetchOrdersFromSupabase(startDate, endDate);
  }
  return fetchOrdersFromRest(startDate, endDate);
}

/**
 * Fetch a single order by ID
 */
export async function fetchOrderById(orderId: string): Promise<Order> {
  if (useSupabase) {
    return fetchOrderByIdFromSupabase(orderId);
  }
  return fetchOrderByIdFromRest(orderId);
}

/**
 * Fetch order items for a specific order
 */
export async function fetchOrderItems(orderId: string): Promise<OrderItem[]> {
  if (useSupabase) {
    return fetchOrderItemsFromSupabase(orderId);
  }
  return fetchOrderItemsFromRest(orderId);
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
  if (useSupabase) {
    return updateOrderStatusInSupabase(orderId, status);
  }
  return updateOrderStatusFromRest(orderId, status);
}

/**
 * Update order item quantity
 */
export async function updateOrderItemQuantity(
  orderId: string,
  itemId: string,
  actualQuantity: number
): Promise<OrderItem> {
  if (useSupabase) {
    return updateOrderItemQuantityInSupabase(orderId, itemId, actualQuantity);
  }
  return updateOrderItemQuantityFromRest(orderId, itemId, actualQuantity);
}

/**
 * Confirm or deny an order item
 */
export async function updateOrderItemConfirmation(
  orderId: string,
  itemId: string,
  confirmed: boolean | null
): Promise<OrderItem> {
  if (useSupabase) {
    return updateOrderItemConfirmationInSupabase(orderId, itemId, confirmed);
  }
  return updateOrderItemConfirmationFromRest(orderId, itemId, confirmed);
}

/**
 * Save all changes for an order (bulk update)
 */
export async function saveOrderChanges(
  orderId: string,
  items: Partial<OrderItem>[],
  status?: Order['status']
): Promise<{ order: Order; items: OrderItem[] }> {
  if (useSupabase) {
    return saveOrderChangesInSupabase(orderId, items, status);
  }
  return saveOrderChangesFromRest(orderId, items, status);
}
