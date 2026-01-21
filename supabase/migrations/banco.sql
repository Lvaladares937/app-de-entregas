/*
  # Rumbrov Delivery - Database Core Structure
  
  Apenas tabelas básicas. As colunas de freelance e políticas RLS 
  estão nos arquivos de migração separados.
*/

-- ============================================
-- STORES TABLE (SEM colunas freelance aqui)
-- ============================================
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  description text,
  address text,
  phone text,
  is_active boolean DEFAULT true,
  menu_link_token text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores NOT NULL,
  name text NOT NULL,
  description text,
  price decimal(10, 2) NOT NULL,
  image_url text,
  category text,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ORDERS TABLE (SEM colunas guest checkout aqui)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores NOT NULL,
  customer_id uuid REFERENCES auth.users,
  delivery_id uuid REFERENCES auth.users,
  status text NOT NULL DEFAULT 'pending',
  total_amount decimal(10, 2) NOT NULL,
  delivery_fee decimal(10, 2) DEFAULT 0,
  delivery_address text NOT NULL,
  delivery_latitude decimal(10, 8),
  delivery_longitude decimal(11, 8),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ORDER_ITEMS TABLE (SEM colunas de snapshot aqui)
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders NOT NULL,
  product_id uuid REFERENCES products NOT NULL,
  quantity integer NOT NULL,
  unit_price decimal(10, 2) NOT NULL,
  subtotal decimal(10, 2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- NÃO CRIAR store_deliveries AQUI!
-- Esta tabela será criada no 2º arquivo de migração
-- ============================================

-- ============================================
-- INDEXES BÁSICOS
-- ============================================
CREATE INDEX IF NOT EXISTS idx_stores_user_id ON stores(user_id);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_id ON orders(delivery_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);