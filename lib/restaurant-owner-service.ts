export interface RestaurantProfile {
  id: string
  name: string
  description: string
  address: string
  phone: string
  email: string
  website?: string
  hours: string
  price_range: number
  cuisine: string[]
  area: string
  logo_url?: string
  cover_image_url?: string
  menu_url?: string
  delivery_available: boolean
  takeout_available: boolean
  kid_friendly: boolean
  wifi_available: boolean
  average_rating: number
  total_reviews: number
  year_opened?: number
  owner_id?: string
  verified: boolean
  created_at: string
  updated_at: string
}

export interface RestaurantOwner {
  id: string
  email: string
  name: string
  phone: string
  restaurant_id?: string
  verified: boolean
  created_at: string
  last_login: string
}

class RestaurantOwnerService {
  private currentOwner: RestaurantOwner | null = null
  private authListeners: Array<(owner: RestaurantOwner | null) => void> = []

  // Initialize service
  async initialize(): Promise<RestaurantOwner | null> {
    try {
      const savedOwner = localStorage.getItem('restaurant_owner')
      if (savedOwner) {
        this.currentOwner = JSON.parse(savedOwner)
        return this.currentOwner
      }
      return null
    } catch (error) {
      console.error('Error initializing restaurant owner service:', error)
      return null
    }
  }

  // Restaurant owner signup
  async signUp(email: string, password: string, name: string, phone: string, restaurantName: string): Promise<{ success: boolean; error?: string }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      const existingOwners = JSON.parse(localStorage.getItem('restaurant_owners') || '[]')
      if (existingOwners.find((o: RestaurantOwner) => o.email === email)) {
        return { success: false, error: 'Email already registered' }
      }

      // Create new owner
      const newOwner: RestaurantOwner = {
        id: Date.now().toString(),
        email,
        name,
        phone,
        verified: false,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      }

      // Create restaurant profile
      const newRestaurant: RestaurantProfile = {
        id: `restaurant_${Date.now()}`,
        name: restaurantName,
        description: '',
        address: '',
        phone: phone,
        email: email,
        hours: '',
        price_range: 2,
        cuisine: [],
        area: '',
        delivery_available: false,
        takeout_available: false,
        kid_friendly: false,
        wifi_available: false,
        average_rating: 0,
        total_reviews: 0,
        owner_id: newOwner.id,
        verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      newOwner.restaurant_id = newRestaurant.id

      // Save to localStorage
      existingOwners.push(newOwner)
      localStorage.setItem('restaurant_owners', JSON.stringify(existingOwners))
      localStorage.setItem('restaurant_owner', JSON.stringify(newOwner))

      const restaurants = JSON.parse(localStorage.getItem('restaurant_profiles') || '[]')
      restaurants.push(newRestaurant)
      localStorage.setItem('restaurant_profiles', JSON.stringify(restaurants))

      this.currentOwner = newOwner
      this.notifyAuthListeners(newOwner)

      return { success: true }
    } catch (error) {
      console.error('Error in restaurant owner signup:', error)
      return { success: false, error: 'Registration failed' }
    }
  }

  // Restaurant owner signin
  async signIn(email: string, password: string): Promise<{ success: boolean; owner?: RestaurantOwner; error?: string }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      const existingOwners = JSON.parse(localStorage.getItem('restaurant_owners') || '[]')
      const owner = existingOwners.find((o: RestaurantOwner) => o.email === email)

      if (!owner) {
        return { success: false, error: 'Invalid credentials' }
      }

      owner.last_login = new Date().toISOString()

      localStorage.setItem('restaurant_owner', JSON.stringify(owner))
      const updatedOwners = existingOwners.map((o: RestaurantOwner) => 
        o.id === owner.id ? owner : o
      )
      localStorage.setItem('restaurant_owners', JSON.stringify(updatedOwners))

      this.currentOwner = owner
      this.notifyAuthListeners(owner)

      return { success: true, owner }
    } catch (error) {
      console.error('Error signing in restaurant owner:', error)
      return { success: false, error: 'Login failed' }
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      localStorage.removeItem('restaurant_owner')
      this.currentOwner = null
      this.notifyAuthListeners(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Get restaurant profile for current owner
  async getRestaurantProfile(): Promise<RestaurantProfile | null> {
    if (!this.currentOwner?.restaurant_id) return null

    try {
      const restaurants = JSON.parse(localStorage.getItem('restaurant_profiles') || '[]')
      return restaurants.find((r: RestaurantProfile) => r.id === this.currentOwner!.restaurant_id) || null
    } catch (error) {
      console.error('Error fetching restaurant profile:', error)
      return null
    }
  }

  // Update restaurant profile
  async updateRestaurantProfile(updates: Partial<RestaurantProfile>): Promise<{ success: boolean; error?: string }> {
    if (!this.currentOwner?.restaurant_id) {
      return { success: false, error: 'No restaurant associated with account' }
    }

    try {
      const restaurants = JSON.parse(localStorage.getItem('restaurant_profiles') || '[]')
      const restaurantIndex = restaurants.findIndex((r: RestaurantProfile) => r.id === this.currentOwner!.restaurant_id)

      if (restaurantIndex === -1) {
        return { success: false, error: 'Restaurant not found' }
      }

      restaurants[restaurantIndex] = {
        ...restaurants[restaurantIndex],
        ...updates,
        updated_at: new Date().toISOString()
      }

      localStorage.setItem('restaurant_profiles', JSON.stringify(restaurants))

      return { success: true }
    } catch (error) {
      console.error('Error updating restaurant profile:', error)
      return { success: false, error: 'Update failed' }
    }
  }

  // Get current owner
  getCurrentOwner(): RestaurantOwner | null {
    return this.currentOwner
  }

  // Check if owner is authenticated
  isAuthenticated(): boolean {
    return this.currentOwner !== null
  }

  // Auth state change listener
  onAuthStateChange(callback: (owner: RestaurantOwner | null) => void): () => void {
    this.authListeners.push(callback)
    return () => {
      this.authListeners = this.authListeners.filter(listener => listener !== callback)
    }
  }

  private notifyAuthListeners(owner: RestaurantOwner | null): void {
    this.authListeners.forEach(listener => listener(owner))
  }

  cleanup(): void {
    this.authListeners = []
  }
}

export const restaurantOwnerService = new RestaurantOwnerService()
export { RestaurantOwnerService }