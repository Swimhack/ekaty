import { useState, useEffect } from 'react'
import Hero from '@/components/home/Hero'
import FeaturedRestaurants from '@/components/home/FeaturedRestaurants'
import SearchSection from '@/components/home/SearchSection'
import StatsSection from '@/components/home/StatsSection'
import NewsletterSignup from '@/components/home/NewsletterSignup'

interface Restaurant {
  id: number
  name: string
  description: string
  address: string
  phone: string
  average_rating: number
  total_reviews: number
  price_range: number
  logo_url: string
  cover_image_url: string
  slug: string
  primary_cuisine: { name: string }
  area: { name: string }
  delivery_available: boolean
  kid_friendly: boolean
  wifi_available: boolean
}

interface ApiResponse {
  restaurants: Restaurant[]
  pagination: {
    total: number
  }
}

export default function Index() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [totalRestaurants, setTotalRestaurants] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch featured restaurants (limit to 6 for homepage)
        const response = await fetch('/api/restaurants.php?limit=6')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data: ApiResponse = await response.json()
        
        if (data.restaurants) {
          setRestaurants(data.restaurants)
          setTotalRestaurants(data.pagination?.total || 0)
          
          // Calculate total reviews from all restaurants
          const reviewCount = data.restaurants.reduce((sum, restaurant) => sum + restaurant.total_reviews, 0)
          setTotalReviews(reviewCount)
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error)
        setError(error instanceof Error ? error.message : 'Failed to load restaurants')
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurants()
  }, [])

  // Show loading state or error if needed
  if (loading) {
    return (
      <>
        <Hero />
        <SearchSection />
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-gray-600">Loading featured restaurants...</p>
            </div>
          </div>
        </div>
        <StatsSection 
          restaurantCount={0}
          reviewCount={0}
        />
        <NewsletterSignup />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Hero />
        <SearchSection />
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-red-600">Error loading restaurants: {error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 btn-primary"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
        <StatsSection 
          restaurantCount={0}
          reviewCount={0}
        />
        <NewsletterSignup />
      </>
    )
  }

  return (
    <>
      <Hero />
      <SearchSection />
      <FeaturedRestaurants restaurants={restaurants} />
      <StatsSection 
        restaurantCount={totalRestaurants}
        reviewCount={totalReviews}
      />
      <NewsletterSignup />
    </>
  )
}