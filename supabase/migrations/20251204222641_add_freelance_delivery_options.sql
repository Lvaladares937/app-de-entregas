/*
  # Add Freelance Delivery System

  1. Changes to `stores` table
    - Add `hiring_delivery` (boolean) - indica se a loja está contratando motoboys
    - Add `daily_rate` (decimal) - taxa fixa por dia de trabalho
    - Add `delivery_rate` (decimal) - taxa por entrega realizada

  2. New Table `store_deliveries`
    - Links delivery workers to stores they work for
    - Tracks active/inactive relationships
    - Records start date and status

  3. Security
    - Store owners can manage their delivery settings
    - Delivery workers can view available opportunities
    - Delivery workers can apply to work for stores
*/

-- Add freelance delivery columns to stores table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'hiring_delivery'
  ) THEN
    ALTER TABLE stores ADD COLUMN hiring_delivery boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'daily_rate'
  ) THEN
    ALTER TABLE stores ADD COLUMN daily_rate decimal(10, 2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stores' AND column_name = 'delivery_rate'
  ) THEN
    ALTER TABLE stores ADD COLUMN delivery_rate decimal(10, 2) DEFAULT 0;
  END IF;
END $$;

-- Create store_deliveries table to track delivery worker relationships
CREATE TABLE IF NOT EXISTS store_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores NOT NULL,
  delivery_id uuid REFERENCES auth.users NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(store_id, delivery_id)
);

ALTER TABLE store_deliveries ENABLE ROW LEVEL SECURITY;

-- Policies for store_deliveries
DROP POLICY IF EXISTS "stores_manage_deliveries" ON store_deliveries;
DROP POLICY IF EXISTS "delivery_view_own_contracts" ON store_deliveries;
DROP POLICY IF EXISTS "delivery_apply_to_stores" ON store_deliveries;
DROP POLICY IF EXISTS "delivery_view_available_stores" ON store_deliveries;

CREATE POLICY "stores_manage_deliveries"
  ON store_deliveries FOR ALL
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

CREATE POLICY "delivery_view_own_contracts"
  ON store_deliveries FOR SELECT
  TO authenticated
  USING (delivery_id = auth.uid());

CREATE POLICY "delivery_apply_to_stores"
  ON store_deliveries FOR INSERT
  TO authenticated
  WITH CHECK (delivery_id = auth.uid());

CREATE POLICY "delivery_view_available_stores"
  ON store_deliveries FOR SELECT
  TO authenticated
  USING (true);

-- Update stores policies to allow deliveries to view hiring stores
DROP POLICY IF EXISTS "delivery_view_hiring_stores" ON stores;

CREATE POLICY "delivery_view_hiring_stores"
  ON stores FOR SELECT
  TO authenticated
  USING (hiring_delivery = true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_store_deliveries_store_id ON store_deliveries(store_id);
CREATE INDEX IF NOT EXISTS idx_store_deliveries_delivery_id ON store_deliveries(delivery_id);
CREATE INDEX IF NOT EXISTS idx_stores_hiring ON stores(hiring_delivery) WHERE hiring_delivery = true;
