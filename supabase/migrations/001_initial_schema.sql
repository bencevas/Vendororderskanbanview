-- Vendor Order Management - Initial Schema
-- Run this migration in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'ready');
CREATE TYPE user_role AS ENUM ('owner', 'member');

-- Super Admins table (CTO level access)
CREATE TABLE super_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'super_admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Users table (store owners and members)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'member',
  store_id UUID, -- Future: reference to stores table
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_code TEXT NOT NULL UNIQUE,
  shopify_order_id TEXT, -- Original Shopify order ID for reference
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status order_status NOT NULL DEFAULT 'pending',
  order_placed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivery_date DATE NOT NULL,
  vendor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order Items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  ordered_quantity DECIMAL(10,3) NOT NULL,
  actual_quantity DECIMAL(10,3) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  confirmed BOOLEAN, -- null = pending, true = confirmed, false = denied
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Enable Row Level Security
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Comments for documentation
COMMENT ON TABLE super_admins IS 'Super administrators with full system access (CTO level)';
COMMENT ON TABLE users IS 'Store owners and members who manage orders';
COMMENT ON TABLE orders IS 'Customer orders with delivery information';
COMMENT ON TABLE order_items IS 'Line items within each order';
COMMENT ON COLUMN order_items.confirmed IS 'null=pending, true=confirmed, false=denied';
COMMENT ON COLUMN order_items.actual_quantity IS 'The actual picked quantity (may differ from ordered)';
