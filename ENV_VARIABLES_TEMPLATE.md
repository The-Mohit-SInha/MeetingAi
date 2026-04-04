# Environment Variables Template

This document lists all required and optional environment variables for the Google Meet integration.

---

## Frontend Environment Variables

### File: `.env` (in project root)

```env
# ============================================================================
# SUPABASE CONFIGURATION (Required)
# ============================================================================
# Your Supabase project URL
VITE_SUPABASE_URL=https://qjrmxudyrwcqwpkmrggn.supabase.co

# Your Supabase anonymous (public) key
# This is safe to expose in frontend code
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcm14dWR5cndjcXdwa21yZ2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDYyNDgsImV4cCI6MjA5MDcyMjI0OH0.tAje6kf-PRqDqKqM_KhNJs2wDCd-I28jUQKG28Y7bec

# ============================================================================
# GOOGLE OAUTH CONFIGURATION (Required for Google Meet Integration)
# ============================================================================
# Your Google OAuth 2.0 Client ID
# Get this from Google Cloud Console → APIs & Services → Credentials
# Example format: 123456789-abcdefghijk.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=

# ============================================================================
# NOTES
# ============================================================================
# - The VITE_ prefix is required for Vite to expose these variables to the browser
# - Never commit this file to version control (.env should be in .gitignore)
# - For production, update these values with your production credentials
# - Google Client Secret is NOT needed in frontend (it goes in Supabase secrets)
```

---

## Backend Environment Variables (Supabase Edge Function Secrets)

### Set in: Supabase Dashboard → Settings → Edge Functions → Secrets

```bash
# ============================================================================
# GOOGLE OAUTH CREDENTIALS (Required)
# ============================================================================
# Your Google OAuth 2.0 Client ID
# Same as VITE_GOOGLE_CLIENT_ID in frontend
GOOGLE_CLIENT_ID=123456789-abcdefghijk.apps.googleusercontent.com

# Your Google OAuth 2.0 Client Secret
# Get this from Google Cloud Console → APIs & Services → Credentials
# Example format: GOCSPX-xxxxxxxxxxxxxxxxxxxxx
# ⚠️ NEVER expose this in frontend code!
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxx

# ============================================================================
# SUPABASE CONFIGURATION (Required - Usually Set Automatically)
# ============================================================================
# Your Supabase project URL
SUPABASE_URL=https://qjrmxudyrwcqwpkmrggn.supabase.co

# Your Supabase service role key (admin access)
# Find in: Supabase Dashboard → Settings → API → service_role key
# ⚠️ NEVER expose this in frontend code!
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ============================================================================
# AI ANALYSIS (Optional - Required for Claude AI Meeting Analysis)
# ============================================================================
# Anthropic API key for Claude AI
# Get from: https://console.anthropic.com/
# Example format: sk-ant-xxxxxxxxxxxxxxxxxxxxx
# If not set, AI analysis features will be disabled
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx

# ============================================================================
# NOTES
# ============================================================================
# - These are server-side secrets and should NEVER be exposed to the frontend
# - Set these in the Supabase Dashboard under Edge Functions → Secrets
# - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are usually set automatically
# - ANTHROPIC_API_KEY is optional - only needed for AI analysis features
```

---

## How to Set Environment Variables

### Frontend (.env file)

1. **Create the file:**
   ```bash
   touch .env
   ```

2. **Add variables:**
   Copy the template above and fill in your values

3. **Verify .gitignore:**
   Make sure `.env` is in your `.gitignore` file:
   ```gitignore
   # Environment variables
   .env
   .env.local
   .env.production
   ```

4. **Restart dev server:**
   ```bash
   npm run dev
   ```

### Backend (Supabase Secrets)

#### Method 1: Supabase Dashboard (Recommended)

1. Go to [your Supabase project](https://app.supabase.com/)
2. Navigate to: **Settings** → **Edge Functions**
3. Click on **Secrets** tab
4. Click **Add secret** for each variable
5. Enter name and value
6. Click **Save**

#### Method 2: Supabase CLI

```bash
# Set individual secrets
supabase secrets set GOOGLE_CLIENT_ID=your-client-id
supabase secrets set GOOGLE_CLIENT_SECRET=your-client-secret
supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxx

# List all secrets (values are hidden)
supabase secrets list

# Unset a secret
supabase secrets unset SECRET_NAME
```

---

## Obtaining Credentials

### Google OAuth Credentials

1. **Go to Google Cloud Console:**
   - https://console.cloud.google.com/

2. **Create/Select Project:**
   - Create new or select existing project

3. **Enable APIs:**
   - Google Calendar API
   - Google+ API

4. **Create OAuth Client:**
   - Navigate to: APIs & Services → Credentials
   - Click: Create Credentials → OAuth client ID
   - Application type: Web application
   - Add authorized redirect URIs:
     ```
     http://localhost:3000/auth/google-meet/callback
     https://your-domain.com/auth/google-meet/callback
     ```
   - Click **Create**

5. **Copy Credentials:**
   - **Client ID** → Use for `VITE_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID`
   - **Client Secret** → Use for `GOOGLE_CLIENT_SECRET`

### Supabase Credentials

1. **Go to Supabase Dashboard:**
   - https://app.supabase.com/

2. **Select Your Project**

3. **Get URL and Keys:**
   - Navigate to: Settings → API
   - Copy:
     - **Project URL** → `VITE_SUPABASE_URL` and `SUPABASE_URL`
     - **anon public** → `VITE_SUPABASE_ANON_KEY`
     - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### Anthropic API Key (Optional)

1. **Go to Anthropic Console:**
   - https://console.anthropic.com/

2. **Create Account / Sign In**

3. **Generate API Key:**
   - Navigate to: API Keys
   - Click: Create Key
   - Copy key → Use for `ANTHROPIC_API_KEY`

---

## Verification

### Frontend Variables

Check that variables are loaded:

```typescript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Google Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
```

**Expected Output:**
- Both should show actual values (not undefined)
- If undefined, restart dev server

### Backend Secrets

Check Edge Function logs in Supabase Dashboard:

```typescript
console.log('Google Client ID set:', !!Deno.env.get('GOOGLE_CLIENT_ID'));
console.log('Google Client Secret set:', !!Deno.env.get('GOOGLE_CLIENT_SECRET'));
```

**Expected Output:**
- Both should be `true`
- If false, secrets not set correctly

---

## Environment-Specific Configurations

### Development (.env.development)

```env
VITE_SUPABASE_URL=https://qjrmxudyrwcqwpkmrggn.supabase.co
VITE_SUPABASE_ANON_KEY=your-dev-anon-key
VITE_GOOGLE_CLIENT_ID=your-dev-client-id.apps.googleusercontent.com
```

### Production (.env.production)

```env
VITE_SUPABASE_URL=https://qjrmxudyrwcqwpkmrggn.supabase.co
VITE_SUPABASE_ANON_KEY=your-prod-anon-key
VITE_GOOGLE_CLIENT_ID=your-prod-client-id.apps.googleusercontent.com
```

**Note:** For production, also update OAuth redirect URIs in Google Cloud Console to match your production domain.

---

## Security Best Practices

### ✅ DO:
- Use environment variables for all secrets
- Add `.env` to `.gitignore`
- Use different credentials for dev/staging/production
- Rotate secrets periodically
- Use minimum required scopes for OAuth
- Set up proper CORS in production

### ❌ DON'T:
- Commit `.env` files to git
- Hardcode credentials in source code
- Share production secrets
- Use production credentials in development
- Expose service role key to frontend
- Share API keys in public forums

---

## Troubleshooting

### "Environment variable undefined"

**Frontend:**
- Ensure variable name starts with `VITE_`
- Restart dev server after adding variables
- Check `.env` file is in project root

**Backend:**
- Verify secrets set in Supabase Dashboard
- Redeploy Edge Function after setting secrets
- Check spelling of secret names

### "Invalid OAuth credentials"

- Verify Client ID matches exactly (including `.apps.googleusercontent.com`)
- Ensure Client Secret has no extra spaces
- Check credentials are from correct Google Cloud project
- Verify APIs are enabled

### "Function not finding secrets"

- Secrets only available in deployed Edge Functions
- Local development uses `supabase functions serve` with `.env.local`
- Check secrets set in correct environment (dev/staging/prod)

---

## Quick Reference

### Frontend Variables (`.env`)
| Variable | Required | Example |
|----------|----------|---------|
| `VITE_SUPABASE_URL` | ✅ Yes | `https://abc...supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | ✅ Yes | `eyJhbGci...` |
| `VITE_GOOGLE_CLIENT_ID` | ✅ Yes | `123...apps.googleusercontent.com` |

### Backend Secrets (Supabase)
| Secret | Required | Example |
|--------|----------|---------|
| `GOOGLE_CLIENT_ID` | ✅ Yes | `123...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | ✅ Yes | `GOCSPX-...` |
| `SUPABASE_URL` | ✅ Yes | `https://abc...supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | `eyJhbGci...` |
| `ANTHROPIC_API_KEY` | ⚠️ Optional | `sk-ant-...` |

---

## Next Steps

1. **Copy this template** to create your `.env` file
2. **Fill in your credentials** from Google Cloud and Supabase
3. **Set Supabase secrets** via Dashboard or CLI
4. **Restart your dev server**
5. **Test the integration** (connect Google account)

---

**Need help?** Check `GOOGLE_MEET_SETUP_GUIDE.md` for detailed setup instructions.

**All set?** Start testing with `INTEGRATION_CHECKLIST.md`!
