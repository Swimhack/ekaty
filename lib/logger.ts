import { createClient } from './supabase'

export type LogLevel = 'error' | 'warning' | 'info' | 'debug'

export interface LogEntry {
  level: LogLevel
  message: string
  context?: Record<string, any>
  userId?: string
  ipAddress?: string
  userAgent?: string
  stackTrace?: string
}

class Logger {
  private supabase = createClient()

  async log(entry: LogEntry): Promise<void> {
    try {
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        const consoleMethod = entry.level === 'error' ? 'error' : 
                             entry.level === 'warning' ? 'warn' : 
                             entry.level === 'debug' ? 'debug' : 'log'
        
        console[consoleMethod](`[${entry.level.toUpperCase()}]`, entry.message, entry.context)
        
        if (entry.stackTrace) {
          console.error('Stack trace:', entry.stackTrace)
        }
      }

      // Log to database
      const { error } = await this.supabase
        .from('application_logs')
        .insert({
          level: entry.level,
          message: entry.message,
          context: entry.context,
          user_id: entry.userId,
          ip_address: entry.ipAddress,
          user_agent: entry.userAgent,
          stack_trace: entry.stackTrace,
        })

      if (error) {
        console.error('Failed to log to database:', error)
      }
    } catch (error) {
      console.error('Logger error:', error)
    }
  }

  error(message: string, context?: Record<string, any>, error?: Error): void {
    this.log({
      level: 'error',
      message,
      context,
      stackTrace: error?.stack,
    })
  }

  warning(message: string, context?: Record<string, any>): void {
    this.log({
      level: 'warning',
      message,
      context,
    })
  }

  info(message: string, context?: Record<string, any>): void {
    this.log({
      level: 'info',
      message,
      context,
    })
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log({
      level: 'debug',
      message,
      context,
    })
  }

  // User-specific logging methods
  logUserAction(userId: string, action: string, context?: Record<string, any>): void {
    this.info(`User action: ${action}`, {
      ...context,
      userId,
      action,
    })
  }

  logRestaurantAction(restaurantId: number, action: string, userId?: string, context?: Record<string, any>): void {
    this.info(`Restaurant action: ${action}`, {
      ...context,
      restaurantId,
      userId,
      action,
    })
  }

  logReviewAction(reviewId: number, action: string, userId?: string, context?: Record<string, any>): void {
    this.info(`Review action: ${action}`, {
      ...context,
      reviewId,
      userId,
      action,
    })
  }

  logSecurityEvent(event: string, userId?: string, context?: Record<string, any>): void {
    this.warning(`Security event: ${event}`, {
      ...context,
      userId,
      event,
      security: true,
    })
  }

  logAPICall(endpoint: string, method: string, userId?: string, context?: Record<string, any>): void {
    this.debug(`API call: ${method} ${endpoint}`, {
      ...context,
      endpoint,
      method,
      userId,
    })
  }

  // Business metrics logging
  logConversion(type: string, userId?: string, context?: Record<string, any>): void {
    this.info(`Conversion: ${type}`, {
      ...context,
      conversionType: type,
      userId,
      metric: true,
    })
  }

  logPerformance(action: string, duration: number, context?: Record<string, any>): void {
    this.debug(`Performance: ${action} took ${duration}ms`, {
      ...context,
      action,
      duration,
      performance: true,
    })
  }
}

// Create singleton instance
export const logger = new Logger()

// Middleware helper for Next.js API routes
export const withLogging = (handler: any) => {
  return async (req: any, res: any) => {
    const start = Date.now()
    const { method, url, headers } = req
    const userAgent = headers['user-agent']
    const ipAddress = headers['x-forwarded-for'] || req.connection.remoteAddress

    try {
      logger.logAPICall(url, method, undefined, {
        userAgent,
        ipAddress,
      })

      const result = await handler(req, res)
      
      const duration = Date.now() - start
      logger.logPerformance(`API ${method} ${url}`, duration, {
        statusCode: res.statusCode,
        userAgent,
        ipAddress,
      })

      return result
    } catch (error) {
      logger.error(`API error in ${method} ${url}`, {
        userAgent,
        ipAddress,
        statusCode: res.statusCode,
      }, error as Error)
      
      throw error
    }
  }
}

// React hook for client-side logging
export const useLogger = () => {
  const logClientAction = (action: string, context?: Record<string, any>) => {
    logger.logUserAction('client', action, {
      ...context,
      clientSide: true,
      url: window.location.href,
      userAgent: navigator.userAgent,
    })
  }

  const logClientError = (error: Error, context?: Record<string, any>) => {
    logger.error(`Client error: ${error.message}`, {
      ...context,
      clientSide: true,
      url: window.location.href,
      userAgent: navigator.userAgent,
    }, error)
  }

  return {
    logAction: logClientAction,
    logError: logClientError,
  }
}

export default logger