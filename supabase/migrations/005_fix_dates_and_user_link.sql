-- Migration 005: Fix seed data dates and properly link user to auth
-- Run this in Supabase SQL Editor

-- ============================================================================
-- STEP 1: UPDATE SEED DATA DELIVERY DATES TO CURRENT DATE RANGE
-- ============================================================================

UPDATE orders SET delivery_date = CURRENT_DATE WHERE order_code = 'ORD-2024-001';
UPDATE orders SET delivery_date = CURRENT_DATE WHERE order_code = 'ORD-2024-002';
UPDATE orders SET delivery_date = CURRENT_DATE WHERE order_code = 'ORD-2024-003';
UPDATE orders SET delivery_date = CURRENT_DATE + INTERVAL '1 day' WHERE order_code = 'ORD-2024-004';
UPDATE orders SET delivery_date = CURRENT_DATE + INTERVAL '1 day' WHERE order_code = 'ORD-2024-005';
UPDATE orders SET delivery_date = CURRENT_DATE + INTERVAL '2 days' WHERE order_code = 'ORD-2024-006';
UPDATE orders SET delivery_date = CURRENT_DATE + INTERVAL '2 days' WHERE order_code = 'ORD-2024-007';
UPDATE orders SET delivery_date = CURRENT_DATE + INTERVAL '3 days' WHERE order_code = 'ORD-2024-008';
UPDATE orders SET delivery_date = CURRENT_DATE + INTERVAL '3 days' WHERE order_code = 'ORD-2024-009';
UPDATE orders SET delivery_date = CURRENT_DATE + INTERVAL '3 days' WHERE order_code = 'ORD-2024-010';
UPDATE orders SET delivery_date = CURRENT_DATE + INTERVAL '4 days' WHERE order_code = 'ORD-2024-011';
UPDATE orders SET delivery_date = CURRENT_DATE + INTERVAL '4 days' WHERE order_code = 'ORD-2024-012';
UPDATE orders SET delivery_date = CURRENT_DATE + INTERVAL '4 days' WHERE order_code = 'ORD-2024-013';

-- ============================================================================
-- STEP 2: PROPERLY LINK vasbence98@gmail.com TO auth.users
-- ============================================================================

DO $link_user$
DECLARE
  auth_user_id UUID;
BEGIN
  SELECT id INTO auth_user_id 
  FROM auth.users 
  WHERE email = 'vasbence98@gmail.com';
  
  IF auth_user_id IS NULL THEN
    RAISE NOTICE 'User not found in auth.users';
    RETURN;
  END IF;
  
  DELETE FROM users WHERE email = 'vasbence98@gmail.com';
  
  INSERT INTO users (id, email, name, role, store_id)
  VALUES (
    auth_user_id,
    'vasbence98@gmail.com',
    'Bence Vas',
    'owner',
    '00000000-0000-0000-0000-000000000001'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = 'Bence Vas',
    role = 'owner',
    store_id = '00000000-0000-0000-0000-000000000001';
  
  INSERT INTO super_admins (user_id, role)
  VALUES (auth_user_id, 'super_admin')
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Confirm email (only email_confirmed_at, not confirmed_at)
  UPDATE auth.users 
  SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
  WHERE id = auth_user_id;
END $link_user$;

-- ============================================================================
-- STEP 3: ENSURE ALL ORDERS HAVE store_id
-- ============================================================================

UPDATE orders 
SET store_id = '00000000-0000-0000-0000-000000000001'
WHERE store_id IS NULL;

-- ============================================================================
-- STEP 4: FIX RLS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view orders" ON orders;
DROP POLICY IF EXISTS "Users can insert orders" ON orders;
DROP POLICY IF EXISTS "Users can view order_items" ON order_items;
DROP POLICY IF EXISTS "Users can insert order_items" ON order_items;
DROP POLICY IF EXISTS "Authenticated can select orders" ON orders;
DROP POLICY IF EXISTS "Authenticated can insert orders" ON orders;
DROP POLICY IF EXISTS "Authenticated can update orders" ON orders;
DROP POLICY IF EXISTS "Authenticated can delete orders" ON orders;
DROP POLICY IF EXISTS "Authenticated can select order_items" ON order_items;
DROP POLICY IF EXISTS "Authenticated can insert order_items" ON order_items;
DROP POLICY IF EXISTS "Authenticated can update order_items" ON order_items;
DROP POLICY IF EXISTS "Authenticated can delete order_items" ON order_items;

CREATE POLICY "Authenticated can select orders"
  ON orders FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can insert orders"
  ON orders FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update orders"
  ON orders FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can delete orders"
  ON orders FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "Authenticated can select order_items"
  ON order_items FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can insert order_items"
  ON order_items FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update order_items"
  ON order_items FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can delete order_items"
  ON order_items FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'owner')
  );

-- ============================================================================
-- DONE! Sign out and sign back in to see the changes.
-- ============================================================================
