import { createContext, useContext, ReactNode } from 'react';
import { Order } from '../components/order-card';

interface OrdersContextType {
  orders: Order[];
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  refreshOrders: () => Promise<void>;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within OrdersProvider');
  }
  return context;
}

export { OrdersContext };
export type { OrdersContextType };
