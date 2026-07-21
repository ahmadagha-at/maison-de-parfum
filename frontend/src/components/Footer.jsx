import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => (
  <footer className="bg-charcoal-950 border-t border-charcoal-800 mt-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-gold-400 text-lg">✦</span>
            <span className="font-serif text-lg text-cream-100">Maison de Parfum</span>
          </div>
          <p className="font-sans text-sm text-charcoal-400 leading-relaxed">
            Curated luxury fragrances for the discerning connoisseur. Each bottle tells a story of artisanal craftsmanship.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-sans text-xs text-charcoal-400 uppercase tracking-widest mb-4">Navigation</h4>
          <ul className="space-y-2">
            {[['/', 'Home'], ['/products', 'Collection'], ['/login', 'Sign In'], ['/register', 'Register']].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="font-sans text-sm text-charcoal-300 hover:text-gold-300 transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-sans text-xs text-charcoal-400 uppercase tracking-widest mb-4">Legal</h4>
          <ul className="space-y-2">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
              <li key={item}>
                <span className="font-sans text-sm text-charcoal-400">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-sans text-xs text-charcoal-400 uppercase tracking-widest mb-4">Contact</h4>
          <ul className="space-y-2">
            <li>
              <a href="mailto:support@maisondeparfum.de" className="font-sans text-sm text-charcoal-300 hover:text-gold-300 transition-colors">
                support@maisondeparfum.de
              </a>
            </li>
            <li>
              <a href="tel:+49123456789" className="font-sans text-sm text-charcoal-300 hover:text-gold-300 transition-colors">
                +49 123 456789
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-charcoal-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="font-sans text-xs text-charcoal-500">
          © {new Date().getFullYear()} Maison de Parfum. All rights reserved.
        </p>
        <p className="font-sans text-xs text-charcoal-600 tracking-widest uppercase">
          Crafted with ✦ elegance
        </p>
      </div>
    </div>
  </footer>
)

export default Footer
