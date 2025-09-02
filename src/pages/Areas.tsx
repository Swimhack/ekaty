
import PageTemplate from '@/components/layout/PageTemplate'

export default function Areas() {
  return (
    <PageTemplate
      title="Areas"
      subtitle="Find restaurants by neighborhood and area within Katy."
    >
      <div className="text-center py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon!</h2>
            <p className="text-gray-600 mb-6">
              We're organizing restaurants by neighborhoods and areas within Katy to help you find 
              dining options near you. This feature will include detailed area maps and local favorites.
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-orange-600">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Neighborhood-based search</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-orange-600">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Area-specific restaurant guides</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-orange-600">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Local dining hotspots</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTemplate>
  )
}
