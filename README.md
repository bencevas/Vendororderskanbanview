# Vendor Orders Kanban View

A vendor order management application for local food businesses. This app allows vendors to view, manage, and fulfill orders from webshops, with features for batch picking and real-time order updates.

## Features

- **Kanban Board**: View orders organized by delivery date in a 5-day scrollable view
- **Order Details Modal**: View and edit individual order items, update quantities, confirm/deny items
- **Batch Pick View**: Group identical items across orders for efficient batch picking
- **Real-time Updates**: Orders sync automatically across all connected clients (with Supabase)
- **Test Payload Generator**: Create test orders using Shopify webhook format
- **Authentication**: Role-based access control (Super Admin, Owner, Member)

## Quick Start

### Installation

```bash
npm install
```

### Running with Mock Server (Development)

```bash
# Run both frontend and mock server
npm run dev:all

# Or run separately:
npm run server  # Terminal 1: Mock API on http://localhost:3000
npm run dev     # Terminal 2: Frontend on http://localhost:5173
```

### Running with Supabase (Production)

1. Create a Supabase project at [supabase.com](https://supabase.com)

2. Run the database migrations in Supabase SQL Editor:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_seed_data.sql` (optional test data)
   - `supabase/migrations/003_rls_policies.sql`

3. Create `.env.local` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Run the frontend:
   ```bash
   npm run dev
   ```

## Architecture

### Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend Options**:
  - Mock Server (Express.js) for development
  - Supabase (PostgreSQL) for production
- **UI Design**: Generated with [ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)

### Database Schema

```
super_admins     users              orders             order_items
------------     -----              ------             -----------
id (PK)          id (PK)            id (PK)            id (PK)
user_id (FK)     email              order_code         order_id (FK)
role             name               shopify_order_id   product_name
created_at       role               customer_name      product_sku
                 store_id           customer_email     ordered_quantity
                 created_at         total_amount       actual_quantity
                                    status             unit
                                    delivery_date      price
                                    vendor_id (FK)     confirmed
                                    created_at         image_url
```

### API Endpoints

#### Orders
- `GET /api/orders?startDate=&endDate=` - Fetch orders for date range
- `GET /api/orders/:id` - Fetch single order
- `PATCH /api/orders/:id/status` - Update order status
- `PATCH /api/orders/:id` - Bulk update order and items

#### Order Items
- `GET /api/orders/:id/items` - Fetch order items
- `PATCH /api/orders/:orderId/items/:itemId` - Update item quantity
- `PATCH /api/orders/:orderId/items/:itemId/confirm` - Confirm/deny item

## Test Payload Generator

Click the "+ Test Order" button in the header to generate test orders using Shopify webhook format. This allows you to:

- Create orders with sample products and customers
- Set custom delivery dates
- Preview the Shopify-formatted JSON payload
- Submit directly to Supabase (when configured)

### Shopify Webhook Integration

Deploy the Edge Function to receive real Shopify webhooks:

```bash
supabase functions deploy shopify-webhook
```

Configure your Shopify store to send `orders/create` webhooks to:
```
https://your-project.supabase.co/functions/v1/shopify-webhook
```

## Design System

The app uses a custom design system generated with ui-ux-pro-max-skill:

- **Primary Color**: #2563EB (Blue)
- **CTA Color**: #F97316 (Orange)
- **Typography**: Playfair Display SC / Karla
- **Style**: Vibrant & Block-based

See `design-system/vendororders/MASTER.md` for full design tokens.

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── auth/               # Login form
│   │   ├── test-generator/     # Test payload generator
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── batch-view.tsx      # Batch pick view
│   │   ├── order-card.tsx      # Order card component
│   │   └── order-details-modal.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx     # Authentication state
│   │   └── OrdersContext.tsx   # Orders state
│   ├── hooks/
│   │   └── useRealtimeOrders.ts # Supabase realtime hook
│   ├── services/
│   │   ├── api.ts              # API functions
│   │   └── supabase.ts         # Supabase client
│   ├── types/
│   │   └── database.ts         # TypeScript types
│   └── App.tsx
├── styles/
│   └── tailwind.css
server/
└── server.js                   # Mock API server
supabase/
├── functions/
│   └── shopify-webhook/        # Edge function for webhooks
└── migrations/
    ├── 001_initial_schema.sql
    ├── 002_seed_data.sql
    └── 003_rls_policies.sql
design-system/
└── vendororders/
    └── MASTER.md               # Design tokens
```

## Scripts

- `npm run dev` - Start Vite dev server
- `npm run server` - Start mock API server
- `npm run dev:all` - Start both frontend and mock server
- `npm run build` - Build for production

## License

MIT
