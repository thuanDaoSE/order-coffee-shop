-- Add address column to users table if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS address VARCHAR(255);

-- Ensure vouchers table has correct columns
ALTER TABLE vouchers
ADD COLUMN IF NOT EXISTS code VARCHAR(50) NOT NULL UNIQUE,
ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20) NOT NULL,
ADD COLUMN IF NOT EXISTS discount_value DECIMAL(10,2) NOT NULL;

ALTER TABLE orders ADD COLUMN delivery_address_id BIGINT;