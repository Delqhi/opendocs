import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/layout/CartDrawer'
import { AIChatWidget } from '@/components/ai/AIChatWidget'
import { Providers } from './providers'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: "Simone's Shop - Dein Premium Online-Shop",
  description: 'Entdecke hochwertige Produkte zu günstigen Preisen. Schneller Versand, sichere Bezahlung mit Stripe, PayPal & Klarna.',
  keywords: ['Online-Shop', 'Deutschland', 'Premium Produkte', 'Schneller Versand', 'Simone'],
  authors: [{ name: 'Simone Schulze' }],
  openGraph: {
    title: "Simone's Shop - Dein Premium Online-Shop",
    description: 'Entdecke hochwertige Produkte zu günstigen Preisen.',
    type: 'website',
    locale: 'de_DE',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <CartDrawer />
          <AIChatWidget />
        </Providers>
      </body>
    </html>
  )
}
