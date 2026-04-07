import Stripe from 'stripe'
import { siteConfig } from '@/config/site'
import { getSheets, getSpreadsheetId } from '@/lib/google-sheets'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const GUESTS_SHEET = 'admin-guests'
const SKIPS_SHEET = 'admin-skips'

// Get all completed Stripe sessions for a show date, with ticket counts
export async function getStripeTickets(showDate) {
  const sessions = []
  let hasMore = true
  let startingAfter = undefined

  while (hasMore) {
    const page = await stripe.checkout.sessions.list({
      status: 'complete',
      limit: 100,
      ...(startingAfter && { starting_after: startingAfter }),
      expand: ['data.line_items'],
    })

    for (const session of page.data) {
      if (session.metadata?.showDate !== showDate) continue
      const ticketCount = (session.line_items?.data || []).reduce(
        (sum, item) => sum + (item.quantity || 0), 0
      )
      sessions.push({ id: session.id, tickets: ticketCount })
    }

    hasMore = page.has_more
    if (page.data.length > 0) {
      startingAfter = page.data[page.data.length - 1].id
    }
  }

  return sessions
}

// Get skipped Stripe session IDs from Google Sheets
export async function getSkippedSessionIds(showDate) {
  try {
    const sheets = getSheets()
    const spreadsheetId = getSpreadsheetId()
    if (!spreadsheetId) return new Set()

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SKIPS_SHEET}!A:B`,
    })

    const rows = response.data.values || []
    const ids = new Set()
    for (const row of rows.slice(1)) {
      if (row[1] === showDate) ids.add(row[0])
    }
    return ids
  } catch (err) {
    if (err.code === 400 || err.message?.includes('Unable to parse range')) {
      return new Set()
    }
    throw err
  }
}

// Get manual guest ticket counts (non-skipped only)
async function getManualTicketCount(showDate) {
  try {
    const sheets = getSheets()
    const spreadsheetId = getSpreadsheetId()
    if (!spreadsheetId) return 0

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${GUESTS_SHEET}!A:G`,
    })

    const rows = response.data.values || []
    let total = 0
    for (const row of rows.slice(1)) {
      if (row[4] !== showDate) continue
      if (row[6] === 'true') continue // column G = skipped
      total += parseInt(row[2]) || 1
    }
    return total
  } catch (err) {
    if (err.code === 400 || err.message?.includes('Unable to parse range')) {
      return 0
    }
    throw err
  }
}

// Get effective tickets sold (for capacity/sold-out check)
// This is what the public checkout uses
export async function getEffectiveTicketsSold(showDate) {
  const [stripeSessions, skippedIds, manualCount] = await Promise.all([
    getStripeTickets(showDate),
    getSkippedSessionIds(showDate),
    getManualTicketCount(showDate),
  ])

  const stripeCount = stripeSessions
    .filter(s => !skippedIds.has(s.id))
    .reduce((sum, s) => sum + s.tickets, 0)

  return stripeCount + manualCount
}

export async function getRemaining(showDate) {
  const sold = await getEffectiveTicketsSold(showDate || siteConfig.nextShowDateISO)
  return siteConfig.tickets.capacity - sold
}
