import { requireAuth } from '@/lib/admin-auth'
import { siteConfig } from '@/config/site'
import { readTab } from '@/lib/google-sheets'
import { getSkippedSessionIds, getCheckedInCounts } from '@/lib/capacity'
import { getShowSessions, getSessionHistory, sessionTickets } from '@/lib/stripe-sessions'

const GUESTS_SHEET = 'admin-guests'

const normEmail = (email) => (email || '').trim().toLowerCase()
const normName = (name) => (name || '').trim().toLowerCase().replace(/\s+/g, ' ')

// Record that the person identified by email/name appeared on a show's list.
// History is tracked by both keys so a guest who paid by Stripe one month and
// cash the next still matches.
function addVisit(history, email, name, showDate) {
  if (!showDate) return
  const e = normEmail(email)
  const n = normName(name)
  if (e) (history.byEmail[e] ||= new Set()).add(showDate)
  if (n) (history.byName[n] ||= new Set()).add(showDate)
}

// Number of *prior* shows (excluding the current one) this guest appeared on,
// unioning matches by email and by name so the same show isn't counted twice.
function priorVisitCount(history, guest, showDate) {
  const shows = new Set()
  const e = normEmail(guest.email)
  const n = normName(guest.name)
  if (e && history.byEmail[e]) for (const d of history.byEmail[e]) shows.add(d)
  if (n && history.byName[n]) for (const d of history.byName[n]) shows.add(d)
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

    const history = { byEmail: {}, byName: {} }
    for (const s of pastSessions) addVisit(history, s.email, s.name, s.showDate)
    for (const row of manualRows) addVisit(history, row[1], row[0], row[4])

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
