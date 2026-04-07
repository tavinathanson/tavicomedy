import { google } from 'googleapis'
import { requireAuth } from '@/lib/admin-auth'

const SHEET_NAME = 'admin-guests'

export default requireAuth(async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  const { name, showDate } = req.body || {}
  if (!name || !showDate) {
    return res.status(400).json({ error: 'Name and showDate are required' })
  }

  const spreadsheetId = process.env.GOOGLE_SHEET_ID
  if (!spreadsheetId) {
    return res.status(500).json({ error: 'Google Sheets not configured' })
  }

  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
    const sheets = google.sheets({ version: 'v4', auth })

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!A:F`,
    })

    const rows = response.data.values || []
    // Find the row (skip header), match on name + showDate
    const rowIndex = rows.findIndex(
      (row, i) => i > 0 && row[0] === name && row[4] === showDate
    )

    if (rowIndex === -1) {
      return res.status(404).json({ error: 'Guest not found' })
    }

    // Get sheet ID for the tab
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId })
    const sheet = spreadsheet.data.sheets.find(
      s => s.properties.title === SHEET_NAME
    )

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: sheet.properties.sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            }
          }
        }]
      }
    })

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Error deleting guest:', err)
    return res.status(500).json({ error: 'Failed to delete guest' })
  }
})
