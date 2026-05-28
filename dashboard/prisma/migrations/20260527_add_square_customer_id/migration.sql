-- Add square_customer_id to clients table for Square POS sync
ALTER TABLE clients ADD COLUMN IF NOT EXISTS square_customer_id VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_clients_square_customer_id ON clients(square_customer_id);
