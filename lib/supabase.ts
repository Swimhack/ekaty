import { createClient as createBrowserClient } from './supabase-client'

export const createClient = createBrowserClient

// Database types will be generated with: npm run db:generate
export type Database = {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: number
          name: string
          description: string | null
          address: string
          city: string
          state: string
          zip_code: string | null
          phone: string | null
          website: string | null
          hours: any | null
          price_range: number | null
          latitude: number | null
          longitude: number | null
          area_id: number | null
          primary_cuisine_id: number | null
          secondary_cuisine_id: number | null
          tertiary_cuisine_id: number | null
          delivery_available: boolean
          wifi_available: boolean
          kid_friendly: boolean
          outdoor_seating: boolean
          accepts_reservations: boolean
          status: 'active' | 'inactive' | 'pending'
          featured: boolean
          featured_until: string | null
          owner_user_id: string | null
          slug: string | null
          meta_title: string | null
          meta_description: string | null
          logo_url: string | null
          cover_image_url: string | null
          gallery_images: any | null
          facebook_url: string | null
          twitter_url: string | null
          instagram_url: string | null
          google_place_id: string | null
          google_rating: number | null
          google_reviews_count: number
          total_reviews: number
          average_rating: number
          total_views: number
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          description?: string | null
          address: string
          city?: string
          state?: string
          zip_code?: string | null
          phone?: string | null
          website?: string | null
          hours?: any | null
          price_range?: number | null
          latitude?: number | null
          longitude?: number | null
          area_id?: number | null
          primary_cuisine_id?: number | null
          secondary_cuisine_id?: number | null
          tertiary_cuisine_id?: number | null
          delivery_available?: boolean
          wifi_available?: boolean
          kid_friendly?: boolean
          outdoor_seating?: boolean
          accepts_reservations?: boolean
          status?: 'active' | 'inactive' | 'pending'
          featured?: boolean
          featured_until?: string | null
          owner_user_id?: string | null
          slug?: string | null
          meta_title?: string | null
          meta_description?: string | null
          logo_url?: string | null
          cover_image_url?: string | null
          gallery_images?: any | null
          facebook_url?: string | null
          twitter_url?: string | null
          instagram_url?: string | null
          google_place_id?: string | null
          google_rating?: number | null
          google_reviews_count?: number
          total_reviews?: number
          average_rating?: number
          total_views?: number
        }
        Update: {
          name?: string
          description?: string | null
          address?: string
          city?: string
          state?: string
          zip_code?: string | null
          phone?: string | null
          website?: string | null
          hours?: any | null
          price_range?: number | null
          latitude?: number | null
          longitude?: number | null
          area_id?: number | null
          primary_cuisine_id?: number | null
          secondary_cuisine_id?: number | null
          tertiary_cuisine_id?: number | null
          delivery_available?: boolean
          wifi_available?: boolean
          kid_friendly?: boolean
          outdoor_seating?: boolean
          accepts_reservations?: boolean
          status?: 'active' | 'inactive' | 'pending'
          featured?: boolean
          featured_until?: string | null
          owner_user_id?: string | null
          slug?: string | null
          meta_title?: string | null
          meta_description?: string | null
          logo_url?: string | null
          cover_image_url?: string | null
          gallery_images?: any | null
          facebook_url?: string | null
          twitter_url?: string | null
          instagram_url?: string | null
          google_place_id?: string | null
          google_rating?: number | null
          google_reviews_count?: number
          total_reviews?: number
          average_rating?: number
          total_views?: number
        }
      }
      reviews: {
        Row: {
          id: number
          restaurant_id: number
          user_id: string
          food_rating: number
          service_rating: number
          value_rating: number
          atmosphere_rating: number
          overall_rating: number
          title: string | null
          content: string | null
          pros: string | null
          cons: string | null
          status: 'pending' | 'approved' | 'rejected'
          helpful_count: number
          reported_count: number
          visit_date: string | null
          party_size: number | null
          meal_type: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          restaurant_id: number
          user_id: string
          food_rating: number
          service_rating: number
          value_rating: number
          atmosphere_rating: number
          title?: string | null
          content?: string | null
          pros?: string | null
          cons?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          helpful_count?: number
          reported_count?: number
          visit_date?: string | null
          party_size?: number | null
          meal_type?: string | null
        }
        Update: {
          restaurant_id?: number
          user_id?: string
          food_rating?: number
          service_rating?: number
          value_rating?: number
          atmosphere_rating?: number
          title?: string | null
          content?: string | null
          pros?: string | null
          cons?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          helpful_count?: number
          reported_count?: number
          visit_date?: string | null
          party_size?: number | null
          meal_type?: string | null
        }
      }
      cuisines: {
        Row: {
          id: number
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          description?: string | null
        }
        Update: {
          name?: string
          description?: string | null
        }
      }
      areas: {
        Row: {
          id: number
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          description?: string | null
        }
        Update: {
          name?: string
          description?: string | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          display_name: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          current_location_id: number | null
          status: 'active' | 'inactive' | 'suspended'
          email_verified: boolean
          newsletter_subscribed: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          display_name?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          current_location_id?: number | null
          status?: 'active' | 'inactive' | 'suspended'
          email_verified?: boolean
          newsletter_subscribed?: boolean
          last_login?: string | null
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          display_name?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          current_location_id?: number | null
          status?: 'active' | 'inactive' | 'suspended'
          email_verified?: boolean
          newsletter_subscribed?: boolean
          last_login?: string | null
        }
      }
    }
  }
}