import { useState } from 'react'

export default function WaitlistSignup({ showDate }) {
  const [email, setEmail] = useState('')
  const [tickets, setTickets] = useState('2')
  const [status, setStatus] = useState('') // 'submitting', 'success', 'duplicate', or error message

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('submitting')

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Lead')
    }

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, showDate, tickets: parseInt(tickets, 10) }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.message?.includes('already')) {
          setStatus('duplicate')
        } else {
          setStatus('success')
        }
        setEmail('')
        setTickets('2')
      } else {
        setStatus(data.error || 'Something went wrong. Please try again, or email tavi@tavicomedy.com.')
      }
    } catch {
      setStatus('Could not connect to the server. Please check your internet connection and try again.')
    }
  }

  const isSuccess = status === 'success' || status === 'duplicate'
  const isSubmitting = status === 'submitting'
  const isError = status && !isSuccess && !isSubmitting

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
      <p className="text-sm font-medium text-gray-900">
        Join the waitlist for this show
      </p>
      <p className="text-xs text-gray-500 mt-1 mb-2">
        We&apos;ll let you know if spots open up
      </p>
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={isSubmitting}
          className="flex-1 min-w-[180px] px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-comedy-purple/50 focus:border-comedy-purple disabled:opacity-50"
        />
        <select
          value={tickets}
          onChange={(e) => setTickets(e.target.value)}
          disabled={isSubmitting}
          className="w-24 px-2 py-2 text-sm rounded-lg border border-gray-300 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-comedy-purple/50 focus:border-comedy-purple disabled:opacity-50"
          aria-label="Number of tickets"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <option key={n} value={n}>{n} {n === 1 ? 'ticket' : 'tickets'}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm bg-comedy-purple text-white font-medium rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-comedy-purple/50 disabled:opacity-50"
        >
          {isSubmitting ? 'Joining...' : 'Join'}
        </button>
      </form>
      {isSuccess && (
        <p className="mt-2 text-sm text-green-700">
          {status === 'duplicate'
            ? "You're already on the waitlist for this show!"
            : "You're on the waitlist! We'll reach out if spots open up."}
        </p>
      )}
      {isError && (
        <p className="mt-2 text-sm text-red-600">
          {status}
        </p>
      )}
    </div>
  )
}
