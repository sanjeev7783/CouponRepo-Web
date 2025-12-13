# Supabase OTP Email Configuration

To enable OTP (One-Time Password) authentication instead of magic links, you need to configure your Supabase project:

## Steps to Configure OTP in Supabase Dashboard:

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **Authentication** → **Email Templates**
4. Select **"Magic Link"** template
5. Change the email template to show the OTP token instead of a magic link

### Custom OTP Email Template:

Replace the default magic link template with this OTP template:

\`\`\`html
<h2>Your OTP Code</h2>
<p>Enter this code to log in:</p>
<h1 style="font-size: 32px; font-weight: bold; margin: 20px 0;">{{ .Token }}</h1>
<p>This code will expire in 60 minutes.</p>
<p>If you didn't request this code, please ignore this email.</p>
\`\`\`

## Alternative: Use the Current Setup

The current implementation works with Supabase's default OTP system:

1. User enters email → Supabase sends email with 6-digit code
2. User enters the 6-digit code
3. System verifies and logs them in

**Note:** The email template in Supabase should display the token/OTP prominently. By default, Supabase sends a 6-digit code when using `signInWithOtp()`, but the email template might be configured to show a magic link button instead.

## Quick Fix:

If you're still getting magic links, go to:
- Dashboard → Authentication → Email Templates → Confirm signup
- Update template to show: `{{ .Token }}` or `{{ .TokenHash }}`
