import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role (for API routes)
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Database types (based on schema.sql)
export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          address: Record<string, unknown> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          phone?: string | null
          address?: Record<string, unknown> | null
        }
        Update: {
          email?: string
          name?: string
          phone?: string | null
          address?: Record<string, unknown> | null
        }
      }
      products: {
        Row: {
          id: string
          supplier_id: string | null
          name: string
          description: string | null
          price: number
          original_price: number | null
          images: string[]
          category_id: string | null
          variants: Record<string, unknown> | null
          stock: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          supplier_id?: string | null
          name: string
          description?: string | null
          price: number
          original_price?: number | null
          images?: string[]
          category_id?: string | null
          variants?: Record<string, unknown> | null
          stock?: number
          is_active?: boolean
        }
        Update: {
          name?: string
          description?: string | null
          price?: number
          original_price?: number | null
          images?: string[]
          category_id?: string | null
          variants?: Record<string, unknown> | null
          stock?: number
          is_active?: boolean
        }
      }
      orders: {
        Row: {
          id: string
          customer_id: string
          status: string
          subtotal: number
          shipping_cost: number
          tax: number
          total: number
          shipping_address: Record<string, unknown>
          billing_address: Record<string, unknown>
          payment_method: string | null
          payment_status: string
          tracking_number: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          status?: string
          subtotal: number
          shipping_cost?: number
          tax?: number
          total: number
          shipping_address: Record<string, unknown>
          billing_address: Record<string, unknown>
          payment_method?: string | null
          payment_status?: string
          tracking_number?: string | null
          notes?: string | null
        }
        Update: {
          status?: string
          subtotal?: number
          shipping_cost?: number
          tax?: number
          total?: number
          shipping_address?: Record<string, unknown>
          billing_address?: Record<string, unknown>
          payment_method?: string | null
          payment_status?: string
          tracking_number?: string | null
          notes?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image: string | null
          parent_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image?: string | null
          parent_id?: string | null
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          image?: string | null
          parent_id?: string | null
        }
      }
    }
  }
}
