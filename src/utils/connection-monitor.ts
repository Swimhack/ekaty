// Connection monitoring utility to detect and handle Cloudflare timeouts
export class ConnectionMonitor {
  private static instance: ConnectionMonitor
  private listeners: Set<(isOnline: boolean) => void> = new Set()
  private isMonitoring = false
  private lastPingTime = 0
  private consecutiveFailures = 0

  static getInstance(): ConnectionMonitor {
    if (!ConnectionMonitor.instance) {
      ConnectionMonitor.instance = new ConnectionMonitor()
    }
    return ConnectionMonitor.instance
  }

  startMonitoring(): void {
    if (this.isMonitoring) return

    this.isMonitoring = true
    
    // Monitor browser online/offline events
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)

    // Periodic connection check every 30 seconds
    this.startPeriodicCheck()
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) return

    this.isMonitoring = false
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)
  }

  addListener(callback: (isOnline: boolean) => void): () => void {
    this.listeners.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback)
    }
  }

  private handleOnline = (): void => {
    this.consecutiveFailures = 0
    this.notifyListeners(true)
    console.log('🟢 Connection restored')
  }

  private handleOffline = (): void => {
    this.notifyListeners(false)
    console.log('🔴 Connection lost')
  }

  private notifyListeners(isOnline: boolean): void {
    this.listeners.forEach(callback => callback(isOnline))
  }

  private startPeriodicCheck(): void {
    const checkConnection = async () => {
      if (!this.isMonitoring) return

      try {
        const now = Date.now()
        
        // Don't ping too frequently
        if (now - this.lastPingTime < 30000) {
          setTimeout(checkConnection, 30000)
          return
        }

        this.lastPingTime = now

        // Ping a reliable endpoint
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        await fetch('https://cloudflare.com/cdn-cgi/trace', {
          signal: controller.signal,
          method: 'GET',
          cache: 'no-cache',
          headers: {
            'Accept': 'text/plain',
          }
        })

        clearTimeout(timeoutId)
        
        if (this.consecutiveFailures > 0) {
          this.consecutiveFailures = 0
          this.notifyListeners(true)
          console.log('🟢 Connection check passed')
        }

      } catch (error) {
        this.consecutiveFailures++
        console.warn(`⚠️ Connection check failed (${this.consecutiveFailures}/3):`, error)
        
        if (this.consecutiveFailures >= 3) {
          this.notifyListeners(false)
        }
      }

      // Schedule next check
      setTimeout(checkConnection, 30000)
    }

    // Start first check
    setTimeout(checkConnection, 5000)
  }

  // Test if we can reach Supabase specifically
  async testSupabaseConnection(): Promise<boolean> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      if (!supabaseUrl) return false

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        signal: controller.signal,
        method: 'HEAD',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        }
      })

      clearTimeout(timeoutId)
      return response.ok

    } catch (error) {
      console.warn('Supabase connection test failed:', error)
      return false
    }
  }

  getConnectionInfo(): {
    isOnline: boolean
    consecutiveFailures: number
    effectiveType?: string
  } {
    return {
      isOnline: navigator.onLine,
      consecutiveFailures: this.consecutiveFailures,
      effectiveType: (navigator as any).connection?.effectiveType
    }
  }
}

// Hook for React components to monitor connection status
export function useConnectionMonitor() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [connectionInfo, setConnectionInfo] = useState(() => 
    ConnectionMonitor.getInstance().getConnectionInfo()
  )

  useEffect(() => {
    const monitor = ConnectionMonitor.getInstance()
    monitor.startMonitoring()

    const unsubscribe = monitor.addListener((online) => {
      setIsOnline(online)
      setConnectionInfo(monitor.getConnectionInfo())
    })

    return () => {
      unsubscribe()
      monitor.stopMonitoring()
    }
  }, [])

  return {
    isOnline,
    connectionInfo,
    testSupabaseConnection: () => ConnectionMonitor.getInstance().testSupabaseConnection()
  }
}

import { useState, useEffect } from 'react'