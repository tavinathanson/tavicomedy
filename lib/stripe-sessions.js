import Stripe from 'stripe'
import { getSheets, getSpreadsheetId, ensureSheetTab, readTab } from '@/lib/google-sheets'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Only scan Stripe sessions created this many days before the show. Tickets
// never go on sale earlier than this, and it keeps us from paging all history.
const SALES_WINDOW_DAYS = 45

// Past sessions never change, so a slim copy of each one (enough for the show
// list and returning-guest history) is cached in this tab and only newer
// sessions are fetched from Stripe.
const CACHE_SHEET = 'admin-stripe-sessions'
const CACHE_HEADERS = ['SessionId', 'Created', 'ShowDate', 'Name', 'Email', 'Tickets']

// A checkout session can complete up to 24h after it was created, so each sync
// rescans that far behind the newest cached session to catch late completions.
const RESCAN_SECONDS = 24 * 3600

export const sessionTickets = (session) =>
  (session.line_items?.data || []).reduce((sum, item) => sum + (item.quantity || 0), 0)

function listCompletedSessions({ createdGte, expand = [] }) {
  return stripe.checkout.sessions
    .list({
      status: 'complete',
      limit: 100,
      ...(createdGte && { created: { gte: createdGte } }),
      expand: ['data.line_items', ...expand],
    })
    .autoPagingToArray({ limit: 100000 })
}

// Completed sessions for one show, scanning only its sales window.
export async function getShowSessions(showDate, expand) {
  const windowStart = Math.floor(new Date(showDate).getTime() / 1000) - SALES_WINDOW_DAYS * 86400
  const sessions = await listCompletedSessions({ createdGte: windowStart, expand })
  return sessions.filter(s => s.metadata?.showDate === showDate)
}

// Every completed session ever, as { id, created, showDate, name, email, tickets },
// served from the sheet cache plus whatever Stripe has that is newer.
export async function getSessionHistory() {
  const byId = new Map()
  for (const [id, created, showDate, name, email, tickets] of await readTab(`${CACHE_SHEET}!A:F`)) {
    byId.set(id, { id, created: parseInt(created) || 0, showDate: showDate || '', name: name || '', email: email || '', tickets: parseInt(tickets) || 0 })
  }

  const newest = Math.max(0, ...[...byId.values()].map(s => s.created))
  const fresh = await listCompletedSessions({ createdGte: newest && newest - RESCAN_SECONDS })
  const added = fresh
    .filter(s => !byId.has(s.id))
    .map(s => ({
      id: s.id,
      created: s.created,
      showDate: s.metadata?.showDate || '',
      name: s.customer_details?.name || '',
      email: s.customer_details?.email || '',
      tickets: sessionTickets(s),
    }))

  if (added.length) {
    const sheets = getSheets()
    const spreadsheetId = getSpreadsheetId()
    if (spreadsheetId) {
      await ensureSheetTab(sheets, spreadsheetId, CACHE_SHEET, CACHE_HEADERS)
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${CACHE_SHEET}!A:F`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: { values: added.map(s => [s.id, s.created, s.showDate, s.name, s.email, s.tickets]) },
      })
    }
    for (const s of added) byId.set(s.id, s)
  }

  return [...byId.values()]
}
