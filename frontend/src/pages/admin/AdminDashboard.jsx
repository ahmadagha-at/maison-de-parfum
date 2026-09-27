import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import api from '../../api/axiosInstance'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchEmail, setSearchEmail] = useState('')
  const [customerOrders, setCustomerOrders] = useState(null)
  const [orderPage, setOrderPage] = useState({
    number: 0,
    totalPages: 0,
    totalElements: 0,
  })
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [refundingId, setRefundingId] = useState(null)

  const refreshStats = async () => {
    const response = await api.get('/admin/dashboard/stats')
    setStats(response.data)
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/dashboard/stats')
        setStats(response.data)
      } catch (err) {
        setError('Failed to load dashboard statistics.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const fetchCustomerOrders = async (page = 0) => {
    const email = searchEmail.trim()
    if (!email) return

    setIsSearching(true)
    setSearchError('')

    try {
      const response = await api.get('/orders/admin/search', {
        params: { email, page, size: 10 },
      })

      setCustomerOrders(response.data.content)
      setOrderPage({
        number: response.data.number,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
      })
    } catch (err) {
      setCustomerOrders(null)
      setSearchError(
          err.response?.data?.message ||
          'No customer was found with this email address.'
      )
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchOrders = (event) => {
    event.preventDefault()
    fetchCustomerOrders(0)
  }

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Delete order #${orderId}? This action cannot be undone.`)) {
      return
    }

    setDeletingId(orderId)
    setSearchError('')

    try {
      await api.delete(`/orders/admin/${orderId}`)

      const remainingOnPage = customerOrders.length - 1
      const targetPage =
          remainingOnPage === 0 && orderPage.number > 0
              ? orderPage.number - 1
              : orderPage.number

      await fetchCustomerOrders(targetPage)
      await refreshStats()
    } catch (err) {
      setSearchError(
          err.response?.data?.message ||
          'The order could not be deleted. Please try again.'
      )
    } finally {
      setDeletingId(null)
    }
  }

  const handleRefundOrder = async (orderId) => {
    if (!window.confirm(`Refund the full payment for order #${orderId}?`)) {
      return
    }

    setRefundingId(orderId)
    setSearchError('')

    try {
      const response = await api.post(`/orders/admin/${orderId}/refund`)

      await fetchCustomerOrders(orderPage.number)
      await refreshStats()

      if (response.data.status !== 'REFUNDED') {
        setSearchError(
            'The refund is processing at Stripe. Try again later to check its status.'
        )
      }
    } catch (err) {
      setSearchError(
          err.response?.data?.message ||
          'The refund could not be completed. Please try again.'
      )
    } finally {
      setRefundingId(null)
    }
  }

  if (isLoading) {
    return (
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="h-10 bg-charcoal-900 rounded w-1/4 mb-10 animate-pulse" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[...Array(3)].map((_, i) => (
                <div
                    key={i}
                    className="h-32 bg-charcoal-900 rounded-lg animate-pulse"
                />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-charcoal-900 rounded-lg animate-pulse" />
            <div className="h-96 bg-charcoal-900 rounded-lg animate-pulse" />
          </div>
        </div>
    )
  }

  if (error || !stats) {
    return (
        <div className="text-center py-20">
          <p className="font-sans text-sm text-red-400">
            {error || 'Failed to load dashboard statistics.'}
          </p>
        </div>
    )
  }

  const monthlyData = stats.monthlyRevenue.map((m) => {
    const date = new Date(m.year, m.month - 1)

    return {
      name: date.toLocaleString('default', {
        month: 'short',
        year: '2-digit',
      }),
      revenue: parseFloat(m.revenue),
    }
  })

  const topProductsData = stats.topProducts.map((p) => ({
    name: p.productName,
    value: p.totalQuantitySold,
  }))

  const COLORS = ['#d4af6a', '#b8962e', '#9a7a1e']

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <p className="font-sans text-xs text-gold-400 tracking-[0.3em] uppercase mb-1">
              Admin Portal
            </p>
            <h1 className="font-serif text-3xl text-cream-100">
              Dashboard
            </h1>
          </div>

          <Link
              to="/admin/products"
              className="font-sans text-sm px-5 py-2.5 bg-charcoal-800 text-cream-100 hover:bg-charcoal-700 rounded transition-colors tracking-wide"
          >
            Manage Products
          </Link>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-charcoal-900 border border-charcoal-800 p-6 rounded-lg">
            <p className="font-sans text-xs text-charcoal-400 uppercase tracking-widest mb-2">
              Total Revenue
            </p>
            <p className="font-serif text-3xl text-gold-400">
              €{parseFloat(stats.totalRevenue).toFixed(2)}
            </p>
          </div>

          <div className="bg-charcoal-900 border border-charcoal-800 p-6 rounded-lg">
            <p className="font-sans text-xs text-charcoal-400 uppercase tracking-widest mb-2">
              Total Orders
            </p>
            <p className="font-serif text-3xl text-cream-100">
              {stats.totalOrders}
            </p>
          </div>

          <div className="bg-charcoal-900 border border-charcoal-800 p-6 rounded-lg">
            <p className="font-sans text-xs text-charcoal-400 uppercase tracking-widest mb-2">
              Items Sold
            </p>
            <p className="font-serif text-3xl text-cream-100">
              {stats.totalItemsSold}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Revenue Chart */}
          <div className="bg-charcoal-900 border border-charcoal-800 p-6 rounded-lg">
            <h2 className="font-serif text-xl text-cream-100 mb-6">
              Revenue Overview
            </h2>

            {monthlyData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={monthlyData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#2e2b26"
                          vertical={false}
                      />
                      <XAxis
                          dataKey="name"
                          stroke="#777369"
                          tick={{ fill: '#777369', fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                          dy={10}
                      />
                      <YAxis
                          stroke="#777369"
                          tick={{ fill: '#777369', fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                          dx={-10}
                          tickFormatter={(v) => `€${v}`}
                      />
                      <RechartsTooltip
                          cursor={{ fill: '#2e2b26' }}
                          contentStyle={{
                            backgroundColor: '#1a1816',
                            borderColor: '#45423c',
                            color: '#fdfaf4',
                          }}
                          itemStyle={{ color: '#d4af6a' }}
                          formatter={(val) => [`€${val.toFixed(2)}`, 'Revenue']}
                      />
                      <Bar
                          dataKey="revenue"
                          fill="#d4af6a"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={50}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
            ) : (
                <div className="h-80 flex items-center justify-center">
                  <p className="font-sans text-sm text-charcoal-500">
                    No revenue data available.
                  </p>
                </div>
            )}
          </div>

          {/* Top Products */}
          <div className="bg-charcoal-900 border border-charcoal-800 p-6 rounded-lg flex flex-col">
            <h2 className="font-serif text-xl text-cream-100 mb-6">
              Top Selling Fragrances
            </h2>

            {topProductsData.length > 0 ? (
                <div className="flex-1 flex flex-col items-center">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                            data={topProductsData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                          {topProductsData.map((entry, index) => (
                              <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                              />
                          ))}
                        </Pie>

                        <RechartsTooltip
                            contentStyle={{
                              backgroundColor: '#1a1816',
                              borderColor: '#45423c',
                              color: '#fdfaf4',
                            }}
                            itemStyle={{ color: '#d4af6a' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="w-full mt-4 space-y-3">
                    {stats.topProducts.map((p, index) => (
                        <div
                            key={p.productId}
                            className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3 truncate pr-4">
                            <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{
                                  backgroundColor: COLORS[index % COLORS.length],
                                }}
                            />
                            <div className="truncate">
                              <p className="font-sans text-xs text-charcoal-400 uppercase tracking-widest">
                                {p.brand}
                              </p>
                              <p className="font-serif text-sm text-cream-100 truncate">
                                {p.productName}
                              </p>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <p className="font-sans text-sm text-cream-100">
                              {p.totalQuantitySold} sold
                            </p>
                            <p className="font-sans text-xs text-gold-400">
                              €{parseFloat(p.totalRevenue).toFixed(2)}
                            </p>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="font-sans text-sm text-charcoal-500">
                    No product sales yet.
                  </p>
                </div>
            )}
          </div>
        </div>

        {/* Customer order management */}
        <div className="mt-10 bg-charcoal-900 border border-charcoal-800 p-6 rounded-lg">
          <h2 className="font-serif text-xl text-cream-100 mb-2">
            Manage Customer Orders
          </h2>
          <p className="font-sans text-sm text-charcoal-400 mb-6">
            Search by customer email address to review, refund or delete orders.
          </p>

          <form
              onSubmit={handleSearchOrders}
              className="flex flex-col sm:flex-row gap-3 mb-6"
          >
            <label htmlFor="customer-email" className="sr-only">
              Customer email address
            </label>

            <input
                id="customer-email"
                type="email"
                value={searchEmail}
                onChange={(event) => setSearchEmail(event.target.value)}
                placeholder="customer@example.com"
                required
                className="flex-1 bg-charcoal-950 border border-charcoal-700 text-cream-100 placeholder-charcoal-600 rounded px-4 py-3 font-sans text-sm focus:outline-none focus:border-gold-500 transition-colors"
            />

            <button
                type="submit"
                disabled={isSearching}
                className="font-sans text-sm px-6 py-3 bg-gold-500 text-charcoal-950 hover:bg-gold-400 disabled:opacity-50 rounded font-medium tracking-wide transition-colors"
            >
              {isSearching ? 'Searching…' : 'Search Orders'}
            </button>
          </form>

          {searchError && (
              <p className="font-sans text-xs text-red-400 mb-4">
                {searchError}
              </p>
          )}

          {customerOrders && (
              customerOrders.length === 0 ? (
                  <p className="font-sans text-sm text-charcoal-500">
                    This customer has no orders.
                  </p>
              ) : (
                  <>
                    <p className="font-sans text-xs text-charcoal-500 mb-4">
                      {orderPage.totalElements}{' '}
                      {orderPage.totalElements === 1 ? 'order' : 'orders'} found
                    </p>

                    <div className="space-y-3">
                      {customerOrders.map((order) => (
                          <div
                              key={order.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-charcoal-950 border border-charcoal-800 rounded p-4"
                          >
                            <div>
                              <p className="font-serif text-sm text-cream-100">
                                Order #{order.id}
                              </p>
                              <p className="font-sans text-xs text-charcoal-400">
                                {order.items.length}{' '}
                                {order.items.length === 1 ? 'item' : 'items'}
                                {' · '}
                                {order.status}
                                {' · '}
                                {order.status === 'PENDING' && (
                                    <p className="font-sans text-xs text-amber-400 mt-2">
                                      Awaiting payment. After at least 30 minutes, an automatic check
                                      cancels unpaid orders and releases the reserved stock.
                                    </p>
                                )}
                                {new Date(order.createdAt).toLocaleDateString('en-US')}
                              </p>
                              <p className="font-sans text-xs text-gold-400 mt-1">
                                €{parseFloat(order.totalAmount).toFixed(2)}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              {['CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(order.status) && (
                                  <button
                                      type="button"
                                      onClick={() => handleRefundOrder(order.id)}
                                      disabled={
                                          refundingId === order.id ||
                                          deletingId === order.id
                                      }
                                      className="font-sans text-xs px-4 py-2 border border-gold-500 text-gold-400 hover:bg-charcoal-800 disabled:opacity-50 rounded transition-colors"
                                  >
                                    {refundingId === order.id ? 'Refunding…' : 'Refund'}
                                  </button>
                              )}

                              {['PENDING', 'CANCELLED', 'REFUNDED'].includes(order.status) && (
                                  <button
                                      type="button"
                                      onClick={() => handleDeleteOrder(order.id)}
                                      disabled={
                                          deletingId === order.id ||
                                          refundingId === order.id
                                      }
                                      className="font-sans text-xs px-4 py-2 border border-red-800/50 text-red-400 hover:bg-red-950/50 disabled:opacity-50 rounded transition-colors"
                                  >
                                    {deletingId === order.id ? 'Deleting…' : 'Delete'}
                                  </button>
                              )}
                            </div>
                          </div>
                      ))}
                    </div>

                    {orderPage.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 mt-6">
                          <button
                              type="button"
                              onClick={() => fetchCustomerOrders(orderPage.number - 1)}
                              disabled={isSearching || orderPage.number === 0}
                              className="font-sans text-xs px-4 py-2 border border-charcoal-700 text-charcoal-300 disabled:opacity-30 rounded"
                          >
                            Previous
                          </button>

                          <span className="font-sans text-xs text-charcoal-400">
                    Page {orderPage.number + 1} of {orderPage.totalPages}
                  </span>

                          <button
                              type="button"
                              onClick={() => fetchCustomerOrders(orderPage.number + 1)}
                              disabled={
                                  isSearching ||
                                  orderPage.number >= orderPage.totalPages - 1
                              }
                              className="font-sans text-xs px-4 py-2 border border-charcoal-700 text-charcoal-300 disabled:opacity-30 rounded"
                          >
                            Next
                          </button>
                        </div>
                    )}
                  </>
              )
          )}
        </div>
      </div>
  )
}

export default AdminDashboard
