import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to get start of day
const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Helper function to add days
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Helper function to check if two dates are the same day
const isSameDay = (date1, date2) => {
  return date1.toDateString() === date2.toDateString();
};

// Generate mock orders data (always relative to current date)
const generateMockOrders = () => {
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
      deliveryDate: baseDate.toISOString(),
    },
    {
      id: '2',
      orderCode: 'ORD-2024-002',
      customerName: 'Emma Johnson',
      itemCount: 5,
      totalAmount: 289.50,
      status: 'confirmed',
      deliveryDate: baseDate.toISOString(),
    },
    {
      id: '3',
      orderCode: 'ORD-2024-003',
      customerName: 'Michael Brown',
      itemCount: 2,
      totalAmount: 89.99,
      status: 'processing',
      deliveryDate: baseDate.toISOString(),
    },
    
    // Tomorrow
    {
      id: '4',
      orderCode: 'ORD-2024-004',
      customerName: 'Sarah Davis',
      itemCount: 7,
      totalAmount: 456.75,
      status: 'confirmed',
      deliveryDate: addDays(baseDate, 1).toISOString(),
    },
    {
      id: '5',
      orderCode: 'ORD-2024-005',
      customerName: 'David Wilson',
      itemCount: 1,
      totalAmount: 49.99,
      status: 'pending',
      deliveryDate: addDays(baseDate, 1).toISOString(),
    },
    
    // Day 2
    {
      id: '6',
      orderCode: 'ORD-2024-006',
      customerName: 'Jessica Martinez',
      itemCount: 4,
      totalAmount: 199.99,
      status: 'confirmed',
      deliveryDate: addDays(baseDate, 2).toISOString(),
    },
    {
      id: '7',
      orderCode: 'ORD-2024-007',
      customerName: 'Robert Taylor',
      itemCount: 6,
      totalAmount: 342.00,
      status: 'ready',
      deliveryDate: addDays(baseDate, 2).toISOString(),
    },
    {
      id: '8',
      orderCode: 'ORD-2024-008',
      customerName: 'Amanda Anderson',
      itemCount: 3,
      totalAmount: 156.25,
      status: 'processing',
      deliveryDate: addDays(baseDate, 2).toISOString(),
    },
    
    // Day 3
    {
      id: '9',
      orderCode: 'ORD-2024-009',
      customerName: 'Christopher Lee',
      itemCount: 8,
      totalAmount: 523.40,
      status: 'confirmed',
      deliveryDate: addDays(baseDate, 3).toISOString(),
    },
    {
      id: '10',
      orderCode: 'ORD-2024-010',
      customerName: 'Michelle White',
      itemCount: 2,
      totalAmount: 78.50,
      status: 'pending',
      deliveryDate: addDays(baseDate, 3).toISOString(),
    },
    
    // Day 4
    {
      id: '11',
      orderCode: 'ORD-2024-011',
      customerName: 'James Harris',
      itemCount: 5,
      totalAmount: 267.80,
      status: 'confirmed',
      deliveryDate: addDays(baseDate, 4).toISOString(),
    },
    {
      id: '12',
      orderCode: 'ORD-2024-012',
      customerName: 'Lisa Thompson',
      itemCount: 3,
      totalAmount: 145.99,
      status: 'pending',
      deliveryDate: addDays(baseDate, 4).toISOString(),
    },
    {
      id: '13',
      orderCode: 'ORD-2024-013',
      customerName: 'Daniel Garcia',
      itemCount: 4,
      totalAmount: 234.00,
      status: 'ready',
      deliveryDate: addDays(baseDate, 4).toISOString(),
    },
  ];
};

// Mock order items data
const getOrderItems = (orderCode) => {
  const itemsMap = {
    'ORD-2024-001': [
      { id: '1', name: 'Organic Chicken Breast', orderedQuantity: 2, actualQuantity: 2, price: 12.99, unit: 'kg', confirmed: null, image: 'https://butchershoppeteams.com/cdn/shop/products/butcher-shoppe-direct-boneless-skinless-chicken-breasts-15517883433043_1080x_266ae294-f803-4ef2-8308-0bc060f54d12.webp?v=1680630694' },
      { id: '2', name: 'Fresh Salmon Fillet', orderedQuantity: 1.5, actualQuantity: 1.5, price: 24.99, unit: 'kg', confirmed: null, image: 'https://meat4you.ch/media/catalog/product/cache/1e5ed9cbca70cb1b2ba6633fbe65aac9/b/i/bio-lachsfilet-mit-haut-meat4you_24a1909.jpg' },
      { id: '3', name: 'Ground Beef', orderedQuantity: 1, actualQuantity: 1, price: 15.50, unit: 'kg', confirmed: null, image: 'https://heatherlea.ca/wp-content/uploads/2022/12/DSC_0760-scaled.jpg' },
    ],
    'ORD-2024-002': [
      { id: '1', name: 'Ribeye Steak', orderedQuantity: 2, actualQuantity: 2, price: 28.99, unit: 'kg', confirmed: null, image: 'https://embed.widencdn.net/img/beef/ng96sbyljl/800x600px/Ribeye%20Steak_Lip-on.psd?keep=c&u=7fueml' },
      { id: '2', name: 'Pork Tenderloin', orderedQuantity: 1.5, actualQuantity: 1.5, price: 16.99, unit: 'kg', confirmed: null, image: 'https://cdn.woodwardmeats.com/media/product/1_Pork-Tenderloin.jpg' },
      { id: '3', name: 'Lamb Chops', orderedQuantity: 1, actualQuantity: 1, price: 32.00, unit: 'kg', confirmed: null, image: 'https://thebutchery.ca/cdn/shop/files/IMG_0126.jpg?v=1686321240&width=800' },
      { id: '4', name: 'Turkey Breast', orderedQuantity: 2.5, actualQuantity: 2.5, price: 14.50, unit: 'kg', confirmed: null, image: 'https://jmbutcher.mt/wp-content/uploads/2020/05/Turkey-Breast.jpg' },
      { id: '5', name: 'Duck Breast', orderedQuantity: 0.8, actualQuantity: 0.8, price: 22.00, unit: 'kg', confirmed: null, image: 'https://www.countrystylemeats.co.uk/wp-content/uploads/2022/05/duck-breast-jpg.webp' },
    ],
    'ORD-2024-003': [
      { id: '1', name: 'Organic Chicken Breast', orderedQuantity: 2.5, actualQuantity: 2.5, price: 12.99, unit: 'kg', confirmed: null, image: 'https://butchershoppeteams.com/cdn/shop/products/butcher-shoppe-direct-boneless-skinless-chicken-breasts-15517883433043_1080x_266ae294-f803-4ef2-8308-0bc060f54d12.webp?v=1680630694' },
      { id: '2', name: 'Fresh Salmon Fillet', orderedQuantity: 1, actualQuantity: 1, price: 24.99, unit: 'kg', confirmed: null, image: 'https://meat4you.ch/media/catalog/product/cache/1e5ed9cbca70cb1b2ba6633fbe65aac9/b/i/bio-lachsfilet-mit-haut-meat4you_24a1909.jpg' },
    ],
    'ORD-2024-004': [
      { id: '1', name: 'Ribeye Steak', orderedQuantity: 3, actualQuantity: 3, price: 28.99, unit: 'kg', confirmed: null, image: 'https://embed.widencdn.net/img/beef/ng96sbyljl/800x600px/Ribeye%20Steak_Lip-on.psd?keep=c&u=7fueml' },
      { id: '2', name: 'Ground Beef', orderedQuantity: 2, actualQuantity: 2, price: 15.50, unit: 'kg', confirmed: null, image: 'https://heatherlea.ca/wp-content/uploads/2022/12/DSC_0760-scaled.jpg' },
      { id: '3', name: 'Pork Tenderloin', orderedQuantity: 1.5, actualQuantity: 1.5, price: 16.99, unit: 'kg', confirmed: null, image: 'https://cdn.woodwardmeats.com/media/product/1_Pork-Tenderloin.jpg' },
      { id: '4', name: 'Lamb Chops', orderedQuantity: 2, actualQuantity: 2, price: 32.00, unit: 'kg', confirmed: null, image: 'https://thebutchery.ca/cdn/shop/files/IMG_0126.jpg?v=1686321240&width=800' },
      { id: '5', name: 'Turkey Breast', orderedQuantity: 1, actualQuantity: 1, price: 14.50, unit: 'kg', confirmed: null, image: 'https://jmbutcher.mt/wp-content/uploads/2020/05/Turkey-Breast.jpg' },
      { id: '6', name: 'Duck Breast', orderedQuantity: 1.2, actualQuantity: 1.2, price: 22.00, unit: 'kg', confirmed: null, image: 'https://www.countrystylemeats.co.uk/wp-content/uploads/2022/05/duck-breast-jpg.webp' },
      { id: '7', name: 'Organic Chicken Breast', orderedQuantity: 2, actualQuantity: 2, price: 12.99, unit: 'kg', confirmed: null, image: 'https://butchershoppeteams.com/cdn/shop/products/butcher-shoppe-direct-boneless-skinless-chicken-breasts-15517883433043_1080x_266ae294-f803-4ef2-8308-0bc060f54d12.webp?v=1680630694' },
    ],
    'ORD-2024-005': [
      { id: '1', name: 'Fresh Salmon Fillet', orderedQuantity: 1, actualQuantity: 1, price: 24.99, unit: 'kg', confirmed: null, image: 'https://meat4you.ch/media/catalog/product/cache/1e5ed9cbca70cb1b2ba6633fbe65aac9/b/i/bio-lachsfilet-mit-haut-meat4you_24a1909.jpg' },
    ],
    'ORD-2024-006': [
      { id: '1', name: 'Ribeye Steak', orderedQuantity: 2, actualQuantity: 2, price: 28.99, unit: 'kg', confirmed: null, image: 'https://embed.widencdn.net/img/beef/ng96sbyljl/800x600px/Ribeye%20Steak_Lip-on.psd?keep=c&u=7fueml' },
      { id: '2', name: 'Ground Beef', orderedQuantity: 1, actualQuantity: 1, price: 15.50, unit: 'kg', confirmed: null, image: 'https://heatherlea.ca/wp-content/uploads/2022/12/DSC_0760-scaled.jpg' },
      { id: '3', name: 'Pork Tenderloin', orderedQuantity: 1, actualQuantity: 1, price: 16.99, unit: 'kg', confirmed: null, image: 'https://cdn.woodwardmeats.com/media/product/1_Pork-Tenderloin.jpg' },
      { id: '4', name: 'Organic Chicken Breast', orderedQuantity: 1.5, actualQuantity: 1.5, price: 12.99, unit: 'kg', confirmed: null, image: 'https://butchershoppeteams.com/cdn/shop/products/butcher-shoppe-direct-boneless-skinless-chicken-breasts-15517883433043_1080x_266ae294-f803-4ef2-8308-0bc060f54d12.webp?v=1680630694' },
    ],
    'ORD-2024-007': [
      { id: '1', name: 'Lamb Chops', orderedQuantity: 3, actualQuantity: 3, price: 32.00, unit: 'kg', confirmed: null, image: 'https://thebutchery.ca/cdn/shop/files/IMG_0126.jpg?v=1686321240&width=800' },
      { id: '2', name: 'Turkey Breast', orderedQuantity: 2, actualQuantity: 2, price: 14.50, unit: 'kg', confirmed: null, image: 'https://jmbutcher.mt/wp-content/uploads/2020/05/Turkey-Breast.jpg' },
      { id: '3', name: 'Duck Breast', orderedQuantity: 1, actualQuantity: 1, price: 22.00, unit: 'kg', confirmed: null, image: 'https://www.countrystylemeats.co.uk/wp-content/uploads/2022/05/duck-breast-jpg.webp' },
      { id: '4', name: 'Ribeye Steak', orderedQuantity: 2.5, actualQuantity: 2.5, price: 28.99, unit: 'kg', confirmed: null, image: 'https://embed.widencdn.net/img/beef/ng96sbyljl/800x600px/Ribeye%20Steak_Lip-on.psd?keep=c&u=7fueml' },
      { id: '5', name: 'Ground Beef', orderedQuantity: 1.5, actualQuantity: 1.5, price: 15.50, unit: 'kg', confirmed: null, image: 'https://heatherlea.ca/wp-content/uploads/2022/12/DSC_0760-scaled.jpg' },
      { id: '6', name: 'Fresh Salmon Fillet', orderedQuantity: 1, actualQuantity: 1, price: 24.99, unit: 'kg', confirmed: null, image: 'https://meat4you.ch/media/catalog/product/cache/1e5ed9cbca70cb1b2ba6633fbe65aac9/b/i/bio-lachsfilet-mit-haut-meat4you_24a1909.jpg' },
    ],
    'ORD-2024-008': [
      { id: '1', name: 'Pork Tenderloin', orderedQuantity: 2, actualQuantity: 2, price: 16.99, unit: 'kg', confirmed: null, image: 'https://cdn.woodwardmeats.com/media/product/1_Pork-Tenderloin.jpg' },
      { id: '2', name: 'Organic Chicken Breast', orderedQuantity: 1, actualQuantity: 1, price: 12.99, unit: 'kg', confirmed: null, image: 'https://butchershoppeteams.com/cdn/shop/products/butcher-shoppe-direct-boneless-skinless-chicken-breasts-15517883433043_1080x_266ae294-f803-4ef2-8308-0bc060f54d12.webp?v=1680630694' },
      { id: '3', name: 'Lamb Chops', orderedQuantity: 1.5, actualQuantity: 1.5, price: 32.00, unit: 'kg', confirmed: null, image: 'https://thebutchery.ca/cdn/shop/files/IMG_0126.jpg?v=1686321240&width=800' },
    ],
    'ORD-2024-009': [
      { id: '1', name: 'Ribeye Steak', orderedQuantity: 4, actualQuantity: 4, price: 28.99, unit: 'kg', confirmed: null, image: 'https://embed.widencdn.net/img/beef/ng96sbyljl/800x600px/Ribeye%20Steak_Lip-on.psd?keep=c&u=7fueml' },
      { id: '2', name: 'Ground Beef', orderedQuantity: 2, actualQuantity: 2, price: 15.50, unit: 'kg', confirmed: null, image: 'https://heatherlea.ca/wp-content/uploads/2022/12/DSC_0760-scaled.jpg' },
      { id: '3', name: 'Pork Tenderloin', orderedQuantity: 1.5, actualQuantity: 1.5, price: 16.99, unit: 'kg', confirmed: null, image: 'https://cdn.woodwardmeats.com/media/product/1_Pork-Tenderloin.jpg' },
      { id: '4', name: 'Lamb Chops', orderedQuantity: 2, actualQuantity: 2, price: 32.00, unit: 'kg', confirmed: null, image: 'https://thebutchery.ca/cdn/shop/files/IMG_0126.jpg?v=1686321240&width=800' },
      { id: '5', name: 'Turkey Breast', orderedQuantity: 1.5, actualQuantity: 1.5, price: 14.50, unit: 'kg', confirmed: null, image: 'https://jmbutcher.mt/wp-content/uploads/2020/05/Turkey-Breast.jpg' },
      { id: '6', name: 'Duck Breast', orderedQuantity: 1, actualQuantity: 1, price: 22.00, unit: 'kg', confirmed: null, image: 'https://www.countrystylemeats.co.uk/wp-content/uploads/2022/05/duck-breast-jpg.webp' },
      { id: '7', name: 'Organic Chicken Breast', orderedQuantity: 2, actualQuantity: 2, price: 12.99, unit: 'kg', confirmed: null, image: 'https://butchershoppeteams.com/cdn/shop/products/butcher-shoppe-direct-boneless-skinless-chicken-breasts-15517883433043_1080x_266ae294-f803-4ef2-8308-0bc060f54d12.webp?v=1680630694' },
      { id: '8', name: 'Fresh Salmon Fillet', orderedQuantity: 1.5, actualQuantity: 1.5, price: 24.99, unit: 'kg', confirmed: null, image: 'https://meat4you.ch/media/catalog/product/cache/1e5ed9cbca70cb1b2ba6633fbe65aac9/b/i/bio-lachsfilet-mit-haut-meat4you_24a1909.jpg' },
    ],
    'ORD-2024-010': [
      { id: '1', name: 'Ground Beef', orderedQuantity: 1, actualQuantity: 1, price: 15.50, unit: 'kg', confirmed: null, image: 'https://heatherlea.ca/wp-content/uploads/2022/12/DSC_0760-scaled.jpg' },
      { id: '2', name: 'Organic Chicken Breast', orderedQuantity: 1, actualQuantity: 1, price: 12.99, unit: 'kg', confirmed: null, image: 'https://butchershoppeteams.com/cdn/shop/products/butcher-shoppe-direct-boneless-skinless-chicken-breasts-15517883433043_1080x_266ae294-f803-4ef2-8308-0bc060f54d12.webp?v=1680630694' },
    ],
    'ORD-2024-011': [
      { id: '1', name: 'Ribeye Steak', orderedQuantity: 3, actualQuantity: 3, price: 28.99, unit: 'kg', confirmed: null, image: 'https://embed.widencdn.net/img/beef/ng96sbyljl/800x600px/Ribeye%20Steak_Lip-on.psd?keep=c&u=7fueml' },
      { id: '2', name: 'Ground Beef', orderedQuantity: 1.5, actualQuantity: 1.5, price: 15.50, unit: 'kg', confirmed: null, image: 'https://heatherlea.ca/wp-content/uploads/2022/12/DSC_0760-scaled.jpg' },
      { id: '3', name: 'Pork Tenderloin', orderedQuantity: 1, actualQuantity: 1, price: 16.99, unit: 'kg', confirmed: null, image: 'https://cdn.woodwardmeats.com/media/product/1_Pork-Tenderloin.jpg' },
      { id: '4', name: 'Lamb Chops', orderedQuantity: 1.5, actualQuantity: 1.5, price: 32.00, unit: 'kg', confirmed: null, image: 'https://thebutchery.ca/cdn/shop/files/IMG_0126.jpg?v=1686321240&width=800' },
      { id: '5', name: 'Turkey Breast', orderedQuantity: 1, actualQuantity: 1, price: 14.50, unit: 'kg', confirmed: null, image: 'https://jmbutcher.mt/wp-content/uploads/2020/05/Turkey-Breast.jpg' },
    ],
    'ORD-2024-012': [
      { id: '1', name: 'Duck Breast', orderedQuantity: 1, actualQuantity: 1, price: 22.00, unit: 'kg', confirmed: null, image: 'https://www.countrystylemeats.co.uk/wp-content/uploads/2022/05/duck-breast-jpg.webp' },
      { id: '2', name: 'Organic Chicken Breast', orderedQuantity: 1, actualQuantity: 1, price: 12.99, unit: 'kg', confirmed: null, image: 'https://butchershoppeteams.com/cdn/shop/products/butcher-shoppe-direct-boneless-skinless-chicken-breasts-15517883433043_1080x_266ae294-f803-4ef2-8308-0bc060f54d12.webp?v=1680630694' },
      { id: '3', name: 'Fresh Salmon Fillet', orderedQuantity: 1, actualQuantity: 1, price: 24.99, unit: 'kg', confirmed: null, image: 'https://meat4you.ch/media/catalog/product/cache/1e5ed9cbca70cb1b2ba6633fbe65aac9/b/i/bio-lachsfilet-mit-haut-meat4you_24a1909.jpg' },
    ],
    'ORD-2024-013': [
      { id: '1', name: 'Ribeye Steak', orderedQuantity: 2, actualQuantity: 2, price: 28.99, unit: 'kg', confirmed: null, image: 'https://embed.widencdn.net/img/beef/ng96sbyljl/800x600px/Ribeye%20Steak_Lip-on.psd?keep=c&u=7fueml' },
      { id: '2', name: 'Ground Beef', orderedQuantity: 1, actualQuantity: 1, price: 15.50, unit: 'kg', confirmed: null, image: 'https://heatherlea.ca/wp-content/uploads/2022/12/DSC_0760-scaled.jpg' },
      { id: '3', name: 'Pork Tenderloin', orderedQuantity: 1, actualQuantity: 1, price: 16.99, unit: 'kg', confirmed: null, image: 'https://cdn.woodwardmeats.com/media/product/1_Pork-Tenderloin.jpg' },
      { id: '4', name: 'Lamb Chops', orderedQuantity: 1, actualQuantity: 1, price: 32.00, unit: 'kg', confirmed: null, image: 'https://thebutchery.ca/cdn/shop/files/IMG_0126.jpg?v=1686321240&width=800' },
    ],
  };

  return itemsMap[orderCode] || [
    { id: '1', name: 'Sample Product A', orderedQuantity: 2, actualQuantity: 2, price: 29.99, unit: 'kg', confirmed: null, image: 'figma:asset/3c867424c3791bfcc1f02947243b24a416a57b37.png' },
    { id: '2', name: 'Sample Product B', orderedQuantity: 1, actualQuantity: 1, price: 49.99, unit: 'kg', confirmed: null, image: 'figma:asset/3c867424c3791bfcc1f02947243b24a416a57b37.png' },
    { id: '3', name: 'Sample Product C', orderedQuantity: 1.5, actualQuantity: 1.5, price: 19.99, unit: 'kg', confirmed: null, image: 'figma:asset/3c867424c3791bfcc1f02947243b24a416a57b37.png' },
  ];
};

// In-memory storage (persists between requests, simulating a database)
let ordersCache = null;
let orderItemsCache = {};

// Function to get current orders (initializes once, then returns cached data)
const getCurrentOrders = () => {
  if (!ordersCache) {
    console.log('📦 Initializing orders cache...');
    ordersCache = generateMockOrders();
  }
  return ordersCache;
};

// Function to get order items (initializes once per order, then returns cached data)
const getOrderItemsCached = (orderId) => {
  if (!orderItemsCache[orderId]) {
    console.log(`📦 Initializing items cache for order ${orderId}...`);
    orderItemsCache[orderId] = generateOrderItems(orderId);
  }
  return orderItemsCache[orderId];
};

// API Routes

// GET /api/orders - Fetch orders with optional date filtering
app.get('/api/orders', (req, res) => {
  // Regenerate orders to ensure dates are always current
  const orders = getCurrentOrders();
  let filteredOrders = [...orders];

  // Filter by date range if provided
  if (req.query.startDate || req.query.endDate) {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.deliveryDate);
      if (startDate && orderDate < startDate) return false;
      if (endDate && orderDate > endDate) return false;
      return true;
    });
  }

  res.json(filteredOrders);
});

// GET /api/orders/:id - Fetch a single order
app.get('/api/orders/:id', (req, res) => {
  const orders = getCurrentOrders();
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  res.json(order);
});

// GET /api/orders/:id/items - Fetch order items
app.get('/api/orders/:id/items', (req, res) => {
  const orders = getCurrentOrders();
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  // Get items from cache or generate them
  if (!orderItemsCache[req.params.id]) {
    orderItemsCache[req.params.id] = getOrderItems(order.orderCode);
  }

  res.json(orderItemsCache[req.params.id]);
});

// PATCH /api/orders/:id/status - Update order status
app.patch('/api/orders/:id/status', (req, res) => {
  const orders = getCurrentOrders();
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  const { status } = req.body;
  if (!['pending', 'confirmed', 'processing', 'ready'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  // Update the order in the cache (this persists the change)
  order.status = status;
  console.log(`📝 Updated order ${order.id} status to ${status}`);
  res.json(order);
});

// PATCH /api/orders/:orderId/items/:itemId - Update item quantity
app.patch('/api/orders/:orderId/items/:itemId', (req, res) => {
  const orders = getCurrentOrders();
  const order = orders.find(o => o.id === req.params.orderId);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (!orderItemsCache[req.params.orderId]) {
    orderItemsCache[req.params.orderId] = getOrderItems(order.orderCode);
  }

  const item = orderItemsCache[req.params.orderId].find(i => i.id === req.params.itemId);
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  const { actualQuantity } = req.body;
  if (typeof actualQuantity !== 'number' || actualQuantity < 0) {
    return res.status(400).json({ message: 'Invalid quantity' });
  }

  item.actualQuantity = actualQuantity;
  res.json(item);
});

// PATCH /api/orders/:orderId/items/:itemId/confirm - Confirm or deny item
app.patch('/api/orders/:orderId/items/:itemId/confirm', (req, res) => {
  const orders = getCurrentOrders();
  const order = orders.find(o => o.id === req.params.orderId);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (!orderItemsCache[req.params.orderId]) {
    orderItemsCache[req.params.orderId] = getOrderItems(order.orderCode);
  }

  const item = orderItemsCache[req.params.orderId].find(i => i.id === req.params.itemId);
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  const { confirmed } = req.body;
  // Allow null to revert confirmation
  if (confirmed !== null && typeof confirmed !== 'boolean') {
    return res.status(400).json({ message: 'Invalid confirmation value' });
  }

  item.confirmed = confirmed;
  res.json(item);
});

// PATCH /api/orders/:id - Save all changes (bulk update)
app.patch('/api/orders/:id', (req, res) => {
  const orders = getCurrentOrders();
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  const { items, status } = req.body;
  console.log(`📝 Bulk update for order ${order.id}:`, { status, itemsCount: items?.length });

  // Update status if provided
  if (status && ['pending', 'confirmed', 'processing', 'ready'].includes(status)) {
    console.log(`📝 Updating order ${order.id} status from ${order.status} to ${status}`);
    order.status = status;
  }

  // Update items if provided
  if (items && Array.isArray(items)) {
    if (!orderItemsCache[req.params.id]) {
      orderItemsCache[req.params.id] = getOrderItems(order.orderCode);
    }

    items.forEach(updatedItem => {
      const item = orderItemsCache[req.params.id].find(i => i.id === updatedItem.id);
      if (item) {
        if (updatedItem.actualQuantity !== undefined) {
          item.actualQuantity = updatedItem.actualQuantity;
        }
        if (updatedItem.confirmed !== undefined) {
          item.confirmed = updatedItem.confirmed;
        }
      }
    });
  }

  console.log(`✅ Order ${order.id} saved with status: ${order.status}`);
  res.json({
    order,
    items: orderItemsCache[req.params.id] || getOrderItems(order.orderCode),
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mock API server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock API server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
});
