import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'eKaty.com - Katy Restaurant Directory',
  description: 'Discover the best restaurants in Katy, Texas. Read reviews, find local favorites, and explore the dining scene in Katy.',
  keywords: 'Katy restaurants, Texas dining, restaurant reviews, local food',
  authors: [{ name: 'James Strickland' }],
  openGraph: {
    title: 'eKaty.com - Katy Restaurant Directory',
    description: 'Discover the best restaurants in Katy, Texas',
    url: 'https://ekaty.com',
    siteName: 'eKaty.com',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'eKaty.com - Katy Restaurant Directory',
    description: 'Discover the best restaurants in Katy, Texas',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}