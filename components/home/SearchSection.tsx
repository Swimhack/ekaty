'use client'

import { Search as SearchIcon, MapPin, Filter } from 'lucide-react'
import Link from 'next/link'

export default function SearchSection() {
  const popularCuisines = [
    { name: 'Italian', count: 23, href: '/restaurants?cuisine=italian' },
    { name: 'Mexican', count: 31, href: '/restaurants?cuisine=mexican' },
    { name: 'American', count: 45, href: '/restaurants?cuisine=american' },
    { name: 'Asian', count: 18, href: '/restaurants?cuisine=asian' },
    { name: 'BBQ', count: 12, href: '/restaurants?cuisine=bbq' },
    { name: 'Seafood', count: 15, href: '/restaurants?cuisine=seafood' },
  ]

  const popularAreas = [
    { name: 'Cinco Ranch', count: 34, href: '/restaurants?area=cinco-ranch' },
    { name: 'Old Katy', count: 28, href: '/restaurants?area=old-katy' },
    { name: 'Mason Creek', count: 22, href: '/restaurants?area=mason-creek' },
    { name: 'Cross Creek Ranch', count: 19, href: '/restaurants?area=cross-creek-ranch' },
  ]

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
              {popularCuisines.map((cuisine) => (
                <Link
                  key={cuisine.name}
                  href={cuisine.href}
                  className="group p-4 border border-gray-200 rounded-lg hover:border-ekaty-200 hover:bg-ekaty-50 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 group-hover:text-ekaty-700">
                      {cuisine.name}
                    </span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded group-hover:bg-ekaty-200 group-hover:text-ekaty-700">
                      {cuisine.count}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="mt-6">
              <Link
                href="/cuisines"
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
                  href={area.href}
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
                href="/areas"
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
            <Link href="/restaurants?advanced=true" className="text-blue-600 hover:text-blue-700 font-medium">
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
            <Link href="/restaurants/map" className="text-green-600 hover:text-green-700 font-medium">
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
            <Link href="/search/dishes" className="text-purple-600 hover:text-purple-700 font-medium">
              Search Dishes →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}