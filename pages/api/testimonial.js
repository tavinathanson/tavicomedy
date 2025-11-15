import { google } from 'googleapis'

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { testimonial } = req.body

    // Validate input
    if (!testimonial || testimonial.trim().length === 0) {
      return res.status(400).json({ error: 'Testimonial is required' })
    }

    if (testimonial.length > 500) {
      return res.status(400).json({ error: 'Testimonial must be 500 characters or less' })
    }

    // Get credentials from environment variables
    const credentialsString = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
    const spreadsheetId = process.env.GOOGLE_SHEET_ID
    const sheetName = 'testimonials' // Different sheet name for testimonials

    if (!credentialsString || !spreadsheetId) {
      console.error('Missing Google Sheets configuration')
      return res.status(500).json({ error: 'Server configuration error' })
    }

    // Parse credentials
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

    const timestamp = new Date().toISOString()
    const rowData = [
      timestamp,
      testimonial.trim(),
      'website'
    ]

    // Append to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:C`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [rowData],
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Thanks for sharing!'
    })
  } catch (error) {
    console.error('Error saving testimonial to Google Sheets:', error)
    return res.status(500).json({
      error: 'Failed to save testimonial. Please try again.'
    })
  }
}
