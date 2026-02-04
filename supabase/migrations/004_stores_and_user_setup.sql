-- Migration 004: Stores table and user setup
-- Run this in Supabase SQL Editor

-- ============================================================================
-- STEP 1: DISABLE EMAIL CONFIRMATION (Run this first!)
-- ============================================================================
-- Go to Supabase Dashboard -> Authentication -> Providers -> Email
-- Toggle OFF "Confirm email" option
-- OR run this to auto-confirm the user:

-- First, let's confirm any unconfirmed users (including vasbence98@gmail.com)
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- ============================================================================
-- STEP 2: CREATE STORES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE, -- URL-friendly identifier
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  shopify_store_url TEXT, -- e.g., mystore.myshopify.com
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);
CREATE INDEX IF NOT EXISTS idx_stores_is_active ON stores(is_active);

-- Enable RLS on stores
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- RLS policies for stores
CREATE POLICY "Authenticated users can view active stores"
  ON stores FOR SELECT
  USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "Super admins can manage stores"
  ON stores FOR ALL
  USING (EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid()));

-- Grant permissions
GRANT SELECT ON stores TO authenticated;
GRANT ALL ON stores TO authenticated;

-- ============================================================================
-- STEP 3: ADD STORE_ID TO ORDERS TABLE
-- ============================================================================

-- Add store_id column to orders if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'store_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN store_id UUID REFERENCES stores(id) ON DELETE SET NULL;
    CREATE INDEX idx_orders_store_id ON orders(store_id);
  END IF;
END $$;

-- ============================================================================
-- STEP 4: CREATE EXAMPLE STORE
-- ============================================================================

INSERT INTO stores (id, name, slug, description, address, phone, email, shopify_store_url)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo Butcher Shop',
  'demo-butcher-shop',
  'A premium local butcher shop specializing in organic meats',
  '123 Main Street, Budapest, Hungary',
  '+36 1 234 5678',
  'orders@demobutchershop.com',
  'demo-butcher-shop.myshopify.com'
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- STEP 5: LINK ALL EXISTING ORDERS TO THE EXAMPLE STORE
-- ============================================================================

UPDATE orders 
SET store_id = '00000000-0000-0000-0000-000000000001'
WHERE store_id IS NULL;

-- ============================================================================
-- STEP 6: ADD BENCE VAS AS USER AND SUPER ADMIN
-- ============================================================================

-- First, insert into the users table
INSERT INTO users (id, email, name, role, store_id)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'vasbence98@gmail.com',
  'Bence Vas',
  'owner',
  '00000000-0000-0000-0000-000000000001'
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  store_id = EXCLUDED.store_id;

-- Now we need to link to auth.users - get the auth user id
-- This adds the user to super_admins once they've signed up
DO $$
DECLARE
  auth_user_id UUID;
BEGIN
  -- Find the auth user by email
  SELECT id INTO auth_user_id 
  FROM auth.users 
  WHERE email = 'vasbence98@gmail.com';
  
  -- If found, add to super_admins
  IF auth_user_id IS NOT NULL THEN
    INSERT INTO super_admins (user_id, role)
    VALUES (auth_user_id, 'super_admin')
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE 'Added user % to super_admins', auth_user_id;
  ELSE
    RAISE NOTICE 'User vasbence98@gmail.com not found in auth.users. Please sign up first.';
  END IF;
END $$;

-- ============================================================================
-- STEP 7: UPDATE RLS POLICIES TO INCLUDE STORE ACCESS
-- ============================================================================

-- Allow users to view orders for their store
DROP POLICY IF EXISTS "Authenticated users can view orders" ON orders;
CREATE POLICY "Users can view orders"
  ON orders FOR SELECT
  USING (
    auth.role() = 'authenticated' 
    OR EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
  );

-- Allow store owners/members to insert orders for their store
DROP POLICY IF EXISTS "Owners can insert orders" ON orders;
CREATE POLICY "Users can insert orders"
  ON orders FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    OR EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
  );

-- Same for order_items
DROP POLICY IF EXISTS "Authenticated users can view order_items" ON order_items;
CREATE POLICY "Users can view order_items"
  ON order_items FOR SELECT
  USING (
    auth.role() = 'authenticated'
    OR EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Owners can insert order_items" ON order_items;
CREATE POLICY "Users can insert order_items"
  ON order_items FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    OR EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
  );

-- ============================================================================
-- VERIFICATION QUERIES (Run these to verify setup)
-- ============================================================================

-- Check stores table
-- SELECT * FROM stores;

-- Check users table  
-- SELECT * FROM users;

-- Check super_admins
-- SELECT sa.*, au.email FROM super_admins sa JOIN auth.users au ON sa.user_id = au.id;

-- Check orders now have store_id
-- SELECT id, order_code, store_id FROM orders LIMIT 5;

-- ============================================================================
-- DONE! Now:
-- 1. Go to Authentication -> Providers -> Email -> Disable "Confirm email"
-- 2. Sign out and sign back in with vasbence98@gmail.com
-- 3. You should now have full access as a super admin
-- ============================================================================
