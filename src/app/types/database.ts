// Database types for Supabase
// These types match the database schema defined in supabase/migrations/

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'ready';
export type UserRole = 'owner' | 'member';
export type Locale = 'en' | 'hu';

export interface Database {
  public: {
    Tables: {
      super_admins: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
        };
      };
      stores: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          address: string | null;
          phone: string | null;
          email: string | null;
          shopify_store_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          shopify_store_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          shopify_store_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: UserRole;
          store_id: string | null;
          locale: Locale;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role?: UserRole;
          store_id?: string | null;
          locale?: Locale;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: UserRole;
          store_id?: string | null;
          locale?: Locale;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_code: string;
          shopify_order_id: string | null;
          customer_name: string;
          customer_email: string | null;
          total_amount: number;
          status: OrderStatus;
          order_placed_at: string;
          delivery_date: string;
          vendor_id: string | null;
          store_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_code: string;
          shopify_order_id?: string | null;
          customer_name: string;
          customer_email?: string | null;
          total_amount?: number;
          status?: OrderStatus;
          order_placed_at?: string;
          delivery_date: string;
          vendor_id?: string | null;
          store_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_code?: string;
          shopify_order_id?: string | null;
          customer_name?: string;
          customer_email?: string | null;
          total_amount?: number;
          status?: OrderStatus;
          order_placed_at?: string;
          delivery_date?: string;
          vendor_id?: string | null;
          store_id?: string | null;
          created_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_name: string;
          product_sku: string | null;
          ordered_quantity: number;
          actual_quantity: number;
          unit: string;
          price: number;
          confirmed: boolean | null;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_name: string;
          product_sku?: string | null;
          ordered_quantity: number;
          actual_quantity?: number;
          unit?: string;
          price?: number;
          confirmed?: boolean | null;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_name?: string;
          product_sku?: string | null;
          ordered_quantity?: number;
          actual_quantity?: number;
          unit?: string;
          price?: number;
          confirmed?: boolean | null;
          image_url?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

// Convenience types for working with the database
export type SuperAdmin = Database['public']['Tables']['super_admins']['Row'];
export type Store = Database['public']['Tables']['stores']['Row'];
export type User = Database['public']['Tables']['users']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];

export type InsertStore = Database['public']['Tables']['stores']['Insert'];
export type InsertOrder = Database['public']['Tables']['orders']['Insert'];
export type InsertOrderItem = Database['public']['Tables']['order_items']['Insert'];
export type UpdateStore = Database['public']['Tables']['stores']['Update'];
export type UpdateOrder = Database['public']['Tables']['orders']['Update'];
export type UpdateOrderItem = Database['public']['Tables']['order_items']['Update'];
