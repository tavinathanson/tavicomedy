import Stripe from 'stripe'
import { siteConfig } from '@/config/site'
import { sendCheckoutErrorAlert } from '@/lib/resend'
import { getRemaining } from '@/lib/capacity'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const remaining = await getRemaining()
      return res.status(200).json({ remaining, soldOut: remaining <= 0 })
    } catch (err) {
      console.error('GET checkout error:', err)
      sendCheckoutErrorAlert(err.message, {
        method: 'GET',
        showDate: siteConfig.nextShowDateISO,
      }).catch(() => {})
      return res.status(200).json({ error: 'Something went wrong loading ticket availability. Please try again in a moment.' })
    }
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).end('Method Not Allowed')
  }

  try {
    const { quantity, hearAbout, bypass } = req.body || {}
    const ticketCount = Math.max(1, Math.floor(Number(quantity) || 1))
    const showDate = siteConfig.nextShowDateISO

    if (!bypass) {
      let remaining
      try {
        remaining = await getRemaining()
      } catch (err) {
        console.error('Failed to check capacity:', err)
        sendCheckoutErrorAlert(`Failed to check capacity: ${err.message}`, {
          method: 'POST',
          requestedQuantity: ticketCount,
          showDate,
        }).catch(() => {})
        return res.status(200).json({ error: 'Something went wrong checking ticket availability. Please try again in a moment.' })
      }

      if (remaining <= 0) {
        return res.status(200).json({ soldOut: true })
      }

      if (ticketCount > remaining) {
        return res.status(200).json({ remaining })
      }
    }

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded_page',
      billing_address_collection: 'required',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Crave Laughs Comedy Show: ${ticketCount} ${ticketCount === 1 ? 'Ticket' : 'Tickets'}`,
              description: 'Standup comedy at Crave Nature\'s Eatery, Lawrenceville, NJ. BYOB! Doors at 5:30 PM, show at 7:00 PM.',
            },
            unit_amount: 2000,
          },
          quantity: ticketCount,
        },
      ],
      mode: 'payment',
      payment_intent_data: {
        description: 'No ticket needed! Just give your name at the door.',
        metadata: {
          showDate,
          ticketCount: String(ticketCount),
          ...(hearAbout && { hearAbout: String(hearAbout).slice(0, 500) }),
        },
      },
      custom_text: {
        after_submit: {
          message: 'No ticket needed. Just give your name at the door!',
        },
      },
      metadata: {
        showDate,
        ticketCount: String(ticketCount),
        ...(hearAbout && { hearAbout: String(hearAbout).slice(0, 500) }),
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      return_url: `${req.headers.origin || `https://${req.headers.host}`}/success?session_id={CHECKOUT_SESSION_ID}`,
    })

    res.status(200).json({ clientSecret: session.client_secret })
  } catch (err) {
    console.error('POST checkout error:', err)
    const { quantity } = req.body || {}
    sendCheckoutErrorAlert(`Session creation failed: ${err.message}`, {
      method: 'POST',
      requestedQuantity: quantity,
      showDate: siteConfig.nextShowDateISO,
      stripeErrorType: err.type || 'unknown',
    }).catch(() => {})
    res.status(200).json({ error: 'Something went wrong setting up checkout. Please try again, or email tavi@tavicomedy.com for help.' })
  }
}
