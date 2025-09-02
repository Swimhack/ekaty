import { useState, useEffect, useRef, useCallback } from 'react'
import { MessageCircle, Users, Send, RefreshCw, AlertCircle } from 'lucide-react'
import { communityChatService, ChatMessage, OnlineUser } from '../../lib/community-chat-service'
import { userService, UserProfile } from '../../lib/user-service'
import AuthModal from '../components/community/AuthModal'
import MessageItem from '../components/community/MessageItem'
import PageTemplate from '@/components/layout/PageTemplate'

export default function Community() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(true)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [activeUsers, setActiveUsers] = useState<OnlineUser[]>([])
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set())
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Initialize services and check connection
  useEffect(() => {
    const initializeServices = async () => {
      try {
        setIsConnecting(true)
        setConnectionError(null)

        // Initialize user service
        const user = await userService.initialize()
        setCurrentUser(user)

        // Initialize chat service if user is authenticated
        if (user) {
          await communityChatService.initialize(user.id, user.username, user.avatar_url)
        }

        // Test connection
        const isConnected = await communityChatService.testConnection()
        setIsConnected(isConnected)

        if (isConnected) {
          // Load initial data
          await loadMessages()
          await loadOnlineUsers()
        } else {
          setConnectionError('Could not connect to the discussion service. Please try again later.')
        }
      } catch (error) {
        console.error('Error initializing services:', error)
        setConnectionError('Failed to initialize services. Please refresh the page.')
      } finally {
        setIsConnecting(false)
      }
    }

    initializeServices()

    // Set up auth state listener
    const unsubscribe = userService.onAuthStateChange(async (user) => {
      setCurrentUser(user)
      if (user) {
        await communityChatService.initialize(user.id, user.username, user.avatar_url)
        await loadMessages()
        await loadOnlineUsers()
      } else {
        setMessages([])
        setActiveUsers([])
      }
    })

    return () => {
      unsubscribe()
      communityChatService.cleanup()
      userService.cleanup()
    }
  }, [])

  // Load messages from the chat service
  const loadMessages = async () => {
    try {
      const messages = await communityChatService.getMessages()
      setMessages(messages)
    } catch (error) {
      console.error('Error loading messages:', error)
      setConnectionError('Failed to load messages. Please try again.')
    }
  }

  // Load online users
  const loadOnlineUsers = async () => {
    try {
      const users = await communityChatService.getOnlineUsers()
      setActiveUsers(users)
    } catch (error) {
      console.error('Error loading online users:', error)
    }
  }

  // Retry connection
  const retryConnection = async () => {
    setIsConnecting(true)
    setConnectionError(null)
    
    try {
      const isConnected = await communityChatService.testConnection()
      setIsConnected(isConnected)
      
      if (isConnected) {
        await loadMessages()
        await loadOnlineUsers()
      } else {
        setConnectionError('Still unable to connect. Please check your internet connection.')
      }
    } catch (error) {
      setConnectionError('Connection retry failed. Please refresh the page.')
    } finally {
      setIsConnecting(false)
    }
  }

  // Send a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !isConnected || !currentUser) return

    setIsLoading(true)
    try {
      const message = await communityChatService.sendMessage(newMessage.trim(), replyTo || undefined)
      if (message) {
        setMessages(prev => [message, ...prev])
        setNewMessage('')
        setReplyTo(null)
        scrollToBottom()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setConnectionError('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle message like
  const handleLike = async (messageId: string) => {
    if (!currentUser) return

    try {
      const liked = await communityChatService.toggleLike(messageId)
      if (liked !== null) {
        setLikedMessages(prev => {
          const newSet = new Set(prev)
          if (liked) {
            newSet.add(messageId)
          } else {
            newSet.delete(messageId)
          }
          return newSet
        })

        // Update message like count
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, likes: liked ? msg.likes + 1 : Math.max(0, msg.likes - 1) }
            : msg
        ))
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  // Handle message reply
  const handleReply = (messageId: string) => {
    setReplyTo(messageId)
    // Focus on message input
    const textarea = document.querySelector('textarea[placeholder*="Share your thoughts"]') as HTMLTextAreaElement
    if (textarea) {
      textarea.focus()
    }
  }

  // Handle message update
  const handleUpdate = async (messageId: string, newMessage: string) => {
    try {
      const updatedMessage = await communityChatService.updateMessage(messageId, newMessage)
      if (updatedMessage) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? updatedMessage : msg
        ))
      }
    } catch (error) {
      console.error('Error updating message:', error)
      setConnectionError('Failed to update message. Please try again.')
    }
  }

  // Handle message deletion
  const handleDelete = async (messageId: string) => {
    try {
      const success = await communityChatService.deleteMessage(messageId)
      if (success) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, is_deleted: true } : msg
        ))
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      setConnectionError('Failed to delete message. Please try again.')
    }
  }

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Show loading state
  if (isConnecting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Connecting to Community Chat...</h2>
          <p className="text-gray-500">Please wait while we establish connection</p>
        </div>
      </div>
    )
  }

  // Show connection error
  if (!isConnected && connectionError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 border border-red-200">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h2>
            <p className="text-gray-600 mb-6">{connectionError}</p>
            <button
              onClick={retryConnection}
              disabled={isConnecting}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`h-5 w-5 ${isConnecting ? 'animate-spin' : ''}`} />
              <span>{isConnecting ? 'Retrying...' : 'Retry Connection'}</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <PageTemplate
      title="Community Chat"
      subtitle="Connect with fellow food lovers in Katy"
      maxWidth="4xl"
      background="gray-50"
    >
      {/* Chat Header */}
      <div className="bg-white shadow-sm border-b rounded-t-lg">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-6 w-6 text-orange-500" />
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{activeUsers.length} online</span>
              </div>
            </div>
            
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <img
                  src={currentUser.avatar_url || '/images/default-avatar.jpg'}
                  alt={currentUser.username}
                  className="h-8 w-8 rounded-full bg-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="%23e5e7eb"/><text x="16" y="20" font-family="Arial" font-size="12" fill="%236b7280" text-anchor="middle">👤</text></svg>`
                  }}
                />
                <span className="text-sm font-medium text-gray-900">{currentUser.username}</span>
                <button
                  onClick={() => userService.signOut()}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chat Container */}
          {/* Message Input */}
          {currentUser ? (
            <div className="border-b border-gray-200 p-4">
              {replyTo && (
                <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-orange-700">
                      Replying to a message...
                    </span>
                    <button
                      onClick={() => setReplyTo(null)}
                      className="text-orange-500 hover:text-orange-600 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSendMessage} className="flex space-x-3">
                <img
                  src={currentUser.avatar_url || '/images/default-avatar.jpg'}
                  alt="Your avatar"
                  className="h-10 w-10 rounded-full bg-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%23e5e7eb"/><text x="20" y="25" font-family="Arial" font-size="16" fill="%236b7280" text-anchor="middle">👤</text></svg>`
                  }}
                />
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Share your thoughts about Katy restaurants..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    rows={3}
                    disabled={isLoading}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">
                      Be respectful and share your honest dining experiences
                    </p>
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || isLoading}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="h-4 w-4" />
                      <span>{isLoading ? 'Sending...' : 'Send'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="border-b border-gray-200 p-8 text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Join the Conversation</h3>
              <p className="text-gray-600 mb-4">Sign in to start chatting with the community</p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Sign In to Chat
              </button>
            </div>
          )}

          {/* Messages */}
          <div 
            ref={messagesContainerRef}
            className="divide-y divide-gray-200 max-h-96 overflow-y-auto"
          >
            {messages.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  onLike={handleLike}
                  onReply={handleReply}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  isLiked={likedMessages.has(message.id)}
                  showReplies={true}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Community Guidelines */}
        <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-semibold text-orange-800 mb-2">Community Guidelines</h3>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>• Share honest reviews and dining experiences</li>
            <li>• Be respectful to restaurant owners and fellow diners</li>
            <li>• No spam, self-promotion, or inappropriate content</li>
            <li>• Help build a supportive local food community</li>
          </ul>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false)
          // The auth state change listener will handle the rest
        }}
      />
    </PageTemplate>
  )
}