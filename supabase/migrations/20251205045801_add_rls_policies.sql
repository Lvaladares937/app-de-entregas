/*
  # Add RLS Policies for Orders and Order Items

  1. Security Policies
    - Allow anyone (authenticated or not) to create orders and order items
    - Allow authenticated customers to view their own orders
    - Allow store owners to view orders for their stores
    - Allow delivery personnel to view assigned orders
    - Allow anyone to view order items for orders they can access

  2. Notes
    - Policies support guest checkout (no authentication required to create orders)
    - Read access is restricted based on user role and relationship to the order
*/

-- ============================================
-- STORES POLICIES
-- ============================================

DROP POLICY IF EXISTS "Anyone can view active stores" ON stores;
CREATE POLICY "Anyone can view active stores"
  ON stores FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Store owners can view own store" ON stores;
CREATE POLICY "Store owners can view own store"
  ON stores FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Store owners can insert own store" ON stores;
CREATE POLICY "Store owners can insert own store"
  ON stores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Store owners can update own store" ON stores;
CREATE POLICY "Store owners can update own store"
  ON stores FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PRODUCTS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Anyone can view available products" ON products;
CREATE POLICY "Anyone can view available products"
  ON products FOR SELECT
  USING (is_available = true);

DROP POLICY IF EXISTS "Store owners can view own products" ON products;
CREATE POLICY "Store owners can view own products"
  ON products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Store owners can insert own products" ON products;
CREATE POLICY "Store owners can insert own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Store owners can update own products" ON products;
CREATE POLICY "Store owners can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Store owners can delete own products" ON products;
CREATE POLICY "Store owners can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.user_id = auth.uid()
    )
  );

-- ============================================
-- ORDERS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Customers can view own orders" ON orders;
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Store owners can view store orders" ON orders;
CREATE POLICY "Store owners can view store orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = orders.store_id
      AND stores.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Delivery personnel can view assigned orders" ON orders;
CREATE POLICY "Delivery personnel can view assigned orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = delivery_id);

DROP POLICY IF EXISTS "Store owners can update store orders" ON orders;
CREATE POLICY "Store owners can update store orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = orders.store_id
      AND stores.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = orders.store_id
      AND stores.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Delivery personnel can update assigned orders" ON orders;
CREATE POLICY "Delivery personnel can update assigned orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = delivery_id)
  WITH CHECK (auth.uid() = delivery_id);

-- ============================================
-- ORDER_ITEMS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;
CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view accessible order items" ON order_items;
CREATE POLICY "Users can view accessible order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.customer_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM stores
          WHERE stores.id = orders.store_id
          AND stores.user_id = auth.uid()
        )
        OR orders.delivery_id = auth.uid()
      )
    )
  );

-- ============================================
-- STORE_DELIVERIES POLICIES
-- ============================================

DROP POLICY IF EXISTS "Store owners can view delivery requests" ON store_deliveries;
CREATE POLICY "Store owners can view delivery requests"
  ON store_deliveries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = store_deliveries.store_id
      AND stores.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Delivery personnel can view own requests" ON store_deliveries;
CREATE POLICY "Delivery personnel can view own requests"
  ON store_deliveries FOR SELECT
  TO authenticated
  USING (auth.uid() = delivery_id);

DROP POLICY IF EXISTS "Delivery personnel can create requests" ON store_deliveries;
CREATE POLICY "Delivery personnel can create requests"
  ON store_deliveries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = delivery_id);

DROP POLICY IF EXISTS "Store owners can update delivery requests" ON store_deliveries;
CREATE POLICY "Store owners can update delivery requests"
  ON store_deliveries FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = store_deliveries.store_id
      AND stores.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = store_deliveries.store_id
      AND stores.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Delivery personnel can update own requests" ON store_deliveries;
CREATE POLICY "Delivery personnel can update own requests"
  ON store_deliveries FOR UPDATE
  TO authenticated
  USING (auth.uid() = delivery_id)
  WITH CHECK (auth.uid() = delivery_id);
