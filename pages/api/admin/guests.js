import Stripe from 'stripe'
import { requireAuth } from '@/lib/admin-auth'
import { siteConfig } from '@/config/site'
import { getSheets, getSpreadsheetId } from '@/lib/google-sheets'
import { getSkippedSessionIds } from '@/lib/capacity'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const GUESTS_SHEET = 'admin-guests'

async function getStripeGuests(showDate, skippedIds) {
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
      if (session.metadata?.showDate !== showDate) continue
      const ticketCount = (session.line_items?.data || []).reduce(
        (sum, item) => sum + (item.quantity || 0), 0
      )
      guests.push({
        id: session.id,
        name: session.customer_details?.name || '',
        email: session.customer_details?.email || '',
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

async function getManualGuests(showDate) {
  const sheets = getSheets()
  const spreadsheetId = getSpreadsheetId()
  if (!spreadsheetId) return []

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${GUESTS_SHEET}!A:G`,
    })

    const rows = response.data.values || []
    return rows.slice(1)
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
    const skippedIds = await getSkippedSessionIds(showDate)
    const [stripeGuests, manualGuests] = await Promise.all([
      getStripeGuests(showDate, skippedIds),
      getManualGuests(showDate),
    ])

    const allGuests = [...stripeGuests, ...manualGuests]
    const totalTickets = allGuests.reduce((sum, g) => sum + g.tickets, 0)
    const countingTickets = allGuests
      .filter(g => !g.skip)
      .reduce((sum, g) => sum + g.tickets, 0)

    return res.status(200).json({
      showDate,
      capacity: siteConfig.tickets.capacity,
      totalTickets,
      countingTickets,
      guests: allGuests,
    })
  } catch (err) {
    console.error('Error fetching guests:', err)
    return res.status(500).json({ error: 'Failed to fetch guest list' })
  }
})
