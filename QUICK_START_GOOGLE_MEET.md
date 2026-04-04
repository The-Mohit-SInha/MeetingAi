# 🚀 Google Meet AI Integration - Quick Start

## ✅ Setup Complete!

All three API keys have been successfully added to your Supabase project, and the frontend Google Meet OAuth integration is fully configured.

---

## 🎯 Test the Integration (3 Steps)

### Step 1: Connect Your Google Meet Account

1. **Login** to your AI Meeting-to-Action dashboard
2. Navigate to **Settings** > **Integrations**
3. Find the **Google Meet** card (green with video icon)
4. Click **"Connect"** button
5. You'll be redirected to Google's authorization page
6. **Grant permissions** for Google Meet and Calendar access
7. You'll be redirected back to Settings with "Connected" status ✅

### Step 2: Create a Test Meeting

1. Go to **Meetings** tab
2. Click **"+ New Meeting"**
3. Fill in:
   - **Title**: "Test AI Analysis"
   - **Date**: Today's date
   - **Time**: Current time
   - **Duration**: 30 minutes
   - **Participants**: Add 2-3 participant names
4. Click **Save**

### Step 3: Trigger AI Analysis

1. Open the meeting you just created
2. (Optional) Add some test transcript data via browser console:
   ```javascript
   // This simulates a meeting transcript
   const meetingId = 'YOUR_MEETING_ID'; // Get from URL
   await supabase.from('live_meetings').insert({
     meeting_id: meetingId,
     user_id: 'YOUR_USER_ID',
     google_meet_id: 'test-meet-id',
     capture_active: false,
     live_transcript_chunk: 'John: We need to finalize the Q2 budget by next Friday. Sarah: Agreed. I\'ll prepare the presentation by Wednesday. Mike: Can we schedule a follow-up meeting to review the numbers? John: Yes, let\'s meet on Thursday at 2 PM.'
   });
   ```
3. Click the **"Trigger AI Analysis"** button (if available) OR use browser console:
   ```javascript
   const meetingId = 'YOUR_MEETING_ID';
   await fetch(`https://qjrmxudyrwcqwpkmrggn.supabase.co/functions/v1/make-server-af44c8dd/trigger-ai-pipeline`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcm14dWR5cndjcXdwa21yZ2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDYyNDgsImV4cCI6MjA5MDcyMjI0OH0.tAje6kf-PRqDqKqM_KhNJs2wDCd-I28jUQKG28Y7bec`,
     },
     body: JSON.stringify({ meeting_id: meetingId, user_id: 'YOUR_USER_ID' })
   });
   ```

4. **Watch the magic happen!** 🎉
   - Status changes: `queued` → `transcribing` → `analyzing` → `complete`
   - Summary appears
   - Action items are automatically extracted
   - Participant analytics are calculated
   - Notification is sent

---

## 📋 What You'll See After AI Processing

### Meeting Summary
> "Team discussed Q2 budget finalization with key decisions made on presentation timeline and follow-up meeting scheduling."

### Action Items (Auto-extracted)
| Task | Assignee | Due Date | Priority |
|------|----------|----------|----------|
| Prepare Q2 presentation | Sarah | April 9, 2026 | High |
| Schedule Thursday review meeting | Mike | April 10, 2026 | Medium |
| Finalize Q2 budget | John | April 11, 2026 | High |

### Key Decisions
- ✅ Q2 budget finalization deadline set for next Friday
- ✅ Follow-up review meeting scheduled for Thursday at 2 PM

### Participants Analytics
- **John**: Speaking time 45s, Contribution 40%, Tasks: 1
- **Sarah**: Speaking time 30s, Contribution 30%, Tasks: 1  
- **Mike**: Speaking time 25s, Contribution 30%, Tasks: 1

---

## 🐛 Troubleshooting

### Issue: "Failed to connect Google Meet"

**Check:**
1. Open browser console for detailed error
2. Verify redirect URI in Google Cloud Console matches: `http://localhost:5173/auth/google-meet/callback` (or your actual domain)
3. Ensure GOOGLE_CLIENT_ID environment variable is set (check `.env` file)

**Fix:**
```bash
# Verify .env file exists with:
VITE_GOOGLE_CLIENT_ID=920471205841-dtikecrv5b0l432ni766e6e7sp4tr12t.apps.googleusercontent.com

# Restart dev server
npm run dev  # or  pnpm dev
```

### Issue: "AI analysis failed" or stuck in "transcribing"

**Check:**
1. Supabase Function logs: https://supabase.com/dashboard/project/qjrmxudyrwcqwpkmrggn/logs/edge-functions
2. Verify secrets are correctly set in Supabase dashboard
3. Check Anthropic API key is valid

**Test backend directly:**
```bash
curl -X POST https://qjrmxudyrwcqwpkmrggn.supabase.co/functions/v1/make-server-af44c8dd/trigger-ai-pipeline \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"meeting_id": "MEETING_UUID", "user_id": "USER_UUID"}'
```

### Issue: "Google OAuth redirect not working"

**Check:**
1. Ensure route `/auth/google-meet/callback` exists in routes
2. Clear browser cache and cookies
3. Verify CORS settings in Supabase

---

## 🎉 Success Indicators

✅ **Google Meet Connected**: Green badge in Settings  
✅ **OAuth Working**: Redirects to Google and back successfully  
✅ **AI Analysis Working**: Meeting status changes to "complete"  
✅ **Action Items Extracted**: New items appear in Action Items tab  
✅ **Notifications**: You receive a notification when analysis completes  

---

## 📚 Additional Resources

- **Full Documentation**: `/GOOGLE_MEET_INTEGRATION_SETUP.md`
- **Supabase Dashboard**: https://supabase.com/dashboard/project/qjrmxudyrwcqwpkmrggn
- **Google Cloud Console**: https://console.cloud.google.com/
- **Anthropic Console**: https://console.anthropic.com/

---

## 🆘 Need Help?

If you encounter any issues:
1. Check the browser console for errors
2. Review Supabase Function logs
3. Verify all three API keys are correctly set
4. Ensure OAuth redirect URI matches exactly

**Your integration is ready to use! Start by connecting your Google Meet account in Settings.** 🚀
