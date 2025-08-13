-- Drop existing permissive RLS policies that expose customer data
DROP POLICY IF EXISTS "Enable read access for all users" ON inventory_requests;
DROP POLICY IF EXISTS "Enable insert for all users" ON inventory_requests;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON inventory_requests;

-- Create secure RLS policies that protect customer personal information
CREATE POLICY "Users can view only their own requests" 
ON inventory_requests 
FOR SELECT 
USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can insert their own requests" 
ON inventory_requests 
FOR INSERT 
WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can update their own requests" 
ON inventory_requests 
FOR UPDATE 
USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Temporary admin policy - Replace with proper role-based access when auth is implemented
CREATE POLICY "Admin can view all requests (temporary)" 
ON inventory_requests 
FOR ALL 
USING (
  current_setting('request.jwt.claims', true)::json->>'email' = 'irene.gustobrands@gmail.com'
  OR 
  current_setting('request.jwt.claims', true)::json->>'email' = 'admin@gustobrands.com'
);