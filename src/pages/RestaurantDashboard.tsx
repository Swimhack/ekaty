import { useState, useEffect } from 'react'
import { 
  User, 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  DollarSign, 
  Star,
  Edit,
  Save,
  X,
  Camera,
  Menu as MenuIcon,
  Users,
  TrendingUp,
  MessageSquare
} from 'lucide-react'
import { restaurantOwnerService, RestaurantOwner, RestaurantProfile } from '../../lib/restaurant-owner-service'
import RestaurantAuth from '../components/restaurant/RestaurantAuth'

export default function RestaurantDashboard() {
  const [currentOwner, setCurrentOwner] = useState<RestaurantOwner | null>(null)
  const [restaurant, setRestaurant] = useState<RestaurantProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState<Partial<RestaurantProfile>>({})
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    initializeDashboard()

    const unsubscribe = restaurantOwnerService.onAuthStateChange(async (owner) => {
      setCurrentOwner(owner)
      if (owner) {
        const profile = await restaurantOwnerService.getRestaurantProfile()
        setRestaurant(profile)
        if (profile) {
          setEditForm(profile)
        }
      } else {
        setRestaurant(null)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const initializeDashboard = async () => {
    setIsLoading(true)
    const owner = await restaurantOwnerService.initialize()
    setCurrentOwner(owner)
    
    if (owner) {
      const profile = await restaurantOwnerService.getRestaurantProfile()
      setRestaurant(profile)
      if (profile) {
        setEditForm(profile)
      }
    }
    setIsLoading(false)
  }

  const handleSave = async () => {
    if (!restaurant) return

    setIsSaving(true)
    try {
      const result = await restaurantOwnerService.updateRestaurantProfile(editForm)
      if (result.success) {
        const updatedProfile = await restaurantOwnerService.getRestaurantProfile()
        setRestaurant(updatedProfile)
        setIsEditing(false)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      alert('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (restaurant) {
      setEditForm(restaurant)
    }
    setIsEditing(false)
  }

  const handleInputChange = (field: keyof RestaurantProfile, value: any) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading Dashboard...</h2>
        </div>
      </div>
    )
  }

  if (!currentOwner) {
    return <RestaurantAuth onSuccess={initializeDashboard} />
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <Store className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Restaurant Profile</h2>
            <p className="text-gray-600 mb-4">There was an error loading your restaurant profile.</p>
            <button
              onClick={() => restaurantOwnerService.signOut()}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Store className="h-8 w-8 text-orange-500" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Restaurant Dashboard</h1>
                <p className="text-sm text-gray-500">{restaurant.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, {currentOwner.name}
              </div>
              <button
                onClick={() => restaurantOwnerService.signOut()}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'profile' 
                      ? 'bg-orange-50 text-orange-700 border border-orange-200' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span>Restaurant Profile</span>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'analytics' 
                      ? 'bg-orange-50 text-orange-700 border border-orange-200' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <TrendingUp className="h-5 w-5" />
                  <span>Analytics</span>
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'reviews' 
                      ? 'bg-orange-50 text-orange-700 border border-orange-200' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Reviews</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm border">
                {/* Profile Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Restaurant Information</h2>
                  <div className="flex items-center space-x-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleCancel}
                          disabled={isSaving}
                          className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                          <span>Cancel</span>
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
                        >
                          <Save className="h-4 w-4" />
                          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit Profile</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Profile Form */}
                <div className="p-6 space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Restaurant Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900">{restaurant.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editForm.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900">{restaurant.phone || 'Not provided'}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{restaurant.address || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editForm.description || ''}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Describe your restaurant..."
                      />
                    ) : (
                      <p className="text-gray-900">{restaurant.description || 'No description provided'}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hours
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.hours || ''}
                          onChange={(e) => handleInputChange('hours', e.target.value)}
                          placeholder="e.g., Mon-Sun: 9am-10pm"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900">{restaurant.hours || 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          value={editForm.website || ''}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900">{restaurant.website || 'Not provided'}</p>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Restaurant Features
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { key: 'delivery_available', label: 'Delivery Available' },
                        { key: 'takeout_available', label: 'Takeout Available' },
                        { key: 'kid_friendly', label: 'Kid Friendly' },
                        { key: 'wifi_available', label: 'WiFi Available' },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center">
                          {isEditing ? (
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={editForm[key as keyof RestaurantProfile] as boolean || false}
                                onChange={(e) => handleInputChange(key as keyof RestaurantProfile, e.target.checked)}
                                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">{label}</span>
                            </label>
                          ) : (
                            <div className="flex items-center">
                              <div className={`w-4 h-4 rounded ${
                                restaurant[key as keyof RestaurantProfile] 
                                  ? 'bg-green-500' 
                                  : 'bg-gray-300'
                              } mr-2`}></div>
                              <span className="text-sm text-gray-700">{label}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Restaurant Analytics</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-blue-600">Page Views</p>
                        <p className="text-2xl font-bold text-blue-900">1,234</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Star className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-green-600">Average Rating</p>
                        <p className="text-2xl font-bold text-green-900">{restaurant.average_rating || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <MessageSquare className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-purple-600">Total Reviews</p>
                        <p className="text-2xl font-bold text-purple-900">{restaurant.total_reviews || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Detailed analytics coming soon...</p>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Customer Reviews</h2>
                
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No reviews yet...</p>
                  <p className="text-sm mt-2">Reviews will appear here once customers start leaving feedback.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}