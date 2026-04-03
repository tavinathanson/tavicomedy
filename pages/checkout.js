import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'
import Navigation from '@/components/Navigation'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false)
  const [soldOut, setSoldOut] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchClientSecret = useCallback(async () => {
    const res = await fetch('/api/create-checkout-session', { method: 'POST' })
    const data = await res.json()
    if (data.soldOut) {
      setSoldOut(true)
      return ''
    }
    return data.clientSecret
  }, [])

  return (
    <>
      <Head>
        <title>{soldOut ? 'Sold Out' : 'Checkout'} - Tavi Comedy Lab</title>
        <meta name="robots" content="noindex" />
      </Head>

      <Navigation />

      <main className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-lg mx-auto section-padding">
          {soldOut ? (
            <div className="text-center py-16">
              <h1 className="text-3xl font-display uppercase tracking-tight text-comedy-purple mb-4">Sold Out</h1>
              <p className="text-gray-600 mb-6">This show is sold out. Join the mailing list to get notified about future shows.</p>
              <Link href="/#updates" className="btn-primary inline-block py-3 px-8">
                Get Updates
              </Link>
            </div>
          ) : mounted ? (
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          ) : null}
        </div>
      </main>
    </>
  )
}
