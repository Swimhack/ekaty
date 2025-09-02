import { ReactNode } from 'react'

interface PageTemplateProps {
  children: ReactNode
  title?: string
  subtitle?: string
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  background?: 'white' | 'gray-50' | 'gray-100'
}

export default function PageTemplate({
  children,
  title,
  subtitle,
  className = '',
  maxWidth = '7xl',
  padding = 'lg',
  background = 'white'
}: PageTemplateProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  }

  const paddingClasses = {
    none: '',
    sm: 'py-4 sm:py-6',
    md: 'py-6 sm:py-8',
    lg: 'py-8 sm:py-12',
    xl: 'py-12 sm:py-16'
  }

  const backgroundClasses = {
    white: 'bg-white',
    'gray-50': 'bg-gray-50',
    'gray-100': 'bg-gray-100'
  }

  return (
    <div className={`min-h-screen ${backgroundClasses[background]}`}>
      <div className={`w-full ${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 ${paddingClasses[padding]} ${className}`}>
        {/* Page Header */}
        {(title || subtitle) && (
          <div className="text-center mb-8 sm:mb-12">
            {title && (
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        
        {/* Page Content */}
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  )
}

