import { useState } from 'react'
import { Heart, Reply, Edit3, Trash2, MoreVertical, Check, X } from 'lucide-react'
import { ChatMessage } from '../../../lib/community-chat-service'
import { userService } from '../../../lib/user-service'

interface MessageItemProps {
  message: ChatMessage
  onLike: (messageId: string) => void
  onReply: (messageId: string) => void
  onUpdate: (messageId: string, newMessage: string) => void
  onDelete: (messageId: string) => void
  isLiked?: boolean
  showReplies?: boolean
}

export default function MessageItem({
  message,
  onLike,
  onReply,
  onUpdate,
  onDelete,
  isLiked = false,
  showReplies = false
}: MessageItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editMessage, setEditMessage] = useState(message.message)
  const [showMenu, setShowMenu] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const currentUser = userService.getCurrentUser()
  const canEdit = currentUser?.id === message.user_id
  const canDelete = currentUser?.id === message.user_id

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    
    return date.toLocaleDateString()
  }

  const handleLike = () => {
    onLike(message.id)
  }

  const handleReply = () => {
    onReply(message.id)
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditMessage(message.message)
    setShowMenu(false)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this message?')) return
    
    setIsDeleting(true)
    try {
      await onDelete(message.id)
    } finally {
      setIsDeleting(false)
    }
    setShowMenu(false)
  }

  const handleSaveEdit = async () => {
    if (editMessage.trim() === message.message) {
      setIsEditing(false)
      return
    }

    setIsUpdating(true)
    try {
      await onUpdate(message.id, editMessage.trim())
      setIsEditing(false)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditMessage(message.message)
  }

  if (message.is_deleted) {
    return (
      <div className="p-4 text-center text-gray-500 italic">
        <p>This message has been deleted</p>
      </div>
    )
  }

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex space-x-3">
        {/* Avatar */}
        <img
          src={message.avatar_url || '/images/default-avatar.jpg'}
          alt={`${message.username} avatar`}
          className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%23e5e7eb"/><text x="20" y="25" font-family="Arial" font-size="16" fill="%236b7280" text-anchor="middle">👤</text></svg>`
          }}
        />

        <div className="flex-1 min-w-0">
          {/* Message Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-gray-900 truncate">{message.username}</h4>
              <span className="text-sm text-gray-500">{formatTime(message.timestamp)}</span>
              {message.is_edited && (
                <span className="text-xs text-gray-400">(edited)</span>
              )}
            </div>

            {/* Action Menu */}
            {(canEdit || canDelete) && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    {canEdit && (
                      <button
                        onClick={handleEdit}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <Edit3 className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Message Content */}
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                rows={3}
                disabled={isUpdating}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={isUpdating || !editMessage.trim()}
                  className="inline-flex items-center space-x-2 px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="h-4 w-4" />
                  <span>{isUpdating ? 'Saving...' : 'Save'}</span>
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                  className="inline-flex items-center space-x-2 px-3 py-1 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-gray-700 whitespace-pre-wrap break-words">{message.message}</p>
          )}

          {/* Message Actions */}
          <div className="flex items-center space-x-4 mt-3">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 text-sm transition-colors ${
                isLiked 
                  ? 'text-orange-500' 
                  : 'text-gray-500 hover:text-orange-500'
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{message.likes}</span>
            </button>
            
            <button
              onClick={handleReply}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-orange-500 transition-colors"
            >
              <Reply className="h-4 w-4" />
              <span>Reply</span>
            </button>
          </div>

          {/* Replies */}
          {message.replies && message.replies.length > 0 && showReplies && (
            <div className="mt-3 ml-4 space-y-2">
              {message.replies.map((reply) => (
                <div key={reply.id} className="flex space-x-2">
                  <img
                    src={reply.avatar_url || '/images/default-avatar.jpg'}
                    alt={`${reply.username} avatar`}
                    className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="%23e5e7eb"/><text x="16" y="20" font-family="Arial" font-size="12" fill="%236b7280" text-anchor="middle">👤</text></svg>`
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h5 className="font-medium text-gray-900 text-sm">{reply.username}</h5>
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
  )
}


