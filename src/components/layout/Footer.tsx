import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    discover: [
      { name: 'All Restaurants', to: '/restaurants' },
      { name: 'By Cuisine', to: '/cuisines' },
      { name: 'By Area', to: '/areas' },
      { name: 'Featured Restaurants', to: '/featured' },
      { name: 'New Restaurants', to: '/new' },
    ],
    community: [
      { name: 'Write a Review', to: '/reviews/new' },
      { name: 'Browse Reviews', to: '/reviews' },
      { name: 'Join Newsletter', to: '/newsletter' },
      { name: 'Restaurant Events', to: '/events' },
      { name: 'Food Blog', to: '/blog' },
    ],
    business: [
      { name: 'Add Your Restaurant', to: '/business/add' },
      { name: 'Business Dashboard', to: '/business/dashboard' },
      { name: 'Advertising', to: '/business/advertising' },
      { name: 'API Access', to: '/business/api' },
      { name: 'Partner with Us', to: '/business/partners' },
    ],
    support: [
      { name: 'Help Center', to: '/help' },
      { name: 'Contact Us', to: '/contact' },
      { name: 'Report an Issue', to: '/report' },
      { name: 'Privacy Policy', to: '/privacy' },
      { name: 'Terms of Service', to: '/terms' },
    ]
  }

  return (
    <footer className="text-white w-full overflow-hidden" style={{ backgroundColor: '#1A2874' }}>
      {/* Main footer content */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 w-full">
          {/* Company info */}
          <div className="sm:col-span-2 md:col-span-1 lg:col-span-1">
            <div className="mb-4">
              <img 
                src="/images/logo_new.jpg" 
                alt="eKaty.com"
                className="h-12 sm:h-16 w-auto mb-3 max-w-full"
              />
              <span className="font-display font-semibold text-lg sm:text-xl text-white">
                eKaty.com
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Discover the best restaurants in Katy, Texas. Your local dining guide with reviews, photos, and insider tips.
            </p>
            
            {/* Contact info */}
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <MapPin size={16} />
                <span>Katy, Texas</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={16} />
                <a href="mailto:hello@ekaty.com" className="hover:text-white transition-colors">
                  hello@ekaty.com
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={16} />
                <a href="tel:+1-281-555-0123" className="hover:text-white transition-colors">
                  (281) 555-0123
                </a>
              </div>
            </div>
          </div>

          {/* Footer links */}
          <div className="sm:col-span-2 md:col-span-1 lg:col-span-4">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 w-full">
              <div>
                <h3 className="font-semibold text-white mb-4">Discover</h3>
                <ul className="space-y-2">
                  {footerLinks.discover.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.to}
                        className="text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-4">Community</h3>
                <ul className="space-y-2">
                  {footerLinks.community.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.to}
                        className="text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-4">Business</h3>
                <ul className="space-y-2">
                  {footerLinks.business.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.to}
                        className="text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-4">Support</h3>
                <ul className="space-y-2">
                  {footerLinks.support.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.to}
                        className="text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter signup */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-800 w-full">
          <div className="max-w-full sm:max-w-md">
            <h3 className="font-semibold text-white mb-2">Stay Updated</h3>
            <p className="text-gray-400 text-sm mb-4">
              Get the latest restaurant news, reviews, and special offers delivered to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ekaty-500 focus:border-transparent text-sm"
              />
              <button
                type="submit"
                className="px-4 sm:px-6 py-2 bg-ekaty-500 hover:bg-ekaty-600 text-white font-medium rounded-lg transition-colors text-sm whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 w-full">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 text-center sm:text-left">
            {/* Copyright */}
            <div className="text-gray-400 text-sm max-w-full">
              <span className="block sm:inline">© {currentYear} eKaty.com. All rights reserved.</span>{' '}
              <span className="block sm:inline">Built by{' '}
                <a 
                  href="https://stricklandtechnology.com" 
                  className="text-ekaty-500 hover:text-ekaty-400 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Strickland Technology
                </a>
              </span>
            </div>

            {/* Social links */}
            <div className="flex items-center space-x-4">
              <a
                href="https://facebook.com/ekatytx"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Follow us on Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://twitter.com/ekatytx"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Follow us on Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://instagram.com/ekatytx"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Follow us on Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}