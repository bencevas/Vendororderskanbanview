import { startOfDay, addDays } from 'date-fns';
import { Order } from './components/order-card';

// Original hardcoded mock data function that was working
export const generateMockOrders = (): Order[] => {
  const baseDate = startOfDay(new Date());
  
  return [
    // Today
    {
      id: '1',
      orderCode: 'ORD-2024-001',
      customerName: 'John Smith',
      itemCount: 3,
      totalAmount: 124.99,
      status: 'pending',
      deliveryDate: baseDate,
    },
    {
      id: '2',
      orderCode: 'ORD-2024-002',
      customerName: 'Emma Johnson',
      itemCount: 5,
      totalAmount: 289.50,
      status: 'confirmed',
      deliveryDate: baseDate,
    },
    {
      id: '3',
      orderCode: 'ORD-2024-003',
      customerName: 'Michael Brown',
      itemCount: 2,
      totalAmount: 89.99,
      status: 'processing',
      deliveryDate: baseDate,
    },
    
    // Tomorrow
    {
      id: '4',
      orderCode: 'ORD-2024-004',
      customerName: 'Sarah Davis',
      itemCount: 7,
      totalAmount: 456.75,
      status: 'confirmed',
      deliveryDate: addDays(baseDate, 1),
    },
    {
      id: '5',
      orderCode: 'ORD-2024-005',
      customerName: 'David Wilson',
      itemCount: 1,
      totalAmount: 49.99,
      status: 'pending',
      deliveryDate: addDays(baseDate, 1),
    },
    
    // Day 2
    {
      id: '6',
      orderCode: 'ORD-2024-006',
      customerName: 'Jessica Martinez',
      itemCount: 4,
      totalAmount: 199.99,
      status: 'confirmed',
      deliveryDate: addDays(baseDate, 2),
    },
    {
      id: '7',
      orderCode: 'ORD-2024-007',
      customerName: 'Robert Taylor',
      itemCount: 6,
      totalAmount: 342.00,
      status: 'ready',
      deliveryDate: addDays(baseDate, 2),
    },
    {
      id: '8',
      orderCode: 'ORD-2024-008',
      customerName: 'Amanda Anderson',
      itemCount: 3,
      totalAmount: 156.25,
      status: 'processing',
      deliveryDate: addDays(baseDate, 2),
    },
    
    // Day 3
    {
      id: '9',
      orderCode: 'ORD-2024-009',
      customerName: 'Christopher Lee',
      itemCount: 8,
      totalAmount: 523.40,
      status: 'confirmed',
      deliveryDate: addDays(baseDate, 3),
    },
    {
      id: '10',
      orderCode: 'ORD-2024-010',
      customerName: 'Michelle White',
      itemCount: 2,
      totalAmount: 78.50,
      status: 'pending',
      deliveryDate: addDays(baseDate, 3),
    },
    
    // Day 4
    {
      id: '11',
      orderCode: 'ORD-2024-011',
      customerName: 'James Harris',
      itemCount: 5,
      totalAmount: 267.80,
      status: 'confirmed',
      deliveryDate: addDays(baseDate, 4),
    },
    {
      id: '12',
      orderCode: 'ORD-2024-012',
      customerName: 'Lisa Thompson',
      itemCount: 3,
      totalAmount: 145.99,
      status: 'pending',
      deliveryDate: addDays(baseDate, 4),
    },
    {
      id: '13',
      orderCode: 'ORD-2024-013',
      customerName: 'Daniel Garcia',
      itemCount: 4,
      totalAmount: 234.00,
      status: 'ready',
      deliveryDate: addDays(baseDate, 4),
    },
  ];
};
