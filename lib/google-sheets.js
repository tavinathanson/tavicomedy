import { google } from 'googleapis'

// One client per server instance so its auth token is reused across requests
// instead of minted fresh on every call.
let sheetsClient

export function getSheets() {
  if (!sheetsClient) {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
    sheetsClient = google.sheets({ version: 'v4', auth })
  }
  return sheetsClient
}

export function getSpreadsheetId() {
  return process.env.GOOGLE_SHEET_ID
}

// Data rows (header excluded) for a range, or [] when the sheet isn't
// configured or the tab doesn't exist yet.
export async function readTab(range) {
  const spreadsheetId = getSpreadsheetId()
  if (!spreadsheetId) return []
  try {
    const response = await getSheets().spreadsheets.values.get({ spreadsheetId, range })
    return (response.data.values || []).slice(1)
  } catch (err) {
    if (err.code === 400 || err.message?.includes('Unable to parse range')) return []
    throw err
  }
}

export async function ensureSheetTab(sheets, spreadsheetId, tabName, headers) {
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId })
  const exists = spreadsheet.data.sheets.some(
    s => s.properties.title === tabName
  )
  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [{ addSheet: { properties: { title: tabName } } }]
      }
    })
    if (headers) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${tabName}!A1:${String.fromCharCode(64 + headers.length)}1`,
        valueInputOption: 'RAW',
        resource: { values: [headers] }
      })
    }
  }
}
