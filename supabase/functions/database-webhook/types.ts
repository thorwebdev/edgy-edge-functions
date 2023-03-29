export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      animals: {
        Row: {
          animal: string | null
          created_at: string | null
          id: number
        }
        Insert: {
          animal?: string | null
          created_at?: string | null
          id?: number
        }
        Update: {
          animal?: string | null
          created_at?: string | null
          id?: number
        }
      }
      discord_promise_challenge: {
        Row: {
          email: string | null
          id: number
          inserted_at: string
          promise: string
          resolved: boolean | null
          submission: string | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          email?: string | null
          id?: number
          inserted_at?: string
          promise: string
          resolved?: boolean | null
          submission?: string | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          email?: string | null
          id?: number
          inserted_at?: string
          promise?: string
          resolved?: boolean | null
          submission?: string | null
          updated_at?: string
          user_id?: string
          username?: string
        }
      }
      kysely_test: {
        Row: {
          created_at: string | null
          id: number
          test: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          test?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          test?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      install_available_extensions_and_test: {
        Args: Record<PropertyKey, never>
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
