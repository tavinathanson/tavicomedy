import Stripe from 'stripe'
import { requireAuth } from '@/lib/admin-auth'
import { siteConfig } from '@/config/site'
import { getSheets, getSpreadsheetId } from '@/lib/google-sheets'
import { getSkippedSessionIds, getCheckedInCounts } from '@/lib/capacity'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
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

// Returns the current show's Stripe guests plus a cross-show visit history built
// from every completed session (we already page through all of them here).
async function getStripeGuests(showDate, skippedIds, history) {
  const guests = []
  let hasMore = true
  let startingAfter = undefined

  while (hasMore) {
    const sessions = await stripe.checkout.sessions.list({
      status: 'complete',
      limit: 100,
      ...(startingAfter && { starting_after: startingAfter }),
      expand: ['data.line_items'],
    })

    for (const session of sessions.data) {
      const sessionShowDate = session.metadata?.showDate
      const name = session.customer_details?.name || ''
      const email = session.customer_details?.email || ''
      addVisit(history, email, name, sessionShowDate)

      if (sessionShowDate !== showDate) continue
      const ticketCount = (session.line_items?.data || []).reduce(
        (sum, item) => sum + (item.quantity || 0), 0
      )
      guests.push({
        id: session.id,
        name,
        email,
        tickets: ticketCount,
        source: 'stripe',
        skip: skippedIds.has(session.id),
        date: new Date(session.created * 1000).toISOString(),
      })
    }

    hasMore = sessions.has_more
    if (sessions.data.length > 0) {
      startingAfter = sessions.data[sessions.data.length - 1].id
    }
  }

  return guests
}

// Returns the current show's manual guests plus folds every manual row (all
// shows) into the shared visit history.
async function getManualGuests(showDate, history) {
  const sheets = getSheets()
  const spreadsheetId = getSpreadsheetId()
  if (!spreadsheetId) return []

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${GUESTS_SHEET}!A:G`,
    })

    const rows = response.data.values || []
    const dataRows = rows.slice(1)
    for (const row of dataRows) {
      addVisit(history, row[1], row[0], row[4])
    }
    return dataRows
      .filter(row => row[4] === showDate)
      .map((row, i) => ({
        id: `manual-${i}-${row[0]}`,
        name: row[0] || '',
        email: row[1] || '',
        tickets: parseInt(row[2]) || 1,
        source: row[3] || 'other',
        skip: row[6] === 'true',
        date: row[5] || '',
        showDate: row[4] || '',
      }))
  } catch (err) {
    if (err.code === 400 || err.message?.includes('Unable to parse range')) {
      return []
    }
    throw err
  }
}

export default requireAuth(async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).end('Method Not Allowed')
  }

  const showDate = req.query.showDate || siteConfig.nextShowDateISO

  try {
    const [skippedIds, checkedInCounts] = await Promise.all([
      getSkippedSessionIds(showDate),
      getCheckedInCounts(showDate),
    ])
    const history = { byEmail: {}, byName: {} }
    const [stripeGuests, manualGuests] = await Promise.all([
      getStripeGuests(showDate, skippedIds, history),
      getManualGuests(showDate, history),
    ])

    const allGuests = [...stripeGuests, ...manualGuests].map(g => {
      const key = g.source === 'stripe' ? g.id : g.name
      const checkedIn = Math.min(checkedInCounts.get(key) || 0, g.tickets)
      const priorVisits = priorVisitCount(history, g, showDate)
      return { ...g, checkedIn, priorVisits, returning: priorVisits > 0 }
    })
    const totalTickets = allGuests.reduce((sum, g) => sum + g.tickets, 0)
    const countingTickets = allGuests
      .filter(g => !g.skip)
      .reduce((sum, g) => sum + g.tickets, 0)
    const checkedInTickets = allGuests.reduce((sum, g) => sum + g.checkedIn, 0)
    const returningParties = allGuests.filter(g => g.returning).length

    return res.status(200).json({
      showDate,
      capacity: siteConfig.tickets.capacity,
      totalTickets,
      countingTickets,
      checkedInTickets,
      returningParties,
      guests: allGuests,
    })
  } catch (err) {
    console.error('Error fetching guests:', err)
    return res.status(500).json({ error: 'Failed to fetch guest list' })
  }
})
