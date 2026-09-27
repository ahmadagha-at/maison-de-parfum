import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import api from '../api/axiosInstance'
import { useCart } from '../context/CartContext.jsx'
import PaymentForm from '../components/PaymentForm.jsx'


const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null

const CheckoutPage = () => {
  const { items, totalPrice, totalItems, buildOrderPayload, clearCart } = useCart()
  const navigate = useNavigate()

  const [address, setAddress] = useState('')
  const [addressError, setAddressError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const [clientSecret, setClientSecret] = useState(null)
  const [orderId, setOrderId] = useState(null)
  const [orderSuccess, setOrderSuccess] = useState(false)

  const handleCreateOrder = async (e) => {
    e.preventDefault()

    if (!address.trim()) {
      setAddressError('Shipping address is required')
      return
    }

    if (items.length === 0) {
      setServerError('Your cart is empty.')
      return
    }

    setIsSubmitting(true)
    setServerError('')

    try {
      const payload = buildOrderPayload(address)
      const response = await api.post('/orders', payload)

      setOrderId(response.data.id)
      setClientSecret(response.data.clientSecret)
      
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to initialize order. Please try again.'
      setServerError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePaymentSuccess = async () => {
    try {
      await api.post(`/orders/${orderId}/confirm-payment`)
    } catch {
      // The signed Stripe webhook will reconcile the order if this request is delayed.
    }
    setOrderSuccess(true)
    clearCart()
  }

  if (orderSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 border-2 border-gold-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-gold-400 text-2xl">✓</span>
        </div>
        <h1 className="font-serif text-4xl text-cream-100 mb-4">Payment Successful</h1>
        <p className="font-sans text-sm text-charcoal-300 mb-2">
          Your order #{orderId} has been confirmed.
        </p>
        <p className="font-sans text-sm text-charcoal-400 mb-4">
          This test order is now available in your order history.
        </p>
        <p className="font-sans text-xs text-charcoal-500 mb-10">
          Portfolio demonstration — no real payment or shipment is processed.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => navigate('/my-orders')}
            className="font-sans text-sm px-6 py-3 bg-gold-500 text-charcoal-950 hover:bg-gold-400 rounded font-medium tracking-wide transition-colors">
            View My Orders
          </button>
          <button onClick={() => navigate('/products')}
            className="font-sans text-sm px-6 py-3 border border-charcoal-700 text-charcoal-300 hover:border-gold-500 hover:text-gold-400 rounded transition-colors">
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <p className="font-sans text-xs text-gold-400 tracking-[0.3em] uppercase mb-1">Final Step</p>
        <h1 className="font-serif text-4xl text-cream-100">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Forms Area */}
        <div>
          {!clientSecret ? (
            <>
              <h2 className="font-serif text-xl text-cream-100 mb-6">Shipping Details</h2>
              <form onSubmit={handleCreateOrder}>
                {serverError && (
                  <div className="mb-6 p-3 bg-red-950/50 border border-red-800/50 rounded">
                    <p className="font-sans text-xs text-red-400">{serverError}</p>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block font-sans text-xs text-charcoal-400 uppercase tracking-widest mb-2">
                    Full Shipping Address
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value)
                      if (addressError) setAddressError('')
                    }}
                    rows={4}
                    placeholder="Street, City, Postal Code, Country"
                    className="w-full bg-charcoal-900 border border-charcoal-700 text-cream-100 placeholder-charcoal-600 rounded px-4 py-3 font-sans text-sm focus:outline-none focus:border-gold-500 transition-colors resize-none"
                  />
                  {addressError && <p className="mt-1 font-sans text-xs text-red-400">{addressError}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || items.length === 0}
                  className="w-full font-sans text-sm py-4 bg-gold-500 text-charcoal-950 hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed rounded font-medium tracking-wide transition-all duration-200 shadow-lg shadow-gold-500/20">
                  {isSubmitting ? 'Preparing Order…' : 'Continue to Payment'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="font-serif text-xl text-cream-100 mb-6">Payment Details</h2>
              <div className="bg-charcoal-950 p-6 rounded-lg border border-charcoal-800">
                {stripePromise ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <PaymentForm clientSecret={clientSecret} onPaymentSuccess={handlePaymentSuccess} />
                  </Elements>
                ) : (
                  <p className="font-sans text-sm text-red-400">
                    Stripe is not configured. Add VITE_STRIPE_PUBLIC_KEY to frontend/.env.
                  </p>
                )}
              </div>
              <p className="font-sans text-xs text-charcoal-500 mt-5">
                Stripe test mode is used. No real payment will be processed.
              </p>
            </>
          )}
        </div>

        {/* Order Review */}
        <div>
          <h2 className="font-serif text-xl text-cream-100 mb-6">Order Review ({totalItems} items)</h2>
          <div className="bg-charcoal-900 border border-charcoal-800 rounded-lg p-5 space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-charcoal-800 rounded overflow-hidden flex-shrink-0">
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><span className="text-gold-400/30 text-sm">✦</span></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-xs text-gold-400 truncate">{item.brand}</p>
                  <p className="font-serif text-sm text-cream-100 truncate">{item.name}</p>
                  <p className="font-sans text-xs text-charcoal-400">Qty: {item.quantity}</p>
                </div>
                <span className="font-sans text-sm text-cream-100 flex-shrink-0">
                  €{(parseFloat(item.price) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}

            <div className="border-t border-charcoal-800 pt-4 flex justify-between items-center">
              <span className="font-sans text-sm text-charcoal-300">Total</span>
              <span className="font-serif text-xl text-cream-100">€{totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
