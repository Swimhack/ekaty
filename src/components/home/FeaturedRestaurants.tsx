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
    return '$'.repeat(range) + '$'.repeat(4 - range)
  }

  if (!restaurants || restaurants.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Featured Restaurants
            </h2>
            <p className="text-gray-600">No restaurants available at the moment.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
            Featured Restaurants
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the top-rated dining spots that make Katy special
          </p>
        </div>

        {/* Featured restaurants grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* Restaurant image */}
              <div className="relative h-48 bg-gray-200">
                {restaurant.cover_image_url ? (
                  <img
                    src={restaurant.cover_image_url}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <ChefHat size={48} className="text-gray-400" />
                  </div>
                )}
                
                {/* Price range badge */}
                <div className="absolute top-4 right-4">
                  <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-medium text-gray-700">
                    {renderPriceRange(restaurant.price_range)}
                  </span>
                </div>
              </div>

              {/* Restaurant details */}
              <div className="p-6">
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                      {restaurant.name}
                    </h3>
                    {restaurant.logo_url && (
                      <img
                        src={restaurant.logo_url}
                        alt={`${restaurant.name} logo`}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                  </div>
                  
                  {/* Rating and reviews */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      {renderStars(restaurant.average_rating)}
                    </div>
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin size={14} />
                    <span className="truncate">{restaurant.address}</span>
                  </div>
                  
                  <Link
                    to={`/restaurants/${restaurant.slug}`}
                    className="btn-primary text-sm"
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
}