import { useState, useEffect, useCallback } from 'react'
import { AlertCircle, RefreshCw, Wifi, WifiOff, AlertTriangle } from 'lucide-react'

export interface ErrorState {
  hasError: boolean
  error: Error | null
  errorType: 'network' | 'api' | 'generic' | 'timeout' | 'cloudflare'
  retryCount: number
  isRetrying: boolean
}

export interface ErrorHandlerProps {
  error?: Error | null
  errorType?: 'network' | 'api' | 'generic' | 'timeout' | 'cloudflare'
  onRetry?: () => void | Promise<void>
  maxRetries?: number
  showRetryButton?: boolean
  size?: 'small' | 'medium' | 'large'
  className?: string
}

// Custom hook for error handling with retry logic
export function useErrorHandler(maxRetries: number = 3) {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorType: 'generic',
    retryCount: 0,
    isRetrying: false
  })

  const setError = useCallback((error: Error, type: ErrorState['errorType'] = 'generic') => {
    setErrorState(prev => ({
      ...prev,
      hasError: true,
      error,
      errorType: type,
      isRetrying: false
    }))
  }, [])

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorType: 'generic',
      retryCount: 0,
      isRetrying: false
    })
  }, [])

  const retry = useCallback(async (retryFunction: () => Promise<void>) => {
    if (errorState.retryCount >= maxRetries) {
      return
    }

    setErrorState(prev => ({
      ...prev,
      isRetrying: true,
      retryCount: prev.retryCount + 1
    }))

    try {
      await retryFunction()
      clearError()
    } catch (error) {
      const errorType = getErrorType(error as Error)
      setError(error as Error, errorType)
    }
  }, [errorState.retryCount, maxRetries, clearError, setError])

  return {
    errorState,
    setError,
    clearError,
    retry
  }
}

// Utility function to determine error type
function getErrorType(error: Error): ErrorState['errorType'] {
  if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
    return 'network'
  }
  if (error.message.includes('timeout') || error.message.includes('Timeout')) {
    return 'timeout'
  }
  if (error.message.includes('API') || error.message.includes('400') || error.message.includes('500')) {
    return 'api'
  }
  return 'generic'
}

// Error display component
export function ErrorHandler({ 
  error, 
  errorType = 'generic', 
  onRetry, 
  maxRetries = 3, 
  showRetryButton = true,
  size = 'medium',
  className = ''
}: ErrorHandlerProps) {
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    if (!onRetry || retryCount >= maxRetries) return

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

  const getErrorContent = () => {
    switch (errorType) {
      case 'network':
        return {
          icon: WifiOff,
          title: 'Connection Problem',
          message: 'Unable to connect to our servers. Please check your internet connection.',
          suggestion: 'Try again when your connection is restored.'
        }
      
      case 'timeout':
        return {
          icon: AlertCircle,
          title: 'Request Timed Out',
          message: 'The request took too long to complete.',
          suggestion: 'This might be due to slow connection. Please try again.'
        }
      
      case 'cloudflare':
        return {
          icon: AlertCircle,
          title: 'Cloudflare Timeout',
          message: 'Connection timed out through Cloudflare network.',
          suggestion: 'This is usually temporary. Please wait a moment and try again.'
        }
      
      case 'api':
        return {
          icon: AlertTriangle,
          title: 'Service Unavailable',
          message: 'Our servers are temporarily unavailable.',
          suggestion: 'Please try again in a few moments.'
        }
      
      default:
        return {
          icon: AlertCircle,
          title: 'Something went wrong',
          message: error?.message || 'An unexpected error occurred.',
          suggestion: 'Please try again or refresh the page.'
        }
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'p-4',
          icon: 24,
          title: 'text-lg',
          message: 'text-sm',
          button: 'px-3 py-1 text-sm'
        }
      case 'large':
        return {
          container: 'p-8',
          icon: 64,
          title: 'text-2xl',
          message: 'text-base',
          button: 'px-6 py-3 text-base'
        }
      default:
        return {
          container: 'p-6',
          icon: 48,
          title: 'text-xl',
          message: 'text-sm',
          button: 'px-4 py-2 text-sm'
        }
    }
  }

  if (!error) return null

  const errorContent = getErrorContent()
  const sizeClasses = getSizeClasses()
  const IconComponent = errorContent.icon

  const canRetry = showRetryButton && onRetry && retryCount < maxRetries

  return (
    <div className={`text-center ${sizeClasses.container} ${className}`} role="alert">
      <div className="mb-4">
        <IconComponent 
          size={sizeClasses.icon} 
          className="mx-auto text-red-500 mb-3" 
          aria-hidden="true"
        />
        <h3 className={`font-semibold text-gray-900 mb-2 ${sizeClasses.title}`}>
          {errorContent.title}
        </h3>
        <p className={`text-gray-600 mb-2 ${sizeClasses.message}`}>
          {errorContent.message}
        </p>
        <p className={`text-gray-500 ${sizeClasses.message}`}>
          {errorContent.suggestion}
        </p>
      </div>

      {canRetry && (
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className={`inline-flex items-center gap-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${sizeClasses.button}`}
            aria-label={isRetrying ? 'Retrying...' : 'Try again'}
          >
            <RefreshCw 
              size={16} 
              className={isRetrying ? 'animate-spin' : ''} 
            />
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </button>
          
          {retryCount > 0 && (
            <p className="text-xs text-gray-500">
              Attempt {retryCount} of {maxRetries}
            </p>
          )}
        </div>
      )}

      {retryCount >= maxRetries && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            Maximum retry attempts reached. Please refresh the page or contact support if the problem persists.
          </p>
        </div>
      )}

      {process.env.NODE_ENV === 'development' && error && (
        <details className="mt-4 text-left bg-gray-100 p-3 rounded-lg">
          <summary className="cursor-pointer text-xs text-gray-600 mb-2">
            Debug Information
          </summary>
          <pre className="text-xs text-gray-800 whitespace-pre-wrap break-all">
            {error.stack || error.message}
          </pre>
        </details>
      )}
    </div>
  )
}

// Network status indicator component
export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div 
      className="fixed top-0 left-0 right-0 bg-red-600 text-white p-2 z-50"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center justify-center gap-2">
        <WifiOff size={16} />
        <span className="text-sm font-medium">
          No internet connection. Please check your network settings.
        </span>
      </div>
    </div>
  )
}

export default ErrorHandler