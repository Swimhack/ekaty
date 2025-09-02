
import PageTemplate from '@/components/layout/PageTemplate'

export default function About() {
  return (
    <PageTemplate
      title="About eKaty.com"
      subtitle="Learn more about our mission to connect the Katy community with great local dining experiences."
    >
      <div className="prose prose-lg max-w-none">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-6">
              eKaty.com is dedicated to helping the Katy, Texas community discover and enjoy the best local dining experiences. 
              We believe that great food brings people together and strengthens our community bonds.
            </p>
            <p className="text-gray-600 mb-6">
              Our platform provides comprehensive restaurant information, authentic reviews, and helpful tools to make 
              dining decisions easier for residents and visitors alike.
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Offer</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                Comprehensive restaurant directory with detailed information
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                Interactive map showing restaurant locations
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                Community reviews and ratings
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                Grub Roulette for discovering new places
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                Community chat for food discussions
              </li>
            </ul>
          </div>
        </div>
      </div>
    </PageTemplate>
  )
}
