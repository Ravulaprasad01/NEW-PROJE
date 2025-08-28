import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Types for our inventory system
export interface InventoryRequest {
  id: string
  user_email: string
  user_name: string
  total_amount: number
  currency: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  created_at: string
  updated_at: string
  invoice_number?: string
  user_notes?: string
  admin_comment?: string // Add new field for admin-specific notes
  due_date?: string
  delivery_name?: string; // New field for delivery contact name
  delivery_address_lines?: string[]; // New field for delivery address
  items?: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    currency: string;
    currencySymbol: string;
  }>;
}

export interface InventoryRequestItem {
  request_id: string; // Foreign key to link to InventoryRequest
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface Product {
  id: string
  name: string
  price: number
  currency: string
  description?: string
  available_quantity: number
} 