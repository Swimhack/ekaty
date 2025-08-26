import { RestaurantService, type Restaurant, type RestaurantsResponse, type RestaurantFilters } from './restaurant-service'

// Enhanced error types
export class NetworkError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NetworkError'
  }
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TimeoutError'
  }
}

export class APIError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'APIError'
  }
}

// Retry configuration
interface RetryConfig {
  maxRetries: number
  initialDelay: number
  maxDelay: number
  backoffFactor: number
  retryOn?: (error: Error) => boolean
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 5,
  initialDelay: 500,
  maxDelay: 8000,
  backoffFactor: 1.5,
  retryOn: (error: Error) => {
    // Retry on network errors, timeouts, Cloudflare errors, and 5xx server errors
    return (
      error instanceof NetworkError ||
      error instanceof TimeoutError ||
      error.message.toLowerCase().includes('cloudflare') ||
      error.message.toLowerCase().includes('timeout') ||
      error.message.toLowerCase().includes('connection') ||
      (error instanceof APIError && error.status !== undefined && error.status >= 500)
    )
  }
}

// Utility function to add timeout to promises
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new TimeoutError(`Request timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ])
}

// Retry utility function with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error
  let delay = config.initialDelay

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      // If this is the last attempt or error is not retryable, throw
      if (attempt === config.maxRetries || !config.retryOn?.(lastError)) {
        throw lastError
      }

      // Wait before retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.min(delay, config.maxDelay)))
      delay *= config.backoffFactor
    }
  }

  throw lastError!
}

// Enhanced restaurant service with retry logic and better error handling
export class EnhancedRestaurantService {
  private static readonly TIMEOUT_MS = 30000 // Extended to 30 seconds for Cloudflare
  private static readonly CF_TIMEOUT_MS = 45000 // Extended timeout for CF issues

  static async getRestaurants(
    filters: RestaurantFilters = {},
    retryConfig?: Partial<RetryConfig>
  ): Promise<RestaurantsResponse> {
    const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig }
    
    return withRetry(async () => {
      try {
        const result = await withTimeout(
          RestaurantService.getRestaurants(filters),
          this.TIMEOUT_MS
        )
        return result
      } catch (error) {
        throw this.transformError(error as Error)
      }
    }, config)
  }

  static async getCuisines(retryConfig?: Partial<RetryConfig>): Promise<Array<{ id: number; name: string; restaurant_count: number }>> {
    const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig }
    
    return withRetry(async () => {
      try {
        const result = await withTimeout(
          RestaurantService.getCuisines(),
          this.TIMEOUT_MS
        )
        return result
      } catch (error) {
        throw this.transformError(error as Error)
      }
    }, config)
  }

  static async getStats(retryConfig?: Partial<RetryConfig>): Promise<{
    restaurantCount: number
    averageRating: number
    totalReviews: number
    totalCities: number
  }> {
    const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig }
    
    return withRetry(async () => {
      try {
        const result = await withTimeout(
          RestaurantService.getStats(),
          this.TIMEOUT_MS
        )
        return result
      } catch (error) {
        throw this.transformError(error as Error)
      }
    }, config)
  }

  static async getRestaurantById(
    id: number | string,
    retryConfig?: Partial<RetryConfig>
  ): Promise<Restaurant | null> {
    const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig }
    
    return withRetry(async () => {
      try {
        // This method would need to be implemented in the base service
        const result = await withTimeout(
          this.fetchRestaurantById(id),
          this.TIMEOUT_MS
        )
        return result
      } catch (error) {
        throw this.transformError(error as Error)
      }
    }, config)
  }

  // Helper method to fetch individual restaurant (to be implemented)
  private static async fetchRestaurantById(id: number | string): Promise<Restaurant | null> {
    // This would use the Supabase client to fetch a single restaurant
    // Implementation would be similar to getRestaurants but for a single item
    const filters: RestaurantFilters = { limit: 1, offset: 0 }
    const response = await RestaurantService.getRestaurants(filters)
    
    // Find the restaurant by ID or slug
    const restaurant = response.restaurants.find(r => 
      r.id === Number(id) || r.slug === id
    )
    
    return restaurant || null
  }

  // Transform various errors into our custom error types with Cloudflare handling
  private static transformError(error: Error): Error {
    const errorMessage = error.message.toLowerCase()

    // Cloudflare-specific errors
    if (errorMessage.includes('cloudflare') ||
        errorMessage.includes('cf-ray') ||
        errorMessage.includes('connection timed out') ||
        errorMessage.includes('522') ||
        errorMessage.includes('524')) {
      return new TimeoutError('Cloudflare connection timeout. Retrying with extended timeout...')
    }

    if (errorMessage.includes('failed to fetch') || 
        errorMessage.includes('network') ||
        errorMessage.includes('connection')) {
      return new NetworkError('Network connection failed. Please check your internet connection.')
    }

    if (error.name === 'TimeoutError' || errorMessage.includes('timeout') || errorMessage.includes('aborted')) {
      return new TimeoutError('Request timed out. Please try again.')
    }

    if (errorMessage.includes('supabase') || 
        errorMessage.includes('api') ||
        errorMessage.includes('server')) {
      return new APIError('Server error occurred. Please try again later.')
    }

    // Return the original error if we can't classify it
    return error
  }

  // Utility method to check if an error is retryable
  static isRetryableError(error: Error): boolean {
    return DEFAULT_RETRY_CONFIG.retryOn!(error)
  }

  // Cache management (simple in-memory cache with TTL)
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  static async getWithCache<T>(
    cacheKey: string,
    fetcher: () => Promise<T>,
    ttlMs: number = 300000, // 5 minutes default
    retryConfig?: Partial<RetryConfig>
  ): Promise<T> {
    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
      return cached.data
    }

    try {
      const data = await withRetry(fetcher, { ...DEFAULT_RETRY_CONFIG, ...retryConfig })
      
      // Store in cache
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl: ttlMs
      })

      return data
    } catch (error) {
      // If we have stale data, return it as fallback
      if (cached) {
        console.warn('Returning stale data due to fetch error:', error)
        return cached.data
      }
      throw error
    }
  }

  // Clear cache
  static clearCache(cacheKey?: string): void {
    if (cacheKey) {
      this.cache.delete(cacheKey)
    } else {
      this.cache.clear()
    }
  }

  // Prefetch data for better UX
  static async prefetchRestaurants(filters?: RestaurantFilters): Promise<void> {
    try {
      const cacheKey = `restaurants_${JSON.stringify(filters || {})}`
      await this.getWithCache(cacheKey, () => this.getRestaurants(filters), 300000)
    } catch (error) {
      // Prefetch failures should be silent
      console.warn('Prefetch failed:', error)
    }
  }

  static async prefetchCuisines(): Promise<void> {
    try {
      await this.getWithCache('cuisines', () => this.getCuisines(), 600000) // 10 minutes cache
    } catch (error) {
      console.warn('Prefetch cuisines failed:', error)
    }
  }

  static async prefetchStats(): Promise<void> {
    try {
      await this.getWithCache('stats', () => this.getStats(), 300000) // 5 minutes cache
    } catch (error) {
      console.warn('Prefetch stats failed:', error)
    }
  }
}

// Export enhanced service as default with fallback to original
export { EnhancedRestaurantService as default }