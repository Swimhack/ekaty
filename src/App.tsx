
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Index from './pages/Index'
import Restaurants from './pages/Restaurants'
import Popular from './pages/Popular'
import Map from './pages/Map'
import GrubRoulette from './pages/GrubRoulette'
import About from './pages/About'
import Contact from './pages/Contact'
import Cuisines from './pages/Cuisines'
import Areas from './pages/Areas'
import Reviews from './pages/Reviews'

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/popular" element={<Popular />} />
            <Route path="/map" element={<Map />} />
            <Route path="/grub-roulette" element={<GrubRoulette />} />
            <Route path="/cuisines" element={<Cuisines />} />
            <Route path="/areas" element={<Areas />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
