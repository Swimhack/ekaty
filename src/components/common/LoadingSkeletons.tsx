interface SkeletonProps {
  className?: string
}

// Base skeleton component with shimmer animation
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-md ${className}`}
      role="status"
      aria-label="Loading content"
    />
  )
}

// Restaurant card skeleton
export function RestaurantCardSkeleton() {
  return (
    <div 
      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
      role="status"
      aria-label="Loading restaurant information"
    >
      {/* Image skeleton */}
      <Skeleton className="h-40 sm:h-48 w-full" />
      
      {/* Content skeleton */}
      <div className="p-4 sm:p-6">
        {/* Title and logo */}
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-4 rounded-sm" />
            ))}
          </div>
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-16" />
        </div>
        
        {/* Cuisine and location */}
        <div className="flex items-center gap-4 mb-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        
        {/* Description */}
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        
        {/* Features */}
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
        
        {/* Address */}
        <Skeleton className="h-4 w-full mb-4" />
        
        {/* Button */}
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  )
}

// Stats card skeleton
export function StatsCardSkeleton() {
  return (
    <div className="text-center" role="status" aria-label="Loading statistics">
      {/* Icon */}
      <div className="w-18 h-18 rounded-3xl flex items-center justify-center mx-auto mb-6 bg-white/15">
        <Skeleton className="w-9 h-9 rounded-lg" />
      </div>
      
      {/* Value */}
      <Skeleton className="h-12 w-20 mx-auto mb-3" />
      
      {/* Label */}
      <Skeleton className="h-6 w-16 mx-auto mb-2" />
      
      {/* Description */}
      <Skeleton className="h-4 w-24 mx-auto" />
    </div>
  )
}

// Search results skeleton
export function SearchResultsSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading search results">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-24" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <RestaurantCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

// Featured restaurants section skeleton
export function FeaturedRestaurantsSkeleton() {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="text-center mb-8 sm:mb-12">
          <Skeleton className="h-10 w-80 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        
        {/* Restaurant grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          {[...Array(6)].map((_, i) => (
            <RestaurantCardSkeleton key={i} />
          ))}
        </div>
        
        {/* Button skeleton */}
        <div className="text-center">
          <Skeleton className="h-12 w-48 mx-auto rounded-lg" />
        </div>
      </div>
    </section>
  )
}

// Page header skeleton
export function PageHeaderSkeleton() {
  return (
    <div className="mb-8" role="status" aria-label="Loading page header">
      <Skeleton className="h-10 w-80 mb-2" />
      <Skeleton className="h-6 w-96" />
    </div>
  )
}

// Search filters skeleton
export function SearchFiltersSkeleton() {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
      role="status" 
      aria-label="Loading search filters"
    >
      <div className="space-y-4">
        {/* Search bar skeleton */}
        <Skeleton className="h-12 w-full rounded-lg" />
        
        {/* Filter dropdowns skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        
        {/* Search button skeleton */}
        <Skeleton className="h-12 w-full md:w-48 rounded-lg" />
      </div>
    </div>
  )
}

// Simple loading spinner
export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div 
      className={`inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

// Loading overlay for inline content
export function LoadingOverlay({ children, isLoading, loadingText = 'Loading...' }: {
  children: React.ReactNode
  isLoading: boolean
  loadingText?: string
}) {
  if (!isLoading) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
        <div className="text-center">
          <LoadingSpinner size="lg" className="text-ekaty-600 mb-2" />
          <p className="text-gray-600 font-medium" aria-live="polite">{loadingText}</p>
        </div>
      </div>
    </div>
  )
}

// Full page loading state
export function PageLoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeaderSkeleton />
      <SearchFiltersSkeleton />
      <SearchResultsSkeleton />
    </div>
  )
}