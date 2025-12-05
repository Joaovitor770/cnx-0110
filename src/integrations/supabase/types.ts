export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          id: number
          created_at: string
          name: string
          slug: string
        }
        Insert: {
          id?: number
          created_at?: string
          name: string
          slug: string
        }
        Update: {
          id?: number
          created_at?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      collections: {
        Row: {
          id: number
          created_at: string
          name: string
          slug: string
          image: string
          description: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          name: string
          slug: string
          image: string
          description?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          name?: string
          slug?: string
          image?: string
          description?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          id: number
          created_at: string
          name: string
          brand: string
          price: number
          images: string[]
          category: string
          sizes: Json
          description: string | null
          slug: string
          collection_id: number | null
          category_id: number | null
        }
        Insert: {
          id?: number
          created_at?: string
          name: string
          brand?: string
          price: number
          images?: string[]
          category: string
          sizes?: Json
          description?: string | null
          slug: string
          collection_id?: number | null
          category_id?: number | null
        }
        Update: {
          id?: number
          created_at?: string
          name?: string
          brand?: string
          price?: number
          images?: string[]
          category?: string
          sizes?: Json
          description?: string | null
          slug?: string
          collection_id?: number | null
          category_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_collection_id_fkey"
            columns: ["collection_id"]
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          id: number
          created_at: string
          client_id: number | null
          client_name: string
          client_address: string
          items: Json
          total: number
          status: string
        }
        Insert: {
          id?: number
          created_at?: string
          client_id?: number | null
          client_name: string
          client_address: string
          items: Json
          total: number
          status: string
        }
        Update: {
          id?: number
          created_at?: string
          client_id?: number | null
          client_name?: string
          client_address?: string
          items?: Json
          total?: number
          status?: string
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          id: number
          created_at: string
          store_name: string
          logo: string | null
          banner: string | null
          primary_color: string
          secondary_color: string
          contact_email: string
          contact_phone: string
          address: string
          shipping_price: number
        }
        Insert: {
          id?: number
          created_at?: string
          store_name?: string
          logo?: string | null
          banner?: string | null
          primary_color?: string
          secondary_color?: string
          contact_email?: string
          contact_phone?: string
          address?: string
          shipping_price?: number
        }
        Update: {
          id?: number
          created_at?: string
          store_name?: string
          logo?: string | null
          banner?: string | null
          primary_color?: string
          secondary_color?: string
          contact_email?: string
          contact_phone?: string
          address?: string
          shipping_price?: number
        }
        Relationships: []
      }
      clients: {
        Row: {
          id: number
          created_at: string
          name: string
          email: string
          status: string
          joined_at: string
          orders_count: number
        }
        Insert: {
          id?: number
          created_at?: string
          name: string
          email: string
          status: string
          joined_at: string
          orders_count?: number
        }
        Update: {
          id?: number
          created_at?: string
          name?: string
          email?: string
          status?: string
          joined_at?: string
          orders_count?: number
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          id: string
          title: string | null
          subtitle: string | null
          image_url: string | null
          button_text: string | null
          button_link: string | null
          background_type: string | null
          background_color: string | null
          order_index: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title?: string | null
          subtitle?: string | null
          image_url?: string | null
          button_text?: string | null
          button_link?: string | null
          background_type?: string | null
          background_color?: string | null
          order_index?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string | null
          subtitle?: string | null
          image_url?: string | null
          button_text?: string | null
          button_link?: string | null
          background_type?: string | null
          background_color?: string | null
          order_index?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
