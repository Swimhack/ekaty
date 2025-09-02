
import PageTemplate from '@/components/layout/PageTemplate'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

export default function Contact() {
  return (
    <PageTemplate
      title="Contact Us"
      subtitle="Get in touch with the eKaty.com team for questions, suggestions, or support."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Contact Information */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Mail className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Email</h3>
                <p className="text-gray-600">hello@ekaty.com</p>
                <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Phone className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Phone</h3>
                <p className="text-gray-600">(281) 555-0123</p>
                <p className="text-sm text-gray-500">Monday - Friday, 9 AM - 5 PM</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <MapPin className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Location</h3>
                <p className="text-gray-600">Katy, Texas</p>
                <p className="text-sm text-gray-500">Serving the greater Katy area</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">Select a subject</option>
                <option value="general">General Question</option>
                <option value="restaurant">Restaurant Information</option>
                <option value="business">Business Inquiry</option>
                <option value="support">Technical Support</option>
                <option value="feedback">Feedback</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              ></textarea>
            </div>
            
            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors duration-200"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </PageTemplate>
  )
}
