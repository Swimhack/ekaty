'use client'

import { useState } from 'react'
import { Mail, Check, AlertCircle } from 'lucide-react'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setStatus('error')
      setMessage('Please enter your email address')
      return
    }

    setStatus('loading')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('Thank you for subscribing! Check your email to confirm.')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Network error. Please check your connection and try again.')
    }
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-ekaty-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail size={32} className="text-ekaty-500" />
          </div>

          {/* Headline */}
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
            Stay in the Loop
          </h2>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get the latest restaurant news, new openings, special offers, and exclusive content 
            delivered straight to your inbox.
          </p>

          {/* Newsletter benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Check size={16} className="text-green-600" />
              </div>
              <p className="text-sm text-gray-600">New restaurant alerts</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Check size={16} className="text-green-600" />
              </div>
              <p className="text-sm text-gray-600">Exclusive deals & offers</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Check size={16} className="text-green-600" />
              </div>
              <p className="text-sm text-gray-600">Weekly dining recommendations</p>
            </div>
          </div>

          {/* Signup form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading' || status === 'success'}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ekaty-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className="px-6 py-3 bg-ekaty-500 hover:bg-ekaty-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200 whitespace-nowrap disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <div className="spinner"></div>
                    Subscribing...
                  </span>
                ) : status === 'success' ? (
                  <span className="flex items-center gap-2">
                    <Check size={16} />
                    Subscribed!
                  </span>
                ) : (
                  'Subscribe'
                )}
              </button>
            </div>

            {/* Status message */}
            {message && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${
                status === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {status === 'success' ? (
                    <Check size={16} />
                  ) : (
                    <AlertCircle size={16} />
                  )}
                  {message}
                </div>
              </div>
            )}
          </form>

          {/* Privacy note */}
          <p className="text-xs text-gray-500 mt-6">
            We respect your privacy. Unsubscribe at any time. 
            <br className="hidden sm:block" />
            No spam, just great restaurant content.
          </p>
        </div>
      </div>
    </section>
  )
}