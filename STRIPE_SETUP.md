# Stripe Setup Guide

Everything below assumes Stripe **Test Mode** (toggle in top-right of dashboard). Switch to Live Mode when ready to sell real tickets.

---

## TODO

- [ ] Get test API keys from Stripe dashboard and add to `.env.local`
- [ ] Set `showcaseTicketsAvailable: true` in `config/site.js`
- [ ] Test locally (`npm run dev`) using the testing checklist below
- [ ] Add live API keys (`pk_live_`, `sk_live_`) to Vercel environment variables
- [ ] Commit and merge the `stripe` branch
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
4. Update `data/shows.js` with new performers if needed
5. Deploy

That's it. The checkout session is created dynamically by the API route, so there is nothing to configure in the Stripe dashboard per show.

---

## How It Works

- User clicks "Buy Tickets" on the homepage or show card
- They land on `/checkout`, which renders Stripe's embedded checkout form on your site
- The API route (`/api/create-checkout-session`) creates a Checkout Session with the $20 price
- The quantity selector max is set to remaining capacity (e.g., if 94 sold, max is 6)
- If capacity is reached, the checkout page shows "Sold Out" with a link to the mailing list
- Each session is tagged with the show date in metadata, so capacity is tracked per show automatically
- Sessions expire after 30 minutes
- After payment, Stripe redirects to `/success` with the session ID
- The success page fires the Meta Pixel Purchase event and shows show details

---

## Testing Checklist

### Prerequisites
- [ ] Stripe dashboard is in **Test Mode** (toggle top-right)
- [ ] `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` are set in `.env.local`
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
- [ ] Click "Buy Tickets" on homepage, verify `/checkout` page loads with embedded Stripe form
- [ ] Click "Get Tickets" on show card, verify `/checkout` page loads
- [ ] Purchase 1 ticket with test card, verify redirect to `/success`
- [ ] Purchase multiple tickets, verify it works
- [ ] Verify the success page shows correct show details
- [ ] Verify Meta Pixel fires Purchase event on success page

### Capacity Tests
- [ ] After buying tickets, verify the next session's max quantity decreases accordingly
- [ ] Temporarily set `capacity` to a low number (e.g., 2), buy 2 tickets, verify the checkout page shows "Sold Out"
- [ ] Reset `capacity` back to 100

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
   - Adjust `capacity` if needed (default 100)
2. **Update `data/shows.js`** with new performers if needed
3. Deploy

Capacity resets automatically per show because sessions are tagged with the show date.

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
4. Deploy

---

## Tax and Fees

The site advertises "$20, no extra taxes or fees." Tax is absorbed into the $20 price:
- **Per-ticket breakdown:** $20.00 total = $18.76 revenue + $1.24 NJ sales tax (6.625%)
- **You are responsible** for remitting NJ sales tax quarterly/annually

Stripe charges 2.9% + $0.30 per transaction:
- 1 ticket ($20): fee ~$0.88, net ~$17.88
- 6 tickets ($120): fee ~$3.78, net ~$114.98
