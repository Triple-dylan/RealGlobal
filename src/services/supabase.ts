import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a fallback client if environment variables are missing
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Using fallback client.')
    // Return a mock client that won't crash the app
    return createClient('https://fallback.supabase.co', 'fallback-key')
  }
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = createSupabaseClient()

// Database table types
export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string
          address: string
          lat: number
          lng: number
          price: number
          size: number
          type: string
          zoning: string
          opportunity_score: number
          listing_date: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          address: string
          lat: number
          lng: number
          price: number
          size: number
          type: string
          zoning: string
          opportunity_score: number
          listing_date: string
          status: string
          created_at?: string
        }
        Update: {
          id?: string
          address?: string
          lat?: number
          lng?: number
          price?: number
          size?: number
          type?: string
          zoning?: string
          opportunity_score?: number
          listing_date?: string
          status?: string
          created_at?: string
        }
      }
      zoning_data: {
        Row: {
          id: string
          name: string
          type: string
          coordinates: any
          restrictions: string[]
          opportunities: string[]
          score: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          coordinates: any
          restrictions: string[]
          opportunities: string[]
          score: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          coordinates?: any
          restrictions?: string[]
          opportunities?: string[]
          score?: number
          created_at?: string
        }
      }
      economic_data: {
        Row: {
          id: string
          region: string
          gdp_growth: number
          property_appreciation: number
          builder_accessibility: number
          international_accessibility: number
          last_updated: string
          created_at: string
        }
        Insert: {
          id?: string
          region: string
          gdp_growth: number
          property_appreciation: number
          builder_accessibility: number
          international_accessibility: number
          last_updated: string
          created_at?: string
        }
        Update: {
          id?: string
          region?: string
          gdp_growth?: number
          property_appreciation?: number
          builder_accessibility?: number
          international_accessibility?: number
          last_updated?: string
          created_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          user_id: string
          name: string
          region: string
          coordinates: any
          filters: any
          is_active: boolean
          created_at: string
          last_triggered?: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          region: string
          coordinates: any
          filters: any
          is_active: boolean
          created_at?: string
          last_triggered?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          region?: string
          coordinates?: any
          filters?: any
          is_active?: boolean
          created_at?: string
          last_triggered?: string
        }
      }
      ai_reports: {
        Row: {
          id: string
          user_id: string
          region: string
          coordinates: any
          summary: string
          development_opportunities: string[]
          permit_requirements: string[]
          governing_bodies: string[]
          estimated_cost: number
          estimated_roi: number
          risks: string[]
          recommendations: string[]
          generated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          region: string
          coordinates: any
          summary: string
          development_opportunities: string[]
          permit_requirements: string[]
          governing_bodies: string[]
          estimated_cost: number
          estimated_roi: number
          risks: string[]
          recommendations: string[]
          generated_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          region?: string
          coordinates?: any
          summary?: string
          development_opportunities?: string[]
          permit_requirements?: string[]
          governing_bodies?: string[]
          estimated_cost?: number
          estimated_roi?: number
          risks?: string[]
          recommendations?: string[]
          generated_at?: string
          created_at?: string
        }
      }
    }
  }
} 