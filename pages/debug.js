import { useState } from 'react'
import Head from 'next/head'
import CheckoutModal from '@/components/CheckoutModal'

// Only accessible when NEXT_PUBLIC_DEBUG_ENABLED=true
export async function getServerSideProps() {
  if (process.env.NEXT_PUBLIC_DEBUG_ENABLED !== 'true') {
    return { notFound: true }
  }
  return { props: {} }
}

export default function DebugPage() {
  const [activeModal, setActiveModal] = useState(null)

  const states = [
    {
      id: 'live',
      initialStep: null,
      label: 'Checkout Modal (live)',
      description: 'The real checkout flow, hitting the API',
    },
    {
      id: 'pick',
      initialStep: 'pick',
      label: 'Ticket Picker',
      description: 'The quantity selection step',
    },
    {
      id: 'pick-limited',
      initialStep: 'pick-limited',
      label: 'Ticket Picker (limited capacity)',
      description: 'Quantity picker when only a few tickets remain',
    },
    {
      id: 'soldout',
      initialStep: 'soldout',
      label: 'Sold Out',
      description: 'What customers see when tickets are gone',
    },
    {
      id: 'error',
      initialStep: 'error',
      label: 'Error State',
      description: 'What customers see when something goes wrong',
    },
    {
      id: 'pay',
      initialStep: 'pay',
      label: 'Payment Step',
      description: 'The Stripe embedded checkout (will fail without a real session)',
    },
  ]

  const activeState = states.find(s => s.id === activeModal)

  return (
    <>
      <Head>
        <title>Debug - Tavi Comedy Lab</title>
        <meta name="robots" content="noindex" />
      </Head>

      <main className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Checkout Debug</h1>
          <p className="text-gray-500 mb-8 text-sm">Click a state to preview the real CheckoutModal component. This page is only visible when NEXT_PUBLIC_DEBUG_ENABLED=true.</p>

          <div className="space-y-3">
            {states.map(state => (
              <button
                key={state.id}
                onClick={() => setActiveModal(state.id)}
                className="w-full text-left bg-white rounded-lg border border-gray-200 p-4 hover:border-comedy-purple transition-colors"
              >
                <p className="font-medium text-gray-900">{state.label}</p>
                <p className="text-sm text-gray-500">{state.description}</p>
              </button>
            ))}
          </div>

          <div className="mt-8 bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="font-medium text-gray-900 mb-2">Live API Status</h2>
            <TicketStatus />
          </div>
        </div>
      </main>

      <CheckoutModal
        open={activeModal != null}
        onClose={() => setActiveModal(null)}
        initialStep={activeState?.initialStep}
      />
    </>
  )
}

function TicketStatus() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchStatus = () => {
    setLoading(true)
    fetch('/api/create-checkout-session')
      .then(res => res.json())
      .then(data => setStatus(data))
      .catch(err => setStatus({ error: err.message }))
      .finally(() => setLoading(false))
  }

  return (
    <div>
      <button
        onClick={fetchStatus}
        disabled={loading}
        className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded transition-colors disabled:opacity-50"
      >
        {loading ? 'Fetching...' : 'Fetch Status'}
      </button>
      {status && (
        <pre className="mt-3 text-xs bg-gray-50 p-3 rounded overflow-x-auto">
          {JSON.stringify(status, null, 2)}
        </pre>
      )}
    </div>
  )
}
