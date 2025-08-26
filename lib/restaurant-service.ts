import { supabase } from './supabase'
import type { Tables } from '../src/integrations/supabase/types'

export type Restaurant = Tables<'restaurants'> & {
  average_rating?: number
  total_reviews?: number
  slug?: string
  primary_cuisine?: { name: string }
  secondary_cuisine?: { name: string }
  area?: { name: string }
  delivery_available?: boolean
  takeout_available?: boolean
  kid_friendly?: boolean
  wifi_available?: boolean
}

export interface RestaurantsResponse {
  restaurants: Restaurant[]
  pagination: {
    total: number
    limit: number
    offset: number
    has_more: boolean
  }
  filters_applied: {
    search?: string
    cuisine?: string
    area?: string
  }
}

export interface RestaurantFilters {
  search?: string
  cuisine?: string
  area?: string
  limit?: number
  offset?: number
}

export class RestaurantService {
  static async getRestaurants(filters: RestaurantFilters = {}): Promise<RestaurantsResponse> {
    const {
      search = '',
      cuisine = '',
      area = '',
      limit = 20,
      offset = 0
    } = filters

    // Debug logging
    console.log('🔍 Restaurant Service Filters:', { search, cuisine, area, limit, offset })

    try {
      // Build the query
      let query = supabase
        .from('restaurants')
        .select('*')

      // Apply search filter
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,cuisine.cs.{${search}}`)
      }

      // Apply cuisine filter with flexible matching
      if (cuisine) {
        // Create variations of the cuisine name to handle different formats in database
        const cuisineVariations = [
          cuisine, // exact match
          cuisine.toLowerCase(), 
          cuisine.toUpperCase(),
          cuisine.charAt(0).toUpperCase() + cuisine.slice(1).toLowerCase(), // Title case
        ]
        
        // Handle common mappings
        const cuisineMap: { [key: string]: string[] } = {
          'BBQ': ['BBQ', 'Barbecue', 'Bar-B-Que', 'Barbeque'],
          'Asian': ['Asian', 'Chinese', 'Japanese', 'Thai', 'Korean', 'Vietnamese'],
          'Steakhouse': ['Steakhouse', 'Steak House', 'Steak'],
          'Breakfast': ['Breakfast', 'Brunch', 'American (Traditional)'],
          'Mexican': ['Mexican', 'Tex-Mex', 'Latin American'],
          'Italian': ['Italian', 'Pizza', 'Mediterranean']
        }
        
        // Add mapped variations if available
        if (cuisineMap[cuisine]) {
          cuisineVariations.push(...cuisineMap[cuisine])
        }
        
        // Remove duplicates
        const uniqueVariations = [...new Set(cuisineVariations)]
        
        console.log(`🔍 Searching for cuisine variations:`, uniqueVariations)
        
        // Use overlaps with all variations
        query = query.overlaps('cuisine', uniqueVariations)
      }

      // Apply area filter
      if (area) {
        query = query.ilike('address', `%${area}%`)
      }

      // Apply pagination and ordering
      query = query
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching restaurants:', error)
        throw error
      }

      // Transform the data to match the expected format
      const restaurants: Restaurant[] = (data || []).map((restaurant) => ({
        ...restaurant,
        average_rating: restaurant.rating || 0,
        total_reviews: restaurant.total_reviews_count || 0,
        slug: this.generateSlug(restaurant.name),
        primary_cuisine: { name: restaurant.cuisine[0] || 'Restaurant' },
        secondary_cuisine: restaurant.cuisine[1] ? { name: restaurant.cuisine[1] } : undefined,
        area: { name: this.extractCityFromAddress(restaurant.address) },
        delivery_available: true, // Default values since not in current schema
        takeout_available: true,
        kid_friendly: false,
        wifi_available: false
      }))

      // Get total count for pagination
      const { count: totalCount, error: countError } = await supabase
        .from('restaurants')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        console.error('Error getting count:', countError)
      }

      const total = totalCount || 0

      return {
        restaurants,
        pagination: {
          total,
          limit,
          offset,
          has_more: (offset + limit) < total
        },
        filters_applied: {
          search: search || undefined,
          cuisine: cuisine || undefined,
          area: area || undefined
        }
      }

    } catch (error) {
      console.error('Restaurant service error:', error)
      throw error
    }
  }

  static async getCuisines(): Promise<Array<{ id: number; name: string; restaurant_count: number }>> {
    try {
      // Get all unique cuisines from restaurants
      const { data, error } = await supabase
        .from('restaurants')
        .select('cuisine')

      if (error) {
        console.error('Error fetching cuisines:', error)
        throw error
      }

      // Flatten all cuisine arrays and count occurrences
      const cuisineMap = new Map<string, number>()
      
      data?.forEach((restaurant) => {
        restaurant.cuisine?.forEach((cuisine: string) => {
          cuisineMap.set(cuisine, (cuisineMap.get(cuisine) || 0) + 1)
        })
      })

      // Convert to array format
      const cuisines = Array.from(cuisineMap.entries()).map(([name, count], index) => ({
        id: index + 1,
        name,
        restaurant_count: count
      }))

      // Sort by restaurant count descending
      return cuisines.sort((a, b) => b.restaurant_count - a.restaurant_count)

    } catch (error) {
      console.error('Error fetching cuisines:', error)
      return []
    }
  }

  static async getStats(): Promise<{
    restaurantCount: number
    averageRating: number
    totalReviews: number
    totalCities: number
  }> {
    try {
      // Get restaurant count and ratings
      const { data: restaurants, error: restaurantError } = await supabase
        .from('restaurants')
        .select('rating, address, total_reviews_count')

      if (restaurantError) {
        console.error('Error fetching restaurant stats:', restaurantError)
        throw restaurantError
      }

      // Get total reviews count
      const { count: reviewCount, error: reviewError } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })

      if (reviewError) {
        console.error('Error fetching review count:', reviewError)
      }

      // Calculate stats from restaurant data
      const restaurantCount = restaurants?.length || 0
      const validRatings = restaurants?.filter(r => r.rating && r.rating > 0) || []
      const averageRating = validRatings.length > 0 
        ? validRatings.reduce((sum, r) => sum + r.rating!, 0) / validRatings.length
        : 0

      // Calculate total reviews from restaurant records or direct count
      const totalReviews = reviewCount || 
        (restaurants?.reduce((sum, r) => sum + (r.total_reviews_count || 0), 0) || 0)

      // Get unique cities
      const cities = new Set<string>()
      restaurants?.forEach(restaurant => {
        if (restaurant.address) {
          const parts = restaurant.address.split(',')
          if (parts.length >= 2) {
            cities.add(parts[1].trim())
          } else {
            cities.add('Katy')
          }
        }
      })

      return {
        restaurantCount,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        totalCities: cities.size
      }

    } catch (error) {
      console.error('Error fetching stats:', error)
      return {
        restaurantCount: 0,
        averageRating: 0,
        totalReviews: 0,
        totalCities: 0
      }
    }
  }

  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/--+/g, '-') // Replace multiple hyphens with single
      .trim()
  }

  private static extractCityFromAddress(address: string): string {
    // Try to extract city from address - look for common patterns
    const parts = address.split(',')
    
    // If address has comma-separated parts, assume format: street, city, state zip
    if (parts.length >= 2) {
      return parts[1].trim()
    }
    
    // Default fallback
    return 'Katy'
  }
}