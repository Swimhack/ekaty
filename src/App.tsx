
import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Index from './pages/Index'

// Lazy load non-critical pages
const Restaurants = lazy(() => import('./pages/Restaurants'))
const Popular = lazy(() => import('./pages/Popular'))
const Map = lazy(() => import('./pages/Map'))
const GrubRoulette = lazy(() => import('./pages/GrubRoulette'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Cuisines = lazy(() => import('./pages/Cuisines'))
const Areas = lazy(() => import('./pages/Areas'))
const Reviews = lazy(() => import('./pages/Reviews'))
const Community = lazy(() => import('./pages/Community'))
const RestaurantDetail = lazy(() => import('./pages/RestaurantDetail'))
const RestaurantDashboard = lazy(() => import('./pages/RestaurantDashboard'))

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
)

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/restaurants" element={<Restaurants />} />
              <Route path="/popular" element={<Popular />} />
              <Route path="/map" element={<Map />} />
              <Route path="/grub-roulette" element={<GrubRoulette />} />
              <Route path="/cuisines" element={<Cuisines />} />
              <Route path="/areas" element={<Areas />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/community" element={<Community />} />
              <Route path="/restaurant/:slug" element={<RestaurantDetail />} />
              <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              {/* Catch-all route for 404 errors */}
              <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1><p className="text-gray-600">The page you're looking for doesn't exist.</p><a href="/" className="mt-4 inline-block bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">Go Home</a></div></div>} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
