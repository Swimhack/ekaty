import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'eKaty.com - Katy Restaurant Directory',
  description: 'Discover the best restaurants in Katy, Texas. Read reviews, find local favorites, and explore the dining scene in Katy.',
  keywords: 'Katy restaurants, Texas dining, restaurant reviews, local food',
  authors: [{ name: 'James Strickland' }],
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