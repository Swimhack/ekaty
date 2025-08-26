import { useState, useEffect } from 'react'
import { AlertCircle, RefreshCw, Cloud, Wifi } from 'lucide-react'

interface CloudflareTimeoutHandlerProps {
  onRetry?: () => Promise<void>
  className?: string
}

export default function CloudflareTimeoutHandler({ 
  onRetry, 
  className = '' 
}: CloudflareTimeoutHandlerProps) {
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleRetry = async () => {
    if (!onRetry || isRetrying) return

    setIsRetrying(true)
    setRetryCount(prev => prev + 1)

    try {
      await onRetry()
    } catch (error) {
      console.error('Retry failed:', error)
    } finally {
      setIsRetrying(false)
    }
  }

  const handleForceRefresh = () => {
    window.location.reload()
  }

  return (
    <div className={`text-center p-6 bg-orange-50 border border-orange-200 rounded-lg ${className}`}>
      <div className="mb-4">
        <Cloud size={48} className="mx-auto text-orange-500 mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Cloudflare Connection Timeout
        </h3>
        <p className="text-gray-600 mb-2">
          The request timed out while connecting through Cloudflare's network.
        </p>
        <p className="text-sm text-gray-500">
          This is usually temporary and often resolves with a retry.
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
        >
          {isRetrying ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              Retrying... ({retryCount}/5)
            </>
          ) : (
            <>
              <RefreshCw size={16} />
              Retry Connection
            </>
          )}
        </button>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
        </button>

        {showAdvanced && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left">
            <h4 className="font-medium text-gray-900 mb-2">Troubleshooting Steps:</h4>
            <ul className="text-sm text-gray-600 space-y-1 mb-4">
              <li>• Check your internet connection</li>
              <li>• Wait a moment and try again</li>
              <li>• Clear browser cache and cookies</li>
              <li>• Try using a different browser or device</li>
              <li>• Contact support if the issue persists</li>
            </ul>
            
            <button
              onClick={handleForceRefresh}
              className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Wifi size={16} />
              Force Page Refresh
            </button>
          </div>
        )}
      </div>

      {retryCount > 0 && (
        <div className="mt-4 text-xs text-gray-500">
          Retry attempts: {retryCount}/5
        </div>
      )}
    </div>
  )
}