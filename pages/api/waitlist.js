import { google } from 'googleapis'
import { sendWaitlistConfirmation, sendCheckoutErrorAlert } from '../../lib/resend'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, showDate, tickets } = req.body

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid email address.' })
    }

    if (!showDate) {
      return res.status(400).json({ error: 'Show date is required.' })
    }

    const credentialsString = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
    const spreadsheetId = process.env.GOOGLE_SHEET_ID
    const sheetName = process.env.GOOGLE_WAITLIST_SHEET_NAME || 'show-waitlist'

    if (!credentialsString || !spreadsheetId) {
      console.error('Missing Google Sheets configuration')
      sendCheckoutErrorAlert('Waitlist: missing Google Sheets config', {
        email,
        showDate,
      }).catch(() => {})
      return res.status(500).json({ error: 'Something went wrong on our end. Please email tavi@tavicomedy.com to get on the waitlist.' })
    }

    let credentials
    try {
      credentials = JSON.parse(credentialsString)
    } catch (parseError) {
      console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY:', parseError.message)
      sendCheckoutErrorAlert(`Waitlist: failed to parse Google credentials: ${parseError.message}`, {
        email,
        showDate,
      }).catch(() => {})
      return res.status(500).json({ error: 'Something went wrong on our end. Please email tavi@tavicomedy.com to get on the waitlist.' })
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const sheets = google.sheets({ version: 'v4', auth })

    // Check for duplicate email + show date
    const readResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:B`,
    })

    const existingRows = readResponse.data.values || []
    const isDuplicate = existingRows.some(
      (row) =>
        row[0] &&
        row[0].toLowerCase() === email.toLowerCase() &&
        row[1] === showDate
    )

    if (isDuplicate) {
      return res.status(200).json({
        success: true,
        message: "You're already on the waitlist for this show!",
      })
    }

    const timestamp = new Date().toISOString()
    const ticketCount = Math.min(Math.max(parseInt(tickets, 10) || 1, 1), 10)
    const rowData = [email, showDate, ticketCount, timestamp, 'website']

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:E`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [rowData],
      },
    })

    // Send confirmation email (don't fail the request if this fails)
    const emailResult = await sendWaitlistConfirmation(email, showDate, ticketCount)
    if (!emailResult.success) {
      console.error('Failed to send waitlist confirmation email:', emailResult.error)
      sendCheckoutErrorAlert(`Waitlist confirmation email failed: ${emailResult.error}`, {
        customerEmail: email,
        showDate,
        tickets: ticketCount,
        note: 'Customer was added to the waitlist sheet successfully, but did not receive a confirmation email.',
      }).catch(() => {})
    }

    return res.status(200).json({
      success: true,
      message: "You're on the waitlist! We'll reach out if spots open up.",
    })
  } catch (error) {
    console.error('Waitlist error:', error)
    const { email, showDate, tickets } = req.body || {}
    sendCheckoutErrorAlert(`Waitlist failed: ${error.message}`, {
      customerEmail: email || 'unknown',
      showDate: showDate || 'unknown',
      tickets: tickets || 'unknown',
    }).catch(() => {})
    return res.status(500).json({
      error: 'Something went wrong joining the waitlist. Please try again, or email tavi@tavicomedy.com directly.',
    })
  }
}
