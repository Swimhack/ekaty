/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: [
      'localhost',
      'sctaykgcfkhadowygrj.supabase.co',
      'maps.googleapis.com',
      'places.googleapis.com',
      'ekaty.com'
    ],
  },
  env: {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,
  },
}

module.exports = nextConfig