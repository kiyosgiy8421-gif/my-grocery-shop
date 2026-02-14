-- Run this SQL in your Supabase SQL Editor to create the orders table

CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  delivery_area TEXT,
  delivery_charge DECIMAL(10, 2) DEFAULT 300,
  items JSONB NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- If you already have an orders table, add the new columns:
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_area TEXT;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_charge DECIMAL(10, 2) DEFAULT 300;

-- Enable Row Level Security (optional, for public insert access)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow inserts only when user is authenticated
CREATE POLICY "Authenticated users can insert orders" ON orders
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
