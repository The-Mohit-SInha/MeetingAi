# 🚀 Supabase Edge Function Deployment Guide

## ✅ What's Ready

Your Supabase Edge Function for Groq transcription is fully configured and ready to deploy!

**Function location:** `/supabase/functions/transcribe/index.ts`
**Groq API Key:** `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`

## 🔧 Deployment Options

### Option 1: Deploy via Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard:**
   - Navigate to https://supabase.com/dashboard/project/qjrmxudyrwcqwpkmrggn

2. **Set the Environment Secret:**
   - Go to **Settings** → **Edge Functions** → **Secrets**
   - Click **Add Secret**
   - Name: `GROQ_API_KEY`
   - Value: `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`
   - Click **Save**

3. **Deploy the Function:**
   - Go to **Edge Functions** in the left sidebar
   - Click **Deploy new function**
   - Name it: `transcribe`
   - Copy and paste the content from `/supabase/functions/transcribe/index.ts`
   - Click **Deploy**

### Option 2: Deploy via CLI (From Your Local Machine)

If you're running this on your local machine (not in this sandbox):

```bash
# 1. Install Supabase CLI globally
npm install -g supabase

# 2. Login to Supabase (opens browser)
supabase login

# 3. Link to your project
cd /path/to/your/project
supabase link --project-ref qjrmxudyrwcqwpkmrggn

# 4. Set the API key as a secret
supabase secrets set GROQ_API_KEY=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

# 5. Deploy the transcribe function
supabase functions deploy transcribe
```

### Option 3: Deploy via GitHub Actions (Automated)

If you want automated deployments:

1. **Add GitHub Secret:**
   - Go to your GitHub repository settings
   - Add secret: `SUPABASE_ACCESS_TOKEN` (get from https://supabase.com/dashboard/account/tokens)
   - Add secret: `GROQ_API_KEY` with the value

2. **Create `.github/workflows/deploy.yml`:**
```yaml
name: Deploy Supabase Functions

on:
  push:
    branches: [main]
    paths:
      - 'supabase/functions/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Set secrets
        run: |
          supabase secrets set GROQ_API_KEY=${{ secrets.GROQ_API_KEY }} --project-ref qjrmxudyrwcqwpkmrggn
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Deploy function
        run: supabase functions deploy transcribe --project-ref qjrmxudyrwcqwpkmrggn
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

## 🧪 Verify Deployment

After deployment, test the function:

```bash
# Test health endpoint
curl https://qjrmxudyrwcqwpkmrggn.supabase.co/functions/v1/transcribe/health
```

Expected response:
```json
{
  "configured": true,
  "service": "groq-whisper",
  "model": "whisper-large-v3-turbo"
}
```

## 🎯 What Happens After Deployment

Once deployed:

1. **The test panel in your app will show:**
   - ✅ Health Check: Groq API is configured (whisper-large-v3-turbo)

2. **Recording tab audio will:**
   - Capture audio from browser tabs
   - Send to Supabase Edge Function
   - Edge function forwards to Groq API
   - Returns high-quality transcript
   - Meeting saved with transcript + AI analysis

3. **Your app will automatically:**
   - Detect Groq is configured
   - Use Groq for all tab transcriptions
   - Fall back to local Whisper if Groq fails

## 📊 Monitoring

After deployment, you can monitor:

- **Function Logs:** Supabase Dashboard → Edge Functions → transcribe → Logs
- **Invocations:** See request counts and errors
- **Secrets:** Manage environment variables

## 🔒 Security Notes

- ✅ API key is stored securely in Supabase (never exposed to client)
- ✅ Edge function runs on Supabase's secure infrastructure
- ✅ CORS is properly configured for your frontend
- ✅ All requests are logged for monitoring

## 🐛 Troubleshooting

**If health check returns `configured: false`:**
- Make sure you set the secret: `GROQ_API_KEY`
- The secret must be set BEFORE deploying the function
- Redeploy the function after setting the secret

**If deployment fails:**
- Check that the function name is exactly `transcribe`
- Verify your Supabase project ref is correct
- Make sure you're logged in: `supabase login`

**If transcription fails:**
- Check Edge Function logs in Supabase dashboard
- Verify the Groq API key is valid
- Test the key directly at https://console.groq.com/

## 🎉 Next Steps

1. **Deploy using Option 1 above** (Supabase Dashboard is easiest)
2. **Test the health endpoint** to confirm it's working
3. **Try recording audio** in your app
4. **Check the browser console** for detailed logs
5. **Monitor the Edge Function logs** in Supabase dashboard

---

**Once deployed, your transcription system will be fully operational!** 🚀

The app will automatically detect when Groq is available and use it for all tab audio transcriptions.
