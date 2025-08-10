-- Create inventory_requests table
CREATE TABLE IF NOT EXISTS inventory_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  items JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invoice_number TEXT,
  admin_notes TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE inventory_requests ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your authentication needs)
CREATE POLICY "Enable read access for all users" ON inventory_requests FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON inventory_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON inventory_requests FOR UPDATE USING (true);

-- Insert some test data
INSERT INTO inventory_requests (user_email, user_name, items, total_amount, status) VALUES
('test@example.com', 'Test User', '[{"product_id": "PKI-20", "product_name": "PKI-20", "quantity": 1, "unit_price": 17000, "total_price": 17000}]', 17000, 'pending'),
('john@example.com', 'John Doe', '[{"product_id": "PKA-20", "product_name": "PKA-20", "quantity": 2, "unit_price": 20000, "total_price": 40000}]', 40000, 'approved'); 