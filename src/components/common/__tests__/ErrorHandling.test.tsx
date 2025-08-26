import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { ErrorBoundary } from '../ErrorBoundary'
import ErrorHandler, { useErrorHandler, NetworkStatus } from '../ErrorHandler'
import { LoadingSpinner, RestaurantCardSkeleton } from '../LoadingSkeletons'

// Mock error component that throws an error
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div>No error</div>
}

// Mock component to test useErrorHandler hook
const TestErrorHandler = () => {
  const { errorState, setError, clearError, retry } = useErrorHandler(3)
  
  const triggerError = () => {
    setError(new Error('Test hook error'), 'network')
  }
  
  const performRetry = async () => {
    // Simulate some async operation
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  return (
    <div>
      <button onClick={triggerError}>Trigger Error</button>
      <button onClick={clearError}>Clear Error</button>
      <button onClick={() => retry(performRetry)}>Retry</button>
      
      {errorState.hasError && (
        <div data-testid="error-state">
          <div>Error: {errorState.error?.message}</div>
          <div>Type: {errorState.errorType}</div>
          <div>Retry Count: {errorState.retryCount}</div>
          <div>Is Retrying: {errorState.isRetrying.toString()}</div>
        </div>
      )}
    </div>
  )
}

describe('ErrorBoundary', () => {
  // Mock console.error to avoid noise in tests
  const originalError = console.error
  beforeEach(() => {
    console.error = vi.fn()
  })
  
  afterEach(() => {
    console.error = originalError
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('catches errors and displays error UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText(/We encountered an unexpected error/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('displays custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Custom error message')).toBeInTheDocument()
  })

  it('calls onError callback when error occurs', () => {
    const onError = vi.fn()
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    )
  })

  it('can retry after error', async () => {
    const user = userEvent.setup()
    
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    
    // Click try again
    await user.click(screen.getByRole('button', { name: /try again/i }))
    
    // Rerender with no error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('No error')).toBeInTheDocument()
  })
})

describe('ErrorHandler', () => {
  it('renders nothing when no error', () => {
    const { container } = render(<ErrorHandler error={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('displays network error correctly', () => {
    const networkError = new Error('Network failed')
    networkError.name = 'NetworkError'
    
    render(
      <ErrorHandler 
        error={networkError} 
        errorType="network" 
      />
    )
    
    expect(screen.getByText('Connection Problem')).toBeInTheDocument()
    expect(screen.getByText(/Unable to connect to our servers/)).toBeInTheDocument()
  })

  it('displays timeout error correctly', () => {
    const timeoutError = new Error('Request timeout')
    
    render(
      <ErrorHandler 
        error={timeoutError} 
        errorType="timeout" 
      />
    )
    
    expect(screen.getByText('Request Timed Out')).toBeInTheDocument()
    expect(screen.getByText(/The request took too long/)).toBeInTheDocument()
  })

  it('displays API error correctly', () => {
    const apiError = new Error('Server error')
    
    render(
      <ErrorHandler 
        error={apiError} 
        errorType="api" 
      />
    )
    
    expect(screen.getByText('Service Unavailable')).toBeInTheDocument()
    expect(screen.getByText(/Our servers are temporarily unavailable/)).toBeInTheDocument()
  })

  it('handles retry functionality', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const error = new Error('Test error')
    
    render(
      <ErrorHandler 
        error={error} 
        onRetry={onRetry}
        maxRetries={3}
      />
    )
    
    const retryButton = screen.getByRole('button', { name: /try again/i })
    await user.click(retryButton)
    
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('disables retry button after max retries', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const error = new Error('Test error')
    
    render(
      <ErrorHandler 
        error={error} 
        onRetry={onRetry}
        maxRetries={1}
      />
    )
    
    const retryButton = screen.getByRole('button', { name: /try again/i })
    
    // First retry
    await user.click(retryButton)
    expect(onRetry).toHaveBeenCalledTimes(1)
    
    // Should show max retries reached message
    expect(screen.getByText(/Maximum retry attempts reached/)).toBeInTheDocument()
  })

  it('shows different sizes correctly', () => {
    const error = new Error('Test error')
    
    const { rerender } = render(
      <ErrorHandler error={error} size="small" />
    )
    
    expect(screen.getByRole('alert')).toHaveClass('p-4')
    
    rerender(<ErrorHandler error={error} size="large" />)
    expect(screen.getByRole('alert')).toHaveClass('p-8')
  })
})

describe('useErrorHandler hook', () => {
  it('manages error state correctly', async () => {
    const user = userEvent.setup()
    
    render(<TestErrorHandler />)
    
    // Initially no error
    expect(screen.queryByTestId('error-state')).not.toBeInTheDocument()
    
    // Trigger error
    await user.click(screen.getByText('Trigger Error'))
    
    const errorState = screen.getByTestId('error-state')
    expect(errorState).toBeInTheDocument()
    expect(screen.getByText('Error: Test hook error')).toBeInTheDocument()
    expect(screen.getByText('Type: network')).toBeInTheDocument()
    expect(screen.getByText('Retry Count: 0')).toBeInTheDocument()
    
    // Clear error
    await user.click(screen.getByText('Clear Error'))
    expect(screen.queryByTestId('error-state')).not.toBeInTheDocument()
  })

  it('handles retry functionality', async () => {
    const user = userEvent.setup()
    
    render(<TestErrorHandler />)
    
    // Trigger error first
    await user.click(screen.getByText('Trigger Error'))
    expect(screen.getByText('Retry Count: 0')).toBeInTheDocument()
    
    // Retry
    await user.click(screen.getByText('Retry'))
    
    await waitFor(() => {
      expect(screen.queryByTestId('error-state')).not.toBeInTheDocument()
    })
  })
})

describe('NetworkStatus', () => {
  it('shows offline message when navigator.onLine is false', () => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    })
    
    render(<NetworkStatus />)
    
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/No internet connection/)).toBeInTheDocument()
  })

  it('shows nothing when online', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    })
    
    const { container } = render(<NetworkStatus />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('Loading Components', () => {
  it('renders loading spinner with correct size', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />)
    
    expect(screen.getByRole('status')).toHaveClass('h-4', 'w-4')
    
    rerender(<LoadingSpinner size="lg" />)
    expect(screen.getByRole('status')).toHaveClass('h-12', 'w-12')
  })

  it('renders loading spinner with custom className', () => {
    render(<LoadingSpinner className="text-red-500" />)
    
    expect(screen.getByRole('status')).toHaveClass('text-red-500')
  })

  it('renders restaurant card skeleton', () => {
    render(<RestaurantCardSkeleton />)
    
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByLabelText('Loading restaurant information')).toBeInTheDocument()
  })

  it('has accessible loading text', () => {
    render(<LoadingSpinner />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.getByLabelText('Loading')).toBeInTheDocument()
  })
})

describe('Accessibility', () => {
  it('error handlers have proper ARIA attributes', () => {
    const error = new Error('Test error')
    
    render(<ErrorHandler error={error} />)
    
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('loading states have proper ARIA attributes', () => {
    render(<RestaurantCardSkeleton />)
    
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByLabelText('Loading restaurant information')).toBeInTheDocument()
  })

  it('retry buttons have proper labels', () => {
    const error = new Error('Test error')
    const onRetry = vi.fn()
    
    render(<ErrorHandler error={error} onRetry={onRetry} />)
    
    const retryButton = screen.getByRole('button', { name: /try again/i })
    expect(retryButton).toHaveAttribute('aria-label')
  })

  it('error messages are announced to screen readers', () => {
    const error = new Error('Test error')
    
    render(<ErrorHandler error={error} />)
    
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})