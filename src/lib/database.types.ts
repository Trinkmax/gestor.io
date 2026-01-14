export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      account_movements: {
        Row: {
          amount: number
          balance: number
          client_id: string
          created_at: string | null
          id: string
          notes: string | null
          reference_id: string
          reference_number: number | null
          type: string
        }
        Insert: {
          amount: number
          balance: number
          client_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          reference_id: string
          reference_number?: number | null
          type: string
        }
        Update: {
          amount?: number
          balance?: number
          client_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          reference_id?: string
          reference_number?: number | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_movements_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      business_config: {
        Row: {
          allow_credit_overpayment: boolean | null
          allow_negative_stock: boolean | null
          business_address: string | null
          business_email: string | null
          business_name: string
          business_phone: string | null
          created_at: string | null
          employee_can_adjust_stock: boolean | null
          employee_can_edit_prices: boolean | null
          id: string
          require_cash_register_for_sales: boolean | null
          show_costs_to_accountant: boolean | null
          show_costs_to_employee: boolean | null
          updated_at: string | null
        }
        Insert: {
          allow_credit_overpayment?: boolean | null
          allow_negative_stock?: boolean | null
          business_address?: string | null
          business_email?: string | null
          business_name?: string
          business_phone?: string | null
          created_at?: string | null
          employee_can_adjust_stock?: boolean | null
          employee_can_edit_prices?: boolean | null
          id?: string
          require_cash_register_for_sales?: boolean | null
          show_costs_to_accountant?: boolean | null
          show_costs_to_employee?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allow_credit_overpayment?: boolean | null
          allow_negative_stock?: boolean | null
          business_address?: string | null
          business_email?: string | null
          business_name?: string
          business_phone?: string | null
          created_at?: string | null
          employee_can_adjust_stock?: boolean | null
          employee_can_edit_prices?: boolean | null
          id?: string
          require_cash_register_for_sales?: boolean | null
          show_costs_to_accountant?: boolean | null
          show_costs_to_employee?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cash_registers: {
        Row: {
          closed_at: string | null
          closed_by: string | null
          closed_by_name: string | null
          closing_amount: number | null
          closing_notes: string | null
          difference: number | null
          expected_amount: number | null
          id: string
          is_closed: boolean | null
          opened_at: string | null
          opened_by: string
          opened_by_name: string
          opening_amount: number
          opening_notes: string | null
          sales_count: number | null
          total_card: number | null
          total_cash: number | null
          total_credit: number | null
          total_expenses_cash: number | null
          total_expenses_transfer: number | null
          total_transfer: number | null
        }
        Insert: {
          closed_at?: string | null
          closed_by?: string | null
          closed_by_name?: string | null
          closing_amount?: number | null
          closing_notes?: string | null
          difference?: number | null
          expected_amount?: number | null
          id?: string
          is_closed?: boolean | null
          opened_at?: string | null
          opened_by: string
          opened_by_name: string
          opening_amount?: number
          opening_notes?: string | null
          sales_count?: number | null
          total_card?: number | null
          total_cash?: number | null
          total_credit?: number | null
          total_expenses_cash?: number | null
          total_expenses_transfer?: number | null
          total_transfer?: number | null
        }
        Update: {
          closed_at?: string | null
          closed_by?: string | null
          closed_by_name?: string | null
          closing_amount?: number | null
          closing_notes?: string | null
          difference?: number | null
          expected_amount?: number | null
          id?: string
          is_closed?: boolean | null
          opened_at?: string | null
          opened_by?: string
          opened_by_name?: string
          opening_amount?: number
          opening_notes?: string | null
          sales_count?: number | null
          total_card?: number | null
          total_cash?: number | null
          total_credit?: number | null
          total_expenses_cash?: number | null
          total_expenses_transfer?: number | null
          total_transfer?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_registers_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_registers_opened_by_fkey"
            columns: ["opened_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          balance: number
          created_at: string | null
          email: string | null
          id: string
          last_activity_at: string | null
          name: string
          notes: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          balance?: number
          created_at?: string | null
          email?: string | null
          id?: string
          last_activity_at?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          balance?: number
          created_at?: string | null
          email?: string | null
          id?: string
          last_activity_at?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          cash_register_id: string
          category: string | null
          created_at: string | null
          id: string
          notes: string | null
          payment_method: string
          user_id: string
          user_name: string
        }
        Insert: {
          amount: number
          cash_register_id: string
          category?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_method: string
          user_id: string
          user_name: string
        }
        Update: {
          amount?: number
          cash_register_id?: string
          category?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_method?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_cash_register_id_fkey"
            columns: ["cash_register_id"]
            isOneToOne: false
            referencedRelation: "cash_registers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          client_id: string
          client_name: string
          created_at: string | null
          id: string
          notes: string | null
          payment_method: string
          user_id: string
          user_name: string
        }
        Insert: {
          amount: number
          client_id: string
          client_name: string
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_method: string
          user_id: string
          user_name: string
        }
        Update: {
          amount?: number
          client_id?: string
          client_name?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_method?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          code: string | null
          cost: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          min_stock: number | null
          name: string
          price: number
          stock: number
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          code?: string | null
          cost?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          min_stock?: number | null
          name: string
          price: number
          stock?: number
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          code?: string | null
          cost?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          min_stock?: number | null
          name?: string
          price?: number
          stock?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_items: {
        Row: {
          id: string
          product_code: string | null
          product_id: string
          product_name: string
          quantity: number
          sale_id: string
          subtotal: number
          unit_price: number
        }
        Insert: {
          id?: string
          product_code?: string | null
          product_id: string
          product_name: string
          quantity: number
          sale_id: string
          subtotal: number
          unit_price: number
        }
        Update: {
          id?: string
          product_code?: string | null
          product_id?: string
          product_name?: string
          quantity?: number
          sale_id?: string
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          cash_register_id: string
          client_id: string | null
          client_name: string | null
          created_at: string | null
          id: string
          notes: string | null
          number: number
          payment_method: string
          total: number
          user_id: string
          user_name: string
        }
        Insert: {
          cash_register_id: string
          client_id?: string | null
          client_name?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          number: number
          payment_method: string
          total: number
          user_id: string
          user_name: string
        }
        Update: {
          cash_register_id?: string
          client_id?: string | null
          client_name?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          number?: number
          payment_method?: string
          total?: number
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_cash_register_id_fkey"
            columns: ["cash_register_id"]
            isOneToOne: false
            referencedRelation: "cash_registers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_adjustments: {
        Row: {
          created_at: string | null
          id: string
          new_stock: number
          previous_stock: number
          product_id: string
          product_name: string
          quantity: number
          reason: string
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          new_stock: number
          previous_stock: number
          product_id: string
          product_name: string
          quantity: number
          reason: string
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          new_stock?: number
          previous_stock?: number
          product_id?: string
          product_name?: string
          quantity?: number
          reason?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_adjustments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_adjustments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar: string | null
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          name: string
          role: string
          updated_at?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_next_sale_number: { Args: Record<string, never>; Returns: number }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

