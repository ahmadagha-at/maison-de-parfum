import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axiosInstance'

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState({ page: 0, totalPages: 0, totalElements: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchOrders = useCallback(async (page = 0) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get('/orders/my-orders', {
        params: { page, size: 10 },
      })
      const { content, number, totalPages, totalElements } = response.data
      setOrders(content)
      setPagination({ page: number, totalPages, totalElements })
    } catch {
      setError('Failed to load your orders. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders(0)
  }, [fetchOrders])

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'text-amber-400 bg-amber-400/10 border-amber-400/20'
      case 'CONFIRMED': return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      case 'SHIPPED': return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20'
      case 'DELIVERED': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
      case 'CANCELLED': return 'text-red-400 bg-red-400/10 border-red-400/20'
      default: return 'text-charcoal-400 bg-charcoal-800 border-charcoal-700'
    }
  }

  if (isLoading && orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 animate-pulse space-y-6">
        <div className="h-10 bg-charcoal-800 rounded w-1/4 mb-10" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 bg-charcoal-900 border border-charcoal-800 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <p className="font-sans text-xs text-gold-400 tracking-[0.3em] uppercase mb-1">Your History</p>
        <h1 className="font-serif text-4xl text-cream-100">My Orders</h1>
      </div>

      {error ? (
        <div className="text-center py-20">
          <p className="font-sans text-sm text-red-400">{error}</p>
          <button onClick={() => fetchOrders(0)}
            className="mt-4 font-sans text-sm text-gold-400 hover:text-gold-300 underline">
            Retry
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 border border-charcoal-800 rounded-lg bg-charcoal-900/50">
          <span className="text-gold-400/20 text-6xl block mb-4">✦</span>
          <p className="font-sans text-sm text-charcoal-400 mb-6">You haven't placed any orders yet.</p>
          <Link to="/products"
            className="font-sans text-sm px-6 py-3 bg-gold-500 text-charcoal-950 hover:bg-gold-400 rounded font-medium tracking-wide transition-colors">
            Discover Fragrances
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-charcoal-900 border border-charcoal-800 rounded-lg overflow-hidden">
              {/* Order Header */}
              <div className="bg-charcoal-950/50 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-charcoal-800">
                <div>
                  <p className="font-sans text-xs text-charcoal-400 mb-1">
                    Order #{order.id}
                  </p>
                  <p className="font-sans text-sm text-cream-100">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-sans text-xs text-charcoal-400 mb-1">Total Amount</p>
                  <p className="font-sans text-sm font-medium text-cream-100">
                    €{parseFloat(order.totalAmount).toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className={`font-sans text-xs px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-charcoal-800/50 last:border-0 last:pb-0">
                      <div>
                        <p className="font-sans text-xs text-gold-400 uppercase tracking-widest">{item.productBrand}</p>
                        <Link to={`/products/${item.productId}`} className="font-serif text-base text-cream-100 hover:text-gold-300 transition-colors">
                          {item.productName}
                        </Link>
                        <p className="font-sans text-xs text-charcoal-400 mt-1">
                          Qty: {item.quantity} × €{parseFloat(item.unitPrice).toFixed(2)}
                        </p>
                      </div>
                      <span className="font-sans text-sm text-cream-100">
                        €{parseFloat(item.subtotal).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-charcoal-800">
                  <p className="font-sans text-xs text-charcoal-400 mb-1">Shipping Address</p>
                  <p className="font-sans text-sm text-cream-200 whitespace-pre-line">{order.shippingAddress}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => fetchOrders(pagination.page - 1)}
                disabled={pagination.page === 0}
                className="font-sans text-sm px-4 py-2 border border-charcoal-700 text-charcoal-300 hover:border-gold-500 hover:text-gold-400 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-all">
                ← Prev
              </button>
              <span className="font-sans text-sm text-charcoal-400 px-4">
                Page {pagination.page + 1} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchOrders(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages - 1}
                className="font-sans text-sm px-4 py-2 border border-charcoal-700 text-charcoal-300 hover:border-gold-500 hover:text-gold-400 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-all">
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-10 pt-6 border-t border-charcoal-800 text-center">
        <p className="font-sans text-xs text-charcoal-500">
          Portfolio demonstration — orders and payments shown here are test data.
        </p>
      </div>
    </div>
  )
}

export default OrderHistoryPage
