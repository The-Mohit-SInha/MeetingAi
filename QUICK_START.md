# 🚀 Quick Start: Audio Transcription

Get audio transcription working in **under 2 minutes**!

## ⚡ Zero-Config Mode (Works Immediately)

**No setup required!** The app works out of the box with local browser-based transcription.

1. Open the app
2. Go to **Meetings** page
3. Click **"Record Audio"**
4. Choose **"Browser Tab"** or **"Microphone"**
5. Start recording
6. Stop when done
7. **Transcript appears automatically!**

That's it! The app uses local browser-based Whisper transcription (free, no API needed).

## ⚡⚡ High-Quality Mode (2 minutes setup)

For **better transcription quality**, add a free Groq API key:

### Step 1: Get Free API Key (30 seconds)
1. Go to https://console.groq.com/
2. Sign up (no credit card)
3. Click **"API Keys"**
4. Click **"Create API Key"**
5. Copy the key (starts with `gsk_...`)

### Step 2: Add to Environment (30 seconds)

**If using Supabase CLI:**
```bash
supabase secrets set GROQ_API_KEY=gsk_your_key_here
```

**If using .env file:**
```bash
echo "GROQ_API_KEY=gsk_your_key_here" >> supabase/.env
```

### Step 3: Restart Server (30 seconds)
```bash
# Stop the dev server (Ctrl+C)
# Start it again
pnpm dev
```

### Step 4: Test It! (30 seconds)
1. Refresh the app
2. Open browser console (F12)
3. Go to Meetings → Record Audio
4. Look for: **"✅ Using Groq Whisper API"** in console

**Done!** You now have professional-grade transcription.

---

## 📊 Comparison

| Feature | Zero-Config | High-Quality |
|---------|-------------|--------------|
| Setup time | 0 seconds | 2 minutes |
| Quality | Good ★★★☆☆ | Excellent ★★★★★ |
| Speed | Medium (~30s) | Fast (~5s) |
| Cost | Free | Free |
| Works offline | ✅ Yes | ❌ No |
| API key needed | ❌ No | ✅ Yes (free) |

## 🎯 Usage Tips

### For Best Results:

1. **Browser Tab Recording**:
   - ✅ Use Chrome or Edge (best compatibility)
   - ✅ Check "Share tab audio" in the picker
   - ✅ Keep the tab active during recording
   - ✅ Close other apps to reduce CPU usage

2. **Microphone Recording**:
   - ✅ Use a quiet environment
   - ✅ Speak clearly and at normal pace
   - ✅ Position mic 6-12 inches from mouth
   - ✅ Grant microphone permission when prompted

### Recording Google Meet, Zoom, etc:

1. Start your meeting in one tab
2. Open this app in another tab
3. Click **"Record Audio"** → **"Browser Tab"**
4. Select the meeting tab
5. ✅ **Check "Share tab audio"**
6. Record the entire meeting
7. Get automatic transcript + AI summary!

## 🐛 Troubleshooting

### "No audio captured"
- **Fix**: Make sure "Share tab audio" is checked when selecting the tab

### "Share tab audio" option is missing
- **Fix**: Use Chrome or Edge browser (Firefox doesn't support this yet)

### Transcription is slow
- **Fix**: Add Groq API key for 6x faster transcription

### "Groq not configured" message
- **Fix**: Add `GROQ_API_KEY` environment variable and restart server

### Browser asks for permissions
- **Fix**: Click "Allow" - this is normal for audio/screen capture

## 📖 More Help

- **Full setup guide**: See `GROQ_SETUP.md`
- **Architecture details**: See `ARCHITECTURE.md`
- **Implementation notes**: See `TRANSCRIPTION_IMPLEMENTATION.md`

## 🎉 You're Ready!

Start recording meetings and get automatic transcripts!

Questions? Check the browser console (F12) for detailed logs.

---

**Pro Tip**: With Groq API configured, you get 14,400 free transcriptions per day. That's ~50 hours of meetings daily - more than you'll ever need! 🚀
