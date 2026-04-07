import { requireAuth } from '@/lib/admin-auth'
import { siteConfig } from '@/config/site'
import { getSheets, getSpreadsheetId, ensureSheetTab } from '@/lib/google-sheets'

const SHEET_NAME = 'admin-guests'

export default requireAuth(async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  const { name, email, tickets, source } = req.body || {}
  const showDate = req.body.showDate || siteConfig.nextShowDateISO

  if (!name) {
    return res.status(400).json({ error: 'Name is required' })
  }

  const validSources = ['venmo', 'comp', 'cash', 'other']
  if (!source || !validSources.includes(source)) {
    return res.status(400).json({ error: `Source must be one of: ${validSources.join(', ')}` })
  }

  const spreadsheetId = getSpreadsheetId()
  if (!spreadsheetId) {
    return res.status(500).json({ error: 'Google Sheets not configured' })
  }

  try {
    const sheets = getSheets()
    await ensureSheetTab(sheets, spreadsheetId, SHEET_NAME,
      ['Name', 'Email', 'Tickets', 'Source', 'ShowDate', 'AddedAt', 'Skip']
    )

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEET_NAME}!A:G`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [[
          name,
          email || '',
          Math.max(1, parseInt(tickets) || 1),
          source,
          showDate,
          new Date().toISOString(),
          '', // skip = false by default
        ]]
      }
    })

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Error adding guest:', err)
    return res.status(500).json({ error: 'Failed to add guest' })
  }
})
