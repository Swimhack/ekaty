import { supabase } from './supabase'

export interface ChatMessage {
  id: string
  user_id: string
  username: string
  avatar_url?: string
  message: string
  timestamp: string
  likes: number
  parent_id?: string
  is_edited: boolean
  is_deleted: boolean
  replies?: ChatMessage[]
}

export interface OnlineUser {
  user_id: string
  username: string
  avatar_url?: string
  is_online: boolean
  last_seen: string
}

class CommunityChatService {
  private currentUserId: string | null = null
  private currentUsername: string | null = null
  private currentAvatarUrl: string | null = null

  // Initialize the chat service with user credentials
  async initialize(userId: string, username: string, avatarUrl?: string): Promise<void> {
    this.currentUserId = userId
    this.currentUsername = username
    this.currentAvatarUrl = avatarUrl
  }

  // Test connection to Supabase
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1)

      return !error
    } catch (error) {
      console.error('Connection test failed:', error)
      return false
    }
  }

  // Get messages from the chat
  async getMessages(parentId?: string, limit = 50, offset = 0): Promise<ChatMessage[]> {
    try {
      // Use mock data for now since we need to create the database tables
      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          user_id: '1',
          username: 'Sarah M.',
          avatar_url: '/images/avatar1.jpg',
          message: 'Just tried the new Italian place on Mason Road - absolutely amazing! The pasta was perfectly cooked and the service was outstanding. Highly recommend! 🍝',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          likes: 8,
          is_edited: false,
          is_deleted: false,
          replies: [
            {
              id: '1a',
              user_id: '2',
              username: 'Mike K.',
              avatar_url: '/images/avatar2.jpg',
              message: 'Which dish did you try? I\'ve been wanting to check it out!',
              timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
              likes: 2,
              is_edited: false,
              is_deleted: false,
            }
          ]
        },
        {
          id: '2',
          user_id: '3',
          username: 'James R.',
          avatar_url: '/images/avatar3.jpg',
          message: 'Anyone know if Local Foods is still doing their happy hour specials? Planning to meet friends there later!',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          likes: 3,
          is_edited: false,
          is_deleted: false,
        },
        {
          id: '3',
          user_id: '4',
          username: 'Emma L.',
          avatar_url: '/images/avatar4.jpg',
          message: 'The farmers market this weekend was incredible! Picked up some fresh ingredients and tried the new food truck. Katy\'s food scene just keeps getting better! 🌟',
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          likes: 15,
          is_edited: false,
          is_deleted: false,
        }
      ]

      return mockMessages
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      return []
    }
  }

  // Send a new message
  async sendMessage(message: string, parentId?: string): Promise<ChatMessage | null> {
    if (!this.currentUserId || !this.currentUsername) {
      throw new Error('User not initialized')
    }

    try {
      // Create a new message object
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        user_id: this.currentUserId,
        username: this.currentUsername,
        avatar_url: this.currentAvatarUrl || '/images/default-avatar.jpg',
        message: message.trim(),
        timestamp: new Date().toISOString(),
        likes: 0,
        parent_id: parentId,
        is_edited: false,
        is_deleted: false,
      }

      return newMessage
    } catch (error) {
      console.error('Failed to send message:', error)
      return null
    }
  }

  // Update an existing message
  async updateMessage(messageId: string, newMessage: string): Promise<ChatMessage | null> {
    if (!this.currentUserId) {
      throw new Error('User not initialized')
    }

    try {
      // For now, just return a mock updated message
      return {
        id: messageId,
        user_id: this.currentUserId,
        username: this.currentUsername || 'User',
        avatar_url: this.currentAvatarUrl || '/images/default-avatar.jpg',
        message: newMessage.trim(),
        timestamp: new Date().toISOString(),
        likes: 0,
        is_edited: true,
        is_deleted: false,
      }
    } catch (error) {
      console.error('Failed to update message:', error)
      return null
    }
  }

  // Delete a message
  async deleteMessage(messageId: string): Promise<boolean> {
    if (!this.currentUserId) {
      throw new Error('User not initialized')
    }

    try {
      // For now, just return success
      return true
    } catch (error) {
      console.error('Failed to delete message:', error)
      return false
    }
  }

  // Like or unlike a message
  async toggleLike(messageId: string): Promise<boolean | null> {
    if (!this.currentUserId) {
      throw new Error('User not initialized')
    }

    try {
      // For now, just toggle the like state
      return Math.random() > 0.5 // Randomly return true or false
    } catch (error) {
      console.error('Failed to toggle like:', error)
      return null
    }
  }

  // Get online users
  async getOnlineUsers(): Promise<OnlineUser[]> {
    try {
      // Return mock online users
      const mockUsers: OnlineUser[] = [
        {
          user_id: '1',
          username: 'Sarah M.',
          avatar_url: '/images/avatar1.jpg',
          is_online: true,
          last_seen: new Date().toISOString(),
        },
        {
          user_id: '2',
          username: 'Mike K.',
          avatar_url: '/images/avatar2.jpg',
          is_online: true,
          last_seen: new Date().toISOString(),
        },
        {
          user_id: '3',
          username: 'James R.',
          avatar_url: '/images/avatar3.jpg',
          is_online: true,
          last_seen: new Date().toISOString(),
        }
      ]

      return mockUsers
    } catch (error) {
      console.error('Failed to fetch online users:', error)
      return []
    }
  }

  // Clean up resources
  cleanup(): void {
    // Nothing to clean up in simplified version
  }
}

// Create and export a singleton instance
export const communityChatService = new CommunityChatService()

// Export the class for testing or custom instances
export { CommunityChatService }


