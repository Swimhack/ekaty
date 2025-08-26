import { useState, useEffect } from 'react'
import Hero from '@/components/home/Hero'
import FeaturedRestaurants from '@/components/home/FeaturedRestaurants'
import SearchSection from '@/components/home/SearchSection'
import StatsSection from '@/components/home/StatsSection'
import NewsletterSignup from '@/components/home/NewsletterSignup'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { NetworkStatus, useErrorHandler } from '@/components/common/ErrorHandler'
import EnhancedRestaurantService from '../../lib/enhanced-restaurant-service'
import { type Restaurant } from '../../lib/restaurant-service'

export default function Index() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [totalRestaurants, setTotalRestaurants] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [loading, setLoading] = useState(true)
  const { errorState, setError, clearError, retry } = useErrorHandler(3)

  const fetchData = async () => {
    try {
      clearError()
      setLoading(true)

      // Fetch both featured restaurants and stats in parallel for better performance
      const [restaurantData, statsData] = await Promise.all([
        EnhancedRestaurantService.getRestaurants({ limit: 6, offset: 0 }),
        EnhancedRestaurantService.getStats()
      ])
      
      if (restaurantData.restaurants) {
        setRestaurants(restaurantData.restaurants)
      }

      // Use the accurate stats from the getStats method
      setTotalRestaurants(statsData.restaurantCount)
      setTotalReviews(statsData.totalReviews)

    } catch (error) {
      console.error('Error fetching data:', error)
      const errorType = error instanceof Error && error.name ? 
        (error.name === 'NetworkError' ? 'network' : 
         error.name === 'TimeoutError' ? 'timeout' : 'api') : 'generic'
      setError(error as Error, errorType)
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = async () => {
    await retry(fetchData)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <>
      <NetworkStatus />
      <ErrorBoundary>
        <Hero />
        <SearchSection />
        <FeaturedRestaurants 
          restaurants={restaurants}
          loading={loading}
          error={errorState.hasError ? errorState.error : null}
          onRetry={handleRetry}
        />
        <StatsSection 
          restaurantCount={totalRestaurants}
          reviewCount={totalReviews}
          loading={loading}
          error={errorState.hasError ? errorState.error : null}
          onRetry={handleRetry}
        />
        <NewsletterSignup />
      </ErrorBoundary>
    </>
  )
}