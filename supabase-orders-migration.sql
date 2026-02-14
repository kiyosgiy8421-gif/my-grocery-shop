-- Run this in Supabase SQL Editor to update your 'orders' table

-- 1. Add columns if they don't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_area TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_charge INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Authenticated users can insert orders" ON orders;
DROP POLICY IF EXISTS "Allow anonymous insert" ON orders;

-- 4. Policy: Allow anyone to insert orders
CREATE POLICY "Allow anyone to insert orders"
  ON orders
  FOR INSERT
  WITH CHECK (true);

-- 5. Policy: Users can see only their own orders
CREATE POLICY "Users can view own orders"
  ON orders
  FOR SELECT
  USING (user_id = auth.uid());
