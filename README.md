
  # Vendor Orders Kanban View

  This is a code bundle for Vendor Orders Kanban View. The original project is available at https://www.figma.com/design/gQHswhOTDcCrLmyl4ginEp/Vendor-Orders-Kanban-View.

  ## Running the code

  ### Installation

  Run `npm i` to install the dependencies.

  ### Running with Mock Server

  A mock server is included with all the original dummy data. To run both the frontend and mock server together:

  ```bash
  npm run dev:all
  ```

  This will start:
  - Mock API server on `http://localhost:3000`
  - Frontend dev server on `http://localhost:5173`

  Or run them separately:

  ```bash
  # Terminal 1: Start the mock server
  npm run server

  # Terminal 2: Start the frontend
  npm run dev
  ```

  ### Running with Your Own Backend

  If you have your own backend API, set the `VITE_API_BASE_URL` environment variable:

  ```bash
  # Create a .env file
  VITE_API_BASE_URL=http://your-api-url.com/api
  npm run dev
  ```

  ## Backend API Integration

  This application now fetches data from a backend API instead of using mock data. 

  ### Configuration

  Set the `VITE_API_BASE_URL` environment variable to point to your backend API:

  ```bash
  # Create a .env file in the root directory
  VITE_API_BASE_URL=http://localhost:3000/api
  ```

  If not set, it defaults to `http://localhost:3000/api`.

  ### API Endpoints

  The application expects the following API endpoints:

  #### Orders
  - `GET /api/orders?startDate={isoDate}&endDate={isoDate}` - Fetch orders for a date range
  - `GET /api/orders/:id` - Fetch a single order by ID
  - `PATCH /api/orders/:id/status` - Update order status
  - `PATCH /api/orders/:id` - Save all changes for an order (bulk update)

  #### Order Items
  - `GET /api/orders/:id/items` - Fetch items for an order
  - `PATCH /api/orders/:orderId/items/:itemId` - Update item quantity
  - `PATCH /api/orders/:orderId/items/:itemId/confirm` - Confirm or deny an item

  ### Data Models

  #### Order
  ```typescript
  {
    id: string;
    orderCode: string;
    customerName: string;
    itemCount: number;
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'processing' | 'ready';
    deliveryDate: string; // ISO date string
  }
  ```

  #### OrderItem
  ```typescript
  {
    id: string;
    name: string;
    orderedQuantity: number;
    actualQuantity: number;
    price: number;
    unit: string;
    confirmed: boolean | null; // null = pending, true = confirmed, false = denied
    image: string;
  }
  ```

  ### Features

  - ✅ Fetches orders from backend API
  - ✅ Fetches order items from backend API
  - ✅ Updates order status in real-time
  - ✅ Updates item quantities and confirmations
  - ✅ Loading states and error handling
  - ✅ Optimistic UI updates

  ## Mock Server

  The mock server (`server/server.js`) provides a complete API implementation with all the original dummy data. It includes:

  - All 13 mock orders with dates spanning 5 days
  - Order items for each order
  - Full CRUD operations for orders and items
  - In-memory storage (data resets on server restart)

  The server runs on `http://localhost:3000` and provides all the endpoints documented above.
  