/**
 * Auto-generated TypeScript types from Supabase database schema
 * Generated from migrations: 001-009
 * 
 * To regenerate with Supabase CLI:
 * npx supabase gen types typescript --project-id mnmnfaseiddqfiufckem --schema public > types/database.types.ts
 */

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
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          current_weight_kg: number | null
          target_weight_kg: number | null
          height_cm: number | null
          glp1_medication: 'ozempic' | 'wegovy' | 'mounjaro' | 'zepbound' | 'other' | null
          glp1_start_date: string | null
          daily_protein_target_g: number | null
          created_at: string | null
          updated_at: string | null
          // Migration 002
          current_program_id: string | null
          // Migration 003
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'unpaid' | null
          subscription_plan: 'core' | 'premium' | null
          // Migration 007
          meal_timing_alerts: boolean | null
          meal_timing_threshold_hours: number | null
          // Migration 009
          medication_type: 'ozempic' | 'wegovy' | 'mounjaro' | 'zepbound' | 'other' | null
          dose_day_of_week: number | null
          dose_time: string | null
          started_medication_at: string | null
          glp1_current_dose: string | null
          email_notifications: boolean | null
          marketing_emails: boolean | null
          gdpr_consent: boolean | null
          gdpr_consent_at: string | null
          // Migration 018
          daily_water_goal_ml: number | null
          // Migration 022
          expo_push_token: string | null
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          current_weight_kg?: number | null
          target_weight_kg?: number | null
          height_cm?: number | null
          glp1_medication?: 'ozempic' | 'wegovy' | 'mounjaro' | 'zepbound' | 'other' | null
          glp1_start_date?: string | null
          daily_protein_target_g?: number | null
          created_at?: string | null
          updated_at?: string | null
          current_program_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'unpaid' | null
          subscription_plan?: 'core' | 'premium' | null
          meal_timing_alerts?: boolean | null
          meal_timing_threshold_hours?: number | null
          medication_type?: 'ozempic' | 'wegovy' | 'mounjaro' | 'zepbound' | 'other' | null
          dose_day_of_week?: number | null
          dose_time?: string | null
          started_medication_at?: string | null
          glp1_current_dose?: string | null
          email_notifications?: boolean | null
          marketing_emails?: boolean | null
          gdpr_consent?: boolean | null
          gdpr_consent_at?: string | null
          daily_water_goal_ml?: number | null
          expo_push_token?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          current_weight_kg?: number | null
          target_weight_kg?: number | null
          height_cm?: number | null
          glp1_medication?: 'ozempic' | 'wegovy' | 'mounjaro' | 'zepbound' | 'other' | null
          glp1_start_date?: string | null
          daily_protein_target_g?: number | null
          created_at?: string | null
          updated_at?: string | null
          current_program_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'unpaid' | null
          subscription_plan?: 'core' | 'premium' | null
          meal_timing_alerts?: boolean | null
          meal_timing_threshold_hours?: number | null
          medication_type?: 'ozempic' | 'wegovy' | 'mounjaro' | 'zepbound' | 'other' | null
          dose_day_of_week?: number | null
          dose_time?: string | null
          started_medication_at?: string | null
          glp1_current_dose?: string | null
          email_notifications?: boolean | null
          marketing_emails?: boolean | null
          gdpr_consent?: boolean | null
          gdpr_consent_at?: string | null
          daily_water_goal_ml?: number | null
          expo_push_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_program_id_fkey"
            columns: ["current_program_id"]
            isOneToOne: false
            referencedRelation: "workout_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      workout_programs: {
        Row: {
          id: string
          name: string
          description: string | null
          difficulty_level: 'beginner' | 'intermediate' | 'advanced' | null
          workouts_per_week: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | null
          workouts_per_week?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | null
          workouts_per_week?: number | null
          created_at?: string | null
        }
        Relationships: []
      }
      workouts: {
        Row: {
          id: string
          program_id: string | null
          name: string
          description: string | null
          order_in_program: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          program_id?: string | null
          name: string
          description?: string | null
          order_in_program?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          program_id?: string | null
          name?: string
          description?: string | null
          order_in_program?: number | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workouts_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "workout_programs"
            referencedColumns: ["id"]
          }
        ]
      }
      exercises: {
        Row: {
          id: string
          workout_id: string | null
          name: string
          description: string | null
          image_url: string | null
          target_sets: number | null
          target_reps_min: number | null
          target_reps_max: number | null
          rest_seconds: number | null
          order_in_workout: number | null
          video_url: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          workout_id?: string | null
          name: string
          description?: string | null
          image_url?: string | null
          target_sets?: number | null
          target_reps_min?: number | null
          target_reps_max?: number | null
          rest_seconds?: number | null
          order_in_workout?: number | null
          video_url?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          workout_id?: string | null
          name?: string
          description?: string | null
          image_url?: string | null
          target_sets?: number | null
          target_reps_min?: number | null
          target_reps_max?: number | null
          rest_seconds?: number | null
          order_in_workout?: number | null
          video_url?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          }
        ]
      }
      protein_logs: {
        Row: {
          id: string
          user_id: string | null
          date: string
          food_name: string
          protein_grams: number
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null
          logged_at: string | null
          created_at: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          date?: string
          food_name: string
          protein_grams: number
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null
          logged_at?: string | null
          created_at?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          date?: string
          food_name?: string
          protein_grams?: number
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null
          logged_at?: string | null
          created_at?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "protein_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      workout_sessions: {
        Row: {
          id: string
          user_id: string | null
          workout_id: string | null
          started_at: string | null
          completed_at: string | null
          notes: string | null
          created_at: string | null
          // Migration 013
          duration_minutes: number | null
          energy_level: number | null
          nausea_level: number | null
          overall_feeling: string | null
          is_dose_day: boolean | null
          dose_day_offset: number | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          workout_id?: string | null
          started_at?: string | null
          completed_at?: string | null
          notes?: string | null
          created_at?: string | null
          // Migration 013
          duration_minutes?: number | null
          energy_level?: number | null
          nausea_level?: number | null
          overall_feeling?: string | null
          is_dose_day?: boolean | null
          dose_day_offset?: number | null
        }
        Update: {
          id?: string
          user_id?: string | null
          workout_id?: string | null
          started_at?: string | null
          completed_at?: string | null
          notes?: string | null
          created_at?: string | null
          // Migration 013
          duration_minutes?: number | null
          energy_level?: number | null
          nausea_level?: number | null
          overall_feeling?: string | null
          is_dose_day?: boolean | null
          dose_day_offset?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sessions_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          }
        ]
      }
      exercise_sets: {
        Row: {
          id: string
          session_id: string | null
          exercise_id: string | null
          set_number: number
          weight_kg: number
          reps_completed: number
          created_at: string | null
        }
        Insert: {
          id?: string
          session_id?: string | null
          exercise_id?: string | null
          set_number: number
          weight_kg: number
          reps_completed: number
          created_at?: string | null
        }
        Update: {
          id?: string
          session_id?: string | null
          exercise_id?: string | null
          set_number?: number
          weight_kg?: number
          reps_completed?: number
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_sets_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_sets_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          }
        ]
      }
      progress_photos: {
        Row: {
          id: string
          user_id: string | null
          photo_url: string
          angle: 'front' | 'back' | 'side_left' | 'side_right' | null
          taken_at: string | null
          created_at: string | null
          // Alternative structure for 4-angle photos
          front_url: string | null
          side_url: string | null
          back_url: string | null
          flex_url: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          photo_url?: string
          angle?: 'front' | 'back' | 'side_left' | 'side_right' | null
          taken_at?: string | null
          created_at?: string | null
          // Alternative structure for 4-angle photos
          front_url?: string | null
          side_url?: string | null
          back_url?: string | null
          flex_url?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          photo_url?: string
          angle?: 'front' | 'back' | 'side_left' | 'side_right' | null
          taken_at?: string | null
          created_at?: string | null
          // Alternative structure for 4-angle photos
          front_url?: string | null
          side_url?: string | null
          back_url?: string | null
          flex_url?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      weight_logs: {
        Row: {
          id: string
          user_id: string | null
          weight_kg: number
          logged_at: string | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          weight_kg: number
          logged_at?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          weight_kg?: number
          logged_at?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weight_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      food_tolerance_votes: {
        Row: {
          id: string
          user_id: string
          food_name: string
          tolerated: boolean
          notes: string | null
          voted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          food_name: string
          tolerated: boolean
          notes?: string | null
          voted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          food_name?: string
          tolerated?: boolean
          notes?: string | null
          voted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_tolerance_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      hydration_logs: {
        Row: {
          id: string
          user_id: string
          amount_ml: number
          logged_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount_ml: number
          logged_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount_ml?: number
          logged_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hydration_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      side_effect_logs: {
        Row: {
          id: string
          user_id: string
          logged_date: string
          nausea_level: number | null
          energy_level: number | null
          appetite_level: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          logged_date?: string
          nausea_level?: number | null
          energy_level?: number | null
          appetite_level?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          logged_date?: string
          nausea_level?: number | null
          energy_level?: number | null
          appetite_level?: number | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "side_effect_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      body_measurements: {
        Row: {
          id: string
          user_id: string
          measured_at: string
          waist_cm: number | null
          chest_cm: number | null
          hips_cm: number | null
          left_arm_cm: number | null
          right_arm_cm: number | null
          left_thigh_cm: number | null
          right_thigh_cm: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          measured_at?: string
          waist_cm?: number | null
          chest_cm?: number | null
          hips_cm?: number | null
          left_arm_cm?: number | null
          right_arm_cm?: number | null
          left_thigh_cm?: number | null
          right_thigh_cm?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          measured_at?: string
          waist_cm?: number | null
          chest_cm?: number | null
          hips_cm?: number | null
          left_arm_cm?: number | null
          right_arm_cm?: number | null
          left_thigh_cm?: number | null
          right_thigh_cm?: number | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "body_measurements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_streaks: {
        Row: {
          user_id: string
          protein_streak: number | null
          protein_best_streak: number | null
          workout_streak: number | null
          workout_best_streak: number | null
          last_calculated_at: string | null
          updated_at: string | null
          // Alternative naming (best_protein_streak, best_workout_streak)
          best_protein_streak: number | null
          best_workout_streak: number | null
        }
        Insert: {
          user_id: string
          protein_streak?: number | null
          protein_best_streak?: number | null
          workout_streak?: number | null
          workout_best_streak?: number | null
          last_calculated_at?: string | null
          updated_at?: string | null
          // Alternative naming
          best_protein_streak?: number | null
          best_workout_streak?: number | null
        }
        Update: {
          user_id?: string
          protein_streak?: number | null
          protein_best_streak?: number | null
          workout_streak?: number | null
          workout_best_streak?: number | null
          last_calculated_at?: string | null
          updated_at?: string | null
          // Alternative naming
          best_protein_streak?: number | null
          best_workout_streak?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      meal_rating_prompts: {
        Row: {
          id: string
          user_id: string
          protein_log_id: string
          prompted_at: string | null
          responded: boolean | null
          response_vote: boolean | null
        }
        Insert: {
          id?: string
          user_id: string
          protein_log_id: string
          prompted_at?: string | null
          responded?: boolean | null
          response_vote?: boolean | null
        }
        Update: {
          id?: string
          user_id?: string
          protein_log_id?: string
          prompted_at?: string | null
          responded?: boolean | null
          response_vote?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_rating_prompts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_rating_prompts_protein_log_id_fkey"
            columns: ["protein_log_id"]
            isOneToOne: false
            referencedRelation: "protein_logs"
            referencedColumns: ["id"]
          }
        ]
      }
      email_logs: {
        Row: {
          id: string
          user_id: string | null
          email_type: string
          sent_at: string
          status: string
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          email_type: string
          sent_at?: string
          status?: string
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          email_type?: string
          sent_at?: string
          status?: string
          error_message?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      food_tolerance_ratings: {
        Row: {
          food_name: string | null
          total_votes: number | null
          upvotes: number | null
          downvotes: number | null
          tolerance_percentage: number | null
          last_voted_at: string | null
        }
        Relationships: []
      }
      user_dose_status: {
        Row: {
          user_id: string | null
          medication_type: 'ozempic' | 'wegovy' | 'mounjaro' | 'zepbound' | 'other' | null
          dose_day_of_week: number | null
          dose_time: string | null
          started_medication_at: string | null
          weeks_on_medication: number | null
          is_today_dose_day: boolean | null
          days_since_last_dose: number | null
          side_effect_level: string | null
          side_effect_message: string | null
        }
        Relationships: []
      }
      workout_stats: {
        Row: {
          user_id: string | null
          total_workouts: number | null
          workouts_last_30_days: number | null
          workouts_last_7_days: number | null
          avg_duration: number | null
          last_workout_date: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_dose_day: {
        Args: {
          p_user_id: string
        }
        Returns: boolean
      }
      days_since_dose: {
        Args: {
          p_user_id: string
        }
        Returns: number
      }
      get_side_effect_level: {
        Args: {
          p_user_id: string
        }
        Returns: string
      }
      get_food_rating: {
        Args: {
          p_food_name: string
        }
        Returns: {
          food_name: string
          total_votes: number
          upvotes: number
          downvotes: number
          tolerance_percentage: number
          last_voted_at: string
        }[]
      }
      user_has_voted: {
        Args: {
          p_user_id: string
          p_food_name: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Utility types
type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
