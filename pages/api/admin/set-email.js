import { requireAuth } from '@/lib/admin-auth'
import { getSheets, getSpreadsheetId } from '@/lib/google-sheets'

const SHEET_NAME = 'admin-guests'

// Set (or clear) the email on a manual guest, matched by name + showDate.
export default requireAuth(async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  const { name, showDate } = req.body || {}
  const email = (req.body?.email || '').trim()
  if (!name || !showDate) {
    return res.status(400).json({ error: 'Name and showDate are required' })
  }
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'That does not look like an email' })
  }

  const spreadsheetId = getSpreadsheetId()
  if (!spreadsheetId) {
    return res.status(500).json({ error: 'Google Sheets not configured' })
  }

  try {
    const sheets = getSheets()
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!A:E`,
    })
    const rows = response.data.values || []
    const rowIndex = rows.findIndex(
      (row, i) => i > 0 && row[0] === name && row[4] === showDate
    )
    if (rowIndex === -1) {
      return res.status(404).json({ error: 'Guest not found' })
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEET_NAME}!B${rowIndex + 1}`,
      valueInputOption: 'RAW',
      resource: { values: [[email]] },
    })

    return res.status(200).json({ success: true, email })
  } catch (err) {
    console.error('Error setting email:', err)
    return res.status(500).json({ error: 'Failed to save email' })
  }
})
