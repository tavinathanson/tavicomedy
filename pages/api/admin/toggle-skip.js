import { requireAuth } from '@/lib/admin-auth'
import { getSheets, getSpreadsheetId, ensureSheetTab } from '@/lib/google-sheets'

const SKIPS_SHEET = 'admin-skips'
const GUESTS_SHEET = 'admin-guests'

export default requireAuth(async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  const { id, source, showDate, skip } = req.body || {}
  if (!id || !showDate || typeof skip !== 'boolean') {
    return res.status(400).json({ error: 'id, showDate, and skip (boolean) are required' })
  }

  const sheets = getSheets()
  const spreadsheetId = getSpreadsheetId()
  if (!spreadsheetId) {
    return res.status(500).json({ error: 'Google Sheets not configured' })
  }

  try {
    if (source === 'stripe') {
      // Stripe skips: add/remove session ID from admin-skips sheet
      await ensureSheetTab(sheets, spreadsheetId, SKIPS_SHEET, ['SessionId', 'ShowDate'])

      if (skip) {
        // Add to skips
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: `${SKIPS_SHEET}!A:B`,
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          resource: { values: [[id, showDate]] }
        })
      } else {
        // Remove from skips
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `${SKIPS_SHEET}!A:B`,
        })
        const rows = response.data.values || []
        const rowIndex = rows.findIndex(
          (row, i) => i > 0 && row[0] === id && row[1] === showDate
        )
        if (rowIndex > -1) {
          const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId })
          const sheet = spreadsheet.data.sheets.find(
            s => s.properties.title === SKIPS_SHEET
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
        }
      }
    } else {
      // Manual guests: update column G (skip) in admin-guests sheet
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${GUESTS_SHEET}!A:G`,
      })
      const rows = response.data.values || []
      // Match on name (column A) + showDate (column E) -- id is "manual-{i}-{name}"
      const name = id.replace(/^manual-\d+-/, '')
      const rowIndex = rows.findIndex(
        (row, i) => i > 0 && row[0] === name && row[4] === showDate
      )
      if (rowIndex === -1) {
        return res.status(404).json({ error: 'Guest not found' })
      }
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${GUESTS_SHEET}!G${rowIndex + 1}`,
        valueInputOption: 'RAW',
        resource: { values: [[skip ? 'true' : '']] }
      })
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Error toggling skip:', err)
    return res.status(500).json({ error: 'Failed to update skip status' })
  }
})
