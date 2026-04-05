import Stripe from 'stripe'
import { siteConfig } from '@/config/site'
import { sendPurchaseNotification } from '@/lib/resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

async function getTicketsSold(showDate) {
  let total = 0
  let hasMore = true
  let startingAfter = undefined

  while (hasMore) {
    const sessions = await stripe.checkout.sessions.list({
      status: 'complete',
      limit: 100,
      ...(startingAfter && { starting_after: startingAfter }),
      expand: ['data.line_items'],
    })

    for (const session of sessions.data) {
      if (session.metadata?.showDate !== showDate) continue
      for (const item of session.line_items?.data || []) {
        total += item.quantity || 0
      }
    }

    hasMore = sessions.has_more
    if (sessions.data.length > 0) {
      startingAfter = sessions.data[sessions.data.length - 1].id
    }
  }

  return total
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  const { sessionId } = req.body || {}
  if (!sessionId) {
    return res.status(400).json({ error: 'Missing session ID' })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return res.status(200).json({ ok: true })
    }

    // Skip if we already sent the notification for this session.
    // If anything goes wrong checking/setting this, we send anyway
    // (a duplicate email is better than a missed one).
    if (session.metadata?.notificationSent === 'true') {
      return res.status(200).json({ ok: true })
    }

    const showDate = session.metadata?.showDate
    const ticketCount = Number(session.metadata?.ticketCount) || 0
    const hearAbout = session.metadata?.hearAbout

    if (showDate && ticketCount > 0) {
      try {
        await stripe.checkout.sessions.update(sessionId, {
          metadata: { ...session.metadata, notificationSent: 'true' },
        })
      } catch (_) {
        // Non-critical: if the flag fails to set, we may send a duplicate next time
      }

      const totalSold = await getTicketsSold(showDate)
      await sendPurchaseNotification({
        customerEmail: session.customer_details?.email,
        customerName: session.customer_details?.name,
        ticketCount,
        totalSold,
        showDate,
        hearAbout,
      })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Purchase notification error:', err)
    return res.status(200).json({ ok: true })
  }
}
