import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-charcoal-950/95 backdrop-blur-sm border-b border-charcoal-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <span className="text-gold-400 text-xl">✦</span>
            <span className="font-serif text-xl font-semibold text-cream-100 tracking-wide group-hover:text-gold-300 transition-colors">
              Maison de Parfum
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/products"
              className="font-sans text-sm text-charcoal-300 hover:text-cream-100 tracking-widest uppercase transition-colors">
              Collection
            </Link>

            {isAdmin && (
              <Link to="/admin/dashboard"
                className="font-sans text-sm text-gold-400 hover:text-gold-300 tracking-widest uppercase transition-colors">
                Dashboard
              </Link>
            )}

            {isAuthenticated && (
              <Link to="/my-orders"
                className="font-sans text-sm text-charcoal-300 hover:text-cream-100 tracking-widest uppercase transition-colors">
                Orders
              </Link>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-5">
            {/* Cart Button */}
            <Link to="/cart" className="relative group">
              <svg className="w-5 h-5 text-charcoal-300 group-hover:text-cream-100 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold-500 text-charcoal-950 text-xs font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="font-sans text-sm text-charcoal-300">{user?.firstName}</span>
                <button
                  onClick={handleLogout}
                  className="font-sans text-sm px-4 py-1.5 border border-charcoal-700 text-charcoal-300 hover:border-gold-500 hover:text-gold-400 rounded transition-all duration-200 tracking-wide">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login"
                  className="font-sans text-sm text-charcoal-300 hover:text-cream-100 transition-colors tracking-wide">
                  Sign In
                </Link>
                <Link to="/register"
                  className="font-sans text-sm px-4 py-1.5 bg-gold-500 text-charcoal-950 hover:bg-gold-400 rounded transition-all duration-200 font-medium tracking-wide">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-charcoal-300 hover:text-cream-100"
            onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-charcoal-800 py-4 flex flex-col gap-4">
            <Link to="/products" onClick={() => setMenuOpen(false)}
              className="font-sans text-sm text-charcoal-300 tracking-widest uppercase">Collection</Link>
            <Link to="/cart" onClick={() => setMenuOpen(false)}
              className="font-sans text-sm text-charcoal-300 tracking-widest uppercase">Cart ({totalItems})</Link>
            {isAuthenticated && (
              <Link to="/my-orders" onClick={() => setMenuOpen(false)}
                className="font-sans text-sm text-charcoal-300 tracking-widest uppercase">Orders</Link>
            )}
            {isAdmin && (
              <Link to="/admin/dashboard" onClick={() => setMenuOpen(false)}
                className="font-sans text-sm text-gold-400 tracking-widest uppercase">Dashboard</Link>
            )}
            {isAuthenticated ? (
              <button onClick={() => { handleLogout(); setMenuOpen(false) }}
                className="text-left font-sans text-sm text-charcoal-300">Sign Out</button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}
                  className="font-sans text-sm text-charcoal-300">Sign In</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}
                  className="font-sans text-sm text-gold-400">Register</Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}

export default Navbar
