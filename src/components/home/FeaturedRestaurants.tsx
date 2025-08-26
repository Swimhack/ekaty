import { memo, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, Clock, Phone, ChefHat } from 'lucide-react'
import { FeaturedRestaurantsSkeleton } from '../common/LoadingSkeletons'
import ErrorHandler from '../common/ErrorHandler'

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

interface FeaturedRestaurantsProps {
  restaurants: Restaurant[]
  loading?: boolean
  error?: Error | null
  onRetry?: () => void
}

// Memoized StarRating component
const StarRating = memo(({ rating }: { rating: number }) => {
  const stars = useMemo(() => {
    const starsArray = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      starsArray.push(
        <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
      )
    }

    if (hasHalfStar) {
      starsArray.push(
        <Star key="half" size={16} className="fill-yellow-400 text-yellow-400 opacity-50" />
      )
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      starsArray.push(
        <Star key={`empty-${i}`} size={16} className="text-gray-300" />
      )
    }

    return starsArray
  }, [rating])

  return <div className="flex items-center gap-1">{stars}</div>
})
StarRating.displayName = 'StarRating'

// Memoized PriceRange component
const PriceRange = memo(({ range }: { range: number }) => {
  const priceDisplay = useMemo(() => {
    return '$'.repeat(range) + '$'.repeat(Math.max(0, 4 - range))
  }, [range])

  return <span>{priceDisplay}</span>
})
PriceRange.displayName = 'PriceRange'

const FeaturedRestaurants = memo(function FeaturedRestaurants({ restaurants, loading = false, error = null, onRetry }: FeaturedRestaurantsProps) {
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    target.nextElementSibling?.classList.remove('hidden');
  }, [])

  const handleLogoError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
  }, [])

  // Show loading skeleton
  if (loading) {
    return <FeaturedRestaurantsSkeleton />
  }

  // Show error state
  if (error) {
    return (
      <section className="py-12 sm:py-16 bg-white">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Featured Restaurants
            </h2>
          </div>
          <ErrorHandler 
            error={error}
            errorType={error.name === 'NetworkError' ? 'network' : 'api'}
            onRetry={onRetry}
            size="medium"
          />
        </div>
      </section>
    )
  }

  if (!restaurants || restaurants.length === 0) {
    return (
      <section className="py-12 sm:py-16 bg-white">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Featured Restaurants
            </h2>
            <div className="max-w-md mx-auto">
              <ChefHat size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">No featured restaurants available at the moment.</p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="btn-primary"
                  aria-label="Refresh featured restaurants"
                >
                  Refresh
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-8 sm:mb-12 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-gray-900 mb-3 sm:mb-4">
            Featured Restaurants
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the top-rated dining spots that make Katy special
          </p>
        </div>

        {/* Featured restaurants grid */}
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 w-full">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 w-full max-w-full"
            >
              {/* Restaurant image */}
              <div className="relative h-40 sm:h-48 bg-gray-200 w-full overflow-hidden">
                <img
                  src={restaurant.cover_image_url}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
                <div className="hidden w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center absolute inset-0">
                  <ChefHat size={48} className="text-gray-400" />
                </div>
                
                {/* Price range badge */}
                <div className="absolute top-4 right-4">
                  <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-medium text-gray-700">
                    <PriceRange range={restaurant.price_range} />
                  </span>
                </div>
              </div>

              {/* Restaurant details */}
              <div className="p-4 sm:p-6 w-full min-w-0">
                {/* Header */}
                <div className="mb-4 min-w-0">
                  <div className="flex items-start justify-between mb-2 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-1 min-w-0 flex-1 pr-2">
                      {restaurant.name}
                    </h3>
                    {restaurant.logo_url && restaurant.logo_url !== '/images/no_profile_img.jpg' && (
                      <img
                        src={restaurant.logo_url}
                        alt={`${restaurant.name} logo`}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        onError={handleLogoError}
                      />
                    )}
                  </div>
                  
                  {/* Rating and reviews */}
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={restaurant.average_rating} />
                    <span className="text-sm font-medium text-gray-700">
                      {restaurant.average_rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({restaurant.total_reviews} reviews)
                    </span>
                  </div>

                  {/* Cuisine and area */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="font-medium text-ekaty-600">
                      {restaurant.primary_cuisine.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{restaurant.area.name}</span>
                    </div>
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
                  {restaurant.kid_friendly && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Kid Friendly
                    </span>
                  )}
                  {restaurant.wifi_available && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      WiFi
                    </span>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                  <div className="flex items-center gap-2 text-sm text-gray-500 min-w-0 flex-1">
                    <MapPin size={14} className="flex-shrink-0" />
                    <span className="truncate">{restaurant.address}</span>
                  </div>
                  
                  <Link
                    to={`/restaurant/${restaurant.slug}`}
                    className="btn-primary text-sm w-full sm:w-auto text-center flex-shrink-0"
                  >
                    View Details
                  </Link>
                </div>

                {/* Contact info */}
                {restaurant.phone && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={14} />
                      <a
                        href={`tel:${restaurant.phone}`}
                        className="hover:text-ekaty-600 transition-colors"
                      >
                        {restaurant.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* View all button */}
        <div className="text-center">
          <Link
            to="/restaurants"
            className="inline-flex items-center gap-2 btn-secondary"
          >
            <ChefHat size={20} />
            View All Restaurants
          </Link>
        </div>
      </div>
    </section>
  )
})

export default FeaturedRestaurants