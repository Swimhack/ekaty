'use client'

import { useState } from 'react'
import { Search, MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedArea, setSelectedArea] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (selectedArea) params.set('area', selectedArea)
    router.push(`/restaurants?${params.toString()}`)
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
    <div className="relative bg-gradient-to-br from-ekaty-50 to-ekaty-100 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNlYjc0MjUiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSI0Ii8+PC9nPjwvZz48L3N2Zz4=')] repeat"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="text-center">
          {/* Hero headline */}
          <h1 className="text-4xl md:text-6xl font-display font-bold text-gray-900 mb-6">
            Discover the Best
            <span className="block text-ekaty-500">Restaurants in Katy</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            From family favorites to hidden gems, explore Katy's dining scene with trusted reviews, 
            photos, and insider tips from your local community.
          </p>

          {/* Search form */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-2xl shadow-xl p-2 border border-gray-200">
              <div className="flex flex-col md:flex-row gap-2">
                {/* Search input */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search restaurants, cuisines, dishes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-gray-700 placeholder-gray-400 bg-transparent focus:outline-none text-lg"
                  />
                </div>

                {/* Area selector */}
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="pl-12 pr-8 py-4 text-gray-700 bg-transparent focus:outline-none cursor-pointer min-w-[200px] appearance-none"
                  >
                    {katyAreas.map((area) => (
                      <option key={area} value={area === 'All Areas' ? '' : area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search button */}
                <button
                  type="submit"
                  className="bg-ekaty-500 hover:bg-ekaty-600 text-white font-semibold px-8 py-4 rounded-xl transition-colors duration-200 whitespace-nowrap"
                >
                  Find Restaurants
                </button>
              </div>
            </div>
          </form>

          {/* Quick links */}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="text-gray-500">Popular searches:</span>
            <button
              onClick={() => setSearchQuery('pizza')}
              className="text-ekaty-500 hover:text-ekaty-600 font-medium transition-colors"
            >
              Pizza
            </button>
            <button
              onClick={() => setSearchQuery('mexican')}
              className="text-ekaty-500 hover:text-ekaty-600 font-medium transition-colors"
            >
              Mexican Food
            </button>
            <button
              onClick={() => setSearchQuery('bbq')}
              className="text-ekaty-500 hover:text-ekaty-600 font-medium transition-colors"
            >
              BBQ
            </button>
            <button
              onClick={() => setSearchQuery('sushi')}
              className="text-ekaty-500 hover:text-ekaty-600 font-medium transition-colors"
            >
              Sushi
            </button>
            <button
              onClick={() => setSearchQuery('steakhouse')}
              className="text-ekaty-500 hover:text-ekaty-600 font-medium transition-colors"
            >
              Steakhouse
            </button>
          </div>
        </div>
      </div>

      {/* Bottom curve */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-12"
        >
          <path
            d="M0 48h1440V0s-300 48-720 48S0 0 0 0v48z"
            fill="white"
          />
        </svg>
      </div>
    </div>
  )
}