# Google Analytics Setup Instructions

## How to Set Up Google Analytics 4 for ColorChase

### Step 1: Create Google Analytics Account (if needed)
1. Go to [Google Analytics](https://analytics.google.com/)
2. Click "Start measuring" or "Admin" (gear icon)
3. Sign in with your Google account

### Step 2: Create a GA4 Property
1. In Admin settings, click "+ Create Property"
2. Enter property details:
   - **Property name**: ColorChase
   - **Reporting time zone**: Select your timezone
   - **Currency**: Select your currency
3. Click "Next"

### Step 3: Set Up Data Stream
1. Select platform: **Web**
2. Enter website details:
   - **Website URL**: https://colorchase.vercel.app
   - **Stream name**: ColorChase Production
3. Click "Create stream"

### Step 4: Get Your Measurement ID
1. After creating the stream, you'll see your **Measurement ID** (starts with `G-`)
2. Copy this ID (format: `G-XXXXXXXXXX`)

### Step 5: Add to Environment Variables
1. Create or edit `.env.local` in your project root:
   ```
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
   (Replace `G-XXXXXXXXXX` with your actual Measurement ID)

2. **Important**: Never commit `.env.local` to git (it should be in `.gitignore`)

### Step 6: Deploy to Vercel
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add new variable:
   - **Name**: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - **Value**: Your `G-XXXXXXXXXX` ID
   - **Environment**: Production, Preview, Development (select all)
4. Click "Save"
5. Redeploy your application

### Step 7: Verify Tracking
1. Go to Google Analytics
2. Navigate to Reports → Realtime
3. Visit your live website
4. You should see yourself as an active user in the Realtime report within a few seconds

### Troubleshooting
- **Not seeing data?** Check browser console for errors
- **Still no data?** Verify environment variable is set correctly
- **Ad blockers?** Ad blockers may prevent GA from loading (expected)
- **Local development?** Make sure `.env.local` exists and has the correct variable

### What Gets Tracked
- Page views (all public pages)
- User navigation between pages
- Session duration
- Device/browser information
- Traffic sources

### Privacy Notes
- GA4 is GDPR-compliant by default
- IP addresses are anonymized
- No personally identifiable information is collected
- Users can opt-out using browser extensions
