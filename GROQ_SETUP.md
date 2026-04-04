# Groq Transcription Setup

This app uses **Groq's free Whisper API** for high-quality audio transcription of tab recordings. Groq provides excellent transcription quality with generous free tier limits.

## Why Groq?

- ✅ **Completely free tier** with generous limits
- ✅ **Fast and accurate** transcription using Whisper Large V3 Turbo
- ✅ **Easy to set up** - just one API key
- ✅ **14,400 requests per day** on free tier
- ✅ **25MB audio file size limit**

## Setup Instructions

### 1. Get Your Free Groq API Key

1. Go to [https://console.groq.com/](https://console.groq.com/)
2. Sign up for a free account (no credit card required)
3. Navigate to **API Keys** in the dashboard
4. Click **Create API Key**
5. Copy your API key (starts with `gsk_...`)

### 2. Add API Key to Your Project

#### Option A: Using Supabase CLI (Recommended)

If you're running the app locally with Supabase:

```bash
# Set the environment variable for your edge functions
supabase secrets set GROQ_API_KEY=your_api_key_here
```

#### Option B: Manual Configuration

1. Create or edit the file: `supabase/.env.local`
2. Add this line:
   ```
   GROQ_API_KEY=your_api_key_here
   ```
3. Restart your Supabase local development server

#### Option C: Production Deployment

If you're deploying to Supabase Cloud:

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Edge Functions**
3. Add a new secret:
   - Name: `GROQ_API_KEY`
   - Value: `your_api_key_here`

### 3. Verify Setup

1. Start your app
2. Open the browser console (F12)
3. The app will automatically check if Groq is configured
4. Look for one of these messages:
   - ✅ **"Using Groq Whisper API for transcription"** - Setup successful!
   - ⚠️ **"Groq not configured, falling back to local Whisper"** - API key not configured

## How It Works

### Recording Modes

1. **Microphone Mode**:
   - Uses Web Speech API for real-time transcription
   - Works instantly, no API calls needed
   - Best for voice recordings

2. **Tab Audio Mode**:
   - Captures audio from browser tabs (Google Meet, Zoom, etc.)
   - Sends audio to Groq API for transcription after recording
   - High-quality transcription with Whisper Large V3 Turbo
   - Falls back to local browser-based Whisper if Groq is unavailable

### Fallback Behavior

If Groq API is not configured or fails:
- The app automatically falls back to local browser-based transcription
- Uses Transformers.js with Whisper Tiny model
- Runs entirely in your browser (no external API calls)
- Lower quality but works offline

## Free Tier Limits

Groq's free tier includes:

- **14,400 requests per day** (one request per recording)
- **30 requests per minute**
- **25 MB audio file size limit**

This is more than enough for daily meeting transcription needs!

## Troubleshooting

### "Groq API key not configured"

- Make sure you added the API key using one of the methods above
- Restart your development server after adding the key
- Check that the key starts with `gsk_`

### "Audio file too large"

- Groq has a 25MB limit per file
- For longer recordings, the audio is automatically chunked
- If you encounter this error, try recording shorter sessions

### Transcription is slow

- First transcription may take a few seconds
- Subsequent transcriptions are faster
- Check your internet connection
- Groq API is typically very fast (< 5 seconds for most recordings)

### Rate limit errors

- Free tier allows 30 requests/minute
- If you're transcribing many recordings quickly, wait a minute between batches
- The app automatically handles rate limiting with 100ms delays between chunks

## Cost Comparison

| Service | Free Tier | Quality | Speed |
|---------|-----------|---------|-------|
| **Groq** | 14,400/day | Excellent | Very Fast |
| AssemblyAI | 5 hours/month | Excellent | Fast |
| Deepgram | $200 credit | Excellent | Fast |
| OpenAI Whisper | Paid only | Excellent | Medium |
| Local Browser | Unlimited | Good | Medium |

**Groq is the best choice for this app** - free, fast, and excellent quality!

## Need Help?

- **Groq Documentation**: [https://console.groq.com/docs](https://console.groq.com/docs)
- **Groq Support**: Available through their console
- **This App**: Check the browser console for detailed transcription logs

---

**Pro Tip**: Keep your API key secure! Don't commit it to version control. Use environment variables as shown above.
