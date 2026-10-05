import { requireAuth } from '@/lib/admin-auth'
import { siteConfig } from '@/config/site'
import { readTab } from '@/lib/google-sheets'
import { getSkippedSessionIds, getCheckedInCounts } from '@/lib/capacity'
import { getShowSessions, getSessionHistory, sessionTickets } from '@/lib/stripe-sessions'
import { personKeys } from '@/lib/attendance.mjs'
import attendance from '@/data/attendance.json'

const GUESTS_SHEET = 'admin-guests'

// Record that a person (by hashed email/name keys) appeared on a show's list.
function addVisit(history, keys, showDate) {
  if (!showDate) return
  for (const k of keys) (history[k] ||= new Set()).add(showDate)
}

// Number of *prior* shows (excluding the current one) this guest appeared on,
// unioning matches across keys so the same show isn't counted twice.
function priorVisitCount(history, guest, showDate) {
  const shows = new Set()
  for (const k of personKeys(guest.email, guest.name)) for (const d of history[k] || []) shows.add(d)
  shows.delete(showDate)
  return shows.size
}

// Exact amounts and fees come from the underlying charge (all in cents). The
// balance transaction holds Stripe's real fee; amount_refunded lets us net out
// refunds so revenue reflects what was actually kept.
const toStripeGuest = (session, skippedIds) => {
  const charge = session.payment_intent?.latest_charge
  return {
    id: session.id,
    name: session.customer_details?.name || '',
    email: session.customer_details?.email || '',
    tickets: sessionTickets(session),
    source: 'stripe',
    skip: skippedIds.has(session.id),
    date: new Date(session.created * 1000).toISOString(),
    amount: session.amount_total || 0,
    fee: charge?.balance_transaction?.fee || 0,
    refunded: charge?.amount_refunded || 0,
  }
}

const toManualGuest = (row, i) => ({
  id: `manual-${i}-${row[0]}`,
  name: row[0] || '',
  email: row[1] || '',
  tickets: parseInt(row[2]) || 1,
  source: row[3] || 'other',
  skip: row[6] === 'true',
  date: row[5] || '',
  showDate: row[4] || '',
})

export default requireAuth(async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).end('Method Not Allowed')
  }

  const showDate = req.query.showDate || siteConfig.nextShowDateISO

  try {
    const [skippedIds, checkedInCounts, manualRows, showSessions, pastSessions] = await Promise.all([
      getSkippedSessionIds(showDate),
      getCheckedInCounts(showDate),
      readTab(`${GUESTS_SHEET}!A:G`),
      getShowSessions(showDate, ['data.payment_intent.latest_charge.balance_transaction']),
      getSessionHistory(),
    ])

    // Past shows from comedylist (incl. pre-Stripe Eventbrite), Stripe, and manual entries.
    const history = {}
    for (const [key, dates] of Object.entries(attendance)) for (const d of dates) addVisit(history, [key], d)
    for (const s of pastSessions) addVisit(history, personKeys(s.email, s.name), s.showDate)
    for (const row of manualRows) addVisit(history, personKeys(row[1], row[0]), row[4])

    const manualGuests = manualRows.filter(row => row[4] === showDate).map(toManualGuest)
    const stripeGuests = showSessions.map(s => toStripeGuest(s, skippedIds))
    const guests = [...stripeGuests, ...manualGuests].map(g => {
      const key = g.source === 'stripe' ? g.id : g.name
      const checkedIn = Math.min(checkedInCounts.get(key) || 0, g.tickets)
      const priorVisits = priorVisitCount(history, g, showDate)
      return { ...g, checkedIn, priorVisits }
    })

    return res.status(200).json({
      showDate,
      capacity: siteConfig.tickets.capacity,
      guests,
    })
  } catch (err) {
    console.error('Error fetching guests:', err)
    return res.status(500).json({ error: 'Failed to fetch guest list' })
  }
})
