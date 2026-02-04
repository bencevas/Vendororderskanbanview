import { useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { Order } from '../components/order-card';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { Order as DbOrder } from '../types/database';

interface UseRealtimeOrdersOptions {
  onOrderInsert?: (order: Order) => void;
  onOrderUpdate?: (order: Order) => void;
  onOrderDelete?: (orderId: string) => void;
  enabled?: boolean;
}

// Convert DB order to frontend Order
function dbOrderToOrder(dbOrder: DbOrder): Order {
  return {
    id: dbOrder.id,
    orderCode: dbOrder.order_code,
    customerName: dbOrder.customer_name,
    itemCount: 0, // Will need to be fetched separately
    totalAmount: Number(dbOrder.total_amount),
    status: dbOrder.status,
    deliveryDate: new Date(dbOrder.delivery_date),
  };
}

/**
 * Hook for subscribing to real-time order changes
 * Only activates when Supabase is configured
 */
export function useRealtimeOrders({
  onOrderInsert,
  onOrderUpdate,
  onOrderDelete,
  enabled = true,
}: UseRealtimeOrdersOptions) {
  const handleChanges = useCallback(
    (payload: RealtimePostgresChangesPayload<DbOrder>) => {
      console.log('📡 Realtime change received:', payload.eventType);

      switch (payload.eventType) {
        case 'INSERT':
          if (payload.new && onOrderInsert) {
            const newOrder = dbOrderToOrder(payload.new as DbOrder);
            console.log('➕ New order:', newOrder);
            onOrderInsert(newOrder);
          }
          break;

        case 'UPDATE':
          if (payload.new && onOrderUpdate) {
            const updatedOrder = dbOrderToOrder(payload.new as DbOrder);
            console.log('🔄 Updated order:', updatedOrder);
            onOrderUpdate(updatedOrder);
          }
          break;

        case 'DELETE':
          if (payload.old && onOrderDelete) {
            const deletedId = (payload.old as DbOrder).id;
            console.log('🗑️ Deleted order:', deletedId);
            onOrderDelete(deletedId);
          }
          break;
      }
    },
    [onOrderInsert, onOrderUpdate, onOrderDelete]
  );

  useEffect(() => {
    if (!enabled || !isSupabaseConfigured()) {
      console.log('📡 Realtime disabled or Supabase not configured');
      return;
    }

    console.log('📡 Setting up realtime subscription for orders...');

    // Subscribe to all changes on the orders table
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        handleChanges
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
      });

    // Cleanup on unmount
    return () => {
      console.log('📡 Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [enabled, handleChanges]);
}

/**
 * Hook for subscribing to real-time order item changes
 */
export function useRealtimeOrderItems({
  orderId,
  onItemUpdate,
  enabled = true,
}: {
  orderId: string;
  onItemUpdate?: (itemId: string, changes: Partial<{ actualQuantity: number; confirmed: boolean | null }>) => void;
  enabled?: boolean;
}) {
  useEffect(() => {
    if (!enabled || !isSupabaseConfigured() || !orderId) {
      return;
    }

    console.log('📡 Setting up realtime subscription for order items:', orderId);

    const channel = supabase
      .channel(`order-items-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'order_items',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          if (payload.new && onItemUpdate) {
            const item = payload.new as {
              id: string;
              actual_quantity: number;
              confirmed: boolean | null;
            };
            onItemUpdate(item.id, {
              actualQuantity: item.actual_quantity,
              confirmed: item.confirmed,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, onItemUpdate, enabled]);
}
