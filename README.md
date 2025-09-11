# Tavi Comedy Lab

A modern, photo-driven landing page for comedy shows in the Lawrenceville/Princeton area.

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3005](http://localhost:3005) in your browser

## Important Setup Steps

### 1. Add Your Images
Replace the placeholder images in `/public/images/` with your actual photos:
- See `/public/images/placeholder-info.txt` for detailed instructions
- Main images to replace:
  - Hero background: Use "Copy of Crave Show Photos.png"
  - Gallery photos: Use your flyers and event photos
  - Show cards: Add showcase and open mic photos

### 2. Configure Mailchimp
1. Get your Mailchimp form action URL from your Mailchimp account
2. Edit `/components/EmailSignup.js`
3. Replace `'https://YOUR-MAILCHIMP-URL-HERE'` with your actual Mailchimp form action URL
4. Uncomment the form submission code

### 3. Managing Show Dates and Ticket Sales

**When tickets are NOT available:**
1. In `/config/site.js`, set `showcaseTicketsAvailable: false`
2. The site will automatically:
   - Show "Next date coming soon" for the showcase
   - Change buttons to "Get Notified About Next Show"
   - Link to the email signup instead of Eventbrite

**When tickets go on sale:**
1. In `/config/site.js`:
   - Set `showcaseTicketsAvailable: true`
   - Update `nextShowDate: "Saturday, March 15"` (or your actual date)
2. The site will automatically:
   - Show the actual show date
   - Change buttons back to "Get Tickets"
   - Link to your Eventbrite page

**Other show details:**
Edit `/data/shows.js` to update:
- Ticket prices
- Event descriptions
- Venue information

## Deployment to Vercel

### Option 1: Deploy with Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts to link to your Vercel account
```

### Option 2: Deploy via GitHub
1. Push this code to a GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Vercel will automatically detect Next.js and deploy

### Custom Domain Setup
1. In your Vercel dashboard, go to your project settings
2. Navigate to "Domains"
3. Add `tavicomedy.com`
4. Follow Vercel's instructions to update your DNS settings

## Project Structure

```
tavicomedy/
├── pages/
│   ├── _app.js          # Next.js app wrapper
│   ├── _document.js     # HTML document structure
│   └── index.js         # Main landing page
├── components/
│   ├── Navigation.js    # Header navigation
│   ├── ShowCard.js      # Individual show cards
│   └── EmailSignup.js   # Mailchimp email form
├── data/
│   └── shows.js         # Show/event data
├── styles/
│   └── globals.css      # Global styles & Tailwind
├── public/
│   └── images/          # Image assets
└── package.json         # Dependencies
```

## Customization

### Colors
Edit `tailwind.config.js` to change the color scheme:
- `comedy-purple`: Main purple accent
- `comedy-green`: Secondary green accent
- `comedy-blue`: Additional blue accent

### Content
- Hero text: Edit the headline in `pages/index.js`
- About section: Update the text in the About section
- Show details: Modify `data/shows.js`

### Adding New Shows
1. Edit `/data/shows.js`
2. Add a new object to the `upcomingShows` array
3. Include all required fields (name, date, time, etc.)

## Environment Variables (Optional)
If you want to use environment variables for sensitive data:

1. Create `.env.local`:
```
NEXT_PUBLIC_MAILCHIMP_URL=your-mailchimp-url
```

2. Update `EmailSignup.js` to use:
```js
const MAILCHIMP_ACTION_URL = process.env.NEXT_PUBLIC_MAILCHIMP_URL
```

## Support

For questions or issues:
- Email: tavi@tavicomedy.com
- Instagram: @tavinathanson