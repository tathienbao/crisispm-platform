/**
 * SUPABASE DATABASE TYPE DEFINITIONS
 * Auto-generated TypeScript definitions for our PostgreSQL database schema.
 * 
 * IMPORTANT: This file should be regenerated whenever the database schema changes.
 * Use: supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
 * 
 * These types provide:
 * - Compile-time type safety for database operations
 * - Autocomplete support in IDE
 * - Runtime error prevention for data model mismatches
 */

export interface Database {
  public: {
    Tables: {
      /**
       * USER PROFILES TABLE
       * Stores additional user information beyond basic auth.users data.
       * Links to Supabase Auth via UUID foreign key relationship.
       */
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          email: string
          subscription: 'free' | 'pro' | 'corporate'
          subscription_end: string | null
          total_crises: number
          average_score: number
          streak_days: number
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          categories: string[]
          email_notifications: boolean
          created_at: string
        }
        Insert: {
          id: string
          updated_at?: string | null
          email: string
          subscription?: 'free' | 'pro' | 'corporate'
          subscription_end?: string | null
          total_crises?: number
          average_score?: number
          streak_days?: number
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          categories?: string[]
          email_notifications?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          updated_at?: string | null
          email?: string
          subscription?: 'free' | 'pro' | 'corporate'
          subscription_end?: string | null
          total_crises?: number
          average_score?: number
          streak_days?: number
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          categories?: string[]
          email_notifications?: boolean
          created_at?: string
        }
      }

      /**
       * CRISIS SCENARIOS TABLE
       * Stores pre-generated crisis scenarios with template variables.
       * Core business logic: 44,928 unique combinations via algorithmic generation.
       */
      crisis_scenarios: {
        Row: {
          id: string
          category: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          template_id: string
          industry: 'tech' | 'healthcare' | 'finance' | 'retail'
          company_size: 'startup' | 'midsize' | 'enterprise'
          severity: 'minor' | 'major' | 'critical'
          timeline: 'hours' | 'days' | 'weeks'
          stakeholder_type: 'internal' | 'external' | 'regulatory' | 'mixed'
          title: string
          description: string
          context: string
          stakeholders: string
          time_pressure: string
          expert_solution: string
          assessment_criteria: Record<string, any>
          created_at: string
        }
        Insert: {
          id?: string
          category: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          template_id: string
          industry: 'tech' | 'healthcare' | 'finance' | 'retail'
          company_size: 'startup' | 'midsize' | 'enterprise'
          severity: 'minor' | 'major' | 'critical'
          timeline: 'hours' | 'days' | 'weeks'
          stakeholder_type: 'internal' | 'external' | 'regulatory' | 'mixed'
          title: string
          description: string
          context: string
          stakeholders: string
          time_pressure: string
          expert_solution: string
          assessment_criteria: Record<string, any>
          created_at?: string
        }
        Update: {
          id?: string
          category?: string
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          template_id?: string
          industry?: 'tech' | 'healthcare' | 'finance' | 'retail'
          company_size?: 'startup' | 'midsize' | 'enterprise'
          severity?: 'minor' | 'major' | 'critical'
          timeline?: 'hours' | 'days' | 'weeks'
          stakeholder_type?: 'internal' | 'external' | 'regulatory' | 'mixed'
          title?: string
          description?: string
          context?: string
          stakeholders?: string
          time_pressure?: string
          expert_solution?: string
          assessment_criteria?: Record<string, any>
          created_at?: string
        }
      }

      /**
       * USER RESPONSES TABLE
       * Stores user responses to crisis scenarios with AI-generated assessments.
       * Links users to scenarios with detailed scoring and feedback.
       */
      user_responses: {
        Row: {
          id: string
          user_id: string
          scenario_id: string
          response: string
          total_score: number | null
          strategy_score: number | null
          communication_score: number | null
          leadership_score: number | null
          execution_score: number | null
          feedback: string | null
          improvements: string[] | null
          submitted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          scenario_id: string
          response: string
          total_score?: number | null
          strategy_score?: number | null
          communication_score?: number | null
          leadership_score?: number | null
          execution_score?: number | null
          feedback?: string | null
          improvements?: string[] | null
          submitted_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          scenario_id?: string
          response?: string
          total_score?: number | null
          strategy_score?: number | null
          communication_score?: number | null
          leadership_score?: number | null
          execution_score?: number | null
          feedback?: string | null
          improvements?: string[] | null
          submitted_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

/**
 * CONVENIENCE TYPE EXPORTS
 * Shorthand types for common database operations
 */
export type User = Database['public']['Tables']['profiles']['Row']
export type UserInsert = Database['public']['Tables']['profiles']['Insert']
export type UserUpdate = Database['public']['Tables']['profiles']['Update']

export type CrisisScenario = Database['public']['Tables']['crisis_scenarios']['Row']
export type CrisisScenarioInsert = Database['public']['Tables']['crisis_scenarios']['Insert']
export type CrisisScenarioUpdate = Database['public']['Tables']['crisis_scenarios']['Update']

export type UserResponse = Database['public']['Tables']['user_responses']['Row']
export type UserResponseInsert = Database['public']['Tables']['user_responses']['Insert']
export type UserResponseUpdate = Database['public']['Tables']['user_responses']['Update']