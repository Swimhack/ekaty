
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Search, User, ChevronDown } from 'lucide-react'
import SearchModal from '@/components/search/SearchModal'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const location = useLocation()
  const user = null // Temporarily disabled for build
  
  const handleSignOut = async () => {
    setIsUserMenuOpen(false)
  }

  const navigation = [
    { name: 'Popular', to: '/popular' },
    { name: 'Map', to: '/map' },
    { name: 'Grub Roulette', to: '/grub-roulette' },
    { name: 'All Restaurants', to: '/restaurants' },
    { name: 'Community', to: '/community' },
    { name: 'About', to: '/about' },
    { name: 'Contact', to: '/contact' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 shadow-xl border-b border-orange-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18 md:h-20">
            {/* Enhanced eKaty.com Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-4 hover:opacity-95 transition-all duration-300 group">
                <div className="relative">
                  <img 
                    src="/images/logo.gif" 
                    alt="eKaty.com - Katy Restaurant Directory"
                    className="h-14 w-auto drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback to logo_new.jpg if logo.gif fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/logo_new.jpg';
                    }}
                  />
                  <div className="absolute -inset-2 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                </div>
                <div className="hidden sm:block">
                  <div className="text-xl text-gray-800 font-bold tracking-wide">
                    Restaurant Directory
                  </div>
                  <div className="text-sm text-orange-600 font-medium tracking-wide">
                    for Katy, Texas
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.to}
                  className={`${
                    isActive(item.to) 
                      ? 'text-orange-600 bg-orange-50 border-b-2 border-orange-500' 
                      : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50/50'
                  } font-medium transition-all duration-200 px-3 py-2 rounded-t-lg border-b-2 border-transparent`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Search button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-600 hover:text-orange-600 transition-colors bg-orange-50 hover:bg-orange-100 rounded-lg"
                aria-label="Search restaurants"
              >
                <Search size={20} />
              </button>

              {/* User menu or auth buttons */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-purple-200 hover:text-white transition-colors bg-purple-700/20 hover:bg-purple-700/40 rounded-lg px-3 py-2"
                  >
                    <User size={20} />
                    <span className="hidden sm:block">User</span>
                    <ChevronDown size={16} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          My Profile
                        </Link>
                        <Link
                          to="/favorites"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          My Favorites
                        </Link>
                        <Link
                          to="/my-reviews"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          My Reviews
                        </Link>
                        <hr className="my-1" />
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/auth/login"
                    className="text-gray-700 hover:text-orange-600 transition-colors px-3 py-2 rounded-lg hover:bg-orange-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth/register"
                    className="bg-orange-500 text-white hover:bg-orange-600 font-medium px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-orange-600 transition-colors bg-orange-50 hover:bg-orange-100 rounded-lg"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-orange-200">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.to}
                  className={`block px-3 py-2 rounded-md transition-colors ${
                    isActive(item.to)
                      ? 'text-orange-600 bg-orange-100'
                      : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {!user && (
                <>
                  <hr className="my-2" />
                  <Link
                    to="/auth/login"
                    className="block px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth/register"
                    className="block px-3 py-2 text-white bg-orange-500 hover:bg-orange-600 rounded-md transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Overlay for dropdowns */}
      {(isUserMenuOpen || isMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsUserMenuOpen(false)
            setIsMenuOpen(false)
          }}
        />
      )}
    </>
  )
}
