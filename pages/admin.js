import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'

export default function AdminPage() {
  const [authed, setAuthed] = useState(null) // null = checking
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    fetch('/api/admin/auth')
      .then(r => r.json())
      .then(d => setAuthed(d.authenticated))
      .catch(() => setAuthed(false))
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      setAuthed(true)
      setPassword('')
    } else {
      setLoginError('Wrong password')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    setAuthed(false)
  }

  if (authed === null) {
    return <Shell><p className="text-gray-500">Loading...</p></Shell>
  }

  if (!authed) {
    return (
      <Shell>
        <div className="max-w-sm mx-auto mt-24">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-comedy-purple"
              autoFocus
            />
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <button
              type="submit"
              className="w-full bg-comedy-purple text-white font-medium py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Log In
            </button>
          </form>
        </div>
      </Shell>
    )
  }

  return <Shell><GuestList onLogout={handleLogout} /></Shell>
}

function Shell({ children }) {
  return (
    <>
      <Head>
        <title>Admin - Tavi Comedy</title>
        <meta name="robots" content="noindex" />
      </Head>
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </>
  )
}

function GuestList({ onLogout }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  const fetchGuests = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/guests')
      if (!res.ok) throw new Error('Failed to fetch')
      setData(await res.json())
    } catch {
      setError('Failed to load guest list')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchGuests() }, [fetchGuests])

  const handleDelete = async (guest) => {
    if (!confirm(`Remove ${guest.name}?`)) return
    const res = await fetch('/api/admin/delete-guest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: guest.name, showDate: data.showDate }),
    })
    if (res.ok) fetchGuests()
  }

  const handleToggleSkip = async (guest) => {
    const res = await fetch('/api/admin/toggle-skip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: guest.id,
        source: guest.source,
        showDate: data.showDate,
        skip: !guest.skip,
      }),
    })
    if (res.ok) fetchGuests()
  }

  const counting = data?.guests?.filter(g => !g.skip) || []
  const skipped = data?.guests?.filter(g => g.skip) || []
  const countingTickets = counting.reduce((s, g) => s + g.tickets, 0)
  const skippedTickets = skipped.reduce((s, g) => s + g.tickets, 0)
  const remaining = data ? data.capacity - countingTickets : 0

  const handleExportCsv = () => {
    const rows = [['Name', 'Email']]
    for (const g of data.guests) {
      rows.push([g.name || '', g.email || ''])
    }
    const csv = rows
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `guests-${data.showDate}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Guest List</h1>
          {data && (
            <p className="text-gray-500 text-sm mt-1">
              Show: {data.showDate}
            </p>
          )}
        </div>
        <button
          onClick={onLogout}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Log out
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && !data && <p className="text-gray-500">Loading...</p>}

      {data && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <SummaryCard
              label="Counting"
              value={countingTickets}
              sub={`/ ${data.capacity} cap`}
            />
            <SummaryCard
              label="Remaining"
              value={remaining}
              sub={remaining <= 0 ? 'sold out' : 'available'}
              highlight={remaining <= 0}
            />
            <SummaryCard
              label="Total People"
              value={data.totalTickets}
              sub="all entries"
            />
            <SummaryCard
              label="Skipped"
              value={skippedTickets}
              sub={`${skipped.length} entries`}
            />
          </div>

          {/* Add guest */}
          <div className="mb-6">
            {showAddForm ? (
              <AddGuestForm
                showDate={data.showDate}
                onDone={() => { setShowAddForm(false); fetchGuests() }}
                onCancel={() => setShowAddForm(false)}
              />
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="text-sm bg-comedy-purple text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  + Add Guest
                </button>
                <button
                  onClick={handleExportCsv}
                  disabled={!data.guests.length}
                  className="text-sm bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Export CSV
                </button>
              </div>
            )}
          </div>

          {/* Guest table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Email</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Qty</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Source</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Count</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {data.guests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      No guests yet
                    </td>
                  </tr>
                )}
                {data.guests.map((guest) => (
                  <tr
                    key={guest.id}
                    className={`border-b border-gray-100 last:border-0 ${guest.skip ? 'opacity-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      {guest.name || <span className="text-gray-400">No name</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{guest.email}</td>
                    <td className="px-4 py-3 text-center">{guest.tickets}</td>
                    <td className="px-4 py-3 text-center">
                      <SourceBadge source={guest.source} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleSkip(guest)}
                        className={`text-xs font-medium px-2 py-0.5 rounded-full transition-colors ${
                          guest.skip
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                        title={guest.skip ? 'Click to count toward capacity' : 'Click to skip (not count)'}
                      >
                        {guest.skip ? 'skipped' : 'yes'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {guest.source !== 'stripe' && (
                        <button
                          onClick={() => handleDelete(guest)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove"
                        >
                          &times;
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function SummaryCard({ label, value, sub, highlight }) {
  return (
    <div className={`bg-white rounded-lg border p-4 text-center ${highlight ? 'border-red-300' : 'border-gray-200'}`}>
      <p className={`text-2xl font-bold ${highlight ? 'text-red-600' : ''}`}>{value}</p>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  )
}

const SOURCE_STYLES = {
  stripe: 'bg-blue-100 text-blue-700',
  venmo: 'bg-cyan-100 text-cyan-700',
  comp: 'bg-green-100 text-green-700',
  cash: 'bg-yellow-100 text-yellow-700',
  other: 'bg-gray-100 text-gray-600',
}

function SourceBadge({ source }) {
  const style = SOURCE_STYLES[source] || SOURCE_STYLES.other
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${style}`}>
      {source}
    </span>
  )
}

function AddGuestForm({ showDate, onDone, onCancel }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [tickets, setTickets] = useState('1')
  const [source, setSource] = useState('venmo')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const res = await fetch('/api/admin/add-guest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, tickets: parseInt(tickets) || 1, source, showDate }),
    })

    if (res.ok) {
      onDone()
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Failed to add guest')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Name *"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-comedy-purple"
          autoFocus
        />
        <input
          type="email"
          placeholder="Email (optional)"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-comedy-purple"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          min="1"
          placeholder="Tickets"
          value={tickets}
          onChange={e => setTickets(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-comedy-purple"
        />
        <select
          value={source}
          onChange={e => setSource(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-comedy-purple"
        >
          <option value="venmo">Venmo</option>
          <option value="comp">Comp (free)</option>
          <option value="cash">Cash</option>
          <option value="other">Other</option>
        </select>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="text-sm bg-comedy-purple text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Adding...' : 'Add'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-gray-500 px-4 py-2 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
