# Stripe Setup Guide

Everything below assumes Stripe **Test Mode** (toggle in top-right of dashboard). Switch to Live Mode when ready to sell real tickets.

---

## TODO

- [ ] Get test API keys from Stripe dashboard and add to `.env.local`
- [ ] Set `showcaseTicketsAvailable: true` in `config/site.js`
- [ ] Test locally (`npm run dev`) using the testing checklist below
- [ ] Use the debug page (`/debug`, requires `NEXT_PUBLIC_DEBUG_ENABLED=true`) to visually verify all checkout states
- [ ] Add live API keys (`pk_live_`, `sk_live_`) to Vercel environment variables
- [ ] Commit and merge
- [ ] Deploy

---

## 1. Get Your API Keys

1. Go to **Developers > API keys** in the Stripe dashboard
2. Copy your **Publishable key** (`pk_test_...`)
3. Copy your **Secret key** (`sk_test_...`)
4. Add them to `.env.local`:

```
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

5. Also add these as environment variables in **Vercel > Settings > Environment Variables**

## 2. Update the Website for a New Show

1. Open `config/site.js`
2. Set `nextShowDateISO` to the new date
3. Set `showcaseTicketsAvailable: true` when ready to sell
4. Adjust `capacity` if needed (default 100)
5. Update `data/shows.js` with new performers if needed
6. Deploy

That's it. The checkout session is created dynamically by the API route, so there is nothing to configure in the Stripe dashboard per show. Capacity resets automatically because sessions are tagged with the show date.

---

## How It Works

1. User clicks "Buy Tickets" on the homepage or show card
2. A modal opens with a ticket quantity picker (+/- buttons, total price)
3. User clicks "Continue to Payment"
4. The API route (`/api/create-checkout-session`) checks remaining capacity, then creates a Stripe Checkout Session with the selected quantity
5. Stripe's embedded checkout form loads inside the modal
6. After payment, Stripe redirects to `/success`
7. The success page fires the Meta Pixel Purchase event and shows show details

### Capacity management

- The API checks tickets sold per show (via Stripe session metadata) against `config/site.js` `tickets.capacity`
- The quantity picker caps at remaining capacity (e.g., 6 left means max 6)
- Sold out is detected automatically: no manual toggle needed
- "Almost sold out" badge shows on the show card when remaining is at or below `tickets.almostSoldOutThreshold` (default 15)
- Sessions expire after 30 minutes

### Error handling

- If the API or Stripe fails, the customer sees a clear error message with a "Try Again" button and a link to email tavi@tavicomedy.com
- You get an email alert (via Resend) whenever a customer hits a checkout error, with details about what went wrong

### Debug page

Visit `/debug` (only available when `NEXT_PUBLIC_DEBUG_ENABLED=true` in env) to preview all checkout modal states: ticket picker, sold out, error, limited capacity, and the live checkout flow. This renders the real `CheckoutModal` component, not mocks.

---

## Testing Checklist

### Prerequisites
- [ ] Stripe dashboard is in **Test Mode** (toggle top-right)
- [ ] `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` are set in `.env.local`
- [ ] `NEXT_PUBLIC_DEBUG_ENABLED=true` is set in `.env.local`
- [ ] `showcaseTicketsAvailable` is `true` in `config/site.js`
- [ ] Site is running locally (`npm run dev`)

### Test Card Numbers
| Card | Number | Use |
|------|--------|-----|
| Visa (success) | 4242 4242 4242 4242 | Normal purchase |
| Visa (decline) | 4000 0000 0000 0002 | Test decline handling |
| 3D Secure | 4000 0025 0000 3155 | Test auth flow |

Use any future expiry date, any 3-digit CVC, any ZIP code.

### Functional Tests
- [ ] Click "Buy Tickets" on homepage, verify modal opens with ticket picker
- [ ] Click "Get Tickets" on show card, verify modal opens
- [ ] Select quantity, click "Continue to Payment", verify Stripe form loads in modal
- [ ] Click "Change quantity" link above Stripe form, verify it returns to picker
- [ ] Purchase 1 ticket with test card, verify redirect to `/success`
- [ ] Purchase multiple tickets, verify it works
- [ ] Verify the success page shows correct show details
- [ ] Verify Meta Pixel fires Purchase event on success page

### Capacity Tests
- [ ] After buying tickets, verify the quantity picker max decreases accordingly
- [ ] Temporarily set `capacity` to a low number (e.g., 2), buy 2 tickets, verify sold out state appears
- [ ] Verify "Almost sold out" badge appears when remaining is at or below `almostSoldOutThreshold`
- [ ] Reset `capacity` back to 100

### Debug Page Tests
- [ ] Visit `/debug`, verify all modal states render correctly
- [ ] Verify links in sold out and error states work (mailing list, email)
- [ ] Verify `/debug` returns 404 when `NEXT_PUBLIC_DEBUG_ENABLED` is not set

### Refund Test
- [ ] Go to **Payments** in Stripe dashboard
- [ ] Click a test payment
- [ ] Click **Refund** > Full refund
- [ ] Verify refund processes

---

## Operational Guide

### For Each New Show

1. **Update `config/site.js`:**
   - Set `nextShowDateISO` to the new date
   - Set `showcaseTicketsAvailable: true`
   - Adjust `capacity` or `almostSoldOutThreshold` if needed
2. **Update `data/shows.js`** with new performers if needed
3. Deploy

Sold out is detected automatically. To force sold out immediately (e.g., holding back tickets for door sales), set `showcaseForceSoldOut: true` in config. This skips the Stripe capacity check entirely.

### After a Show

1. Set `showcaseTicketsAvailable: false` in `config/site.js`
2. Deploy

### Export Customer List

1. Go to **Payments** in Stripe dashboard
2. Filter by date range
3. Click **Export** (top-right)
4. Select CSV format
5. Fields available: customer name, email, amount, date, quantity

### Handle Refunds

1. Go to **Payments** in Stripe dashboard
2. Find the payment (search by customer email or name)
3. Click the payment
4. Click **Refund**
5. Choose full or partial refund
6. Customer gets an email automatically from Stripe

### Switch from Test to Live Mode

1. Toggle **Live Mode** in Stripe dashboard (top-right)
2. Copy your live API keys (`pk_live_...`, `sk_live_...`)
3. Update `.env.local` and Vercel environment variables with the live keys
4. Do NOT add `NEXT_PUBLIC_DEBUG_ENABLED` to Vercel (keeps `/debug` hidden in prod)
5. Deploy

---

## Config Reference (`config/site.js`)

```js
showcaseTicketsAvailable: true,    // false = "Get Ticket Alerts" mode
showcaseForceSoldOut: false,       // true = force sold out (skips Stripe check)

tickets: {
  buttonText: "Buy Tickets",
  checkoutPath: "/checkout",
  capacity: 100,                   // max tickets per show
  almostSoldOutThreshold: 15,      // "Almost sold out" badge threshold
}
```

---

## Receipts

Customers receive an email receipt after every successful payment. This is handled by two things working together:

1. **Stripe Dashboard toggle:** Settings > Business > Customer emails > "Successful payments" is turned ON. This tells Stripe to email a receipt to the customer after each charge.
2. **Code (`create-checkout-session.js`):** The checkout session sets `payment_intent_data.description` to "No ticket needed. Just give your name at the door." This message appears on the emailed receipt so customers know they don't need a physical ticket.

Additionally, `custom_text.after_submit` is set on the checkout session so the same "no ticket needed" message appears on the Stripe confirmation page right after payment.

If the dashboard toggle is off, no receipts are sent (unless `receipt_email` is explicitly set on the payment intent via the API, which we don't do). The toggle setting is ignored when `receipt_email` is provided in the API, but since we rely on the toggle, just keep it on.

---

## Tax and Fees

The site advertises "$20, no extra taxes or fees." Tax is absorbed into the $20 price:
- **Per-ticket breakdown:** $20.00 total = $18.76 revenue + $1.24 NJ sales tax (6.625%)
- **You are responsible** for remitting NJ sales tax quarterly/annually

Stripe charges 2.9% + $0.30 per transaction:
- 1 ticket ($20): fee ~$0.88, net ~$17.88
- 6 tickets ($120): fee ~$3.78, net ~$114.98
