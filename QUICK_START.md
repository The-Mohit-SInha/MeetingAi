# Google Meet Integration - Quick Start

## 🚀 5-Minute Setup Guide

Follow these steps to get your Google Meet integration up and running quickly.

---

## Step 1: Get Google OAuth Credentials (5 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable these APIs:
   - Google Calendar API
   - Google+ API (for user info)
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Add authorized redirect URIs:
   ```
   http://localhost:3000/auth/google-meet/callback
   YOUR_PRODUCTION_URL/auth/google-meet/callback
   ```
7. Copy your **Client ID** and **Client Secret**

---

## Step 2: Configure Environment Variables

### Frontend (.env file):
```env
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
```

### Supabase Edge Function Secrets:
Go to Supabase Dashboard → Settings → Edge Functions → Secrets

```bash
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
```

---

## Step 3: Deploy Edge Function

The Edge Function is already created. Just deploy it:

1. Go to your Supabase Dashboard
2. Navigate to Edge Functions
3. Find `google-meet-server`
4. Click **Deploy**

Or use CLI:
```bash
supabase functions deploy google-meet-server
```

---

## Step 4: Test the Integration

### 4.1 Connect Your Google Account
1. Sign in to your app
2. Go to **Settings** → **Integrations**
3. Click **Connect** on the Google Meet card
4. Authorize with Google
5. ✅ You should see "Connected" status

### 4.2 Import Your First Meeting
1. Click **Import** in the navigation
2. Click **Refresh Meetings**
3. Select a meeting and click **Import**
4. ✅ Meeting should appear in your Meetings list

### 4.3 Optional: Add AI Analysis
Add Anthropic API key to Supabase secrets:
```bash
ANTHROPIC_API_KEY=sk-ant-...
```

Then trigger AI analysis on imported meetings.

---

## Troubleshooting

### "Failed to connect"
- ✅ Check `GOOGLE_CLIENT_ID` in frontend `.env`
- ✅ Check `GOOGLE_CLIENT_SECRET` in Supabase secrets
- ✅ Verify redirect URI matches exactly

### "No meetings found"
- ✅ Make sure you have Google Calendar events with Meet links
- ✅ Events must be within ±30 days from today
- ✅ Disconnect and reconnect if needed

### Edge Function not working
- ✅ Ensure Edge Runtime is enabled in `config.toml`
- ✅ Redeploy the Edge Function
- ✅ Check Supabase Function logs for errors

---

## What's Next?

1. **Explore Features:**
   - Import multiple meetings
   - View meeting details
   - Check participant analytics
   - Review AI-generated action items

2. **Customize Settings:**
   - Auto-join meetings toggle
   - Video/chat capture preferences
   - Notification settings

3. **Share Feedback:**
   - Test all workflows
   - Report any issues
   - Suggest improvements

---

## Support

- 📖 Full Setup Guide: `GOOGLE_MEET_SETUP_GUIDE.md`
- 📋 Implementation Details: `IMPLEMENTATION_SUMMARY.md`
- 🐛 Issues: Check Edge Function logs in Supabase Dashboard

---

**You're all set!** 🎉

Start importing meetings and let the AI handle the rest.
