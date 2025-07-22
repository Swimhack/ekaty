
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
    <div className="relative bg-gradient-to-b from-purple-800 via-purple-700 to-purple-900 overflow-hidden" style={{ backgroundColor: '#433E8E' }}>
      {/* Hero Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: 'url("/images/katywelcome.jpg")',
          backgroundBlendMode: 'overlay'
        }}
      />
      
      {/* Grain Elevator silhouette */}
      <div 
        className="absolute right-0 top-0 h-full w-96 bg-cover bg-right bg-no-repeat opacity-15"
        style={{
          backgroundImage: 'url("/images/KatyTexasGrainElevator203.jpg")',
        }}
      />

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
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

          {/* Classic Search Section */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-12">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold text-purple-800 mb-4">Find Restaurants in Katy</h3>
              
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    placeholder="Restaurant name, cuisine, or dish..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-500 text-gray-700 font-medium"
                  />
                </div>

                {/* Area Selector */}
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="pl-10 pr-8 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-500 cursor-pointer min-w-[180px] text-gray-700 font-medium appearance-none bg-white"
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
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 whitespace-nowrap"
                  style={{ backgroundColor: '#1A2874' }}
                >
                  Search Restaurants
                </button>
              </div>
            </div>
          </form>

          {/* Quick Navigation Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            <button
              onClick={() => navigate('/restaurants')}
              className="bg-white/10 hover:bg-white/20 backdrop-blur text-white font-medium py-4 px-6 rounded-lg border border-white/30 transition-all duration-200 hover:scale-105"
            >
              All Restaurants
            </button>
            <button
              onClick={() => navigate('/popular')}
              className="bg-white/10 hover:bg-white/20 backdrop-blur text-white font-medium py-4 px-6 rounded-lg border border-white/30 transition-all duration-200 hover:scale-105"
            >
              Most Popular
            </button>
            <button
              onClick={() => navigate('/cuisines')}
              className="bg-white/10 hover:bg-white/20 backdrop-blur text-white font-medium py-4 px-6 rounded-lg border border-white/30 transition-all duration-200 hover:scale-105"
            >
              By Cuisine
            </button>
            <button
              onClick={() => navigate('/areas')}
              className="bg-white/10 hover:bg-white/20 backdrop-blur text-white font-medium py-4 px-6 rounded-lg border border-white/30 transition-all duration-200 hover:scale-105"
            >
              By Area
            </button>
          </div>

          {/* Popular Search Tags */}
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <span className="text-purple-200 font-medium">Popular:</span>
            {['Pizza', 'Mexican', 'BBQ', 'Sushi', 'Steakhouse', 'Breakfast'].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSearchQuery(tag.toLowerCase())
                  const params = new URLSearchParams()
                  params.set('q', tag.toLowerCase())
                  navigate(`/restaurants?${params.toString()}`)
                }}
                className="bg-purple-600/30 hover:bg-purple-600/50 text-white font-medium px-4 py-2 rounded-full transition-all duration-200 hover:scale-105 border border-purple-400/30"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom decorative border */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600"></div>
    </div>
  )
}
