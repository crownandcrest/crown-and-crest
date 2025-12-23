-- Add shipping address and phone number to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_address JSONB,
ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Create an index on phone for searching
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
