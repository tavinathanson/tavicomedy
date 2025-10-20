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

### 2. Configure Google Sheets for Email Signups (YAMM Integration)

This site uses Google Sheets to collect email signups, which integrates seamlessly with YAMM (Yet Another Mail Merge) for sending newsletters.

**Step 1: Create Your Google Sheet**

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Name it something like "Comedy Newsletter Subscribers"
3. In the first row, add these column headers:
   - **Column A**: `Email`
   - **Column B**: `Shows`
   - **Column C**: `Open Mics`
   - **Column D**: `Timestamp`
   - **Column E**: `Source`
4. Note the **Sheet ID** from the URL (the long string between `/d/` and `/edit`):
   - Example: `https://docs.google.com/spreadsheets/d/1abc123XYZ456/edit`
   - Sheet ID: `1abc123XYZ456`
5. Note the **tab name** at the bottom of the sheet (e.g., "website-mailing-list")

**Step 2: Set Up Google Cloud Service Account**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project:
   - Click the project dropdown at the top
   - Click "New Project"
   - Name it (e.g., "website-mailing-list")
   - Click "Create"
3. Enable the Google Sheets API:
   - In the left sidebar, go to **APIs & Services** → **Library**
   - Search for "Google Sheets API"
   - Click on it and click **Enable**
4. Create a service account:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **Service Account**
   - Enter a name (e.g., "website-mailing-list")
   - Click **Create and Continue**
   - Skip the optional permissions (click **Continue** then **Done**)
5. Create a JSON key:
   - Click on the service account you just created
   - Go to the **Keys** tab
   - Click **Add Key** → **Create new key**
   - Choose **JSON** format
   - Click **Create** (this downloads a JSON file to your computer)
6. Open the downloaded JSON file and copy the `client_email` value
   - It looks like: `something@project-name.iam.gserviceaccount.com`

**Note on Organization Policies:** If you get an error about service account key creation being disabled, you'll need to either:
- Disable the `iam.disableServiceAccountKeyCreation` policy in your organization settings, OR
- Use a personal Gmail account to create the Google Cloud project (recommended for personal projects)

**Step 3: Share Your Sheet with the Service Account**

1. Go back to your Google Sheet
2. Click the **Share** button (top right)
3. Paste the service account email address (the `client_email` from the JSON file)
4. Give it **Editor** permissions
5. Uncheck "Notify people" (it's a bot account, no need to notify)
6. Click **Share**

**Step 4: Set Up Environment Variables Locally**

1. In your terminal, copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and add your values:
   ```bash
   # Copy the ENTIRE contents of your service account JSON file here
   # IMPORTANT: Wrap the JSON in SINGLE QUOTES to preserve formatting
   GOOGLE_SERVICE_ACCOUNT_KEY='{
     "type": "service_account",
     "project_id": "your-project",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "something@project.iam.gserviceaccount.com",
     ...
   }'

   # Your Google Sheet ID (from Step 1)
   GOOGLE_SHEET_ID=1abc123XYZ456

   # The tab/worksheet name (from Step 1)
   GOOGLE_SHEET_NAME=website-mailing-list
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

**Step 5: Deploy to Vercel with Environment Variables**

When deploying to Vercel:

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add these three variables:

   | Key | Value |
   |-----|-------|
   | `GOOGLE_SERVICE_ACCOUNT_KEY` | Paste the entire JSON file contents wrapped in single quotes: `'{"type":"service_account",...}'` (you can minify to one line or keep multi-line) |
   | `GOOGLE_SHEET_ID` | Your Sheet ID from Step 1 |
   | `GOOGLE_SHEET_NAME` | Your tab name (e.g., "website-mailing-list") |

3. Click **Save**
4. Redeploy your site: **Deployments** tab → **Redeploy** on latest deployment

**Step 6: Connect to YAMM**

1. In YAMM, when creating a new mail merge:
   - Select your Google Sheet as the data source
   - Map the `Email` column as the recipient email
   - Use the `Shows` and `Open Mics` columns to filter/segment your sends
   - The `Timestamp` column shows when they signed up
   - The `Source` column will show "website" for all signups from this form

**How It Works**

- When someone signs up, their email and preferences are saved to your Google Sheet
- If the same email signs up again with different preferences, the row is **updated** (not duplicated)
- YAMM automatically pulls contacts from this sheet for your mail merges
- You can manually add contacts to the sheet, and they'll also be included in YAMM

**Troubleshooting**

- **"Server configuration error"**: Check that all environment variables are set correctly in Vercel
- **"Failed to save subscription"**: Verify the service account has Editor access to the sheet
- **Duplicate entries**: The system should update existing emails, not create duplicates. If you see duplicates, check that the email column (A) doesn't have any hidden formatting
- **Test first**: Always test with your own email before going live

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
│   ├── api/
│   │   └── subscribe.js  # API route for Google Sheets integration
│   ├── _app.js           # Next.js app wrapper
│   ├── _document.js      # HTML document structure
│   └── index.js          # Main landing page
├── components/
│   ├── Navigation.js     # Header navigation
│   ├── ShowCard.js       # Individual show cards
│   └── EmailSignup.js    # Email signup form (Google Sheets)
├── data/
│   └── shows.js          # Show/event data
├── config/
│   └── site.js           # Site configuration
├── styles/
│   └── globals.css       # Global styles & Tailwind
├── public/
│   └── images/           # Image assets
└── package.json          # Dependencies
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
2. Fill in your Google Sheets API values (see Configure Google Sheets section above)
3. When deploying to Vercel, add these same variables in your project settings

**Required Variables:**
- `GOOGLE_SERVICE_ACCOUNT_KEY` - Full JSON credentials from Google Cloud service account
- `GOOGLE_SHEET_ID` - Your Google Sheet ID
- `GOOGLE_SHEET_NAME` - The tab name in your sheet (default: "website-mailing-list")

## Support

For questions or issues:
- Email: tavi@tavicomedy.com
- Instagram: @tavinathanson