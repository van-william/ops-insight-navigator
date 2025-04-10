export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      discovery_paths: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          created_at?: string
        }
      }
      discovery_questions: {
        Row: {
          id: string
          path_id: string
          question: string
          sequence: number
          next_question_logic: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          path_id: string
          question: string
          sequence: number
          next_question_logic?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          path_id?: string
          question?: string
          sequence?: number
          next_question_logic?: Json | null
          created_at?: string
        }
      }
      discovery_sessions: {
        Row: {
          id: string
          user_id: string
          path_id: string
          status: string
          current_question: string | null
          responses: Json
          recommendations: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          path_id: string
          status?: string
          current_question?: string | null
          responses?: Json
          recommendations?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          path_id?: string
          status?: string
          current_question?: string | null
          responses?: Json
          recommendations?: Json
          created_at?: string
          updated_at?: string
        }
      }
      pl_analysis: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
          updated_at: string
          direct_material: number | null
          direct_labor_base: number | null
          direct_labor_benefits: number | null
          direct_labor_ot: number | null
          temp_labor: number | null
          indirect_labor_base: number | null
          indirect_labor_benefits: number | null
          indirect_labor_ot: number | null
          salaried_labor_base: number | null
          salaried_labor_benefits: number | null
          salaried_labor_ot: number | null
          copq: number | null
          mro: number | null
          utilities: number | null
          freight_regular: number | null
          freight_expedited: number | null
          other_variable_overhead: number | null
          other_fixed_overhead: number | null
          other_sga: number | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
          updated_at?: string
          direct_material?: number | null
          direct_labor_base?: number | null
          direct_labor_benefits?: number | null
          direct_labor_ot?: number | null
          temp_labor?: number | null
          indirect_labor_base?: number | null
          indirect_labor_benefits?: number | null
          indirect_labor_ot?: number | null
          salaried_labor_base?: number | null
          salaried_labor_benefits?: number | null
          salaried_labor_ot?: number | null
          copq?: number | null
          mro?: number | null
          utilities?: number | null
          freight_regular?: number | null
          freight_expedited?: number | null
          other_variable_overhead?: number | null
          other_fixed_overhead?: number | null
          other_sga?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
          updated_at?: string
          direct_material?: number | null
          direct_labor_base?: number | null
          direct_labor_benefits?: number | null
          direct_labor_ot?: number | null
          temp_labor?: number | null
          indirect_labor_base?: number | null
          indirect_labor_benefits?: number | null
          indirect_labor_ot?: number | null
          salaried_labor_base?: number | null
          salaried_labor_benefits?: number | null
          salaried_labor_ot?: number | null
          copq?: number | null
          mro?: number | null
          utilities?: number | null
          freight_regular?: number | null
          freight_expedited?: number | null
          other_variable_overhead?: number | null
          other_fixed_overhead?: number | null
          other_sga?: number | null
        }
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
