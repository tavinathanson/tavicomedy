import Stripe from 'stripe'
import { siteConfig } from '@/config/site'
import { sendPurchaseNotification } from '@/lib/resend'
import { getEffectiveTicketsSold } from '@/lib/capacity'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

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

      const totalSold = await getEffectiveTicketsSold(showDate)
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
