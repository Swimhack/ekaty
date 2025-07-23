
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
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
