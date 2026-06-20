import { requireAuth } from '@/lib/admin-auth'
import { getSheets, getSpreadsheetId, ensureSheetTab } from '@/lib/google-sheets'

const CHECKINS_SHEET = 'admin-checkins'

async function deleteRows(sheets, spreadsheetId, rowIndices) {
  if (!rowIndices.length) return
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId })
  const sheet = spreadsheet.data.sheets.find(s => s.properties.title === CHECKINS_SHEET)
  // Delete from the bottom up so earlier indices stay valid
  const requests = [...rowIndices]
    .sort((a, b) => b - a)
    .map(i => ({
      deleteDimension: {
        range: { sheetId: sheet.properties.sheetId, dimension: 'ROWS', startIndex: i, endIndex: i + 1 },
      },
    }))
  await sheets.spreadsheets.batchUpdate({ spreadsheetId, resource: { requests } })
}

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
    // Collect every row matching this guest. There should only be one, but a
    // race could have created duplicates; collapse them so reads are stable.
    const matches = []
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === key && rows[i][1] === showDate) matches.push(i)
    }

    if (checkedIn === 0) {
      // Nobody checked in: remove all rows for this guest
      await deleteRows(sheets, spreadsheetId, matches)
    } else if (matches.length === 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${CHECKINS_SHEET}!A:C`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: { values: [[key, showDate, checkedIn]] },
      })
    } else {
      // Update the first match to the new value, drop any duplicate rows
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${CHECKINS_SHEET}!C${matches[0] + 1}`,
        valueInputOption: 'RAW',
        resource: { values: [[checkedIn]] },
      })
      if (matches.length > 1) {
        await deleteRows(sheets, spreadsheetId, matches.slice(1))
      }
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Error updating check-in:', err)
    return res.status(500).json({ error: 'Failed to update check-in' })
  }
})
