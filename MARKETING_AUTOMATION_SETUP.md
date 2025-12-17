# ColorChase Marketing Automation Setup Guide

This guide will help you set up email notifications and automated social media posts for ColorChase.

## 📧 Email Notifications Setup

### 1. Create a Resend Account

1. Go to [resend.com](https://resend.com) and sign up for a free account
2. Free tier includes 3,000 emails/month and 100 emails/day
3. Navigate to **API Keys** and create a new API key
4. Copy the API key for later use

### 2. Verify Your Domain (Optional but Recommended)

For better deliverability and custom sender addresses:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `colorchase.app`)
4. Add the DNS records shown to your domain's DNS settings
5. Wait for verification (usually takes a few minutes)

If you skip this, emails will be sent from `onboarding@resend.dev`

### 3. Add Database Column

You need to add an email notification preference column to your profiles table:

```sql
-- Run this in your Supabase SQL Editor
ALTER TABLE profiles 
ADD COLUMN email_notifications BOOLEAN DEFAULT true;
```

### 4. Configure Supabase Edge Function

1. In your terminal, navigate to your project:
   ```bash
   cd /workspaces/colorchase26
   ```

2. Deploy the email reminder function:
   ```bash
   supabase functions deploy send-daily-reminder
   ```

3. Set the Resend API key as a secret:
   ```bash
   supabase secrets set RESEND_API_KEY=re_your_api_key_here
   ```

### 5. Set Up Cron Job

In your Supabase Dashboard:

1. Go to **Database** → **Extensions**
2. Enable `pg_cron` extension
3. Go to **SQL Editor** and run:

```sql
-- Schedule daily reminder emails at 7 AM UTC (2 hours before reset)
SELECT cron.schedule(
  'send-daily-reminder',
  '0 7 * * *', -- Every day at 7 AM UTC
  $$
  SELECT
      net.http_post(
         url := 'https://your-project-ref.supabase.co/functions/v1/send-daily-reminder',
         headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
         )
      ) AS request_id;
  $$
);
```

**Important:** Replace `your-project-ref` with your actual Supabase project reference.

### 6. Update Profile Page UI

The profile page needs to be updated to allow users to toggle email notifications. I'll create that update next.

### Testing Email Notifications

Test the function manually:

```bash
curl -X POST 'https://your-project-ref.supabase.co/functions/v1/send-daily-reminder' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

---

## 📱 Social Media Automation Setup

You have two options: **Basic** (manual posting with automation tools) or **Advanced** (fully automated).

### Option A: Basic Setup (Recommended to Start)

This generates the content, but you post manually or semi-automatically via Buffer.

#### 1. Deploy the Social Post Generator

```bash
supabase functions deploy generate-social-post
```

#### 2. Create a Daily Task

Use this function to generate content each day:

```bash
curl -X POST 'https://your-project-ref.supabase.co/functions/v1/generate-social-post' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

This returns:
- SVG image code
- Caption text with hashtags
- Hex codes
- Palette name

#### 3. Manual Workflow

1. Run the function daily (or set a reminder)
2. Copy the SVG code
3. Convert to PNG using [svgtopng.com](https://svgtopng.com) or [CloudConvert](https://cloudconvert.com)
4. Post to social media with the generated caption

### Option B: Advanced Setup (Fully Automated)

#### Prerequisites

1. **Cloudinary Account** (for SVG → PNG conversion)
   - Sign up at [cloudinary.com](https://cloudinary.com)
   - Free tier: 25 credits/month (enough for daily posts)
   - Go to Settings → Upload → Add upload preset (unsigned)
   - Copy: Cloud name & Upload preset name

2. **Buffer Account** (for social media posting)
   - Sign up at [buffer.com](https://buffer.com)
   - Free tier: 3 social channels
   - Connect your social media accounts (Twitter, Instagram, Facebook, LinkedIn, etc.)
   - Go to [buffer.com/developers/apps](https://buffer.com/developers/apps)
   - Create a new app → Get Access Token

#### Setup Steps

1. **Deploy Advanced Function**
   ```bash
   supabase functions deploy generate-social-post-advanced
   ```

2. **Set Secrets**
   ```bash
   supabase secrets set CLOUDINARY_CLOUD_NAME=your_cloud_name
   supabase secrets set CLOUDINARY_UPLOAD_PRESET=your_preset_name
   supabase secrets set BUFFER_ACCESS_TOKEN=your_buffer_token
   ```

3. **Create Cron Job for Automated Posting**

   In Supabase SQL Editor:
   ```sql
   -- Post to social media daily at 10 AM UTC (1 hour after palette reset)
   SELECT cron.schedule(
     'auto-social-post',
     '0 10 * * *', -- Every day at 10 AM UTC
     $$
     SELECT
       net.http_post(
         url:='https://your-project-ref.supabase.co/functions/v1/generate-social-post-advanced',
         headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
         body:='{"autoPost": true}'::jsonb
       ) AS request_id;
     $$
   );
   ```

4. **Test the Function**
   ```bash
   curl -X POST 'https://your-project-ref.supabase.co/functions/v1/generate-social-post-advanced' \
     -H 'Authorization: Bearer YOUR_ANON_KEY' \
     -H 'Content-Type: application/json' \
     -d '{"autoPost": false}'
   ```

---

## 🎨 Customization Options

### Email Templates

Edit [`/supabase/functions/send-daily-reminder/index.ts`](supabase/functions/send-daily-reminder/index.ts) to customize:
- Email design and colors
- Subject line
- Messaging
- CTA button text/link

### Social Media Captions

Edit the `generateCaption` function in [`generate-social-post-advanced/index.ts`](supabase/functions/generate-social-post-advanced/index.ts):
- Add more caption variations
- Customize hashtags
- Adjust tone/style
- Add specific CTAs

### Image Design

Edit the `generateSVG` function to customize:
- Layout and composition
- Fonts and sizes
- Color overlays
- Text positioning
- Branding elements

---

## 📊 Monitoring & Analytics

### Email Metrics

View in Resend Dashboard:
- Delivery rates
- Open rates (requires domain verification)
- Click rates
- Bounce rates

### Social Media Metrics

View in Buffer Dashboard:
- Post performance
- Engagement rates
- Best posting times
- Audience growth

### Supabase Logs

Monitor function execution:
1. Go to Supabase Dashboard → **Edge Functions**
2. Click on function name
3. View **Logs** tab for errors/execution history

---

## 💡 Tips & Best Practices

### Email Notifications
- Send 2-4 hours before reset (not too early, not last minute)
- A/B test subject lines over time
- Monitor unsubscribe rates
- Keep emails mobile-friendly

### Social Media
- Post 1-2 hours after palette reset (when new palette is live)
- Rotate caption styles to keep content fresh
- Engage with comments/replies
- Track which platforms perform best
- Consider time zones of your audience

### Cost Management
- Resend: Stay under 3,000 emails/month (free tier)
- Cloudinary: 25 credits/month = ~25 image conversions
- Buffer: 3 channels free, $6/month for more

---

## 🔧 Troubleshooting

### Emails Not Sending
1. Check Resend API key is set correctly
2. Verify `email_notifications` column exists in profiles table
3. Check function logs in Supabase dashboard
4. Ensure users have valid email addresses

### Social Posts Failing
1. Verify all API keys are set as secrets
2. Test Cloudinary upload separately
3. Check Buffer access token hasn't expired
4. Review function logs for specific errors

### Cron Jobs Not Running
1. Verify `pg_cron` extension is enabled
2. Check cron schedule syntax
3. Ensure service role key is accessible
4. Review PostgreSQL logs in Supabase

---

## 🚀 Next Steps

1. Start with Basic Setup to test content quality
2. Monitor engagement and iterate on captions/design
3. Upgrade to Advanced Setup once comfortable
4. Consider adding:
   - Instagram Stories automation
   - Discord/Telegram notifications
   - Weekly recap emails
   - User milestone celebrations

---

## 📞 Support Resources

- **Resend Docs:** https://resend.com/docs
- **Buffer API:** https://buffer.com/developers/api
- **Cloudinary Docs:** https://cloudinary.com/documentation
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **pg_cron Guide:** https://supabase.com/docs/guides/database/extensions/pg_cron

---

## Environment Variables Summary

Add these to your `.env.local` for local testing:

```bash
# Already configured
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email notifications
RESEND_API_KEY=re_your_resend_api_key

# Social media automation (optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_UPLOAD_PRESET=your_preset
BUFFER_ACCESS_TOKEN=your_buffer_token
```

For Supabase Edge Functions, set these as secrets:
```bash
supabase secrets set RESEND_API_KEY=re_xxx
supabase secrets set CLOUDINARY_CLOUD_NAME=xxx
supabase secrets set CLOUDINARY_UPLOAD_PRESET=xxx
supabase secrets set BUFFER_ACCESS_TOKEN=xxx
```
