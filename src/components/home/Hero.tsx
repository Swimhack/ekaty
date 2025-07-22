
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
    <div className="relative bg-gradient-to-br from-orange-50 to-amber-50 py-16 lg:py-24">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNlYjc0MjUiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSI0Ii8+PC9nPjwvZz48L3N2Zz4=')] repeat"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Classic eKaty Logo */}
          <div className="mb-8 flex justify-center">
            <img 
              src="/images/logo_new.jpg" 
              alt="eKaty.com - Everything Katy Community Driven"
              className="h-32 w-auto drop-shadow-lg"
            />
          </div>
          
          {/* Classic Welcome Message */}
          <h1 className="text-3xl md:text-5xl font-display font-bold text-gray-900 mb-4">
            Welcome to eKaty.com
          </h1>
          
          <h2 className="text-xl md:text-2xl font-semibold text-orange-600 mb-2">
            Everything Katy - Community Driven
          </h2>
          
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Your comprehensive guide to restaurants, dining, and community in Katy, Texas
          </p>

          {/* Search Section */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Find Restaurants in Katy</h3>
              
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1 relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-600 transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="Restaurant name, cuisine, or dish..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-700 font-medium transition-all duration-200"
                  />
                </div>

                {/* Area Selector */}
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-600 pointer-events-none transition-colors" size={20} />
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="pl-12 pr-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 cursor-pointer min-w-[200px] text-gray-700 font-medium appearance-none bg-white transition-all duration-200"
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
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 whitespace-nowrap"
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
              className="bg-white hover:bg-orange-50 text-gray-800 hover:text-orange-600 font-medium py-3 px-4 rounded-lg border border-gray-200 hover:border-orange-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              All Restaurants
            </button>
            <button
              onClick={() => navigate('/popular')}
              className="bg-white hover:bg-orange-50 text-gray-800 hover:text-orange-600 font-medium py-3 px-4 rounded-lg border border-gray-200 hover:border-orange-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Most Popular
            </button>
            <button
              onClick={() => navigate('/cuisines')}
              className="bg-white hover:bg-orange-50 text-gray-800 hover:text-orange-600 font-medium py-3 px-4 rounded-lg border border-gray-200 hover:border-orange-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              By Cuisine
            </button>
            <button
              onClick={() => navigate('/areas')}
              className="bg-white hover:bg-orange-50 text-gray-800 hover:text-orange-600 font-medium py-3 px-4 rounded-lg border border-gray-200 hover:border-orange-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              By Area
            </button>
          </div>

          {/* Popular Search Tags */}
          <div className="text-center">
            <div className="text-gray-600 font-medium text-sm mb-3">Popular searches:</div>
            <div className="flex flex-wrap justify-center gap-2">
              {['Pizza', 'Mexican', 'BBQ', 'Sushi', 'Steakhouse'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchQuery(tag.toLowerCase())
                    const params = new URLSearchParams()
                    params.set('q', tag.toLowerCase())
                    navigate(`/restaurants?${params.toString()}`)
                  }}
                  className="text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
