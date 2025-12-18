import { google } from 'googleapis'
import { sendSubscriptionConfirmation } from '../../lib/resend'

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, interestType, howFound } = req.body

    // Validate input
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' })
    }

    if (!interestType || !['shows', 'openmics', 'both'].includes(interestType)) {
      return res.status(400).json({ error: 'Valid interest type is required' })
    }

    // Get credentials from environment variables
    const credentialsString = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
    const spreadsheetId = process.env.GOOGLE_SHEET_ID
    const sheetName = process.env.GOOGLE_SHEET_NAME || 'website-mailing-list'

    if (!credentialsString || !spreadsheetId) {
      console.error('Missing Google Sheets configuration')
      return res.status(500).json({ error: 'Server configuration error' })
    }

    // Parse credentials - handle both single-line and multi-line JSON
    let credentials
    try {
      credentials = JSON.parse(credentialsString)
    } catch (parseError) {
      console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY:', parseError.message)
      return res.status(500).json({ error: 'Server configuration error' })
    }

    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const sheets = google.sheets({ version: 'v4', auth })

    // Determine which interests are selected
    const showsInterest = interestType === 'shows' || interestType === 'both'
    const openMicsInterest = interestType === 'openmics' || interestType === 'both'

    // Check if email already exists
    const readResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:A`,
    })

    const existingEmails = readResponse.data.values || []
    const emailIndex = existingEmails.findIndex(
      (row) => row[0] && row[0].toLowerCase() === email.toLowerCase()
    )

    const timestamp = new Date().toISOString()
    const rowData = [
      email,
      showsInterest,
      openMicsInterest,
      timestamp,
      'website',
      howFound || ''
    ]

    if (emailIndex > 0) {
      // Email exists, update the row (emailIndex is 0-based, but row 1 is headers)
      const rowNumber = emailIndex + 1
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A${rowNumber}:F${rowNumber}`,
        valueInputOption: 'RAW',
        resource: {
          values: [rowData],
        },
      })

      return res.status(200).json({
        success: true,
        message: 'Your preferences have been updated!',
        updated: true
      })
    } else {
      // New email, append to sheet
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:F`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [rowData],
        },
      })

      // Send confirmation email (don't fail the request if this fails)
      const emailResult = await sendSubscriptionConfirmation(email, interestType)
      if (!emailResult.success) {
        console.error('Failed to send confirmation email:', emailResult.error)
      }

      return res.status(200).json({
        success: true,
        message: 'Thanks for signing up!',
        updated: false
      })
    }
  } catch (error) {
    console.error('Error saving to Google Sheets:', error)
    return res.status(500).json({
      error: 'Failed to save subscription. Please try again.'
    })
  }
}
