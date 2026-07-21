import React, { useState, useEffect, useCallback } from 'react'
import api from '../api/axiosInstance'
import ProductCard from '../components/ProductCard.jsx'

const ProductsPage = () => {
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({ page: 0, totalPages: 0, totalElements: 0 })
  const [brand, setBrand] = useState('')
  const [brandInput, setBrandInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProducts = useCallback(async (page = 0) => {
    setIsLoading(true)
    setError(null)
    try {
      const params = { page, size: 12, sortBy: 'createdAt', sortDir: 'desc' }
      if (brand) params.brand = brand

      const response = await api.get('/products', { params })
      const { content, number, totalPages, totalElements } = response.data

      setProducts(content)
      setPagination({ page: number, totalPages, totalElements })
    } catch {
      setError('Failed to load products. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [brand])

  useEffect(() => {
    fetchProducts(0)
  }, [fetchProducts])

  const handleFilterSubmit = (e) => {
    e.preventDefault()
    setBrand(brandInput.trim())
  }

  const handleClearFilter = () => {
    setBrandInput('')
    setBrand('')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      {/* Header */}
      <div className="text-center mb-12">
        <p className="font-sans text-xs text-gold-400 tracking-[0.3em] uppercase mb-3">Our Collection</p>
        <h1 className="font-serif text-5xl text-cream-100">Fragrances</h1>
        {pagination.totalElements > 0 && (
          <p className="font-sans text-sm text-charcoal-400 mt-3">
            {pagination.totalElements} parfums available
          </p>
        )}
      </div>

      {/* Filter Bar */}
      <form onSubmit={handleFilterSubmit} className="flex gap-3 mb-10 max-w-md mx-auto">
        <input
          type="text"
          value={brandInput}
          onChange={(e) => setBrandInput(e.target.value)}
          placeholder="Filter by brand…"
          className="flex-1 bg-charcoal-900 border border-charcoal-700 text-cream-100 placeholder-charcoal-500 rounded px-4 py-2.5 font-sans text-sm focus:outline-none focus:border-gold-500 transition-colors"
        />
        <button type="submit"
          className="font-sans text-sm px-5 py-2.5 bg-gold-500 text-charcoal-950 hover:bg-gold-400 rounded transition-colors font-medium">
          Filter
        </button>
        {brand && (
          <button type="button" onClick={handleClearFilter}
            className="font-sans text-sm px-4 py-2.5 border border-charcoal-700 text-charcoal-300 hover:border-charcoal-500 rounded transition-colors">
            Clear
          </button>
        )}
      </form>

      {/* Active Filter Badge */}
      {brand && (
        <div className="flex justify-center mb-6">
          <span className="font-sans text-xs text-gold-400 bg-gold-500/10 border border-gold-500/30 px-3 py-1 rounded-full">
            Brand: {brand}
          </span>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-charcoal-900 border border-charcoal-800 rounded-lg overflow-hidden animate-pulse">
              <div className="aspect-[3/4] bg-charcoal-800" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-charcoal-800 rounded w-1/2" />
                <div className="h-4 bg-charcoal-800 rounded w-3/4" />
                <div className="h-3 bg-charcoal-800 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="font-sans text-sm text-red-400">{error}</p>
          <button onClick={() => fetchProducts(0)}
            className="mt-4 font-sans text-sm text-gold-400 hover:text-gold-300 underline">
            Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-gold-400/20 text-6xl block mb-4">✦</span>
          <p className="font-sans text-sm text-charcoal-400">No fragrances found for this filter.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => fetchProducts(pagination.page - 1)}
                disabled={pagination.page === 0}
                className="font-sans text-sm px-4 py-2 border border-charcoal-700 text-charcoal-300 hover:border-gold-500 hover:text-gold-400 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-all">
                ← Prev
              </button>
              <span className="font-sans text-sm text-charcoal-400 px-4">
                Page {pagination.page + 1} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchProducts(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages - 1}
                className="font-sans text-sm px-4 py-2 border border-charcoal-700 text-charcoal-300 hover:border-gold-500 hover:text-gold-400 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-all">
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ProductsPage
