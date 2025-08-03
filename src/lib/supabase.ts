import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our inventory system
export interface InventoryRequest {
  id: string
  user_email: string
  user_name: string
  items: InventoryItem[]
  total_amount: number
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  created_at: string
  updated_at: string
  invoice_number?: string
  admin_notes?: string
}

export interface InventoryItem {
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