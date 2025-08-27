export interface UserProfile {
  id: string
  username: string
  email?: string
  avatar_url?: string
  created_at: string
  last_seen: string
  is_online: boolean
}

export interface UserSession {
  user: UserProfile
  access_token: string
  refresh_token: string
}

class UserService {
  private currentUser: UserProfile | null = null
  private authListeners: Array<(user: UserProfile | null) => void> = []

  // Initialize user service and check for existing session
  async initialize(): Promise<UserProfile | null> {
    try {
      // Check localStorage for existing session
      const savedUser = localStorage.getItem('community_user')
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser)
        return this.currentUser
      }
      return null
    } catch (error) {
      console.error('Error initializing user service:', error)
      return null
    }
  }

  // Sign up a new user
  async signUp(email: string, password: string, username: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Simulate signup delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check if username is already taken (simulate)
      const existingUsers = JSON.parse(localStorage.getItem('community_users') || '[]')
      if (existingUsers.find((u: UserProfile) => u.username === username)) {
        return { success: false, error: 'Username already taken' }
      }

      // Create new user
      const newUser: UserProfile = {
        id: Date.now().toString(),
        username,
        email,
        avatar_url: '/images/default-avatar.jpg',
        created_at: new Date().toISOString(),
        last_seen: new Date().toISOString(),
        is_online: true
      }

      // Save user to localStorage
      existingUsers.push(newUser)
      localStorage.setItem('community_users', JSON.stringify(existingUsers))
      localStorage.setItem('community_user', JSON.stringify(newUser))
      
      this.currentUser = newUser
      this.notifyAuthListeners(newUser)

      return { success: true }
    } catch (error) {
      console.error('Error signing up:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Sign in existing user
  async signIn(email: string, password: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      // Simulate signin delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Find user by email
      const existingUsers = JSON.parse(localStorage.getItem('community_users') || '[]')
      const user = existingUsers.find((u: UserProfile) => u.email === email)
      
      if (!user) {
        return { success: false, error: 'User not found' }
      }

      // Update last seen
      user.last_seen = new Date().toISOString()
      user.is_online = true

      // Save updated user data
      localStorage.setItem('community_user', JSON.stringify(user))
      const updatedUsers = existingUsers.map((u: UserProfile) => 
        u.id === user.id ? user : u
      )
      localStorage.setItem('community_users', JSON.stringify(updatedUsers))
      
      this.currentUser = user
      this.notifyAuthListeners(user)

      return { success: true, user }
    } catch (error) {
      console.error('Error signing in:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Sign out current user
  async signOut(): Promise<void> {
    try {
      if (this.currentUser) {
        // Update user to offline
        this.currentUser.is_online = false
        this.currentUser.last_seen = new Date().toISOString()
        
        const existingUsers = JSON.parse(localStorage.getItem('community_users') || '[]')
        const updatedUsers = existingUsers.map((u: UserProfile) => 
          u.id === this.currentUser!.id ? this.currentUser : u
        )
        localStorage.setItem('community_users', JSON.stringify(updatedUsers))
      }

      localStorage.removeItem('community_user')
      this.currentUser = null
      this.notifyAuthListeners(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Get current user
  getCurrentUser(): UserProfile | null {
    return this.currentUser
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  // Listen for auth state changes
  onAuthStateChange(callback: (user: UserProfile | null) => void): () => void {
    this.authListeners.push(callback)
    
    // Return unsubscribe function
    return () => {
      this.authListeners = this.authListeners.filter(listener => listener !== callback)
    }
  }

  // Notify auth state listeners
  private notifyAuthListeners(user: UserProfile | null): void {
    this.authListeners.forEach(listener => listener(user))
  }

  // Clean up resources
  cleanup(): void {
    this.authListeners = []
  }
}

// Create and export a singleton instance
export const userService = new UserService()

// Export the class for testing or custom instances
export { UserService }
