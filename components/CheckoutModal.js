import { useState, useCallback, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'
import { siteConfig } from '@/config/site'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

// initialStep: optional, forces the modal into a specific state (for debug/preview).
// When set, skips the API fetch.
export default function CheckoutModal({ open, onClose, initialStep }) {
  const [quantity, setQuantity] = useState(2)
  const [remaining, setRemaining] = useState(null)
  const [step, setStep] = useState('pick') // 'pick', 'pay', 'error', or 'soldout'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // Fetch remaining capacity and reset state when modal opens
  useEffect(() => {
    if (!open) return

    if (!initialStep && siteConfig.showcaseForceSoldOut) {
      setStep('soldout')
      setLoading(false)
      return
    }

    if (initialStep) {
      setStep(initialStep)
      setLoading(false)
      setQuantity(3)
      setRemaining(3)
      if (initialStep === 'error') {
        setError('Something went wrong setting up checkout. Please try again, or email tavi@tavicomedy.com for help.')
      }
      if (initialStep === 'pick-limited') {
        setStep('pick')
        setRemaining(3)
        setQuantity(3)
        setError('Only 3 tickets left. Please adjust your quantity.')
      }
      return
    }

    setQuantity(2)
    setStep('pick')
    setError('')
    setRemaining(null)
    setLoading(true)
    fetch('/api/create-checkout-session')
      .then(res => res.json())
      .then(data => {
        if (data.soldOut) {
          setStep('soldout')
          return
        }
        if (data.error) {
          setError(data.error)
          setStep('error')
          return
        }
        setRemaining(data.remaining)
        // If only 1 left, default to 1
        if (data.remaining === 1) setQuantity(1)
      })
      .catch(() => {
        setError('Could not connect to the server. Please check your internet connection and try again.')
        setStep('error')
      })
      .finally(() => setLoading(false))
  }, [open, initialStep])

  const fetchClientSecret = useCallback(async () => {
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      })
      const data = await res.json()
      if (data.soldOut) {
        setStep('soldout')
        return ''
      }
      if (data.remaining != null && !data.clientSecret) {
        setRemaining(data.remaining)
        setError(`Only ${data.remaining} ${data.remaining === 1 ? 'ticket' : 'tickets'} left. Please adjust your quantity.`)
        setStep('pick')
        setQuantity(Math.min(quantity, data.remaining))
        return ''
      }
      if (data.error) {
        setError(data.error)
        setStep('error')
        return ''
      }
      return data.clientSecret
    } catch {
      setError('Could not connect to the server. Please check your internet connection and try again.')
      setStep('error')
      return ''
    }
  }, [quantity])

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

        {step === 'soldout' ? (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-display uppercase tracking-tight text-comedy-purple mb-4">
              Sold Out
            </h2>
            <p className="text-gray-600 mb-6">
              This show is sold out! Join the mailing list to get notified about future shows and be first in line for tickets.
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="#updates"
                onClick={(e) => {
                  e.preventDefault()
                  onClose()
                  setTimeout(() => {
                    document.querySelector('#updates')?.scrollIntoView({ behavior: 'smooth' })
                  }, 100)
                }}
                className="w-full bg-comedy-purple text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors text-center"
              >
                Get Notified About Future Shows
              </a>
              <a
                href="mailto:tavi@tavicomedy.com?subject=Waitlist for sold out show"
                className="text-comedy-purple hover:underline text-sm font-medium"
              >
                Email tavi@tavicomedy.com to get on the waitlist
              </a>
            </div>
          </div>
        ) : step === 'error' ? (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-display uppercase tracking-tight text-red-600 mb-4">
              Something Went Wrong
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setError('')
                  setStep('pick')
                  setLoading(true)
                  fetch('/api/create-checkout-session')
                    .then(res => res.json())
                    .then(data => {
                      if (data.soldOut) { setStep('soldout'); return }
                      if (data.error) { setError(data.error); setStep('error'); return }
                      setRemaining(data.remaining)
                      if (data.remaining === 1) setQuantity(1)
                    })
                    .catch(() => {
                      setError('Still unable to connect. Please try again in a moment.')
                      setStep('error')
                    })
                    .finally(() => setLoading(false))
                }}
                className="w-full bg-comedy-purple text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
              <a
                href="mailto:tavi@tavicomedy.com?subject=Trouble buying tickets"
                className="text-comedy-purple hover:underline text-sm font-medium"
              >
                Email tavi@tavicomedy.com for help
              </a>
            </div>
          </div>
        ) : step === 'pick' ? (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-display uppercase tracking-tight text-comedy-purple mb-2">
              Get Tickets
            </h2>
            <p className="text-gray-500 text-sm mb-8">$20 per ticket, no extra fees</p>

            {error && (
              <p className="text-red-600 text-sm mb-4">{error}</p>
            )}

            {loading ? (
              <p className="text-gray-400 py-8">Loading...</p>
            ) : (
              <>
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
                    disabled={remaining != null && quantity >= remaining}
                    onClick={() => setQuantity(q => remaining != null ? Math.min(q + 1, remaining) : q + 1)}
                    aria-label="Add a ticket"
                    className="w-14 h-14 sm:w-12 sm:h-12 rounded-full border-2 text-2xl sm:text-xl font-medium flex items-center justify-center select-none touch-manipulation transition-colors disabled:opacity-30 disabled:cursor-not-allowed border-gray-300 text-gray-600 active:bg-comedy-purple active:text-white active:border-comedy-purple hover:border-comedy-purple hover:text-comedy-purple"
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
              </>
            )}
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
