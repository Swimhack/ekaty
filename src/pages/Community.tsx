import { useState, useEffect } from 'react'
import { MessageCircle, Users, Send, Heart, Reply } from 'lucide-react'

interface Message {
  id: string
  user: string
  avatar: string
  message: string
  timestamp: Date
  likes: number
  replies: Reply[]
}

interface Reply {
  id: string
  user: string
  avatar: string
  message: string
  timestamp: Date
}

export default function Community() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [activeUsers, setActiveUsers] = useState(12)

  // Mock data for initial messages
  const mockMessages: Message[] = [
    {
      id: '1',
      user: 'Sarah M.',
      avatar: '/images/avatar1.jpg',
      message: 'Just tried the new Italian place on Mason Road - absolutely amazing! The pasta was perfectly cooked and the service was outstanding. Highly recommend! 🍝',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      likes: 8,
      replies: [
        {
          id: '1a',
          user: 'Mike K.',
          avatar: '/images/avatar2.jpg',
          message: 'Which dish did you try? I\'ve been wanting to check it out!',
          timestamp: new Date(Date.now() - 10 * 60 * 1000)
        }
      ]
    },
    {
      id: '2',
      user: 'James R.',
      avatar: '/images/avatar3.jpg',
      message: 'Anyone know if Local Foods is still doing their happy hour specials? Planning to meet friends there later!',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      likes: 3,
      replies: []
    },
    {
      id: '3',
      user: 'Emma L.',
      avatar: '/images/avatar4.jpg',
      message: 'The farmers market this weekend was incredible! Picked up some fresh ingredients and tried the new food truck. Katy\'s food scene just keeps getting better! 🌟',
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      likes: 15,
      replies: []
    }
  ]

  useEffect(() => {
    // Simulate connecting to discussion service
    const connectTimer = setTimeout(() => {
      setIsConnected(true)
      setMessages(mockMessages)
    }, 1000)

    // Simulate active user count updates
    const userTimer = setInterval(() => {
      setActiveUsers(prev => Math.max(8, Math.min(25, prev + Math.floor(Math.random() * 3) - 1)))
    }, 10000)

    return () => {
      clearTimeout(connectTimer)
      clearInterval(userTimer)
    }
  }, [])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !isConnected) return

    const message: Message = {
      id: Date.now().toString(),
      user: 'You',
      avatar: '/images/default-avatar.jpg',
      message: newMessage.trim(),
      timestamp: new Date(),
      likes: 0,
      replies: []
    }

    setMessages(prev => [message, ...prev])
    setNewMessage('')
  }

  const handleLike = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, likes: msg.likes + 1 }
        : msg
    ))
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    
    return date.toLocaleDateString()
  }

  if (!isConnected) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-8 w-8 text-orange-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Community Chat</h1>
                <p className="text-gray-600">Connect with fellow food lovers in Katy</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{activeUsers} online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Message Input */}
          <div className="border-b border-gray-200 p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-3">
              <img
                src="/images/default-avatar.jpg"
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
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    Be respectful and share your honest dining experiences
                  </p>
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-4 w-4" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Messages */}
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="p-4 hover:bg-gray-50">
                  <div className="flex space-x-3">
                    <img
                      src={message.avatar}
                      alt={`${message.user} avatar`}
                      className="h-10 w-10 rounded-full bg-gray-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%23e5e7eb"/><text x="20" y="25" font-family="Arial" font-size="16" fill="%236b7280" text-anchor="middle">👤</text></svg>`
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900">{message.user}</h4>
                        <span className="text-sm text-gray-500">{formatTime(message.timestamp)}</span>
                      </div>
                      <p className="mt-1 text-gray-700">{message.message}</p>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-4 mt-3">
                        <button
                          onClick={() => handleLike(message.id)}
                          className="flex items-center space-x-1 text-sm text-gray-500 hover:text-orange-500 transition-colors"
                        >
                          <Heart className="h-4 w-4" />
                          <span>{message.likes}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-orange-500 transition-colors">
                          <Reply className="h-4 w-4" />
                          <span>Reply</span>
                        </button>
                      </div>

                      {/* Replies */}
                      {message.replies.length > 0 && (
                        <div className="mt-3 ml-4 space-y-2">
                          {message.replies.map((reply) => (
                            <div key={reply.id} className="flex space-x-2">
                              <img
                                src={reply.avatar}
                                alt={`${reply.user} avatar`}
                                className="h-8 w-8 rounded-full bg-gray-200"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="%23e5e7eb"/><text x="16" y="20" font-family="Arial" font-size="12" fill="%236b7280" text-anchor="middle">👤</text></svg>`
                                }}
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h5 className="font-medium text-gray-900 text-sm">{reply.user}</h5>
                                  <span className="text-xs text-gray-500">{formatTime(reply.timestamp)}</span>
                                </div>
                                <p className="text-sm text-gray-700">{reply.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
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
    </div>
  )
}