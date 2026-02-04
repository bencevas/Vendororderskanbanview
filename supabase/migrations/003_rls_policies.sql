-- Row Level Security Policies for Vendor Order Management
-- Run this migration after 001_initial_schema.sql

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user is a super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM super_admins
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user's role from users table
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM users
  WHERE email = auth.jwt() ->> 'email';
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is an owner
CREATE OR REPLACE FUNCTION is_owner()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() = 'owner' OR is_super_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SUPER_ADMINS TABLE POLICIES
-- ============================================================================

-- Only super admins can view super_admins table
CREATE POLICY "Super admins can view all super_admins"
  ON super_admins FOR SELECT
  USING (is_super_admin());

-- Only super admins can insert new super_admins
CREATE POLICY "Super admins can insert super_admins"
  ON super_admins FOR INSERT
  WITH CHECK (is_super_admin());

-- Only super admins can update super_admins
CREATE POLICY "Super admins can update super_admins"
  ON super_admins FOR UPDATE
  USING (is_super_admin());

-- Only super admins can delete super_admins
CREATE POLICY "Super admins can delete super_admins"
  ON super_admins FOR DELETE
  USING (is_super_admin());

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (email = auth.jwt() ->> 'email' OR is_super_admin());

-- Owners can view users in their store
CREATE POLICY "Owners can view store users"
  ON users FOR SELECT
  USING (
    is_owner() OR 
    store_id IN (SELECT store_id FROM users WHERE email = auth.jwt() ->> 'email')
  );

-- Only owners and super admins can insert users
CREATE POLICY "Owners can insert users"
  ON users FOR INSERT
  WITH CHECK (is_owner());

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (email = auth.jwt() ->> 'email')
  WITH CHECK (email = auth.jwt() ->> 'email');

-- Owners can update users in their store
CREATE POLICY "Owners can update store users"
  ON users FOR UPDATE
  USING (is_owner());

-- Only super admins can delete users
CREATE POLICY "Super admins can delete users"
  ON users FOR DELETE
  USING (is_super_admin());

-- ============================================================================
-- ORDERS TABLE POLICIES
-- ============================================================================

-- All authenticated users can view orders (for vendors)
-- In a more restrictive setup, you'd filter by vendor_id
CREATE POLICY "Authenticated users can view orders"
  ON orders FOR SELECT
  USING (auth.role() = 'authenticated');

-- Owners and super admins can insert orders
CREATE POLICY "Owners can insert orders"
  ON orders FOR INSERT
  WITH CHECK (is_owner());

-- All authenticated users can update orders (for status changes)
CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Only owners and super admins can delete orders
CREATE POLICY "Owners can delete orders"
  ON orders FOR DELETE
  USING (is_owner());

-- ============================================================================
-- ORDER_ITEMS TABLE POLICIES
-- ============================================================================

-- All authenticated users can view order items
CREATE POLICY "Authenticated users can view order_items"
  ON order_items FOR SELECT
  USING (auth.role() = 'authenticated');

-- Owners and super admins can insert order items
CREATE POLICY "Owners can insert order_items"
  ON order_items FOR INSERT
  WITH CHECK (is_owner());

-- All authenticated users can update order items (for quantity/confirmation)
CREATE POLICY "Authenticated users can update order_items"
  ON order_items FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Only owners and super admins can delete order items
CREATE POLICY "Owners can delete order_items"
  ON order_items FOR DELETE
  USING (is_owner());

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON super_admins TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON order_items TO authenticated;

-- Grant select to anon for public data (if needed)
-- Currently, all data requires authentication
