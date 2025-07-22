
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
    <div className="relative bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden min-h-screen flex items-center">
      {/* Full-width Hero Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/images/katywelcome.jpg")',
          backgroundAttachment: 'fixed',
          opacity: 0.15,
          backgroundBlendMode: 'overlay'
        }}
      />
      
      {/* Gradient overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-900/20 via-transparent to-orange-900/40" />
      
      {/* Grain Elevator silhouette - positioned for better visual balance */}
      <div 
        className="absolute right-0 top-0 h-full w-80 lg:w-96 bg-cover bg-right-top bg-no-repeat opacity-10"
        style={{
          backgroundImage: 'url("/images/KatyTexasGrainElevator203.jpg")',
        }}
      />

      {/* Main Content - Full width with better spacing */}
      <div className="relative w-full px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="max-w-6xl mx-auto">
        <div className="text-center">
          {/* Classic eKaty Logo */}
          <div className="mb-8 flex justify-center">
            <img 
              src="/images/logo_new.jpg" 
              alt="eKaty.com - Everything Katy Community Driven"
              className="h-48 w-auto drop-shadow-2xl"
            />
          </div>
          
          {/* Classic Welcome Message */}
          <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 drop-shadow-lg">
            Welcome to eKaty.com
          </h1>
          
          <h2 className="text-xl md:text-2xl font-semibold text-purple-100 mb-2">
            Everything Katy - Community Driven
          </h2>
          
          <p className="text-lg text-purple-200 mb-8 max-w-2xl mx-auto drop-shadow">
            Your comprehensive guide to restaurants, dining, and community in Katy, Texas
          </p>

          {/* Enhanced Search Section */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto mb-16">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/30 transform hover:scale-[1.02] transition-all duration-300">
              <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center">Find Your Perfect Restaurant</h3>
              
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1 relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="Restaurant name, cuisine, or dish..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-gray-700 font-medium text-lg transition-all duration-200 shadow-sm"
                  />
                </div>

                {/* Area Selector */}
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 pointer-events-none transition-colors" size={20} />
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="pl-12 pr-8 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 cursor-pointer min-w-[200px] text-gray-700 font-medium text-lg appearance-none bg-white transition-all duration-200 shadow-sm"
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
                  className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 whitespace-nowrap text-lg"
                >
                  Search Restaurants
                </button>
              </div>
            </div>
          </form>

          {/* Enhanced Quick Navigation Links */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
            <button
              onClick={() => navigate('/restaurants')}
              className="group bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-semibold py-5 px-6 rounded-xl border border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg"
            >
              <div className="text-lg mb-1">🍽️</div>
              <div>All Restaurants</div>
              <div className="text-sm text-purple-200 group-hover:text-white transition-colors">Browse all</div>
            </button>
            <button
              onClick={() => navigate('/popular')}
              className="group bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-semibold py-5 px-6 rounded-xl border border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg"
            >
              <div className="text-lg mb-1">⭐</div>
              <div>Most Popular</div>
              <div className="text-sm text-purple-200 group-hover:text-white transition-colors">Top rated</div>
            </button>
            <button
              onClick={() => navigate('/cuisines')}
              className="group bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-semibold py-5 px-6 rounded-xl border border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg"
            >
              <div className="text-lg mb-1">🌮</div>
              <div>By Cuisine</div>
              <div className="text-sm text-purple-200 group-hover:text-white transition-colors">Food types</div>
            </button>
            <button
              onClick={() => navigate('/areas')}
              className="group bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-semibold py-5 px-6 rounded-xl border border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg"
            >
              <div className="text-lg mb-1">📍</div>
              <div>By Area</div>
              <div className="text-sm text-purple-200 group-hover:text-white transition-colors">Locations</div>
            </button>
          </div>

          {/* Enhanced Popular Search Tags */}
          <div className="space-y-4">
            <div className="text-purple-200 font-semibold text-lg">Popular Cuisines:</div>
            <div className="flex flex-wrap justify-center gap-3">
              {['Pizza', 'Mexican', 'BBQ', 'Sushi', 'Steakhouse', 'Breakfast', 'Italian', 'Chinese'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchQuery(tag.toLowerCase())
                    const params = new URLSearchParams()
                    params.set('q', tag.toLowerCase())
                    navigate(`/restaurants?${params.toString()}`)
                  }}
                  className="bg-gradient-to-r from-purple-600/40 to-indigo-600/40 hover:from-purple-600/60 hover:to-indigo-600/60 text-white font-semibold px-5 py-3 rounded-full transition-all duration-300 hover:scale-110 border border-purple-400/40 hover:border-purple-300/60 backdrop-blur-sm shadow-lg hover:shadow-xl"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Enhanced bottom decorative elements */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
        <div className="h-px bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-600"></div>
      </div>
      
      {/* Subtle animation elements */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-white/20 rounded-full animate-pulse"></div>
      <div className="absolute top-40 right-20 w-1 h-1 bg-purple-300/30 rounded-full animate-pulse delay-1000"></div>
      <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-white/10 rounded-full animate-pulse delay-2000"></div>
    </div>
  )
}
