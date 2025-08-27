import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Star, MapPin, Phone, Globe, Clock, Heart, Share2, Camera, Calendar, Users } from 'lucide-react'
import EnhancedRestaurantService from '../../lib/enhanced-restaurant-service'
import { useErrorHandler } from '@/components/common/ErrorHandler'
import ErrorHandler from '@/components/common/ErrorHandler'

interface Restaurant {
  id: number
  name: string
  description: string
  address: string
  phone: string
  website: string
  cuisine_type: string
  price_range: string
  rating: number
  total_reviews: number
  image_url: string
  hours: {
    [key: string]: string
  }
  slug: string
  features?: string[]
}

interface Review {
  id: number
  user_name: string
  rating: number
  comment: string
  date: string
}

export default function RestaurantDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const { errorState, setError, clearError } = useErrorHandler(3)
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'photos'>('overview')

  const fetchRestaurant = async () => {
    if (!slug) return

    try {
      clearError()
      setLoading(true)
      
      const restaurantData = await EnhancedRestaurantService.getRestaurantById(slug)
      
      if (restaurantData) {
        setRestaurant(restaurantData)
        // Mock reviews for now - can be replaced with actual API call
        setReviews([
          {
            id: 1,
            user_name: 'Sarah M.',
            rating: 5,
            comment: 'Amazing food and excellent service! The atmosphere was perfect for a date night.',
            date: '2024-01-15'
          },
          {
            id: 2,
            user_name: 'Mike K.',
            rating: 4,
            comment: 'Great food, friendly staff. Will definitely come back!',
            date: '2024-01-10'
          }
        ])
      } else {
        throw new Error('Restaurant not found')
      }
    } catch (err) {
      console.error('Error fetching restaurant:', err)
      const errorMessage = err instanceof Error ? err.message.toLowerCase() : ''
      
      // Classify error type with Cloudflare detection
      let errorType: 'network' | 'api' | 'timeout' | 'cloudflare' | 'generic' = 'generic'
      
      if (err instanceof Error && err.name) {
        switch (err.name) {
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
      
      setError(err as Error, errorType)
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = async () => {
    await fetchRestaurant()
  }

  useEffect(() => {
    fetchRestaurant()
  }, [slug])

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-gray-600">Loading restaurant details...</p>
        </div>
      </div>
    )
  }

  if (errorState.hasError || (!restaurant && !loading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          {errorState.hasError ? (
            <ErrorHandler 
              error={errorState.error}
              errorType={errorState.errorType}
              onRetry={handleRetry}
              size="large"
            />
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Restaurant Not Found</h1>
              <p className="text-gray-600 mb-6">The restaurant you're looking for could not be found.</p>
            </>
          )}
          <Link
            to="/restaurants"
            className="inline-flex items-center space-x-2 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors mt-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Restaurants</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-64 lg:h-80">
        <img
          src={restaurant.image_url || '/images/restaurant-placeholder.jpg'}
          alt={restaurant.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = '/images/restaurant-placeholder.jpg'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        
        {/* Back Button */}
        <Link
          to="/restaurants"
          className="absolute top-6 left-6 inline-flex items-center space-x-2 bg-white/95 text-gray-900 px-4 py-2 rounded-lg hover:bg-white transition-colors shadow-lg"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Link>

        {/* Action Buttons */}
        <div className="absolute top-6 right-6 flex space-x-3">
          <button className="p-3 bg-white/95 text-gray-900 rounded-lg hover:bg-white transition-colors shadow-lg">
            <Heart className="h-5 w-5" />
          </button>
          <button className="p-3 bg-white/95 text-gray-900 rounded-lg hover:bg-white transition-colors shadow-lg">
            <Share2 className="h-5 w-5" />
          </button>
        </div>

        {/* Restaurant Title */}
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">{restaurant.name}</h1>
          <div className="flex items-center space-x-4 text-white/90">
            <div className="flex items-center space-x-1">
              {renderStars(restaurant.rating)}
              <span className="ml-2 font-medium">{restaurant.rating}</span>
              <span className="text-sm">({restaurant.total_reviews} reviews)</span>
            </div>
            <span className="text-sm">{restaurant.cuisine_type}</span>
            <span className="text-sm">{restaurant.price_range}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                {(['overview', 'reviews', 'photos'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                      activeTab === tab
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">About {restaurant.name}</h2>
                  <p className="text-gray-700 leading-relaxed">{restaurant.description}</p>
                  
                  {restaurant.features && restaurant.features.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-medium text-gray-900 mb-3">Features & Amenities</h3>
                      <div className="flex flex-wrap gap-2">
                        {restaurant.features.map((feature, index) => (
                          <span
                            key={index}
                            className="inline-block bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {restaurant.hours && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Hours
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(restaurant.hours).map(([day, hours]) => (
                        <div key={day} className="flex justify-between">
                          <span className="font-medium text-gray-900 capitalize">{day}:</span>
                          <span className="text-gray-600">{hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Customer Reviews</h2>
                    <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                      Write a Review
                    </button>
                  </div>
                  
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0 mb-6 last:mb-0">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="font-medium text-orange-700">{review.user_name[0]}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{review.user_name}</h4>
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {renderStars(review.rating)}
                            </div>
                            <span className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Photos</h2>
                  <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2">
                    <Camera className="h-4 w-4" />
                    <span>Add Photo</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <img
                    src={restaurant.image_url || '/images/restaurant-placeholder.jpg'}
                    alt={restaurant.name}
                    className="aspect-square object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/images/restaurant-placeholder.jpg'
                    }}
                  />
                  {/* Placeholder for additional photos */}
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <Camera className="h-8 w-8 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Info</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-900">{restaurant.address}</p>
                    <button className="text-orange-600 hover:text-orange-700 text-sm font-medium mt-1">
                      Get Directions
                    </button>
                  </div>
                </div>
                
                {restaurant.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <a
                      href={`tel:${restaurant.phone}`}
                      className="text-orange-600 hover:text-orange-700 font-medium"
                    >
                      {formatPhoneNumber(restaurant.phone)}
                    </a>
                  </div>
                )}
                
                {restaurant.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-gray-400" />
                    <a
                      href={restaurant.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium">
                  Make Reservation
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>View Events</span>
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Join Waitlist</span>
                </button>
              </div>
            </div>

            {/* Rating Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Summary</h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">{restaurant.rating}</div>
                <div className="flex justify-center mb-2">
                  {renderStars(restaurant.rating)}
                </div>
                <p className="text-gray-600 text-sm">{restaurant.total_reviews} total reviews</p>
              </div>
              
              {/* Rating breakdown could go here */}
              <div className="mt-4 space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 w-8">{stars}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full" 
                        style={{ width: `${Math.random() * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}