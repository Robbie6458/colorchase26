# Quick Start Guide: Email & Social Media Automation

## ⚡ Fast Track Implementation (30 minutes)

### Step 1: Database Setup (2 minutes)

Run this SQL in your Supabase SQL Editor:

```sql
-- Add email notification preference column
ALTER TABLE profiles 
ADD COLUMN email_notifications BOOLEAN DEFAULT true;

-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

### Step 2: Email Notifications with Resend (10 minutes)

1. **Sign up for Resend** → [resend.com/signup](https://resend.com/signup)
2. **Get API Key** → Dashboard → API Keys → Create API Key → Copy it
3. **Deploy the function:**
   ```bash
   cd /workspaces/colorchase26
   supabase functions deploy send-daily-reminder
   supabase secrets set RESEND_API_KEY=re_YOUR_API_KEY_HERE
   ```

4. **Schedule daily emails** (Supabase SQL Editor):
   ```sql
   SELECT cron.schedule(
     'send-daily-reminder',
     '0 7 * * *',
     $$
     SELECT net.http_post(
       url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-daily-reminder',
       headers:='{"Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb
     );
     $$
   );
   ```
   Replace `YOUR_PROJECT_REF` with your Supabase project reference (find it in Project Settings → API).

5. **Test it:**
   ```bash
   curl -X POST 'https://iczkzoupdzkakgzvwdye.supabase.co/functions/v1/send-daily-reminder' \
     -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imljemt6b3VwZHprYWtnenZ3ZHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NjA1NTYsImV4cCI6MjA4MTEzNjU1Nn0.P7JsqNGGYasc2MGLuQe8TCfe6nTYOakBelRf4GO07gg'
   ```

✅ **Done!** Users will get emails 2 hours before daily reset.

---

### Step 3: Social Media Posts - Basic Setup (10 minutes)

**Option A: Manual Posting (No extra accounts needed)**

1. **Deploy the function:**
   ```bash
   supabase functions deploy generate-social-post
   ```

2. **Create daily workflow:**
   - Set a daily calendar reminder at 10 AM
   - Run this command:
     ```bash
     curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-social-post' \
       -H 'Authorization: Bearer YOUR_ANON_KEY'
     ```
   - Copy the SVG and caption from the response
   - Convert SVG to PNG at [svgtopng.com](https://svgtopng.com)
   - Post manually to your social channels

**Option B: Semi-Automated with Buffer (Recommended)**

1. **Sign up for Buffer** → [buffer.com](https://buffer.com) (Free: 3 channels)
2. **Connect your social accounts** (Twitter, Instagram, Facebook, etc.)
3. Use the same workflow as Option A, but paste into Buffer's composer
4. Buffer will post across all channels at once

✅ **Done!** You have a daily social media workflow.

---

### Step 4: Social Media - Fully Automated (Advanced - 10 minutes)

**Prerequisites:**
- Cloudinary account (free tier)
- Buffer account with API access

1. **Sign up for Cloudinary** → [cloudinary.com](https://cloudinary.com)
   - Go to Settings → Upload → Add upload preset (unsigned)
   - Note your Cloud Name and Upload Preset

2. **Get Buffer API Token**
   - Go to [buffer.com/developers/apps](https://buffer.com/developers/apps)
   - Create App → Get Access Token

3. **Deploy and configure:**
   ```bash
   supabase functions deploy generate-social-post-advanced
   supabase secrets set CLOUDINARY_CLOUD_NAME=your_cloud_name
   supabase secrets set CLOUDINARY_UPLOAD_PRESET=your_preset
   supabase secrets set BUFFER_ACCESS_TOKEN=your_token
   ```

4. **Schedule automated posting** (Supabase SQL Editor):
   ```sql
   SELECT cron.schedule(
     'auto-social-post',
     '0 10 * * *',
     $$
     SELECT net.http_post(
       url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-social-post-advanced',
       headers:='{"Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
       body:='{"autoPost": true}'::jsonb
     );
     $$
   );
   ```

✅ **Done!** Fully automated daily social posts!

---

## 🧪 Testing

### Test Email Function Locally
```bash
supabase functions serve send-daily-reminder
```

Then in another terminal:
```bash
curl -X POST 'http://localhost:54321/functions/v1/send-daily-reminder' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

### Test Social Post Function
```bash
supabase functions serve generate-social-post
```

```bash
curl -X POST 'http://localhost:54321/functions/v1/generate-social-post' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

---

## 📊 Check if It's Working

### Email Notifications
1. Go to [Resend Dashboard](https://resend.com/emails)
2. View sent emails and delivery status
3. Check open rates (requires domain verification)

### Social Posts
1. Go to [Buffer Dashboard](https://buffer.com)
2. View scheduled and posted content
3. Check engagement metrics

### Cron Jobs
```sql
-- Check scheduled jobs
SELECT * FROM cron.job;

-- View job run history
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

---

## 🎨 Customization

### Change Email Send Time
Edit the cron schedule (currently 7 AM UTC = 2 hours before 9 AM reset):
```sql
-- Send at 6 AM UTC instead (3 hours before reset)
SELECT cron.unschedule('send-daily-reminder');
SELECT cron.schedule('send-daily-reminder', '0 6 * * *', $$...[same command]$$);
```

### Change Social Post Time
```sql
-- Post at noon UTC instead
SELECT cron.unschedule('auto-social-post');
SELECT cron.schedule('auto-social-post', '0 12 * * *', $$...[same command]$$);
```

### Edit Email Template
Edit [send-daily-reminder/index.ts](supabase/functions/send-daily-reminder/index.ts):
- Change colors in the HTML
- Update subject line
- Modify messaging
- Add branding

### Edit Social Media Image
Edit the `generateSVG` function in [generate-social-post-advanced/index.ts](supabase/functions/generate-social-post-advanced/index.ts):
- Adjust layout
- Change fonts
- Modify colors/overlays
- Update text

---

## ❓ Troubleshooting

### Emails not sending?
```bash
# Check if API key is set
supabase secrets list

# View function logs
# Go to Supabase Dashboard → Edge Functions → send-daily-reminder → Logs
```

### Social posts failing?
```bash
# Test the function manually
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-social-post' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'

# Check for error in response
```

### Cron not running?
```sql
-- Check if job exists
SELECT * FROM cron.job WHERE jobname = 'send-daily-reminder';

-- Check job history for errors
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-daily-reminder')
ORDER BY start_time DESC;
```

---

## 💰 Costs (All Free Tiers)

- **Resend**: 3,000 emails/month FREE
- **Supabase Edge Functions**: 500K executions/month FREE  
- **Cloudinary**: 25 credits/month FREE (~25 images)
- **Buffer**: 3 social channels FREE

**Total Monthly Cost: $0** (within free tier limits)

To scale beyond free tiers:
- Resend: $20/month for 50K emails
- Buffer: $6/month for more channels
- Cloudinary: $25/month for 25K credits

---

## 🚀 Next Steps

Once running smoothly, consider:

1. **Domain Verification** on Resend for better deliverability
2. **A/B Testing** different email subject lines and send times
3. **Analytics Integration** to track click-throughs from emails
4. **Instagram Stories** automation (requires different approach)
5. **Weekly digest** emails for inactive users
6. **Celebrate milestones** (user's 10th game, 30-day streak, etc.)

---

## 📚 Full Documentation

For detailed setup instructions, see [MARKETING_AUTOMATION_SETUP.md](MARKETING_AUTOMATION_SETUP.md)

## 🆘 Need Help?

- Resend Docs: https://resend.com/docs
- Buffer API: https://buffer.com/developers/api
- Supabase Functions: https://supabase.com/docs/guides/functions
- Cloudinary: https://cloudinary.com/documentation
