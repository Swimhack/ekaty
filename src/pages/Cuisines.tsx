
import { Link } from 'react-router-dom'
import { ChefHat, MapPin } from 'lucide-react'
import { CUISINE_CATEGORIES } from '@/data/cuisines'
import PageTemplate from '@/components/layout/PageTemplate'

const cuisineColors = [
  { color: 'bg-red-50 border-red-200 hover:bg-red-100', textColor: 'text-red-700' },
  { color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100', textColor: 'text-yellow-700' },
  { color: 'bg-gray-50 border-gray-200 hover:bg-gray-100', textColor: 'text-gray-700' },
  { color: 'bg-green-50 border-green-200 hover:bg-green-100', textColor: 'text-green-700' },
  { color: 'bg-orange-50 border-orange-200 hover:bg-orange-100', textColor: 'text-orange-700' },
  { color: 'bg-amber-50 border-amber-200 hover:bg-amber-100', textColor: 'text-amber-700' },
  { color: 'bg-blue-50 border-blue-200 hover:bg-blue-100', textColor: 'text-blue-700' },
  { color: 'bg-teal-50 border-teal-200 hover:bg-teal-100', textColor: 'text-teal-700' },
  { color: 'bg-purple-50 border-purple-200 hover:bg-purple-100', textColor: 'text-purple-700' },
  { color: 'bg-pink-50 border-pink-200 hover:bg-pink-100', textColor: 'text-pink-700' },
]

export default function Cuisines() {
  return (
    <PageTemplate
      title="Explore Cuisines in Katy"
      subtitle="Discover restaurants by cuisine type and find your new favorite flavors in Katy, Texas."
    >

      {/* Featured Cuisines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {CUISINE_CATEGORIES.map((cuisine, index) => {
          const colorScheme = cuisineColors[index % cuisineColors.length]
          return (
            <Link
              key={cuisine.name}
              to={`/restaurants?cuisine=${encodeURIComponent(cuisine.name)}`}
              className={`group block p-6 border-2 rounded-xl transition-all duration-200 ${colorScheme.color} hover:shadow-lg hover:scale-[1.02]`}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl flex-shrink-0">
                  {cuisine.icon}
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-bold ${colorScheme.textColor} mb-2`}>
                    {cuisine.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {cuisine.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin size={14} />
                    <span>Available in Katy</span>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="bg-gray-50 rounded-xl p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <ChefHat className="text-orange-500" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">
            Find Your Perfect Meal
          </h2>
        </div>
        <p className="text-gray-600 mb-6">
          Browse hundreds of restaurants across all your favorite cuisine types in Katy
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/restaurants"
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            View All Restaurants
          </Link>
          <Link
            to="/popular"
            className="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Most Popular
          </Link>
        </div>
      </div>
    </PageTemplate>
  )
}
