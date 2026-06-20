import { requireAuth } from '@/lib/admin-auth'
import { getSheets, getSpreadsheetId, ensureSheetTab } from '@/lib/google-sheets'

const CHECKINS_SHEET = 'admin-checkins'

export default requireAuth(async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  const { id, source, showDate, name, checkedIn } = req.body || {}
  if (!showDate || typeof checkedIn !== 'number' || checkedIn < 0) {
    return res.status(400).json({ error: 'showDate and checkedIn (non-negative number) are required' })
  }

  // Key matches the convention in guests.js: Stripe session id for stripe
  // guests, guest name for manual guests.
  const key = source === 'stripe' ? id : name
  if (!key) {
    return res.status(400).json({ error: 'id (stripe) or name (manual) is required' })
  }

  const sheets = getSheets()
  const spreadsheetId = getSpreadsheetId()
  if (!spreadsheetId) {
    return res.status(500).json({ error: 'Google Sheets not configured' })
  }

  try {
    await ensureSheetTab(sheets, spreadsheetId, CHECKINS_SHEET, ['Key', 'ShowDate', 'CheckedIn'])

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${CHECKINS_SHEET}!A:C`,
    })
    const rows = response.data.values || []
    const rowIndex = rows.findIndex(
      (row, i) => i > 0 && row[0] === key && row[1] === showDate
    )

    if (checkedIn === 0) {
      // Remove the row entirely when nobody is checked in
      if (rowIndex > -1) {
        const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId })
        const sheet = spreadsheet.data.sheets.find(
          s => s.properties.title === CHECKINS_SHEET
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
    } else if (rowIndex > -1) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${CHECKINS_SHEET}!C${rowIndex + 1}`,
        valueInputOption: 'RAW',
        resource: { values: [[checkedIn]] }
      })
    } else {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${CHECKINS_SHEET}!A:C`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: { values: [[key, showDate, checkedIn]] }
      })
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Error updating check-in:', err)
    return res.status(500).json({ error: 'Failed to update check-in' })
  }
})
