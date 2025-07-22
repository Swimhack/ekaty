
import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Filter, MapPin, Star, Phone, Clock, ChefHat } from 'lucide-react'
import { Link } from 'react-router-dom'

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
  secondary_cuisine?: { name: string }
  area: { name: string }
  delivery_available: boolean
  takeout_available: boolean
  kid_friendly: boolean
  wifi_available: boolean
  hours?: string
}

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
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedCuisine, setSelectedCuisine] = useState(searchParams.get('cuisine') || '')
  const [selectedArea, setSelectedArea] = useState(searchParams.get('area') || '')
  const [sortBy, setSortBy] = useState('name')

  // Fetch restaurants and cuisines
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Build API query parameters
        const params = new URLSearchParams()
        if (searchQuery) params.set('search', searchQuery)
        if (selectedCuisine) params.set('cuisine', selectedCuisine)
        if (selectedArea) params.set('area', selectedArea)
        params.set('limit', '50')

        // Fetch restaurants and cuisines in parallel
        const [restaurantsRes, cuisinesRes] = await Promise.all([
          fetch(`/api/restaurants.php?${params.toString()}`),
          fetch('/api/cuisines.php')
        ])

        if (restaurantsRes.ok) {
          const restaurantsData = await restaurantsRes.json()
          setRestaurants(restaurantsData.restaurants || [])
        }

        if (cuisinesRes.ok) {
          const cuisinesData = await cuisinesRes.json()
          setCuisines(cuisinesData || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
          <p>Loading restaurants...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
          Restaurants in Katy, Texas
        </h1>
        <p className="text-xl text-gray-600">
          Discover {restaurants.length} amazing dining options in the Katy area
        </p>
      </div>

      {/* Search and Filters */}
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
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cuisine filter */}
            <select
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="rating">Sort by Rating</option>
              <option value="reviews">Sort by Reviews</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Search Restaurants
          </button>
        </form>
      </div>

      {/* Results */}
      {sortedRestaurants.length === 0 ? (
        <div className="text-center py-12">
          <ChefHat size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No restaurants found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedRestaurants.map((restaurant) => (
            <div key={restaurant.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Restaurant image */}
              <div className="relative h-48 bg-gray-200">
                <img
                  src={restaurant.cover_image_url}
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
                  {restaurant.logo_url && restaurant.logo_url !== restaurant.cover_image_url && (
                    <img
                      src={restaurant.logo_url}
                      alt={`${restaurant.name} logo`}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  )}
                </div>

                {/* Rating */}
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
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span className="font-medium text-blue-600">
                    {restaurant.primary_cuisine.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{restaurant.area.name}</span>
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
                  to={`/restaurant/${restaurant.slug}`}
                  className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
