import { useState } from 'react'

export default function WaitlistSignup({ showDate }) {
  const [email, setEmail] = useState('')
  const [tickets, setTickets] = useState('2')
  const [status, setStatus] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('Joining waitlist...')

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
        setStatus(data.message || "You're on the waitlist!")
        setEmail('')
        setTickets('2')
      } else {
        setStatus(data.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      console.error('Waitlist error:', error)
      setStatus('Failed to join waitlist. Please try again.')
    }
  }

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
          className="flex-1 min-w-[180px] px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-comedy-purple/50 focus:border-comedy-purple"
        />
        <select
          value={tickets}
          onChange={(e) => setTickets(e.target.value)}
          className="w-24 px-2 py-2 text-sm rounded-lg border border-gray-300 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-comedy-purple/50 focus:border-comedy-purple"
          aria-label="Number of tickets"
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>{n} {n === 1 ? 'ticket' : 'tickets'}</option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-comedy-purple text-white font-medium rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-comedy-purple/50"
        >
          Join
        </button>
      </form>
      {status && (
        <p className={`mt-2 text-sm ${
          status.includes('waitlist!') || status.includes('already')
            ? 'text-green-700'
            : status.includes('Joining')
            ? 'text-gray-500'
            : 'text-red-600'
        }`}>
          {status}
        </p>
      )}
    </div>
  )
}
