import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

const ProductCard = ({ product }) => {
  const { addItem } = useCart()

  const handleAddToCart = (e) => {
    e.preventDefault()
    addItem(product, 1)
  }

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-lg overflow-hidden hover:border-gold-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/5">

        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-charcoal-800">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gold-400/30 text-6xl">✦</span>
            </div>
          )}
          {product.stockQuantity === 0 && (
            <div className="absolute inset-0 bg-charcoal-950/70 flex items-center justify-center">
              <span className="font-sans text-xs text-charcoal-300 uppercase tracking-widest">Sold Out</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="font-sans text-xs text-gold-400 tracking-widest uppercase mb-1">{product.brand}</p>
          <h3 className="font-serif text-base text-cream-100 mb-1 leading-snug line-clamp-2">{product.name}</h3>
          <p className="font-sans text-xs text-charcoal-400 mb-3">{product.scentNote}</p>

          <div className="flex items-center justify-between">
            <span className="font-sans text-base font-medium text-cream-200">
              €{parseFloat(product.price).toFixed(2)}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0}
              className="font-sans text-xs px-3 py-1.5 bg-gold-500 text-charcoal-950 hover:bg-gold-400 disabled:opacity-40 disabled:cursor-not-allowed rounded transition-all duration-200 font-medium tracking-wide"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
