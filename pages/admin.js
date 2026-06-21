import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
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
  const [shows, setShows] = useState([])
  const [selectedShow, setSelectedShow] = useState(null)
  const [currentShowDate, setCurrentShowDate] = useState(null)
  const checkinTimers = useRef({})
  const checkinValues = useRef({})

  const fetchGuests = useCallback(async (showDate) => {
    if (!showDate) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/guests?showDate=${encodeURIComponent(showDate)}`)
      if (!res.ok) throw new Error('Failed to fetch')
      setData(await res.json())
    } catch {
      setError('Failed to load guest list')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load the list of shows, then default to the most recent one that has data
  // (falling back to the current configured show if nothing has sold yet).
  useEffect(() => {
    fetch('/api/admin/shows')
      .then(r => r.json())
      .then(d => {
        const list = d.shows || []
        setShows(list)
        setCurrentShowDate(d.currentShowDate || null)
        const withData = list.find(s => s.parties > 0)
        setSelectedShow(withData?.showDate || d.currentShowDate || list[0]?.showDate || null)
      })
      .catch(() => setError('Failed to load shows'))
  }, [])

  useEffect(() => { fetchGuests(selectedShow) }, [selectedShow, fetchGuests])

  const handleDelete = async (guest) => {
    if (!confirm(`Remove ${guest.name}?`)) return
    const res = await fetch('/api/admin/delete-guest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: guest.name, showDate: data.showDate }),
    })
    if (res.ok) fetchGuests(selectedShow)
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
    if (res.ok) fetchGuests(selectedShow)
  }

  const handleSetCheckedIn = (guest, count) => {
    const clamped = Math.max(0, Math.min(guest.tickets, count))
    if (clamped === (guest.checkedIn || 0)) return
    // Optimistic local update so the door scanning feels instant
    setData(d => ({
      ...d,
      guests: d.guests.map(g => g.id === guest.id ? { ...g, checkedIn: clamped } : g),
    }))
    // Debounce + serialize the write per guest so rapid taps collapse into a
    // single request with the final value (avoids racing writes to the sheet).
    checkinValues.current[guest.id] = clamped
    if (checkinTimers.current[guest.id]) clearTimeout(checkinTimers.current[guest.id])
    checkinTimers.current[guest.id] = setTimeout(async () => {
      delete checkinTimers.current[guest.id]
      const value = checkinValues.current[guest.id]
      try {
        const res = await fetch('/api/admin/check-in', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: guest.id,
            source: guest.source,
            name: guest.name,
            showDate: data.showDate,
            checkedIn: value,
          }),
        })
        if (!res.ok) throw new Error('save failed')
      } catch {
        setError('Could not save a check-in. Reloading the latest...')
        fetchGuests(selectedShow)
      }
    }, 300)
  }

  const counting = data?.guests?.filter(g => !g.skip) || []
  const skipped = data?.guests?.filter(g => g.skip) || []
  const countingTickets = counting.reduce((s, g) => s + g.tickets, 0)
  const skippedTickets = skipped.reduce((s, g) => s + g.tickets, 0)
  const remaining = data ? data.capacity - countingTickets : 0
  const checkedInTickets = counting.reduce((s, g) => s + (g.checkedIn || 0), 0)
  const notArrived = Math.max(0, countingTickets - checkedInTickets)

  // Display guests sorted by last name (last word of the name). Guests with no
  // name sort to the bottom.
  const sortedGuests = data?.guests
    ? [...data.guests].sort((a, b) => {
        const la = lastName(a.name)
        const lb = lastName(b.name)
        if (!la && !lb) return 0
        if (!la) return 1
        if (!lb) return -1
        return la.localeCompare(lb) || (a.name || '').localeCompare(b.name || '')
      })
    : []

  const handleExportCsv = () => {
    const rows = [['Name', 'Email', 'Tickets']]
    for (const g of data.guests) {
      rows.push([g.name || '', g.email || '', g.tickets])
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
      <div className="flex items-start justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold">Guest List</h1>
          {shows.length > 0 && (
            <select
              value={selectedShow || ''}
              onChange={e => setSelectedShow(e.target.value)}
              className="mt-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-comedy-purple"
            >
              {shows.map(s => (
                <option key={s.showDate} value={s.showDate}>
                  {s.showDate}
                  {s.showDate === currentShowDate ? ' (current)' : ''}
                  {` — ${s.tickets} ticket${s.tickets === 1 ? '' : 's'}`}
                </option>
              ))}
            </select>
          )}
        </div>
        <button
          onClick={onLogout}
          className="text-sm text-gray-500 hover:text-gray-700 shrink-0"
        >
          Log out
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && !data && <p className="text-gray-500">Loading...</p>}

      {data && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            <SummaryCard
              label="Checked In"
              value={checkedInTickets}
              sub={`/ ${countingTickets} expected`}
              accent
            />
            <SummaryCard
              label="Not Arrived"
              value={notArrived}
              sub="still expected"
            />
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
              label="Returning"
              value={data.returningParties || 0}
              sub="been before"
            />
            <SummaryCard
              label="Skipped"
              value={skippedTickets}
              sub={`${skipped.length} entries`}
            />
          </div>

          {/* Financials */}
          <FinancialsPanel guests={data.guests} />

          {/* Add guest */}
          <div className="mb-6">
            {showAddForm ? (
              <AddGuestForm
                showDate={data.showDate}
                onDone={() => { setShowAddForm(false); fetchGuests(selectedShow) }}
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
                <ReservedLinkButton />
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
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Check In</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Source</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Count</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {data.guests.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      No guests yet
                    </td>
                  </tr>
                )}
                {sortedGuests.map((guest) => (
                  <tr
                    key={guest.id}
                    className={`border-b border-gray-100 last:border-0 ${guest.skip ? 'opacity-50' : ''} ${(guest.checkedIn || 0) >= guest.tickets && !guest.skip ? 'bg-green-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2">
                        {guest.name || <span className="text-gray-400">No name</span>}
                        {guest.priorVisits > 0 && (
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-comedy-purple"
                            title={`Been to ${guest.priorVisits} previous show${guest.priorVisits > 1 ? 's' : ''}`}
                          >
                            {guest.priorVisits > 1 ? `${guest.priorVisits}× before` : 'returning'}
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{guest.email}</td>
                    <td className="px-4 py-3 text-center">{guest.tickets}</td>
                    <td className="px-4 py-3 text-center">
                      <CheckInCell guest={guest} onSet={handleSetCheckedIn} />
                    </td>
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

function ReservedLinkButton() {
  const [copied, setCopied] = useState(false)
  const [max, setMax] = useState(2)
  const path = '/reserved-r7k9fq2m'
  const handleCopy = async () => {
    const n = Math.max(1, parseInt(max, 10) || 1)
    const url = `${window.location.origin}${path}?max=${n}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      window.prompt('Copy this link:', url)
    }
  }
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-500 flex items-center gap-1">
        Max
        <input
          type="number"
          min="1"
          value={max}
          onChange={e => setMax(e.target.value)}
          className="w-14 text-sm border border-gray-300 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-comedy-purple"
        />
      </label>
      <button
        onClick={handleCopy}
        className="text-sm bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        title="Secret link that bypasses the ticket cap. Only share with waitlist folks."
      >
        {copied ? 'Copied!' : 'Copy reserved link'}
      </button>
    </div>
  )
}

function lastName(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  return parts.length ? parts[parts.length - 1].toLowerCase() : ''
}

function CheckInCell({ guest, onSet }) {
  const checkedIn = guest.checkedIn || 0
  const full = checkedIn >= guest.tickets
  const partial = checkedIn > 0 && !full
  const pillStyle = full
    ? 'bg-green-100 text-green-700 hover:bg-green-200'
    : partial
      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
  const stepBtn = 'w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent leading-none'
  return (
    <div className="inline-flex items-center gap-1">
      {guest.tickets > 1 && (
        <button
          onClick={() => onSet(guest, checkedIn - 1)}
          disabled={checkedIn <= 0}
          className={stepBtn}
          title="Check in one fewer"
        >
          &minus;
        </button>
      )}
      <button
        onClick={() => onSet(guest, full ? 0 : guest.tickets)}
        className={`text-xs font-medium px-2 py-0.5 rounded-full transition-colors min-w-[3rem] ${pillStyle}`}
        title={full ? 'Checked in. Click to undo' : 'Click to check in the whole party'}
      >
        {checkedIn}/{guest.tickets}
      </button>
      {guest.tickets > 1 && (
        <button
          onClick={() => onSet(guest, checkedIn + 1)}
          disabled={full}
          className={stepBtn}
          title="Check in one more"
        >
          +
        </button>
      )}
    </div>
  )
}

const money = (cents) => `$${(cents / 100).toFixed(2)}`

// Live revenue/profit calculator. Reacts to the guest list (add/skip/delete a
// guest and the numbers update) plus a few editable knobs: whether to count
// tickets sold vs. only those checked in, the flat door price, and the NJ tax
// rate that is baked into each ticket. Stripe entries always use their real
// charged amount and Stripe fee; door entries use the flat price; comps are free.
function FinancialsPanel({ guests }) {
  const [open, setOpen] = useState(true)
  const [basis, setBasis] = useState('sold') // 'sold' | 'checkedin'
  const [price, setPrice] = useState('20')
  const [taxRate, setTaxRate] = useState('6.625')

  const fin = useMemo(() => {
    const priceCents = Math.round((parseFloat(price) || 0) * 100)
    const rate = (parseFloat(taxRate) || 0) / 100
    let tickets = 0, grossCents = 0, feeCents = 0
    let stripeGrossCents = 0, doorGrossCents = 0
    let stripeCount = 0, doorCount = 0, compCount = 0
    for (const g of guests) {
      if (g.skip) continue
      const count = basis === 'sold' ? g.tickets : (g.checkedIn || 0)
      if (count <= 0) continue
      const ratio = g.tickets > 0 ? count / g.tickets : 0
      if (g.source === 'stripe') {
        const net = Math.max(0, (g.amount || 0) - (g.refunded || 0))
        const gg = Math.round(net * ratio)
        const ff = Math.round((g.fee || 0) * ratio)
        grossCents += gg; feeCents += ff; stripeGrossCents += gg
        tickets += count; stripeCount += count
      } else if (g.source === 'comp') {
        compCount += count; tickets += count
      } else {
        const gg = priceCents * count
        grossCents += gg; doorGrossCents += gg
        tickets += count; doorCount += count
      }
    }
    const taxCents = rate > 0 ? Math.round(grossCents - grossCents / (1 + rate)) : 0
    const netCents = grossCents - feeCents - taxCents
    return {
      tickets, grossCents, feeCents, taxCents, netCents,
      stripeGrossCents, doorGrossCents, stripeCount, doorCount, compCount,
    }
  }, [guests, basis, price, taxRate])

  const basisBtn = (key, label) => (
    <button
      onClick={() => setBasis(key)}
      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
        basis === key
          ? 'bg-comedy-purple text-white'
          : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-6">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="font-semibold">Financials</span>
        <span className="flex items-center gap-3">
          <span className="text-comedy-purple font-bold">{money(fin.netCents)}</span>
          <span className="text-gray-400 text-sm">{open ? '▲' : '▼'}</span>
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {/* Controls */}
          <div className="flex flex-wrap items-end gap-4 py-4">
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Based on</p>
              <div className="flex gap-2">
                {basisBtn('sold', 'Tickets sold')}
                {basisBtn('checkedin', 'Checked in')}
              </div>
            </div>
            <label className="text-xs text-gray-500 font-medium">
              Door price ($)
              <input
                type="number" min="0" step="1" value={price}
                onChange={e => setPrice(e.target.value)}
                className="block w-24 mt-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm font-normal text-gray-900 focus:outline-none focus:ring-2 focus:ring-comedy-purple"
              />
            </label>
            <label className="text-xs text-gray-500 font-medium">
              NJ tax (%)
              <input
                type="number" min="0" step="0.001" value={taxRate}
                onChange={e => setTaxRate(e.target.value)}
                className="block w-24 mt-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm font-normal text-gray-900 focus:outline-none focus:ring-2 focus:ring-comedy-purple"
              />
            </label>
          </div>

          {/* Breakdown */}
          <dl className="text-sm divide-y divide-gray-100">
            <FinRow label={`Tickets (${basis === 'sold' ? 'sold' : 'checked in'})`} value={fin.tickets} />
            <FinRow
              label="Gross revenue"
              value={money(fin.grossCents)}
              sub={`Stripe ${money(fin.stripeGrossCents)} (${fin.stripeCount}) · door ${money(fin.doorGrossCents)} (${fin.doorCount}) · comp ${fin.compCount} free`}
            />
            <FinRow label="Stripe fees" value={`- ${money(fin.feeCents)}`} negative />
            <FinRow label={`NJ sales tax (set aside, ${taxRate || 0}%)`} value={`- ${money(fin.taxCents)}`} negative />
            <FinRow label="Net profit" value={money(fin.netCents)} bold />
          </dl>
          <p className="text-xs text-gray-400 mt-3">
            Net profit = gross revenue minus Stripe fees and NJ sales tax. It does not include venue, comics, or other costs. Skipped entries are excluded.
          </p>
        </div>
      )}
    </div>
  )
}

function FinRow({ label, value, sub, bold, negative }) {
  return (
    <div className="flex items-baseline justify-between py-2">
      <dt className="text-gray-600">
        {label}
        {sub && <span className="block text-xs text-gray-400">{sub}</span>}
      </dt>
      <dd className={`tabular-nums ${bold ? 'font-bold text-base text-comedy-purple' : negative ? 'text-gray-500' : 'font-medium'}`}>
        {value}
      </dd>
    </div>
  )
}

function SummaryCard({ label, value, sub, highlight, accent }) {
  const border = highlight ? 'border-red-300' : accent ? 'border-comedy-purple' : 'border-gray-200'
  const valueColor = highlight ? 'text-red-600' : accent ? 'text-comedy-purple' : ''
  return (
    <div className={`bg-white rounded-lg border p-4 text-center ${border}`}>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
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
