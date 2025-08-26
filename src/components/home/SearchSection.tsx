import { useState, useEffect, memo, useMemo } from 'react'
import { Search as SearchIcon, MapPin, Filter } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Cuisine {
  id: number
  name: string
  restaurant_count: number
}

const SearchSection = memo(function SearchSection() {
  const [cuisines, setCuisines] = useState<Cuisine[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCuisines = async () => {
      try {
        const response = await fetch('/api/cuisines.php')
        if (response.ok) {
          const data = await response.json()
          // Get top 6 cuisines by restaurant count
          setCuisines(data.sort((a: Cuisine, b: Cuisine) => b.restaurant_count - a.restaurant_count).slice(0, 6))
        }
      } catch (error) {
        console.error('Error fetching cuisines:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCuisines()
  }, [])

  const popularAreas = useMemo(() => [
    { name: 'Katy', count: 34, to: '/restaurants?area=katy' },
    { name: 'Cinco Ranch', count: 28, to: '/restaurants?area=cinco-ranch' },
    { name: 'Mason Creek', count: 22, to: '/restaurants?area=mason-creek' },
    { name: 'Cross Creek Ranch', count: 19, to: '/restaurants?area=cross-creek-ranch' },
  ], [])

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
            Explore by Cuisine & Location
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find exactly what you're craving in your favorite part of Katy
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Browse by Cuisine */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-ekaty-100 rounded-lg flex items-center justify-center">
                <SearchIcon size={20} className="text-ekaty-500" />
              </div>
              <h3 className="text-2xl font-display font-semibold text-gray-900">
                Browse by Cuisine
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-8"></div>
                    </div>
                  </div>
                ))
              ) : (
                cuisines.map((cuisine) => (
                  <Link
                    key={cuisine.id}
                    to={`/restaurants?cuisine=${encodeURIComponent(cuisine.name)}`}
                    className="group p-4 border border-gray-200 rounded-lg hover:border-ekaty-200 hover:bg-ekaty-50 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 group-hover:text-ekaty-700">
                        {cuisine.name}
                      </span>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded group-hover:bg-ekaty-200 group-hover:text-ekaty-700">
                        {cuisine.restaurant_count}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
            
            <div className="mt-6">
              <Link
                to="/cuisines"
                className="inline-flex items-center text-ekaty-500 hover:text-ekaty-600 font-medium"
              >
                View all cuisines →
              </Link>
            </div>
          </div>

          {/* Browse by Area */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-restaurant-100 rounded-lg flex items-center justify-center">
                <MapPin size={20} className="text-restaurant-500" />
              </div>
              <h3 className="text-2xl font-display font-semibold text-gray-900">
                Browse by Area
              </h3>
            </div>
            
            <div className="space-y-4">
              {popularAreas.map((area) => (
                <Link
                  key={area.name}
                  to={area.to}
                  className="group block p-4 border border-gray-200 rounded-lg hover:border-restaurant-200 hover:bg-restaurant-50 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 group-hover:text-restaurant-700">
                      {area.name}
                    </span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded group-hover:bg-restaurant-200 group-hover:text-restaurant-700">
                      {area.count} restaurants
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="mt-6">
              <Link
                to="/areas"
                className="inline-flex items-center text-restaurant-500 hover:text-restaurant-600 font-medium"
              >
                View all areas →
              </Link>
            </div>
          </div>
        </div>

        {/* Quick action cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Filter size={24} className="text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Advanced Search</h4>
            <p className="text-gray-600 text-sm mb-4">
              Filter by price, features, ratings, and more
            </p>
            <Link to="/restaurants?advanced=true" className="text-blue-600 hover:text-blue-700 font-medium">
              Try Advanced Search →
            </Link>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <MapPin size={24} className="text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Map View</h4>
            <p className="text-gray-600 text-sm mb-4">
              See restaurants on an interactive map
            </p>
            <Link to="/restaurants/map" className="text-green-600 hover:text-green-700 font-medium">
              View Map →
            </Link>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <SearchIcon size={24} className="text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">What's Good Here?</h4>
            <p className="text-gray-600 text-sm mb-4">
              Search by specific dishes and menu items
            </p>
            <Link to="/search/dishes" className="text-purple-600 hover:text-purple-700 font-medium">
              Search Dishes →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
})

export default SearchSection