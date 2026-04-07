import Stripe from 'stripe'
import { google } from 'googleapis'
import { requireAuth } from '@/lib/admin-auth'
import { siteConfig } from '@/config/site'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const SHEET_NAME = 'admin-guests'

async function getStripeGuests(showDate) {
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
  const credentialsString = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  const spreadsheetId = process.env.GOOGLE_SHEET_ID
  if (!credentialsString || !spreadsheetId) return []

  let credentials
  try {
    credentials = JSON.parse(credentialsString)
  } catch {
    return []
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  const sheets = google.sheets({ version: 'v4', auth })

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!A:F`,
    })

    const rows = response.data.values || []
    // Skip header row
    return rows.slice(1)
      .filter(row => row[4] === showDate) // column E = showDate
      .map((row, i) => ({
        id: `manual-${i}-${row[0]}`,
        name: row[0] || '',
        email: row[1] || '',
        tickets: parseInt(row[2]) || 1,
        source: row[3] || 'other',
        date: row[5] || '',
        showDate: row[4] || '',
      }))
  } catch (err) {
    // Sheet tab might not exist yet
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
    const [stripeGuests, manualGuests] = await Promise.all([
      getStripeGuests(showDate),
      getManualGuests(showDate),
    ])

    const allGuests = [...stripeGuests, ...manualGuests]
    const totalTickets = allGuests.reduce((sum, g) => sum + g.tickets, 0)

    return res.status(200).json({
      showDate,
      capacity: siteConfig.tickets.capacity,
      totalTickets,
      guests: allGuests,
    })
  } catch (err) {
    console.error('Error fetching guests:', err)
    return res.status(500).json({ error: 'Failed to fetch guest list' })
  }
})
