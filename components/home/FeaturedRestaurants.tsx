import { Link } from 'react-router-dom'
import { Star, MapPin, Clock, Phone, ChefHat } from 'lucide-react'

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
}

export default function FeaturedRestaurants({ restaurants }: FeaturedRestaurantsProps) {
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
      )
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" size={16} className="fill-yellow-400 text-yellow-400 opacity-50" />
      )
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} size={16} className="text-gray-300" />
      )
    }

    return stars
  }

  const renderPriceRange = (range: number) => {
    return '$'.repeat(range) + '$'.repeat(4 - range).replace(/\$/g, '·')
  }

  if (!restaurants.length) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Featured Restaurants
            </h2>
            <p className="text-gray-600">
              No featured restaurants available at the moment. Check back soon!
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
            Featured Restaurants
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover hand-picked favorites from Katy's dining scene, chosen for their 
            exceptional food, service, and local charm.
          </p>
        </div>

        {/* Restaurant grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {restaurants.map((restaurant) => (
            <div key={restaurant.id} className="card hover:shadow-lg transition-shadow duration-300">
              {/* Restaurant image */}
              <div className="relative h-48 overflow-hidden">
                {restaurant.cover_image_url ? (
                  <img
                    src={restaurant.cover_image_url}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement
                      target.onerror = null
                      target.src = '/images/restaurant-placeholder.jpg'
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <ChefHat size={48} className="text-gray-400" />
                  </div>
                )}
                
                {/* Featured badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-ekaty-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Featured
                  </span>
                </div>

                {/* Price range */}
                <div className="absolute top-4 right-4">
                  <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded text-sm font-medium">
                    {renderPriceRange(restaurant.price_range || 2)}
                  </span>
                </div>
              </div>

              <div className="card-body">
                {/* Restaurant info */}
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    <Link
                      to={`/restaurant/${restaurant.slug}`}
                      className="hover:text-ekaty-500 transition-colors"
                    >
                      {restaurant.name}
                    </Link>
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span className="flex items-center gap-1">
                      <ChefHat size={14} />
                      {restaurant.primary_cuisine?.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {restaurant.area?.name}
                    </span>
                  </div>

                  {/* Rating and reviews */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {renderStars(restaurant.average_rating)}
                    </div>
                    <span className="text-sm text-gray-600">
                      {restaurant.average_rating.toFixed(1)} ({restaurant.total_reviews} reviews)
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-2">
                    {restaurant.description}
                  </p>
                </div>

                {/* Features */}
                <div className="flex items-center gap-3 mb-4 text-xs text-gray-500">
                  {restaurant.delivery_available && (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                      Delivery
                    </span>
                  )}
                  {restaurant.kid_friendly && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Kid Friendly
                    </span>
                  )}
                  {restaurant.wifi_available && (
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      WiFi
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <Link
                    to={`/restaurant/${restaurant.slug}`}
                    className="btn-primary text-sm"
                  >
                    View Details
                  </Link>
                  
                  {restaurant.phone && (
                    <a
                      href={`tel:${restaurant.phone}`}
                      className="flex items-center gap-1 text-gray-600 hover:text-ekaty-500 transition-colors text-sm"
                    >
                      <Phone size={14} />
                      Call
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View all button */}
        <div className="text-center">
          <Link
            to="/restaurants"
            className="btn-outline text-lg px-8 py-3"
          >
            View All Restaurants
          </Link>
        </div>
      </div>
    </section>
  )
}