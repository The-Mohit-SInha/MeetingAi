# Groq API Setup - Deployment Instructions

## ✅ What I've Done

1. **Created Supabase Edge Function** at `/supabase/functions/transcribe/index.ts`
   - Provides health check endpoint
   - Securely proxies transcription requests to Groq API
   - Keeps API key on backend (never exposed to client)

2. **Added API Key** to `/supabase/.env`
   - `GROQ_API_KEY=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`

3. **Updated Client Code** to use Supabase Functions
   - Changed from `/make-server-af44c8dd` to `https://qjrmxudyrwcqwpkmrggn.supabase.co/functions/v1/transcribe`
   - Health check now properly queries backend

## 🚀 To Deploy (Run These Commands)

```bash
# 1. Install Supabase CLI if not already installed
npm install -g supabase

# 2. Login to Supabase
supabase login

# 3. Link to your project
supabase link --project-ref qjrmxudyrwcqwpkmrggn

# 4. Set the secret on Supabase (do NOT use .env file in production)
supabase secrets set GROQ_API_KEY=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

# 5. Deploy the function
supabase functions deploy transcribe
```

## 🧪 Testing

After deployment, the health check should return:
```json
{
  "configured": true,
  "service": "groq-whisper",
  "model": "whisper-large-v3-turbo"
}
```

Test it:
```bash
curl https://qjrmxudyrwcqwpkmrggn.supabase.co/functions/v1/transcribe/health
```

## 📝 What This Enables

- ✅ High-quality transcription using Groq's Whisper API
- ✅ Fast processing (whisper-large-v3-turbo)
- ✅ Secure API key management (never exposed to client)
- ✅ Free tier: 14,400 requests/day, 30 requests/minute

## ⚠️ Important Notes

- The `.env` file is for local development only
- Production uses Supabase Secrets (set with `supabase secrets set`)
- Edge function handles CORS automatically
- Microphone recording still works as fallback if this fails
