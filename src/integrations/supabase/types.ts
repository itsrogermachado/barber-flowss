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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          barber_id: string
          client_name: string
          client_whatsapp: string
          created_at: string | null
          end_at: string
          id: string
          notes: string | null
          service_id: string
          shop_id: string
          start_at: string
          status: string
        }
        Insert: {
          barber_id: string
          client_name: string
          client_whatsapp: string
          created_at?: string | null
          end_at: string
          id?: string
          notes?: string | null
          service_id: string
          shop_id: string
          start_at: string
          status?: string
        }
        Update: {
          barber_id?: string
          client_name?: string
          client_whatsapp?: string
          created_at?: string | null
          end_at?: string
          id?: string
          notes?: string | null
          service_id?: string
          shop_id?: string
          start_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      barbers: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          photo_url: string | null
          shop_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          photo_url?: string | null
          shop_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          photo_url?: string | null
          shop_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "barbers_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_slots: {
        Row: {
          barber_id: string
          created_at: string | null
          end_at: string
          id: string
          reason: string | null
          shop_id: string
          start_at: string
        }
        Insert: {
          barber_id: string
          created_at?: string | null
          end_at: string
          id?: string
          reason?: string | null
          shop_id: string
          start_at: string
        }
        Update: {
          barber_id?: string
          created_at?: string | null
          end_at?: string
          id?: string
          reason?: string | null
          shop_id?: string
          start_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_slots_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_slots_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          barber_id: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          role: string
          shop_id: string
          token: string
          used_at: string | null
        }
        Insert: {
          barber_id?: string | null
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          role: string
          shop_id: string
          token: string
          used_at?: string | null
        }
        Update: {
          barber_id?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          role?: string
          shop_id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          barber_id: string | null
          created_at: string | null
          id: string
          role: string
          shop_id: string
          user_id: string
        }
        Insert: {
          barber_id?: string | null
          created_at?: string | null
          id?: string
          role: string
          shop_id: string
          user_id: string
        }
        Update: {
          barber_id?: string | null
          created_at?: string | null
          id?: string
          role?: string
          shop_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_limits: {
        Row: {
          max_appointments_month: number
          max_barbers: number
          plan: string
          whatsapp_reminders_enabled: boolean
        }
        Insert: {
          max_appointments_month: number
          max_barbers: number
          plan: string
          whatsapp_reminders_enabled: boolean
        }
        Update: {
          max_appointments_month?: number
          max_barbers?: number
          plan?: string
          whatsapp_reminders_enabled?: boolean
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          name: string
          price_cents: number
          shop_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          duration_minutes: number
          id?: string
          is_active?: boolean | null
          name: string
          price_cents: number
          shop_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          name?: string
          price_cents?: number
          shop_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "services_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          address: string | null
          created_at: string | null
          id: string
          instagram: string | null
          is_published: boolean | null
          name: string
          onboarding_completed: boolean | null
          phone_whatsapp: string | null
          plan: string | null
          slot_interval_minutes: number | null
          slug: string
          subscription_status: string | null
          timezone: string | null
          trial_ends_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          id?: string
          instagram?: string | null
          is_published?: boolean | null
          name?: string
          onboarding_completed?: boolean | null
          phone_whatsapp?: string | null
          plan?: string | null
          slot_interval_minutes?: number | null
          slug: string
          subscription_status?: string | null
          timezone?: string | null
          trial_ends_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          id?: string
          instagram?: string | null
          is_published?: boolean | null
          name?: string
          onboarding_completed?: boolean | null
          phone_whatsapp?: string | null
          plan?: string | null
          slot_interval_minutes?: number | null
          slug?: string
          subscription_status?: string | null
          timezone?: string | null
          trial_ends_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          id: string
          provider: string
          provider_customer_id: string | null
          provider_subscription_id: string | null
          shop_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          provider: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          shop_id: string
          status: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          provider?: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          shop_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      super_admins: {
        Row: {
          created_at: string | null
          email: string
          id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      working_hours: {
        Row: {
          barber_id: string
          break_end_time: string | null
          break_start_time: string | null
          created_at: string | null
          end_time: string
          id: string
          is_enabled: boolean | null
          shop_id: string
          start_time: string
          weekday: number
        }
        Insert: {
          barber_id: string
          break_end_time?: string | null
          break_start_time?: string | null
          created_at?: string | null
          end_time: string
          id?: string
          is_enabled?: boolean | null
          shop_id: string
          start_time: string
          weekday: number
        }
        Update: {
          barber_id?: string
          break_end_time?: string | null
          break_start_time?: string | null
          created_at?: string | null
          end_time?: string
          id?: string
          is_enabled?: boolean | null
          shop_id?: string
          start_time?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "working_hours_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "working_hours_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_appointment: {
        Args: {
          _barber_choice: string
          _client_name: string
          _client_whatsapp: string
          _notes?: string
          _service_id: string
          _shop_slug: string
          _start_at: string
        }
        Returns: Json
      }
      create_shop_for_user: {
        Args: { _shop_name: string; _slug: string; _user_id: string }
        Returns: string
      }
      get_available_slots: {
        Args: {
          _barber_id: string
          _date: string
          _service_id: string
          _shop_slug: string
        }
        Returns: Json
      }
      get_user_barber_id: {
        Args: { _shop_id: string; _user_id: string }
        Returns: string
      }
      get_user_shop_ids: { Args: { _user_id: string }; Returns: string[] }
      get_user_shop_role: {
        Args: { _shop_id: string; _user_id: string }
        Returns: string
      }
      is_super_admin: { Args: never; Returns: boolean }
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
