
import PageTemplate from '@/components/layout/PageTemplate'

export default function Popular() {
  return (
    <PageTemplate
      title="Popular Restaurants"
      subtitle="Discover the most loved restaurants in Katy, ranked by community favorites and trending spots."
    >
      <div className="text-center py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon!</h2>
            <p className="text-gray-600 mb-6">
              We're working on bringing you the most popular restaurants in Katy based on community ratings, 
              reviews, and trending spots. Check back soon for this exciting feature!
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-orange-600">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Community-driven rankings</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-orange-600">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Trending restaurants</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-orange-600">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Real-time popularity metrics</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTemplate>
  )
}
