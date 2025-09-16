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

**Step 1: Get your Mailchimp Form Action URL**
1. Log into [Mailchimp](https://mailchimp.com)
2. Click **Audience** in the left sidebar
3. Click **Manage Audience** dropdown (see screenshot) → **Signup forms**
4. Click **Embedded forms**
5. You'll see the form builder with:
   - **Settings** panel on the left
   - **Form Title** field (e.g., "Subscribe" or "Comedy Show Updates")
   - Preview of your form on the right
6. Configure your form settings (optional):
   - Form Title: Whatever you want
   - Width: Leave default (600 pixels)
   - Keep other checkboxes unchecked for now
7. Click **Continue** button (top right, green button)
8. On the next page, you'll see **"Copy the code below"** with the embed code
9. In the embed code, look for this line (usually around line 9-10):
    ```html
    <form action="https://YOURDOMAIN.usXX.list-manage.com/subscribe/post?u=XXXXXXXX&amp;id=YYYYYYYY&amp;f_id=ZZZZZZZZ" method="post"
    ```
10. Copy the URL from `action="..."` but **replace `&amp;` with `&`**. Your final URL should look like:
    ```
    https://YOURDOMAIN.usXX.list-manage.com/subscribe/post?u=XXXXXXXX&id=YYYYYYYY&f_id=ZZZZZZZZ
    ```
    
    The URL contains:
    - Data center: `usXX` (like us11, us21, etc.)
    - User ID: The long string after `u=`
    - List ID: The string after `id=`

**Step 2: Get your Group ID (for interest checkboxes)**
1. In your Audience, click **Manage Audience** dropdown → **More options** → **Groups**
2. Click **Create Groups**
3. Create a new group category:
   - **Group category name**: "Show Preferences" (or similar)
   - **Group type**: Select "Checkboxes - subscribers can select one or more"
   - Click **Save**
4. Add group options:
   - Click **Add Group** and enter "Comedy Shows"
   - Click **Add Group** again and enter "Comedy Open Mics"
   - Click **Save**
5. Go back to the main **Forms** page (click Forms in the top navigation)
6. Find your embedded form in the list and click on it
7. In the **Form fields** section:
   - Click **Add a field** 
   - Select **Show Preferences** (this is your group category)
   - Your interest groups will now appear in the form preview
8. Click **Continue** (green button, top right) to get the embed code
9. In the embed code, search for `group[` - you'll find a section like this:
   ```html
   <strong>Show Preferences </strong><ul>
   <li><input type="checkbox" name="group[XXXXX][1]" id="mce-group[XXXXX]-XXXXX-0" value="">
   <label for="mce-group[XXXXX]-XXXXX-0">Comedy Shows</label></li>
   <li><input type="checkbox" name="group[XXXXX][2]" id="mce-group[XXXXX]-XXXXX-1" value="">
   <label for="mce-group[XXXXX]-XXXXX-1">Comedy Open Mics</label></li>
   </ul>
   ```
10. The number in `group[XXXXX]` is your Group ID (usually a 5-digit number like 12345 or 18523)
    - Comedy Shows is `group[XXXXX][1]`
    - Comedy Open Mics is `group[XXXXX][2]`

**Step 3: Set up Environment Variables Locally**
1. In your terminal, copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```
2. Open `.env.local` and add your values:
   ```
   NEXT_PUBLIC_MAILCHIMP_ACTION_URL=https://gmail.us21.list-manage.com/subscribe/post?u=a1b2c3d4e5&id=f6g7h8i9j0
   NEXT_PUBLIC_MAILCHIMP_GROUP_ID=17269
   ```
3. Restart your development server for changes to take effect

**Step 4: Deploy to Vercel with Environment Variables**

When you import your project to Vercel, you'll see the **Configure Project** screen. Here's what to do:

1. **Framework Preset**: Next.js (auto-detected)
2. **Build and Output Settings**: Leave all defaults
   - Build Command: `next build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)
3. **Environment Variables**: Click to expand this section and add:
   
   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_MAILCHIMP_ACTION_URL` | Your URL from Step 1 (the full https://... URL) |
   | `NEXT_PUBLIC_MAILCHIMP_GROUP_ID` | Your 5-digit Group ID from Step 2 |
   | `NEXT_PUBLIC_MAILCHIMP_TAG_WEBSITE` | (Optional) Tag ID for all website signups |
   | `NEXT_PUBLIC_MAILCHIMP_TAG_COMEDY_SHOWS` | (Optional) Tag ID for comedy show interests |
   | `NEXT_PUBLIC_MAILCHIMP_TAG_OPEN_MICS` | (Optional) Tag ID for open mic interests |
   
4. Click **Deploy**

**To add/update environment variables after deployment:**
1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Environment Variables**
3. Add or modify variables
4. Click **Save**
5. Go to **Deployments** tab → click **Redeploy** on the latest deployment

**Using Your Interest Groups & Tags**

**Interest Groups** (already configured):
- Automatically track what subscribers are interested in
- Create segments: Audience → Segments → Group interests → Comedy Shows/Open Mics

**Tags** (optional but powerful):
1. Create tags in Mailchimp:
   - Go to Audience → **Tags** → **Create Tag**
   - Suggested tags: "website-signup", "comedy-shows-interest", "open-mics-interest"
   
2. Get tag IDs:
   - Click on a tag in your Tags list
   - Look at the URL: `/tags/1234567` → `1234567` is your tag ID
   
3. Add tag IDs to your `.env.local`:
   ```
   NEXT_PUBLIC_MAILCHIMP_TAG_WEBSITE=1234567
   NEXT_PUBLIC_MAILCHIMP_TAG_COMEDY_SHOWS=1234568
   NEXT_PUBLIC_MAILCHIMP_TAG_OPEN_MICS=1234569
   ```

4. How it works:
   - Everyone gets the "website-signup" tag
   - If they check "Comedy Shows" → also gets "comedy-shows-interest" tag
   - If they check "Open Mics" → also gets "open-mics-interest" tag
   - Multiple tags can be applied to one subscriber

**Troubleshooting Mailchimp Setup**
- **Can't find embed code?** Make sure you clicked "Continue" after configuring form settings
- **Form doesn't submit?** Check browser console (F12) for errors, verify your URL is correct
- **Groups not showing?** Ensure "Show interest group fields" is checked in form builder
- **Wrong data center?** Your URL must match your account's data center (check your Mailchimp URL)
- **Test first:** Always test with your own email before going live
- **Common mistake:** Don't include the entire embed code - only copy the URL from action=""

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

**Important Note About Multiple Projects:**
If you're already running the [openmic project](https://github.com/tavinathanson/openmic) on `openmic.tavicomedy.com`, that subdomain is already configured and will continue working independently. This setup is only for the main domain.

**In Vercel (tavicomedy project):**
1. Go to your project → **Settings** → **Domains**
2. Add `tavicomedy.com` 
3. Also add `www.tavicomedy.com` if you want www to work
4. Both will show "DNS Change Recommended" until you complete the Namecheap setup
5. Click "Learn more" to see the exact DNS records needed

**In Namecheap:**
1. Go to **Domain List** → **Manage** → **Advanced DNS**
2. You'll see your existing records (like the `openmic` CNAME if you have the openmic project)
3. Add these NEW records without touching existing ones:

**⚠️ IMPORTANT: The DNS values below need to be updated with the actual values Vercel provides in your project's domain settings.**

For the root domain (`tavicomedy.com`):
- **Type**: A Record
- **Host**: @ 
- **Value**: `[UPDATE WITH VERCEL'S A RECORD IP]`
- **TTL**: Automatic

For www subdomain (recommended):
- **Type**: CNAME Record  
- **Host**: www
- **Value**: `[UPDATE WITH VERCEL'S CNAME VALUE]`
- **TTL**: Automatic

4. **Wait**: DNS propagation takes 10-30 minutes
5. **Verify**: In Vercel, your domains should change from "DNS Change Recommended" to "Valid Configuration"

**Domain Structure After Setup:**
- `tavicomedy.com` → Main comedy website (this project)
- `www.tavicomedy.com` → Same as above
- `openmic.tavicomedy.com` → Open mic project (separate Vercel project)
- Future subdomains can be added for other projects

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

## Environment Variables

Required for email signup functionality:

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Mailchimp values (see Configure Mailchimp section above)
3. When deploying to Vercel, add these same variables in your project settings

## Support

For questions or issues:
- Email: tavi@tavicomedy.com
- Instagram: @tavinathanson