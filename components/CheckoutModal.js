import { useState, useCallback, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function CheckoutModal({ open, onClose, onSoldOut }) {
  const [quantity, setQuantity] = useState(2)
  const [step, setStep] = useState('pick') // 'pick' or 'pay'
  const [error, setError] = useState('')

  // Reset when modal opens/closes
  useEffect(() => {
    if (open) {
      setQuantity(2)
      setStep('pick')
      setError('')
    }
  }, [open])

  const fetchClientSecret = useCallback(async () => {
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    })
    const data = await res.json()
    if (data.soldOut) {
      onSoldOut?.()
      return ''
    }
    if (data.remaining) {
      setError(`Only ${data.remaining} tickets left. Please adjust your quantity.`)
      setStep('pick')
      setQuantity(data.remaining)
      return ''
    }
    return data.clientSecret
  }, [quantity, onSoldOut])

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-lg transition-colors"
          aria-label="Close"
        >
          &times;
        </button>

        {step === 'pick' ? (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-display uppercase tracking-tight text-comedy-purple mb-2">
              Get Tickets
            </h2>
            <p className="text-gray-500 text-sm mb-8">$20 per ticket, no extra fees</p>

            {error && (
              <p className="text-red-600 text-sm mb-4">{error}</p>
            )}

            <div className="flex items-center justify-center gap-6 mb-8">
              <button
                type="button"
                disabled={quantity <= 1}
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                aria-label="Remove a ticket"
                className="w-14 h-14 sm:w-12 sm:h-12 rounded-full border-2 text-2xl sm:text-xl font-medium flex items-center justify-center select-none touch-manipulation transition-colors disabled:opacity-30 disabled:cursor-not-allowed border-gray-300 text-gray-600 active:bg-comedy-purple active:text-white active:border-comedy-purple hover:border-comedy-purple hover:text-comedy-purple"
              >
                -
              </button>
              <div className="text-center min-w-[80px]">
                <span className="text-4xl font-bold text-gray-900">{quantity}</span>
                <p className="text-sm text-gray-500 mt-1">{quantity === 1 ? 'ticket' : 'tickets'}</p>
              </div>
              <button
                type="button"
                onClick={() => setQuantity(q => q + 1)}
                aria-label="Add a ticket"
                className="w-14 h-14 sm:w-12 sm:h-12 rounded-full border-2 text-2xl sm:text-xl font-medium flex items-center justify-center select-none touch-manipulation transition-colors border-gray-300 text-gray-600 active:bg-comedy-purple active:text-white active:border-comedy-purple hover:border-comedy-purple hover:text-comedy-purple"
              >
                +
              </button>
            </div>

            <p className="text-lg font-semibold text-gray-900 mb-6">
              Total: ${quantity * 20}
            </p>

            <button
              onClick={() => setStep('pay')}
              className="w-full bg-comedy-purple text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors text-lg"
            >
              Continue to Payment
            </button>
          </div>
        ) : (
          <div className="p-4 pt-6">
            <button
              onClick={() => setStep('pick')}
              className="text-sm text-gray-500 hover:text-comedy-purple transition-colors mb-3 flex items-center gap-1"
            >
              &larr; Change quantity
            </button>
            <EmbeddedCheckoutProvider key={quantity} stripe={stripePromise} options={{ fetchClientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        )}
      </div>
    </div>
  )
}
