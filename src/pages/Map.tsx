
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { type Restaurant } from '../../lib/restaurant-service'
import EnhancedRestaurantService from '../../lib/enhanced-restaurant-service'
import { Link } from 'react-router-dom'
import { Star, MapPin, Phone } from 'lucide-react'

// Fix for default marker icons in React Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Create custom icon
const defaultIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Restaurant marker icon
const restaurantIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

export default function Map() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Katy, Texas coordinates
  const katyCenter: [number, number] = [29.7858, -95.8244]

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true)
        const response = await EnhancedRestaurantService.getRestaurants({
          limit: 100,
          offset: 0
        })
        setRestaurants(response.restaurants)
      } catch (err) {
        console.error('Error fetching restaurants:', err)
        setError('Failed to load restaurants')
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurants()
  }, [])

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" size={12} className="fill-yellow-400 text-yellow-400 opacity-50" />)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={12} className="text-gray-300" />)
    }

    return stars
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
          Restaurant Map
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Explore Katy's restaurants on an interactive map. Click on markers to see restaurant details.
        </p>
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="h-[600px] w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <p className="text-red-600 mb-2">Error loading map</p>
                <p className="text-gray-600 text-sm">{error}</p>
              </div>
            </div>
          ) : (
            <MapContainer
              center={katyCenter}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              className="leaflet-container"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                maxZoom={19}
              />
              
              {restaurants.map((restaurant) => {
                // Generate random coordinates around Katy for demo
                // In production, you'd have actual coordinates from your database
                const lat = katyCenter[0] + (Math.random() - 0.5) * 0.05
                const lng = katyCenter[1] + (Math.random() - 0.5) * 0.05
                
                return (
                  <Marker
                    key={restaurant.id}
                    position={[lat, lng]}
                    icon={restaurantIcon}
                  >
                    <Popup className="restaurant-popup" maxWidth={300}>
                      <div className="p-2">
                        <h3 className="font-bold text-lg mb-2 text-gray-900">
                          {restaurant.name}
                        </h3>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-2">
                          {renderStars(restaurant.average_rating || 0)}
                          <span className="text-sm text-gray-600 ml-1">
                            ({restaurant.total_reviews || 0} reviews)
                          </span>
                        </div>

                        {/* Cuisine */}
                        <p className="text-sm text-blue-600 font-medium mb-2">
                          {restaurant.primary_cuisine?.name || 'Restaurant'}
                        </p>

                        {/* Address */}
                        <div className="flex items-start gap-1 mb-2 text-sm text-gray-600">
                          <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                          <span>{restaurant.address}</span>
                        </div>

                        {/* Phone */}
                        {restaurant.phone && (
                          <div className="flex items-center gap-1 mb-3 text-sm text-gray-600">
                            <Phone size={14} />
                            <a 
                              href={`tel:${restaurant.phone}`}
                              className="hover:text-blue-600"
                            >
                              {restaurant.phone}
                            </a>
                          </div>
                        )}

                        {/* Description */}
                        {restaurant.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                            {restaurant.description}
                          </p>
                        )}

                        {/* View Details Button */}
                        <Link
                          to={`/restaurant/${restaurant.slug || restaurant.id}`}
                          className="inline-block w-full text-center bg-orange-500 text-white py-2 px-3 rounded hover:bg-orange-600 transition-colors text-sm font-medium"
                        >
                          View Full Profile
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}
            </MapContainer>
          )}
        </div>
      </div>

      {/* Map Info */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-2">Interactive Map</h3>
          <p className="text-gray-600 text-sm">
            Click on restaurant markers to see details, ratings, and contact information.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-2">Powered by OpenStreetMap</h3>
          <p className="text-gray-600 text-sm">
            Free, open-source mapping with no API limits or usage restrictions.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-2">Find Nearby</h3>
          <p className="text-gray-600 text-sm">
            Discover restaurants in the Katy area with detailed profiles and reviews.
          </p>
        </div>
      </div>
    </div>
  )
}
