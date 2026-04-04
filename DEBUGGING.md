# 🔧 Transcription Debugging Guide

## Setup Complete ✅

I've added your Groq API key to the environment and improved the logging. Here's what to do next:

## Step 1: Restart Everything

Since you're running this in Figma Make, the edge function server needs to be restarted to pick up the new environment variable.

**In Figma Make:**
1. Stop the preview (if running)
2. Close and reopen the project
3. Start the preview again

**Or if you have access to the terminal:**
```bash
# Stop any running processes (Ctrl+C)
# Then restart
pnpm dev
```

## Step 2: Test the API Configuration

1. Open the app in your browser
2. **Open browser console (F12)** - IMPORTANT!
3. Go to the Meetings page
4. You should see a log like: `🏥 Health check result: { configured: true, service: 'groq-whisper', ... }`

If you see `configured: false`, the environment variable isn't being picked up yet.

## Step 3: Record a Tab with Audio

1. Click **"Record Audio"**
2. Select **"Browser Tab"**
3. Click **"Start Recording"**
4. In the tab picker:
   - Select a tab that's PLAYING AUDIO (YouTube, etc.)
   - ✅ **CHECK "Share tab audio"** - this is critical!
5. Let it record for 10-15 seconds while audio is playing
6. Click **"Stop Recording"**

## Step 4: Watch the Console Logs

You should see logs like this:

```
🛑 Stopping recording...
📊 Audio blob details: { size: "0.5 MB", type: "audio/webm", chunks: 15, groqConfigured: false }
🔍 Groq configuration check: true
🎯 Using Groq Whisper API for transcription
🎯 Starting Groq transcription... { size: "0.5 MB", type: "audio/webm" }
📤 Sending request to /make-server-af44c8dd/api/transcribe...
📥 Response status: 200 OK
✅ Groq transcription complete: { length: 245, duration: 15.2, language: "en", preview: "..." }
```

## Common Issues & Fixes

### Issue 1: "No speech detected"
**Symptoms:** Transcript shows "[No speech detected during recording.]"

**Fixes:**
- ✅ Make sure audio is PLAYING in the tab you're recording
- ✅ Check "Share tab audio" in the picker
- ✅ Use Chrome or Edge (best support)
- ✅ Test with YouTube or a video that has clear speech

### Issue 2: Empty audio blob
**Symptoms:** Console shows `size: "0.00 MB"` or `chunks: 0`

**Fixes:**
- ✅ The tab must be actively playing audio
- ✅ "Share tab audio" must be checked
- ✅ Don't minimize or switch away from the recording

### Issue 3: Groq not configured
**Symptoms:** Console shows `configured: false` or falls back to local Whisper

**Fixes:**
- ✅ Make sure you restarted the server after adding the API key
- ✅ Check that `supabase/.env` file exists and contains the key
- ✅ The key should start with `gsk_`

### Issue 4: API error responses
**Symptoms:** Console shows "Transcription API error" or 401/403 errors

**Fixes:**
- ✅ Verify the API key is correct (no extra spaces)
- ✅ Test the key at https://console.groq.com/
- ✅ Check if you've exceeded rate limits (unlikely with free tier)

## Detailed Logging

I've added comprehensive logging throughout the transcription flow:

1. **Audio blob details** - Size, type, chunks
2. **Configuration check** - Is Groq configured?
3. **API request/response** - Status codes, errors
4. **Transcription result** - Length, preview, duration
5. **Error details** - Full error messages

All logs are prefixed with emojis for easy scanning:
- 🎯 = Action starting
- ✅ = Success
- ❌ = Error
- ⚠️ = Warning
- 📊 = Data/stats
- 🔍 = Checking/investigating

## Quick Test

Want to quickly test if Groq is working?

1. Open browser console (F12)
2. Paste this:
```javascript
fetch('/make-server-af44c8dd/api/transcribe/health')
  .then(r => r.json())
  .then(d => console.log('Groq status:', d))
```

You should see:
```javascript
Groq status: { configured: true, service: 'groq-whisper', model: 'whisper-large-v3-turbo' }
```

## What Changed

I've enhanced the code with:

1. ✅ **Live configuration check** - Checks Groq status before each transcription
2. ✅ **Detailed logging** - Every step is logged with emojis
3. ✅ **Better error messages** - Specific errors for common issues
4. ✅ **Audio validation** - Checks if audio blob is valid
5. ✅ **Empty transcript detection** - Warns if transcription is empty

## Next Steps

1. **Restart the server** to load the new API key
2. **Test with a tab playing audio** (YouTube video with speech)
3. **Watch the console** for detailed logs
4. **Share the console output** if you still have issues

The key is making sure:
- ✅ Audio is actually playing in the tab
- ✅ "Share tab audio" is checked
- ✅ Server has been restarted with the new API key

## Your Groq API Key

I've added this key to `supabase/.env`:
```
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
```

**After you restart the server, this should work perfectly!**

---

Try recording a YouTube video with clear speech and let me know what you see in the console. The detailed logs will tell us exactly what's happening.
