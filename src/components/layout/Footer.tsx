import Link from 'next/link'

const footerLinks = {
  shop: [
    { name: 'Alle Produkte', href: '/products' },
    { name: 'Neuheiten', href: '/products?sort=newest' },
    { name: 'Bestseller', href: '/products?sort=popular' },
    { name: 'Sale', href: '/products?sale=true' },
  ],
  kundenservice: [
    { name: 'Kontakt', href: '/kontakt' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Versand', href: '/versand' },
    { name: 'Rückgabe', href: '/rueckgabe' },
  ],
  rechtliches: [
    { name: 'Impressum', href: '/impressum' },
    { name: 'Datenschutz', href: '/datenschutz' },
    { name: 'AGB', href: '/agb' },
    { name: 'Widerrufsrecht', href: '/widerrufsrecht' },
  ],
}

const socialLinks = [
  { name: 'Instagram', href: 'https://instagram.com', icon: 'instagram' },
  { name: 'TikTok', href: 'https://tiktok.com', icon: 'tiktok' },
  { name: 'Twitter', href: 'https://twitter.com', icon: 'twitter' },
]

export function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500" />
              <span className="text-xl font-bold text-white font-display">
                Simone&apos;s Shop
              </span>
            </Link>
            <p className="text-gray-400 text-sm mb-4 max-w-sm">
              Dein Premium Online-Shop für hochwertige Produkte. 
              Schneller Versand, sichere Bezahlung und erstklassiger Kundenservice.
            </p>
            
            {/* Payment Methods */}
            <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 bg-gray-800 rounded text-xs text-gray-300">Stripe</div>
              <div className="px-3 py-1 bg-gray-800 rounded text-xs text-gray-300">PayPal</div>
              <div className="px-3 py-1 bg-gray-800 rounded text-xs text-gray-300">Klarna</div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  <span className="sr-only">{link.name}</span>
                  <div className="h-5 w-5 flex items-center justify-center">
                    {link.icon === 'instagram' && (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    )}
                    {link.icon === 'tiktok' && (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                      </svg>
                    )}
                    {link.icon === 'twitter' && (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary-400 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kundenservice Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Kundenservice</h3>
            <ul className="space-y-2">
              {footerLinks.kundenservice.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary-400 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Rechtliches Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Rechtliches</h3>
            <ul className="space-y-2">
              {footerLinks.rechtliches.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary-400 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-white font-semibold mb-1">Newsletter</h3>
              <p className="text-gray-400 text-sm">
                Erhalte exklusive Angebote und Neuigkeiten direkt in dein Postfach.
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Deine E-Mail-Adresse"
                className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none w-64"
              />
              <button className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors">
                Anmelden
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm">
            © 2026 Simone&apos;s Shop. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  )
}
