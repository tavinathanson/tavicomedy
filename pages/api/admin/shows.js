import Stripe from 'stripe'
import { requireAuth } from '@/lib/admin-auth'
import { siteConfig } from '@/config/site'
import { getSheets, getSpreadsheetId } from '@/lib/google-sheets'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const GUESTS_SHEET = 'admin-guests'

// Distinct show dates that have any Stripe sales, tallying tickets per show.
async function getStripeShowDates(tally) {
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
      const showDate = session.metadata?.showDate
      if (!showDate) continue
      const tickets = (session.line_items?.data || []).reduce(
        (sum, item) => sum + (item.quantity || 0), 0
      )
      const entry = (tally[showDate] ||= { showDate, tickets: 0, parties: 0 })
      entry.tickets += tickets
      entry.parties += 1
    }

    hasMore = sessions.has_more
    if (sessions.data.length > 0) {
      startingAfter = sessions.data[sessions.data.length - 1].id
    }
  }
}

// Distinct show dates that have any manual (door) guests in the sheet.
async function getManualShowDates(tally) {
  const sheets = getSheets()
  const spreadsheetId = getSpreadsheetId()
  if (!spreadsheetId) return

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${GUESTS_SHEET}!A:G`,
    })
    const rows = (response.data.values || []).slice(1)
    for (const row of rows) {
      const showDate = row[4]
      if (!showDate) continue
      const tickets = parseInt(row[2]) || 1
      const entry = (tally[showDate] ||= { showDate, tickets: 0, parties: 0 })
      entry.tickets += tickets
      entry.parties += 1
    }
  } catch (err) {
    if (err.code === 400 || err.message?.includes('Unable to parse range')) return
    throw err
  }
}

export default requireAuth(async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).end('Method Not Allowed')
  }

  try {
    const tally = {}
    await Promise.all([getStripeShowDates(tally), getManualShowDates(tally)])

    // Always offer the current configured show even if it has no data yet, so
    // the upcoming show can be managed before any tickets are sold.
    const current = siteConfig.nextShowDateISO
    if (current && !tally[current]) {
      tally[current] = { showDate: current, tickets: 0, parties: 0 }
    }

    const shows = Object.values(tally).sort((a, b) =>
      b.showDate.localeCompare(a.showDate)
    )

    return res.status(200).json({
      shows,
      currentShowDate: current,
    })
  } catch (err) {
    console.error('Error fetching shows:', err)
    return res.status(500).json({ error: 'Failed to fetch shows' })
  }
})
