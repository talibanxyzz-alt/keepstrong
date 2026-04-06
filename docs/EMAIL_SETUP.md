# Email System Setup Guide

Complete guide to setting up and using the automated email system with Resend.

## Overview

The app uses Resend API with React Email templates to send:
1. **Welcome email** - Immediately after signup
2. **Day 2 reminder** - 24 hours after signup
3. **Week 1 progress** - 7 days after signup

## Prerequisites

### 1. Resend Account
1. Sign up at https://resend.com
2. Verify your sending domain (or use their test domain)
3. Get your API key

### 2. Environment Variables

Add to `.env.local`:

```bash
# Resend API
RESEND_API_KEY=re_...your_api_key

# Cron job authentication
CRON_SECRET=your_random_secret_string

# Unsubscribe security
UNSUBSCRIBE_SECRET=your_random_secret_string

# App URL (for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or your production URL
```

## Resend Configuration

### Domain Verification

**For Production:**
1. Go to Resend Dashboard > Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `keepstrong.app`)
4. Add the provided DNS records to your domain:
   - TXT record for domain verification
   - MX records for receiving emails
   - DKIM records for authentication
5. Verify DNS propagation (can take up to 48 hours)

**For Development:**
You can use Resend's test domain:
- From: `onboarding@resend.dev`
- Sends to your verified email addresses only

### Update Sender Email

Edit `/lib/email/client.ts`:

```typescript
export const SENDER_EMAIL = 'hello@yourdomain.com'; // Your verified domain
export const SENDER_NAME = 'KeepStrong Team';
```

## Email Templates

### Welcome Email
- **Trigger**: Immediately after signup
- **Subject**: "Welcome to KeepStrong! Here's what to do first"
- **Content**: Onboarding steps with CTA to complete profile

### Day 2 Reminder
- **Trigger**: 24 hours after signup (via daily cron)
- **Subject**: "Did you log your protein today?"
- **Content**: Protein target reminder with quick tip

### Week 1 Progress
- **Trigger**: 7 days after signup (via weekly cron)
- **Subject**: "Your first week progress 📊"
- **Content**: Stats summary with encouragement

## Triggering Emails

### Manual Trigger (Welcome Email)

In your signup success handler:

```typescript
import { sendWelcomeEmail } from '@/lib/email/triggers';

// After successful signup
const { data: { user } } = await supabase.auth.signUp({ email, password });

if (user) {
  // Send welcome email (non-blocking)
  sendWelcomeEmail(user.id);
}
```

### Automated via Cron Jobs

The system uses Vercel Cron Jobs (configured in `vercel.json`):

**Daily Cron** (`/api/emails/cron/daily`)
- Schedule: Every day at 9:00 AM UTC
- Finds users who signed up 24 hours ago
- Sends Day 2 reminders

**Weekly Cron** (`/api/emails/cron/weekly`)
- Schedule: Every Sunday at 9:00 AM UTC
- Finds users who signed up 7 days ago
- Sends Week 1 progress summaries

### Vercel Cron Configuration

The `vercel.json` file configures automatic cron jobs:

```json
{
  "crons": [
    {
      "path": "/api/emails/cron/daily",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/emails/cron/weekly",
      "schedule": "0 9 * * 0"
    }
  ]
}
```

Cron schedule format: `minute hour day month weekday`
- Daily: `0 9 * * *` = 9:00 AM every day
- Weekly: `0 9 * * 0` = 9:00 AM every Sunday

## Security

### Cron Job Authentication

Cron endpoints require authentication via Bearer token:

```typescript
// In cron route
const authHeader = request.headers.get('authorization');
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

Vercel automatically includes this header for configured cron jobs.

### Unsubscribe Token

Unsubscribe links include a signed token:

```typescript
const token = Buffer.from(
  `${userId}:${process.env.UNSUBSCRIBE_SECRET}`
).toString('base64');
```

**Note**: In production, use HMAC or JWT for stronger security.

## Unsubscribe Functionality

### How It Works

1. Every email includes an unsubscribe link at the bottom
2. Link format: `/api/emails/unsubscribe?userId=...&token=...`
3. Token is verified before unsubscribing
4. User sees confirmation page

### Database Field (To Add)

Add to profiles table:

```sql
ALTER TABLE public.profiles 
  ADD COLUMN email_notifications_enabled BOOLEAN DEFAULT true;
```

Update your email sending logic to check this field before sending.

### In Settings Page

Add toggle for email notifications:

```typescript
<label>
  <input
    type="checkbox"
    checked={emailNotificationsEnabled}
    onChange={handleToggleEmailNotifications}
  />
  Receive email notifications
</label>
```

## Testing

### Test in Development

1. **Use Resend test mode**:
   - Emails only send to verified addresses
   - Add your email in Resend Dashboard > Settings

2. **Test welcome email**:
   ```bash
   curl -X POST http://localhost:3000/api/emails/send \
     -H "Content-Type: application/json" \
     -d '{"type":"welcome","userId":"your-user-id"}'
   ```

3. **Test cron jobs locally**:
   ```bash
   curl http://localhost:3000/api/emails/cron/daily \
     -H "Authorization: Bearer your_cron_secret"
   ```

### Preview Templates

Use React Email's preview tool:

```bash
npx react-email dev
```

Opens at `http://localhost:3000` (or next available port)

## Monitoring

### Resend Dashboard

Monitor email delivery:
- Dashboard > Emails
- See sent, delivered, bounced, complained
- Click individual emails for details

### Logs

Check Vercel logs:
- Vercel Dashboard > Your Project > Logs
- Filter by function: `/api/emails/*`
- Check for errors in cron jobs

### Webhook (Optional)

Set up Resend webhooks for real-time updates:
1. Resend Dashboard > Webhooks
2. Add endpoint: `https://yourdomain.com/api/emails/webhook`
3. Select events: delivered, bounced, complained
4. Handle in `/app/api/emails/webhook/route.ts`

## Customization

### Add New Email Type

1. **Create template** in `/lib/email/templates.tsx`:
```typescript
export const NewEmail = ({ name, data }: Props) => (
  <Html>
    {/* Your template */}
  </Html>
);
```

2. **Add to send route** in `/app/api/emails/send/route.ts`:
```typescript
case 'new_email':
  emailHtml = render(NewEmail({ name, data }));
  subject = 'Your subject';
  break;
```

3. **Create trigger** in `/lib/email/triggers.ts`:
```typescript
export async function sendNewEmail(userId: string) {
  // Call API
}
```

### Modify Send Schedule

Edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/emails/cron/daily",
      "schedule": "0 8 * * *"  // 8:00 AM instead of 9:00 AM
    }
  ]
}
```

## Best Practices

1. **Don't block user flows**: Email failures shouldn't prevent signup
2. **Rate limiting**: Resend has limits (3,000 emails/month on free tier)
3. **Personalization**: Always use user's name and relevant data
4. **Mobile optimization**: All templates are mobile-responsive
5. **Unsubscribe link**: Required by law (CAN-SPAM, GDPR)
6. **Test before production**: Use Resend test mode extensively

## Troubleshooting

### Emails not sending

**Check:**
- [ ] `RESEND_API_KEY` is set correctly
- [ ] Sender domain is verified (or using test domain)
- [ ] User email exists in database
- [ ] Check Resend Dashboard > Logs for errors

### Cron jobs not running

**Check:**
- [ ] Deployed to Vercel (cron only works in production)
- [ ] `vercel.json` is committed to repository
- [ ] Check Vercel Dashboard > Settings > Cron Jobs
- [ ] `CRON_SECRET` is set in Vercel environment variables

### Unsubscribe not working

**Check:**
- [ ] `UNSUBSCRIBE_SECRET` is set
- [ ] Token generation matches verification logic
- [ ] User ID is valid UUID

## Costs

### Resend Pricing
- **Free tier**: 3,000 emails/month, 100 emails/day
- **Paid**: $20/month for 50,000 emails

### Vercel Pricing
- Cron jobs are free on Pro plan ($20/month)
- Hobby plan: Deploy manually or use external cron

## Going to Production

1. **Verify domain** in Resend
2. **Update sender email** in code
3. **Set environment variables** in Vercel
4. **Deploy to Vercel**
5. **Verify cron jobs** in Vercel Dashboard
6. **Test with real emails**
7. **Monitor delivery rates**

## Support

- Resend Docs: https://resend.com/docs
- React Email: https://react.email/docs
- Vercel Cron: https://vercel.com/docs/cron-jobs

