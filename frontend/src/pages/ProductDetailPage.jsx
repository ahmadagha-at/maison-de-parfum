import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axiosInstance'
import { useCart } from '../context/CartContext.jsx'

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()

  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addedFeedback, setAddedFeedback] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`)
        setProduct(response.data)
      } catch {
        setError('Product not found.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    addItem(product, quantity)
    setAddedFeedback(true)
    setTimeout(() => setAddedFeedback(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
        <div className="aspect-square bg-charcoal-800 rounded-lg" />
        <div className="space-y-4 pt-4">
          <div className="h-4 bg-charcoal-800 rounded w-1/3" />
          <div className="h-8 bg-charcoal-800 rounded w-3/4" />
          <div className="h-4 bg-charcoal-800 rounded w-full" />
          <div className="h-4 bg-charcoal-800 rounded w-2/3" />
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="font-sans text-sm text-red-400">{error || 'Product not found.'}</p>
        <button onClick={() => navigate('/products')}
          className="font-sans text-sm text-gold-400 hover:text-gold-300 underline">
          Back to Collection
        </button>
      </div>
    )
  }

  const inStock = product.stockQuantity > 0

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-10 font-sans text-xs text-charcoal-500">
        <button onClick={() => navigate('/products')} className="hover:text-gold-300 transition-colors">
          Collection
        </button>
        <span>/</span>
        <span className="text-charcoal-300">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        {/* Image */}
        <div className="relative aspect-square bg-charcoal-900 border border-charcoal-800 rounded-lg overflow-hidden">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gold-400/20 text-8xl">✦</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <p className="font-sans text-xs text-gold-400 tracking-[0.3em] uppercase mb-2">{product.brand}</p>
          <h1 className="font-serif text-4xl text-cream-100 mb-3 leading-tight">{product.name}</h1>
          <p className="font-sans text-sm text-charcoal-400 mb-6 italic">{product.scentNote}</p>

          <div className="border-t border-charcoal-800 pt-6 mb-6">
            <p className="font-sans text-sm text-charcoal-300 leading-relaxed">{product.description}</p>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <span className="font-serif text-3xl text-cream-100">€{parseFloat(product.price).toFixed(2)}</span>
            <span className={`font-sans text-xs px-3 py-1 rounded-full border ${
              inStock
                ? 'border-emerald-800/50 text-emerald-400 bg-emerald-950/40'
                : 'border-charcoal-700 text-charcoal-400'
            }`}>
              {inStock ? `In Stock (${product.stockQuantity})` : 'Sold Out'}
            </span>
          </div>

          {/* Quantity + Add to Cart */}
          {inStock && (
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-charcoal-700 rounded overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-charcoal-300 hover:text-cream-100 hover:bg-charcoal-800 transition-colors font-sans text-lg leading-none">
                  −
                </button>
                <span className="px-4 py-2 font-sans text-sm text-cream-100 bg-charcoal-900 min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                  className="px-3 py-2 text-charcoal-300 hover:text-cream-100 hover:bg-charcoal-800 transition-colors font-sans text-lg leading-none">
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className={`flex-1 font-sans text-sm py-3 rounded font-medium tracking-wide transition-all duration-300 ${
                  addedFeedback
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gold-500 text-charcoal-950 hover:bg-gold-400 shadow-lg shadow-gold-500/20'
                }`}>
                {addedFeedback ? '✓ Added to Cart' : 'Add to Cart'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
