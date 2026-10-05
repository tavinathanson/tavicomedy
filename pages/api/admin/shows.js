import { requireAuth } from '@/lib/admin-auth'
import { siteConfig } from '@/config/site'
import { readTab } from '@/lib/google-sheets'
import { getSessionHistory } from '@/lib/stripe-sessions'

const GUESTS_SHEET = 'admin-guests'

export default requireAuth(async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).end('Method Not Allowed')
  }

  try {
    const [sessions, manualRows] = await Promise.all([
      getSessionHistory(),
      readTab(`${GUESTS_SHEET}!A:G`),
    ])

    // Tally tickets and parties per show date across Stripe and manual guests
    const tally = {}
    const add = (showDate, tickets) => {
      if (!showDate) return
      const entry = (tally[showDate] ||= { showDate, tickets: 0, parties: 0 })
      entry.tickets += tickets
      entry.parties += 1
    }
    for (const s of sessions) add(s.showDate, s.tickets)
    for (const row of manualRows) add(row[4], parseInt(row[2]) || 1)

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
