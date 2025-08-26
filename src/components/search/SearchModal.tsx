'use client'

import { useState, useEffect } from 'react'
import { X, Search, TrendingUp, History } from 'lucide-react'
import { LoadingSpinner } from '../common/LoadingSkeletons'
import { useErrorHandler } from '../common/ErrorHandler'
import EnhancedRestaurantService from '../../../lib/enhanced-restaurant-service'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [popularTerms, setPopularTerms] = useState<string[]>(['Pizza', 'Mexican', 'Sushi', 'BBQ', 'Italian', 'Steakhouse'])
  const [isLoading, setIsLoading] = useState(false)
  const { errorState, setError, clearError } = useErrorHandler(2)

  // Load search history from localStorage
  useEffect(() => {
    try {
      const history = localStorage.getItem('eKaty_search_history')
      if (history) {
        setSearchHistory(JSON.parse(history).slice(0, 5)) // Keep last 5 searches
      }
    } catch (error) {
      console.error('Failed to load search history:', error)
    }
  }, [])

  // Load popular cuisines from API
  useEffect(() => {
    const loadPopularTerms = async () => {
      try {
        const cuisines = await EnhancedRestaurantService.getCuisines()
        const topCuisines = cuisines.slice(0, 6).map(c => c.name)
        setPopularTerms(topCuisines)
      } catch (error) {
        console.error('Failed to load popular terms:', error)
        // Keep default terms if API fails
      }
    }

    if (isOpen && popularTerms.length <= 6) {
      loadPopularTerms()
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const saveToHistory = (searchTerm: string) => {
    try {
      const trimmedTerm = searchTerm.trim()
      if (trimmedTerm) {
        const newHistory = [trimmedTerm, ...searchHistory.filter(term => term !== trimmedTerm)].slice(0, 5)
        setSearchHistory(newHistory)
        localStorage.setItem('eKaty_search_history', JSON.stringify(newHistory))
      }
    } catch (error) {
      console.error('Failed to save search history:', error)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedQuery = query.trim()
    
    if (!trimmedQuery) return

    try {
      clearError()
      setIsLoading(true)
      
      // Validate search query
      if (trimmedQuery.length < 2) {
        throw new Error('Search query must be at least 2 characters long')
      }

      // Save to history
      saveToHistory(trimmedQuery)
      
      // Navigate to search results
      window.location.href = `/restaurants?q=${encodeURIComponent(trimmedQuery)}`
      
    } catch (error) {
      setError(error as Error, 'generic')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickSearch = async (term: string) => {
    try {
      clearError()
      setQuery(term)
      setIsLoading(true)
      
      saveToHistory(term)
      window.location.href = `/restaurants?q=${encodeURIComponent(term)}`
      
    } catch (error) {
      setError(error as Error, 'generic')
    } finally {
      setIsLoading(false)
    }
  }

  const clearHistory = () => {
    try {
      setSearchHistory([])
      localStorage.removeItem('eKaty_search_history')
    } catch (error) {
      console.error('Failed to clear search history:', error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-start justify-center p-4 pt-16">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900" id="search-modal-title">
              Search Restaurants
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-ekaty-500"
              aria-label="Close search modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search form */}
          <div className="p-6">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search by restaurant name, cuisine, or dish..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 text-lg border rounded-xl focus:outline-none focus:ring-2 focus:ring-ekaty-500 focus:border-transparent transition-colors ${
                    errorState.hasError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  autoFocus
                  disabled={isLoading}
                  aria-describedby={errorState.hasError ? 'search-error' : undefined}
                  minLength={2}
                  maxLength={100}
                  role="searchbox"
                  aria-label="Search for restaurants"
                />
              </div>
              
              {/* Error message */}
              {errorState.hasError && (
                <div id="search-error" className="mt-2 text-sm text-red-600" role="alert">
                  {errorState.error?.message}
                </div>
              )}
              
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={!query.trim() || isLoading || query.trim().length < 2}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-ekaty-500 hover:bg-ekaty-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ekaty-500 focus:ring-offset-2"
                  aria-label={isLoading ? 'Searching...' : 'Search restaurants'}
                >
                  {isLoading && <LoadingSpinner size="sm" className="text-white" />}
                  {isLoading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>

            {/* Search History */}
            {searchHistory.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <History size={16} className="text-gray-500" />
                    <p className="text-sm text-gray-600 font-medium">Recent searches:</p>
                  </div>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="Clear search history"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((term, index) => (
                    <button
                      key={`${term}-${index}`}
                      onClick={() => handleQuickSearch(term)}
                      disabled={isLoading}
                      className="px-3 py-1 text-sm bg-blue-50 hover:bg-blue-100 disabled:opacity-50 text-blue-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={`Search for ${term}`}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular searches */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-gray-500" />
                <p className="text-sm text-gray-600 font-medium">Popular searches:</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularTerms.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleQuickSearch(term)}
                    disabled={isLoading}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                    aria-label={`Search for ${term}`}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}