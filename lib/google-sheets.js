import { google } from 'googleapis'

export function getSheets() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  return google.sheets({ version: 'v4', auth })
}

export function getSpreadsheetId() {
  return process.env.GOOGLE_SHEET_ID
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
