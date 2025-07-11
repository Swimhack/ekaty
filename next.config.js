/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Netlify
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  
  // Image optimization
  images: {
    unoptimized: true, // Required for static export
    domains: [
      'localhost',
      'sctaykgcfkhadowygrj.supabase.co',
      'maps.googleapis.com',
      'places.googleapis.com',
      'ekaty.com',
      'netlify.app'
    ],
  },
  
  // Environment variables
  env: {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,
  },
  
  // Webpack configuration for better builds
  webpack: (config, { isServer }) => {
    // Handle Node.js modules in client-side bundles
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    
    return config;
  },
  
  // Redirect configuration
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: false,
      },
    ];
  },
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig