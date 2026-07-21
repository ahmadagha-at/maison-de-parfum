import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const CartPage = () => {
  const { items, totalItems, totalPrice, removeItem, updateQuantity, clearCart } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <span className="text-gold-400/20 text-7xl block mb-6">✦</span>
        <h1 className="font-serif text-4xl text-cream-100 mb-4">Your Cart is Empty</h1>
        <p className="font-sans text-sm text-charcoal-400 mb-8">
          Discover our curated collection and add a fragrance that speaks to you.
        </p>
        <Link to="/products"
          className="font-sans text-sm px-8 py-3 bg-gold-500 text-charcoal-950 hover:bg-gold-400 rounded font-medium tracking-wide transition-colors inline-block">
          Browse Collection
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <p className="font-sans text-xs text-gold-400 tracking-[0.3em] uppercase mb-1">Your Selection</p>
          <h1 className="font-serif text-4xl text-cream-100">Shopping Cart</h1>
        </div>
        <button onClick={clearCart}
          className="font-sans text-xs text-charcoal-400 hover:text-red-400 transition-colors tracking-widest uppercase">
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.productId}
              className="flex gap-4 bg-charcoal-900 border border-charcoal-800 rounded-lg p-4 hover:border-charcoal-700 transition-colors">
              {/* Thumbnail */}
              <div className="w-20 h-20 bg-charcoal-800 rounded overflow-hidden flex-shrink-0">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gold-400/30 text-2xl">✦</span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="font-sans text-xs text-gold-400 tracking-widest uppercase truncate">{item.brand}</p>
                <p className="font-serif text-base text-cream-100 mt-0.5 truncate">{item.name}</p>
                <p className="font-sans text-sm text-cream-200 mt-1">€{parseFloat(item.price).toFixed(2)}</p>
              </div>

              {/* Quantity + Remove */}
              <div className="flex flex-col items-end justify-between">
                <button onClick={() => removeItem(item.productId)}
                  className="text-charcoal-500 hover:text-red-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="flex items-center border border-charcoal-700 rounded overflow-hidden">
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="px-2 py-1 text-charcoal-400 hover:text-cream-100 hover:bg-charcoal-800 transition-colors text-sm">
                    −
                  </button>
                  <span className="px-3 py-1 font-sans text-sm text-cream-100 bg-charcoal-900 min-w-[2rem] text-center">
                    {item.quantity}
                  </span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="px-2 py-1 text-charcoal-400 hover:text-cream-100 hover:bg-charcoal-800 transition-colors text-sm">
                    +
                  </button>
                </div>
                <span className="font-sans text-sm font-medium text-cream-100">
                  €{(parseFloat(item.price) * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-charcoal-900 border border-charcoal-800 rounded-lg p-6 sticky top-24">
            <h2 className="font-serif text-xl text-cream-100 mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between font-sans text-sm">
                <span className="text-charcoal-400">Items ({totalItems})</span>
                <span className="text-cream-100">€{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-sans text-sm">
                <span className="text-charcoal-400">Shipping</span>
                <span className="text-emerald-400">Free</span>
              </div>
            </div>

            <div className="border-t border-charcoal-800 pt-4 mb-6">
              <div className="flex justify-between font-sans">
                <span className="text-sm text-charcoal-300">Total</span>
                <span className="text-lg font-medium text-cream-100">€{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full font-sans text-sm py-3.5 bg-gold-500 text-charcoal-950 hover:bg-gold-400 rounded font-medium tracking-wide transition-all duration-200 shadow-lg shadow-gold-500/20">
              Proceed to Checkout
            </button>

            <Link to="/products" className="block text-center mt-4 font-sans text-xs text-charcoal-500 hover:text-charcoal-300 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
