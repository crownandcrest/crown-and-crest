-- Disable RLS on orders and order_items tables
-- This allows the service role key to insert orders from the API endpoint

ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- Optional: You can keep RLS enabled on products if you prefer
-- and create a policy that allows public read access:
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Public read access" ON products
--   FOR SELECT USING (true);
