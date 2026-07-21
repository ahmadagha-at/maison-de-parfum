import React, { useState } from 'react'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#fdfaf4',
      fontFamily: '"Inter", sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '14px',
      '::placeholder': {
        color: '#777369',
      },
    },
    invalid: {
      color: '#f87171',
      iconColor: '#f87171',
    },
  },
  hidePostalCode: true,
}

const PaymentForm = ({ clientSecret, onPaymentSuccess }) => {
  const stripe = useStripe()
  const elements = useElements()

  const [error, setError] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setError(null)

    const cardElement = elements.getElement(CardElement)

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    })

    if (error) {
      setError(error.message)
      setIsProcessing(false)
    } else if (paymentIntent.status === 'succeeded') {
      await onPaymentSuccess(paymentIntent)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block font-sans text-xs text-charcoal-400 uppercase tracking-widest mb-3">
          Credit Card Details
        </label>
        <div className="bg-charcoal-900 border border-charcoal-700 rounded px-4 py-3.5 focus-within:border-gold-500 transition-colors">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        {error && <p className="mt-2 font-sans text-xs text-red-400">{error}</p>}
      </div>

      <div className="bg-charcoal-800/50 p-4 rounded text-sm text-charcoal-300 font-sans">
        <p className="mb-2"><strong>Demo Mode (Test):</strong> You will not be charged.</p>
        <p>Use any valid-looking data, and <span className="font-mono text-gold-400">4242 4242 4242 4242</span> as the card number, <span className="font-mono text-gold-400">12/34</span> for expiry, and <span className="font-mono text-gold-400">123</span> for CVC.</p>
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full font-sans text-sm py-4 bg-gold-500 text-charcoal-950 hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed rounded font-medium tracking-wide transition-all duration-200 shadow-lg shadow-gold-500/20"
      >
        {isProcessing ? 'Processing Payment…' : 'Pay Now & Confirm Order'}
      </button>
    </form>
  )
}

export default PaymentForm
