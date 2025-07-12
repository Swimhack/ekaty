import Hero from '@/components/home/Hero'
import FeaturedRestaurants from '@/components/home/FeaturedRestaurants'
import SearchSection from '@/components/home/SearchSection'
import StatsSection from '@/components/home/StatsSection'
import NewsletterSignup from '@/components/home/NewsletterSignup'

// Mock data for initial build
const mockRestaurants = [
  {
    id: 1,
    name: 'The Rouxpour',
    description: 'Upscale Cajun and Creole cuisine with a modern twist',
    address: '23119 Colonial Pkwy',
    phone: '(281) 717-4499',
    average_rating: 4.5,
    total_reviews: 127,
    price_range: 3,
    logo_url: '',
    cover_image_url: '',
    slug: 'the-rouxpour',
    primary_cuisine: { name: 'Cajun' },
    area: { name: 'Cinco Ranch' },
    delivery_available: true,
    kid_friendly: true,
    wifi_available: true,
  },
]

export default function Index() {
  return (
    <>
      <Hero />
      <SearchSection />
      <FeaturedRestaurants restaurants={mockRestaurants} />
      <StatsSection 
        restaurantCount={150}
        reviewCount={1250}
      />
      <NewsletterSignup />
    </>
  )
}