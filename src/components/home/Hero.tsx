
import { useState, useEffect } from 'react'
import { Search, MapPin, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedArea, setSelectedArea] = useState('')
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const navigate = useNavigate()

  // Preload hero image for better performance
  useEffect(() => {
    const img = new Image()
    img.src = '/images/katywelcome.jpg'
    img.onload = () => setImageLoaded(true)
    img.onerror = () => setImageError(true)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (selectedArea) params.set('area', selectedArea)
    navigate(`/restaurants?${params.toString()}`)
  }

  const katyAreas = [
    'All Areas',
    'Old Katy',
    'Cinco Ranch',
    'Cross Creek Ranch',
    'Mason Creek',
    'Nottingham Country',
    'Pine Forest',
    'Kelliwood',
    'Grand Lakes',
    'Firethorne',
    'Jordan Ranch',
  ]

  return (
    <div className="relative w-screen min-h-[50vh] md:min-h-[60vh] lg:min-h-[75vh] overflow-hidden">
      {/* Full-width Hero Background Image - Edge to Edge */}
      {!imageError ? (
        <>
          <img
            src="/images/katywelcome.jpg"
            alt="Welcome to Katy, Texas - Local restaurants and dining"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="eager"
            onError={() => setImageError(true)}
          />
          {/* Gradient overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        </>
      ) : (
        /* Fallback gradient if image fails to load */
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500">
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50" />
        </div>
      )}
      
      {/* Subtle pattern overlay - optional decorative element */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSI0Ii8+PC9nPjwvZz48L3N2Zz4=')] repeat"></div>
      </div>

      {/* Image loading state indicator */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500">
          <div className="animate-pulse text-white">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      {/* Content Container - Centered with proper padding */}
      <div className="relative z-10 flex items-center justify-center min-h-[50vh] md:min-h-[60vh] lg:min-h-[75vh] px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center w-full max-w-7xl mx-auto">
          {/* Classic eKaty Logo with enhanced visibility */}
          <div className="mb-6 sm:mb-8 flex justify-center animate-fadeIn">
            <img 
              src="/images/logo_new.jpg" 
              alt="eKaty.com - Everything Katy Community Driven"
              className="h-20 sm:h-24 md:h-28 lg:h-32 w-auto drop-shadow-2xl max-w-full rounded-lg"
              loading="eager"
            />
          </div>
          
          {/* Welcome Message with maximum contrast and readability */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-4 sm:mb-6 drop-shadow-2xl px-4 animate-fadeInUp">
            Welcome to eKaty.com
          </h1>
          
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white/95 mb-3 drop-shadow-xl px-4 animate-fadeInUp animation-delay-100">
            Everything Katy - Community Driven
          </h2>
          
          <p className="text-lg sm:text-xl text-white/90 mb-8 sm:mb-10 max-w-3xl mx-auto drop-shadow-lg px-4 animate-fadeInUp animation-delay-200">
            Your comprehensive guide to restaurants, dining, and community in Katy, Texas
          </p>

          {/* Search Section with enhanced visibility */}
          <form onSubmit={handleSearch} className="w-full max-w-4xl mx-auto mb-8 sm:mb-10 px-4 animate-fadeInUp animation-delay-300">
            <div className="bg-white/98 backdrop-blur-md rounded-xl shadow-2xl p-4 sm:p-6 border border-white/30 w-full">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">Find Restaurants in Katy</h3>
              
              <div className="flex flex-col sm:flex-col lg:flex-row gap-3 sm:gap-4 w-full">
                {/* Search Input */}
                <div className="flex-1 relative group min-w-0">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-600 transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="Restaurant name, cuisine..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-700 font-medium transition-all duration-200 text-sm sm:text-base"
                  />
                </div>

                {/* Area Selector */}
                <div className="relative group sm:min-w-0 lg:min-w-[180px]">
                  <MapPin className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-600 pointer-events-none transition-colors" size={18} />
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-8 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 cursor-pointer text-gray-700 font-medium appearance-none bg-white transition-all duration-200 text-sm sm:text-base"
                  >
                    {katyAreas.map((area) => (
                      <option key={area} value={area === 'All Areas' ? '' : area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-colors duration-200 whitespace-nowrap text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">Search Restaurants</span>
                  <span className="sm:hidden">Search</span>
                </button>
              </div>
            </div>
          </form>

          {/* Quick Navigation Links with staggered animation */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl mx-auto mb-6 sm:mb-8 px-4 animate-fadeInUp animation-delay-400">
            <button
              onClick={() => navigate('/restaurants')}
              className="bg-white/95 backdrop-blur-sm hover:bg-white text-gray-800 hover:text-orange-600 font-medium py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg border border-white/30 hover:border-orange-300 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              All Restaurants
            </button>
            <button
              onClick={() => navigate('/popular')}
              className="bg-white/95 backdrop-blur-sm hover:bg-white text-gray-800 hover:text-orange-600 font-medium py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg border border-white/30 hover:border-orange-300 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              Most Popular
            </button>
            <button
              onClick={() => navigate('/cuisines')}
              className="bg-white/95 backdrop-blur-sm hover:bg-white text-gray-800 hover:text-orange-600 font-medium py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg border border-white/30 hover:border-orange-300 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              By Cuisine
            </button>
            <button
              onClick={() => navigate('/areas')}
              className="bg-white/95 backdrop-blur-sm hover:bg-white text-gray-800 hover:text-orange-600 font-medium py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg border border-white/30 hover:border-orange-300 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              By Area
            </button>
          </div>

          {/* Popular Search Tags with enhanced visibility */}
          <div className="text-center px-4 animate-fadeInUp animation-delay-500">
            <div className="text-white/95 font-semibold text-sm mb-3 drop-shadow-lg">Popular cuisines:</div>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {['Italian', 'Mexican', 'BBQ', 'Asian', 'Steakhouse', 'Breakfast'].map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => {
                    const params = new URLSearchParams()
                    params.set('cuisine', cuisine)
                    navigate(`/restaurants?${params.toString()}`)
                  }}
                  className="bg-white/25 hover:bg-white/40 text-white font-semibold px-2.5 sm:px-3 py-1 rounded-full border border-white/40 hover:border-white/60 transition-all duration-200 backdrop-blur-sm text-xs sm:text-sm shadow-lg"
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
