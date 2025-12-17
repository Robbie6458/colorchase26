# 📧 Email & Social Media Automation

This folder contains everything you need to set up automated marketing for ColorChase.

## 🎯 What's Included

### Email Notifications
- Daily reminder emails sent 2 hours before palette expires
- Beautiful, mobile-responsive HTML emails
- User preference toggle in profile settings
- Powered by Resend (3,000 free emails/month)

### Social Media Automation
- Auto-generate stunning palette images (1200x628px for social)
- AI-rotated captions with hashtags and CTAs
- Semi-automated or fully-automated posting
- Buffer integration for multi-platform posting

## 📁 Files Created

```
/supabase/functions/
  ├── send-daily-reminder/          # Email notification function
  │   └── index.ts
  ├── generate-social-post/         # Basic social post generator
  │   └── index.ts
  └── generate-social-post-advanced/ # Automated posting with Cloudinary + Buffer
      └── index.ts

/app/
  ├── auth/profile/page.tsx         # Updated with email notification toggle
  └── api/auth/update-profile/      # Updated to save notification preferences
      └── route.ts

/
  ├── QUICK_START.md                # 30-minute setup guide
  ├── MARKETING_AUTOMATION_SETUP.md # Comprehensive documentation
  └── social-post-preview.html      # Visual preview tool
```

## 🚀 Getting Started

### Option 1: Quick Start (Recommended)
Read [QUICK_START.md](QUICK_START.md) for a 30-minute setup guide.

### Option 2: Full Documentation
Read [MARKETING_AUTOMATION_SETUP.md](MARKETING_AUTOMATION_SETUP.md) for detailed setup and customization.

### Option 3: Preview Social Posts
Open [social-post-preview.html](social-post-preview.html) in a browser to preview what your social posts will look like.

## ⚡ TL;DR Setup

1. **Add database column:**
   ```sql
   ALTER TABLE profiles ADD COLUMN email_notifications BOOLEAN DEFAULT true;
   ```

2. **Deploy email function:**
   ```bash
   supabase functions deploy send-daily-reminder
   supabase secrets set RESEND_API_KEY=re_your_key
   ```

3. **Deploy social function:**
   ```bash
   supabase functions deploy generate-social-post
   ```

4. **Schedule with cron jobs** (see QUICK_START.md for SQL)

## 🎨 Features

### Email Notifications
✅ Beautiful gradient design matching game aesthetics  
✅ Shows hours remaining until reset  
✅ Mobile-responsive  
✅ Unsubscribe link included  
✅ Customizable send time  

### Social Media Posts
✅ Full-bleed color palette images  
✅ Professional typography and layout  
✅ Auto-generated captions with rotation  
✅ Hex codes displayed beautifully  
✅ Optimized for Twitter, Instagram, Facebook, LinkedIn  

## 💡 Recommended Services

| Service | Purpose | Free Tier | Cost to Scale |
|---------|---------|-----------|---------------|
| **Resend** | Email delivery | 3,000/month | $20/mo for 50K |
| **Buffer** | Social scheduling | 3 channels | $6/mo for more |
| **Cloudinary** | Image conversion | 25 credits | $25/mo for 25K |

**Total: $0/month** within free tiers!

## 🔧 What You Need to Set Up

### For Email Notifications (Required)
- [ ] Resend account + API key
- [ ] Database column added
- [ ] Edge function deployed
- [ ] Cron job scheduled

### For Social Posts - Basic (Optional)
- [ ] Edge function deployed
- [ ] Daily manual workflow

### For Social Posts - Automated (Optional)
- [ ] Cloudinary account (SVG → PNG conversion)
- [ ] Buffer account + API token
- [ ] Advanced edge function deployed
- [ ] Cron job scheduled

## 📊 User Flow

### Email Notification Flow
```
7:00 AM UTC
  ↓
Cron triggers edge function
  ↓
Function queries users with email_notifications=true
  ↓
Generates personalized HTML emails
  ↓
Sends via Resend API
  ↓
Users receive reminder 2 hours before reset
```

### Social Media Flow
```
10:00 AM UTC (1 hour after reset)
  ↓
Cron triggers edge function
  ↓
Fetches yesterday's palette from database
  ↓
Generates SVG image with palette colors
  ↓
(If automated) Converts to PNG via Cloudinary
  ↓
(If automated) Posts to Buffer → Social channels
  ↓
OR Manual: You download and post yourself
```

## 🎯 Customization

All functions are highly customizable:

**Email Template:**
- Colors, fonts, and layout
- Subject line variants
- Send time (via cron schedule)
- Messaging and CTAs

**Social Posts:**
- Image design and layout
- Caption styles and hashtags
- Color schemes and overlays
- Posting time and frequency

See MARKETING_AUTOMATION_SETUP.md for detailed customization guide.

## 🧪 Testing

### Test Locally
```bash
# Start local Supabase
supabase start

# Serve function locally
supabase functions serve send-daily-reminder

# Test in another terminal
curl -X POST 'http://localhost:54321/functions/v1/send-daily-reminder' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

### Test in Production
```bash
curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/send-daily-reminder' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

## 📈 Analytics & Monitoring

### Email Metrics (Resend Dashboard)
- Delivery rates
- Open rates (with domain verification)
- Click-through rates
- Bounce/spam rates

### Social Metrics (Buffer Dashboard)
- Post performance
- Engagement rates
- Best posting times
- Audience growth

### Function Logs (Supabase Dashboard)
- Edge Functions → Logs
- Monitor execution and errors
- View request/response data

## ❓ Troubleshooting

See the troubleshooting section in [MARKETING_AUTOMATION_SETUP.md](MARKETING_AUTOMATION_SETUP.md) for common issues and solutions.

Quick checks:
```bash
# Verify secrets are set
supabase secrets list

# Check cron jobs
# In Supabase SQL Editor:
SELECT * FROM cron.job;

# View recent job runs
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

## 🚦 Rollout Strategy

### Week 1: Email Notifications
1. Deploy email function
2. Test with your own email
3. Enable for all users
4. Monitor delivery rates

### Week 2: Social Posts (Manual)
1. Deploy basic social function
2. Post manually for a week
3. Gather engagement data
4. Refine captions and design

### Week 3: Full Automation
1. Set up Cloudinary + Buffer
2. Deploy advanced function
3. Test automated posting
4. Schedule daily cron

### Week 4+: Optimize
1. A/B test send times
2. Try caption variations
3. Monitor engagement
4. Iterate based on data

## 🎉 Success Metrics

Track these KPIs:

**Email:**
- Open rate (target: >25%)
- Click-through rate (target: >5%)
- Unsubscribe rate (keep <2%)
- Conversion rate (email → game play)

**Social Media:**
- Engagement rate (target: >3%)
- Follower growth
- Click-throughs to game
- Best performing platforms

## 🔮 Future Enhancements

Ideas for v2:
- [ ] Instagram Stories automation
- [ ] Weekly digest emails for inactive users
- [ ] User milestone celebrations
- [ ] Palette of the week highlights
- [ ] Discord/Telegram integration
- [ ] SMS notifications (via Twilio)
- [ ] Push notifications (via OneSignal)

## 🆘 Support

**Having issues?**

1. Check [QUICK_START.md](QUICK_START.md) troubleshooting
2. Review function logs in Supabase
3. Test locally with `supabase functions serve`
4. Check API key configuration

**Resources:**
- Resend Docs: https://resend.com/docs
- Buffer API: https://buffer.com/developers/api
- Supabase Functions: https://supabase.com/docs/guides/functions

---

**Built with ❤️ for ColorChase**

Happy automating! 🚀
