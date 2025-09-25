import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      leaderboard: {
        Row: {
          id: string
          name: string
          completion_time: number
          total_attempts: number
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          completion_time: number
          total_attempts: number
          completed_at: string
        }
        Update: {
          id?: string
          name?: string
          completion_time?: number
          total_attempts?: number
          completed_at?: string
        }
      }
    }
  }
}
