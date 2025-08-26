
import { useState } from 'react'
import { Search, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedArea, setSelectedArea] = useState('')
  const navigate = useNavigate()

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
    <div className="relative bg-gradient-to-br from-orange-50 to-amber-50 py-12 sm:py-16 md:py-20 lg:py-32 overflow-hidden">
      {/* Full-width Hero Background Image extending to edges */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/images/katywelcome.jpg")',
          opacity: 0.3
        }}
      />
      
      {/* Gradient overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-900/30 via-orange-800/20 to-orange-900/40" />
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNlYjc0MjUiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSI0Ii8+PC9nPjwvZz48L3N2Zz4=')] repeat"></div>
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center w-full">
          {/* Classic eKaty Logo */}
          <div className="mb-6 sm:mb-8 flex justify-center">
            <img 
              src="/images/logo_new.jpg" 
              alt="eKaty.com - Everything Katy Community Driven"
              className="h-20 sm:h-24 md:h-28 lg:h-32 w-auto drop-shadow-lg max-w-full"
            />
          </div>
          
          {/* Welcome Message with enhanced contrast */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-3 sm:mb-4 drop-shadow-lg px-4">
            Welcome to eKaty.com
          </h1>
          
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-orange-100 mb-2 drop-shadow-md px-4">
            Everything Katy - Community Driven
          </h2>
          
          <p className="text-base sm:text-lg text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto drop-shadow-md px-4">
            Your comprehensive guide to restaurants, dining, and community in Katy, Texas
          </p>

          {/* Search Section */}
          <form onSubmit={handleSearch} className="w-full max-w-4xl mx-auto mb-8 sm:mb-12 px-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-4 sm:p-6 border border-white/20 w-full">
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

          {/* Quick Navigation Links */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl mx-auto mb-6 sm:mb-8 px-4">
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

          {/* Popular Search Tags */}
          <div className="text-center px-4">
            <div className="text-white/80 font-medium text-sm mb-3 drop-shadow">Popular cuisines:</div>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {['Italian', 'Mexican', 'BBQ', 'Asian', 'Steakhouse', 'Breakfast'].map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => {
                    const params = new URLSearchParams()
                    params.set('cuisine', cuisine)
                    navigate(`/restaurants?${params.toString()}`)
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white font-medium px-2.5 sm:px-3 py-1 rounded-full border border-white/30 hover:border-white/50 transition-all duration-200 backdrop-blur-sm text-xs sm:text-sm"
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
