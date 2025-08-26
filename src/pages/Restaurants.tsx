
import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Filter, MapPin, Star, Phone, Clock, ChefHat, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { type Restaurant } from '../../lib/restaurant-service'
import EnhancedRestaurantService from '../../lib/enhanced-restaurant-service'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { NetworkStatus, useErrorHandler } from '@/components/common/ErrorHandler'
import { PageLoadingSkeleton, SearchFiltersSkeleton, SearchResultsSkeleton } from '@/components/common/LoadingSkeletons'
import ErrorHandler from '@/components/common/ErrorHandler'

interface Cuisine {
  id: number
  name: string
  restaurant_count: number
}

export default function Restaurants() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [cuisines, setCuisines] = useState<Cuisine[]>([])
  const [loading, setLoading] = useState(true)
  const [cuisinesLoading, setCuisinesLoading] = useState(true)
  const { errorState, setError, clearError, retry } = useErrorHandler(3)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedCuisine, setSelectedCuisine] = useState(searchParams.get('cuisine') || '')
  const [selectedArea, setSelectedArea] = useState(searchParams.get('area') || '')
  const [sortBy, setSortBy] = useState('name')

  // Update state when URL parameters change
  useEffect(() => {
    const newSearchQuery = searchParams.get('q') || ''
    const newCuisine = searchParams.get('cuisine') || ''
    const newArea = searchParams.get('area') || ''
    
    console.log('🔍 URL params changed:', { 
      q: newSearchQuery, 
      cuisine: newCuisine, 
      area: newArea 
    })
    
    setSearchQuery(newSearchQuery)
    setSelectedCuisine(newCuisine)
    setSelectedArea(newArea)
  }, [searchParams])

  // Fetch restaurants and cuisines
  const fetchData = async () => {
    try {
      clearError()
      setLoading(true)
      
      console.log('🔍 Restaurants page filters:', {
        searchQuery: searchQuery || undefined,
        selectedCuisine: selectedCuisine || undefined,
        selectedArea: selectedArea || undefined
      })
      
      // Fetch restaurants and cuisines in parallel
      const [restaurantsResponse, cuisinesData] = await Promise.all([
        EnhancedRestaurantService.getRestaurants({
          search: searchQuery || undefined,
          cuisine: selectedCuisine || undefined,
          area: selectedArea || undefined,
          limit: 50,
          offset: 0
        }),
        cuisinesLoading ? EnhancedRestaurantService.getCuisines() : Promise.resolve(cuisines)
      ])

      console.log('🔍 Restaurant response:', restaurantsResponse)
      console.log('🔍 Available cuisines:', cuisinesData)

      setRestaurants(restaurantsResponse.restaurants)
      if (cuisinesLoading) {
        setCuisines(cuisinesData)
        setCuisinesLoading(false)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      const errorMessage = error instanceof Error ? error.message.toLowerCase() : ''
      
      // Classify error type with Cloudflare detection
      let errorType: 'network' | 'api' | 'timeout' | 'cloudflare' | 'generic' = 'generic'
      
      if (error instanceof Error && error.name) {
        switch (error.name) {
          case 'NetworkError':
            errorType = 'network'
            break
          case 'TimeoutError':
            errorType = errorMessage.includes('cloudflare') || 
                       errorMessage.includes('cf-ray') ||
                       errorMessage.includes('connection timed out') ? 'cloudflare' : 'timeout'
            break
          default:
            errorType = 'api'
        }
      } else if (errorMessage.includes('cloudflare') || errorMessage.includes('timeout')) {
        errorType = 'cloudflare'
      }
      
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
  }, [searchQuery, selectedCuisine, selectedArea])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (selectedCuisine) params.set('cuisine', selectedCuisine)
    if (selectedArea) params.set('area', selectedArea)
    setSearchParams(params)
  }, [searchQuery, selectedCuisine, selectedArea, setSearchParams])

  // Sort restaurants
  const sortedRestaurants = useMemo(() => {
    const sorted = [...restaurants]
    switch (sortBy) {
      case 'rating':
        return sorted.sort((a, b) => b.average_rating - a.average_rating)
      case 'reviews':
        return sorted.sort((a, b) => b.total_reviews - a.total_reviews)
      case 'name':
      default:
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
    }
  }, [restaurants, sortBy])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // The useEffect will handle the API call
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" size={14} className="fill-yellow-400 text-yellow-400 opacity-50" />)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={14} className="text-gray-300" />)
    }

    return stars
  }

  const renderPriceRange = (range: number) => {
    return '$'.repeat(range) + '$'.repeat(Math.max(0, 4 - range))
  }

  // Show loading skeleton
  if (loading && restaurants.length === 0) {
    return (
      <>
        <NetworkStatus />
        <PageLoadingSkeleton />
      </>
    )
  }

  return (
    <>
      <NetworkStatus />
      <ErrorBoundary>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
              {selectedCuisine ? `${selectedCuisine} Restaurants in Katy` : 'Restaurants in Katy, Texas'}
            </h1>
            <p className="text-xl text-gray-600">
              {loading ? (
                'Loading amazing dining options...'
              ) : selectedCuisine ? (
                `Found ${restaurants.length} ${selectedCuisine.toLowerCase()} restaurants in the Katy area`
              ) : (
                `Discover ${restaurants.length} amazing dining options in the Katy area`
              )}
            </p>
            {selectedCuisine && (
              <div className="mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  <span className="mr-2">🍽️</span>
                  Filtering by: {selectedCuisine}
                  <button
                    onClick={() => {
                      setSelectedCuisine('')
                      const params = new URLSearchParams(searchParams)
                      params.delete('cuisine')
                      setSearchParams(params)
                    }}
                    className="ml-2 text-orange-600 hover:text-orange-800"
                    title="Clear filter"
                  >
                    ×
                  </button>
                </span>
              </div>
            )}
          </div>

          {/* Search and Filters */}
          {cuisinesLoading ? (
            <SearchFiltersSkeleton />
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <form onSubmit={handleSearch} className="space-y-4">
                {/* Search bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search restaurants, cuisines, or dishes..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                    aria-label="Search restaurants"
                  />
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Cuisine filter */}
                  <select
                    value={selectedCuisine}
                    onChange={(e) => setSelectedCuisine(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                    aria-label="Filter by cuisine"
                  >
                    <option value="">All Cuisines</option>
                    {cuisines.map((cuisine) => (
                      <option key={cuisine.id} value={cuisine.name}>
                        {cuisine.name} ({cuisine.restaurant_count})
                      </option>
                    ))}
                  </select>

                  {/* Area filter */}
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                    aria-label="Filter by area"
                  >
                    <option value="">All Areas</option>
                    <option value="Katy">Katy</option>
                    <option value="Cinco Ranch">Cinco Ranch</option>
                    <option value="Mason Creek">Mason Creek</option>
                    <option value="Cross Creek Ranch">Cross Creek Ranch</option>
                    <option value="Old Katy">Old Katy</option>
                    <option value="West Katy">West Katy</option>
                  </select>

                  {/* Sort by */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                    aria-label="Sort restaurants"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="rating">Sort by Rating</option>
                    <option value="reviews">Sort by Reviews</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Search Restaurants'}
                </button>
              </form>
            </div>
          )}

          {/* Error state */}
          {errorState.hasError && (
            <div className="mb-8">
              <ErrorHandler 
                error={errorState.error}
                errorType={errorState.errorType}
                onRetry={handleRetry}
                size="medium"
              />
            </div>
          )}

          {/* Results */}
          {loading ? (
            <SearchResultsSkeleton />
          ) : sortedRestaurants.length === 0 && !errorState.hasError ? (
            <div className="text-center py-12">
              <ChefHat size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No restaurants found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters.</p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCuisine('')
                  setSelectedArea('')
                }}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          ) : !errorState.hasError ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedRestaurants.map((restaurant) => (
            <div key={restaurant.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Restaurant image */}
              <div className="relative h-48 bg-gray-200">
                <img
                  src={restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop&crop=center'}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop&crop=center';
                  }}
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-medium">
                  {renderPriceRange(restaurant.price_range)}
                </div>
              </div>

              {/* Restaurant details */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                    {restaurant.name}
                  </h3>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {renderStars(restaurant.average_rating || 0)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {(restaurant.average_rating || 0).toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({restaurant.total_reviews || 0} reviews)
                  </span>
                </div>

                {/* Cuisine and area */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span className="font-medium text-blue-600">
                    {restaurant.primary_cuisine?.name || 'Restaurant'}
                  </span>
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{restaurant.area?.name || 'Katy'}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {restaurant.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {restaurant.delivery_available && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Delivery
                    </span>
                  )}
                  {restaurant.takeout_available && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Takeout
                    </span>
                  )}
                  {restaurant.kid_friendly && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Kid Friendly
                    </span>
                  )}
                  {restaurant.wifi_available && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      WiFi
                    </span>
                  )}
                </div>

                {/* Contact info */}
                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    <span className="truncate">{restaurant.address}</span>
                  </div>
                  {restaurant.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} />
                      <a href={`tel:${restaurant.phone}`} className="hover:text-blue-600">
                        {restaurant.phone}
                      </a>
                    </div>
                  )}
                </div>

                {/* Action button */}
                <Link
                  to={`/restaurant/${restaurant.slug || restaurant.id}`}
                  className="block w-full text-center bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  View Details
                </Link>
              </div>
            </div>
              ))}
            </div>
          ) : null}
        </div>
      </ErrorBoundary>
    </>
  )
}
