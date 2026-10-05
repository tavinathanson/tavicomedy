import { siteConfig } from '@/config/site'
import { readTab } from '@/lib/google-sheets'
import { getShowSessions, sessionTickets } from '@/lib/stripe-sessions'

const GUESTS_SHEET = 'admin-guests'
const SKIPS_SHEET = 'admin-skips'
const CHECKINS_SHEET = 'admin-checkins'

// Manual guest rows (admin-guests, columns A:G) for a show
export async function getManualGuestRows(showDate) {
  const rows = await readTab(`${GUESTS_SHEET}!A:G`)
  return rows.filter(row => row[4] === showDate)
}

// Get skipped Stripe session IDs from Google Sheets
export async function getSkippedSessionIds(showDate) {
  const rows = await readTab(`${SKIPS_SHEET}!A:B`)
  return new Set(rows.filter(row => row[1] === showDate).map(row => row[0]))
}

// Get checked-in counts from Google Sheets, keyed by Stripe session id
// (for stripe guests) or guest name (for manual guests). Value is the number
// of people in that party who have been checked in (supports partial check-in).
export async function getCheckedInCounts(showDate) {
  const rows = await readTab(`${CHECKINS_SHEET}!A:C`)
  return new Map(
    rows.filter(row => row[1] === showDate).map(row => [row[0], parseInt(row[2]) || 0])
  )
}

// Get effective tickets sold (for capacity/sold-out check)
// This is what the public checkout uses
export async function getEffectiveTicketsSold(showDate) {
  const [stripeSessions, skippedIds, manualRows] = await Promise.all([
    getShowSessions(showDate),
    getSkippedSessionIds(showDate),
    getManualGuestRows(showDate),
  ])

  const stripeCount = stripeSessions
    .filter(s => !skippedIds.has(s.id))
    .reduce((sum, s) => sum + sessionTickets(s), 0)
  const manualCount = manualRows
    .filter(row => row[6] !== 'true') // column G = skipped
    .reduce((sum, row) => sum + (parseInt(row[2]) || 1), 0)

  return stripeCount + manualCount
}

export async function getRemaining(showDate) {
  const sold = await getEffectiveTicketsSold(showDate || siteConfig.nextShowDateISO)
  return siteConfig.tickets.capacity - sold
}
