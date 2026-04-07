import { google } from 'googleapis'
import { requireAuth } from '@/lib/admin-auth'
import { siteConfig } from '@/config/site'

const SHEET_NAME = 'admin-guests'

async function getSheets() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  return google.sheets({ version: 'v4', auth })
}

async function ensureSheetExists(sheets, spreadsheetId) {
  try {
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId })
    const exists = spreadsheet.data.sheets.some(
      s => s.properties.title === SHEET_NAME
    )
    if (!exists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            addSheet: { properties: { title: SHEET_NAME } }
          }]
        }
      })
      // Add header row
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${SHEET_NAME}!A1:F1`,
        valueInputOption: 'RAW',
        resource: {
          values: [['Name', 'Email', 'Tickets', 'Source', 'ShowDate', 'AddedAt']]
        }
      })
    }
  } catch (err) {
    console.error('Error ensuring sheet exists:', err)
    throw err
  }
}

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

  const spreadsheetId = process.env.GOOGLE_SHEET_ID
  if (!spreadsheetId) {
    return res.status(500).json({ error: 'Google Sheets not configured' })
  }

  try {
    const sheets = await getSheets()
    await ensureSheetExists(sheets, spreadsheetId)

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEET_NAME}!A:F`,
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
        ]]
      }
    })

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Error adding guest:', err)
    return res.status(500).json({ error: 'Failed to add guest' })
  }
})
