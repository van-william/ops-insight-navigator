export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      guided_discovery: {
        Row: {
          completed: boolean | null
          conversation: Json | null
          created_at: string
          id: string
          name: string
          summary: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          conversation?: Json | null
          created_at?: string
          id?: string
          name: string
          summary?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          conversation?: Json | null
          created_at?: string
          id?: string
          name?: string
          summary?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      maturity_assessment: {
        Row: {
          automation_digital_ops: Json | null
          changeovers: Json | null
          completed: boolean | null
          created_at: string
          id: string
          lean_manufacturing: Json | null
          maintenance_effectiveness: Json | null
          name: string
          overall_score: number | null
          planning_scheduling: Json | null
          plant_layout: Json | null
          plant_management: Json | null
          production_efficiency: Json | null
          quality_control: Json | null
          updated_at: string
          user_id: string
          warehouse_logistics: Json | null
        }
        Insert: {
          automation_digital_ops?: Json | null
          changeovers?: Json | null
          completed?: boolean | null
          created_at?: string
          id?: string
          lean_manufacturing?: Json | null
          maintenance_effectiveness?: Json | null
          name: string
          overall_score?: number | null
          planning_scheduling?: Json | null
          plant_layout?: Json | null
          plant_management?: Json | null
          production_efficiency?: Json | null
          quality_control?: Json | null
          updated_at?: string
          user_id: string
          warehouse_logistics?: Json | null
        }
        Update: {
          automation_digital_ops?: Json | null
          changeovers?: Json | null
          completed?: boolean | null
          created_at?: string
          id?: string
          lean_manufacturing?: Json | null
          maintenance_effectiveness?: Json | null
          name?: string
          overall_score?: number | null
          planning_scheduling?: Json | null
          plant_layout?: Json | null
          plant_management?: Json | null
          production_efficiency?: Json | null
          quality_control?: Json | null
          updated_at?: string
          user_id?: string
          warehouse_logistics?: Json | null
        }
        Relationships: []
      }
      pl_analysis: {
        Row: {
          copq: number | null
          created_at: string
          direct_labor_base: number | null
          direct_labor_benefits: number | null
          direct_labor_ot: number | null
          direct_material: number | null
          freight_expedited: number | null
          freight_regular: number | null
          id: string
          indirect_labor_base: number | null
          indirect_labor_benefits: number | null
          indirect_labor_ot: number | null
          mro: number | null
          name: string
          other_fixed_overhead: number | null
          other_sga: number | null
          other_variable_overhead: number | null
          salaried_labor_base: number | null
          salaried_labor_benefits: number | null
          salaried_labor_ot: number | null
          temp_labor: number | null
          updated_at: string
          user_id: string
          utilities: number | null
        }
        Insert: {
          copq?: number | null
          created_at?: string
          direct_labor_base?: number | null
          direct_labor_benefits?: number | null
          direct_labor_ot?: number | null
          direct_material?: number | null
          freight_expedited?: number | null
          freight_regular?: number | null
          id?: string
          indirect_labor_base?: number | null
          indirect_labor_benefits?: number | null
          indirect_labor_ot?: number | null
          mro?: number | null
          name: string
          other_fixed_overhead?: number | null
          other_sga?: number | null
          other_variable_overhead?: number | null
          salaried_labor_base?: number | null
          salaried_labor_benefits?: number | null
          salaried_labor_ot?: number | null
          temp_labor?: number | null
          updated_at?: string
          user_id: string
          utilities?: number | null
        }
        Update: {
          copq?: number | null
          created_at?: string
          direct_labor_base?: number | null
          direct_labor_benefits?: number | null
          direct_labor_ot?: number | null
          direct_material?: number | null
          freight_expedited?: number | null
          freight_regular?: number | null
          id?: string
          indirect_labor_base?: number | null
          indirect_labor_benefits?: number | null
          indirect_labor_ot?: number | null
          mro?: number | null
          name?: string
          other_fixed_overhead?: number | null
          other_sga?: number | null
          other_variable_overhead?: number | null
          salaried_labor_base?: number | null
          salaried_labor_benefits?: number | null
          salaried_labor_ot?: number | null
          temp_labor?: number | null
          updated_at?: string
          user_id?: string
          utilities?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
