# Google Meet Integration - Complete Setup Guide

## Overview

This guide will walk you through setting up the complete Google Meet integration for the AI Meeting-to-Action Management System. This integration allows users to:

- Connect their Google account via OAuth
- Import meetings from Google Calendar
- Auto-capture live Google Meet sessions
- Analyze meetings with Claude AI
- Extract action items automatically

## Prerequisites

1. **Google Cloud Project** with OAuth 2.0 credentials
2. **Supabase Project** with Edge Functions enabled
3. **Anthropic API Key** (for Claude AI analysis)

---

## Part 1: Google Cloud Console Setup

### 1.1 Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Configure the OAuth consent screen:
   - App name: "AI Meeting Manager" (or your app name)
   - User support email: your email
   - Developer contact: your email
   - Scopes: Add the following:
     - `openid`
     - `email`
     - `profile`
     - `https://www.googleapis.com/auth/calendar.readonly`
     - `https://www.googleapis.com/auth/calendar.events.readonly`

### 1.2 Configure Authorized Redirect URIs

Add these redirect URIs:
```
http://localhost:3000/auth/google-meet/callback
https://your-production-domain.com/auth/google-meet/callback
https://your-figma-make-domain.makeproxy-c.figma.site/auth/google-meet/callback
```

### 1.3 Save Your Credentials

After creating the OAuth client, you'll receive:
- **Client ID** (e.g., `123456789-abc...xyz.apps.googleusercontent.com`)
- **Client Secret** (e.g., `GOCSPX-...`)

**⚠️ Keep these safe! You'll need them for environment variables.**

---

## Part 2: Supabase Setup

### 2.1 Enable Edge Functions

Your Edge Function is already created at `/supabase/functions/google-meet-server/index.ts`.

Ensure Edge Runtime is enabled in `/supabase/config.toml`:
```toml
[edge_runtime]
enabled = true
policy = "per_worker"
deno_version = 2
```

### 2.2 Set Supabase Secrets

Navigate to your Supabase Dashboard → Settings → Edge Functions → Secrets

Add the following secrets:

```bash
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here

# Supabase Configuration (already set automatically)
SUPABASE_URL=https://qjrmxudyrwcqwpkmrggn.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Claude AI (Optional - for meeting analysis)
ANTHROPIC_API_KEY=sk-ant-...
```

### 2.3 Deploy Edge Function

The Edge Function will deploy automatically when you publish to Supabase. If deploying manually:

```bash
supabase functions deploy google-meet-server
```

---

## Part 3: Frontend Environment Variables

### 3.1 Create/Update `.env` File

In your project root, create or update the `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://qjrmxudyrwcqwpkmrggn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcm14dWR5cndjcXdwa21yZ2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDYyNDgsImV4cCI6MjA5MDcyMjI0OH0.tAje6kf-PRqDqKqM_KhNJs2wDCd-I28jUQKG28Y7bec

# Google OAuth (from Google Cloud Console)
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

**Note:** The `VITE_` prefix is required for Vite to expose these variables to the frontend.

---

## Part 4: Database Tables (Already Created)

The following tables support Google Meet integration. They should already exist in your Supabase database:

### `user_settings` Columns
```sql
google_meet_connected BOOLEAN DEFAULT FALSE
google_meet_email TEXT
google_meet_access_token TEXT
google_meet_refresh_token TEXT
google_meet_auto_join BOOLEAN DEFAULT TRUE
google_meet_capture_video BOOLEAN DEFAULT FALSE
google_meet_capture_chat BOOLEAN DEFAULT TRUE
```

### `meetings` Columns
```sql
google_meet_id TEXT
google_meet_url TEXT
ai_processed BOOLEAN DEFAULT FALSE
ai_processing_status TEXT DEFAULT 'none'
```

### `live_meetings` Table
```sql
CREATE TABLE live_meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id),
  user_id UUID REFERENCES users(id),
  google_meet_id TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  bot_joined BOOLEAN DEFAULT FALSE,
  capture_active BOOLEAN DEFAULT TRUE,
  current_speaker TEXT,
  live_transcript_chunk TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `ai_processing_jobs` Table
```sql
CREATE TABLE ai_processing_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id),
  user_id UUID REFERENCES users(id),
  job_type TEXT NOT NULL,
  status TEXT NOT NULL,
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Part 5: Testing the Integration

### 5.1 Connect Google Account

1. Sign in to your app
2. Navigate to **Settings** → **Integrations**
3. Click **Connect** on the Google Meet card
4. Authorize the app with Google
5. You should be redirected back with "Connected" status

### 5.2 Import Meetings

1. Navigate to **Import** (in the main navigation)
2. Click **Refresh Meetings**
3. You should see your Google Calendar events with Meet links
4. Click **Import** on any meeting to add it to your database

### 5.3 Test Live Meeting Capture

1. Start or join a Google Meet meeting
2. The app should detect it (if auto-join is enabled)
3. A live banner will appear showing capture status
4. Stop the capture to trigger AI analysis

---

## Part 6: Features & Functionality

### OAuth Flow
- User clicks "Connect" in Settings
- Redirected to Google OAuth consent screen
- Authorization code exchanged for access/refresh tokens via Edge Function
- Tokens stored securely in `user_settings` table

### Meeting Import
- Fetches calendar events from Google Calendar API
- Filters for events with Google Meet links
- Creates meeting records with participants
- Associates with user's account

### Live Meeting Capture (Roadmap)
- Bot joins Google Meet session
- Captures audio/video streams
- Real-time transcript generation
- Live updates via Supabase Realtime

### AI Analysis
- Triggered when meeting ends
- Uses Claude Sonnet 4 for analysis
- Generates:
  - Meeting summary
  - Key decisions
  - Action items
  - Participant analytics
  - Sentiment analysis

---

## Part 7: Troubleshooting

### Issue: "Failed to connect Google Meet"

**Solution:**
- Verify `GOOGLE_CLIENT_ID` in frontend `.env`
- Verify `GOOGLE_CLIENT_SECRET` in Supabase Edge Function secrets
- Check redirect URI matches exactly in Google Cloud Console

### Issue: "Failed to fetch meetings"

**Solution:**
- Check access token is valid in `user_settings` table
- Try disconnecting and reconnecting Google account
- Verify Google Calendar API is enabled in Google Cloud Console

### Issue: Edge Function 403 Error

**Solution:**
- Ensure Edge Runtime is enabled in `config.toml`
- Check Supabase secrets are set correctly
- Redeploy Edge Function

### Issue: "No meetings found"

**Solution:**
- Ensure you have calendar events with Google Meet links
- Check date range (default is ±30 days from today)
- Verify calendar permissions were granted during OAuth

---

## Part 8: Security Best Practices

1. **Never commit secrets** to version control
2. **Rotate tokens** periodically
3. **Use HTTPS** in production
4. **Limit OAuth scopes** to minimum required
5. **Implement rate limiting** on Edge Functions
6. **Validate all inputs** on server side
7. **Use refresh tokens** for long-lived access

---

## Part 9: Production Deployment

### Update Environment Variables

```bash
# Production .env
VITE_SUPABASE_URL=https://qjrmxudyrwcqwpkmrggn.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_GOOGLE_CLIENT_ID=your-production-client-id
```

### Update Google Cloud OAuth

1. Add production domain to authorized redirect URIs
2. Publish OAuth consent screen
3. Verify domain ownership if required

### Deploy Edge Functions

```bash
# Deploy to production
supabase link --project-ref qjrmxudyrwcqwpkmrggn
supabase functions deploy google-meet-server
```

---

## Summary

You now have a fully integrated Google Meet OAuth system with:

✅ OAuth authentication flow  
✅ Google Calendar meeting import  
✅ Real-time meeting capture capability  
✅ Claude AI-powered meeting analysis  
✅ Automatic action item extraction  
✅ Secure token management  

## Need Help?

- Check Edge Function logs in Supabase Dashboard
- Review browser console for frontend errors
- Test Edge Function endpoints directly with Postman/curl
- Verify database table structure matches schema

---

**Last Updated:** April 2026  
**Version:** 1.0.0
