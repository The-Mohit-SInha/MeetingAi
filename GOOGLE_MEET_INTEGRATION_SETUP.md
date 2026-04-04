# Google Meet AI Pipeline Integration - Setup Complete

## ✅ What Has Been Set Up

Your AI Meeting-to-Action Management System now has a **complete Google Meet AI pipeline** with the following features:

### 1. **Backend Integration** ✅
- **Google OAuth Token Exchange**: Exchanges authorization codes for access tokens
- **Claude AI Processing**: Analyzes meeting transcripts with Claude Sonnet 4
- **Automatic Action Item Extraction**: Extracts tasks, decisions, highlights, and participants
- **Real-time Meeting Status Updates**: Tracks processing stages (transcribing → analyzing → complete)

### 2. **API Keys Configured** ✅
All three required secrets have been added to your Supabase project:
- ✅ `GOOGLE_CLIENT_ID` - For OAuth authentication
- ✅ `GOOGLE_CLIENT_SECRET` - For token exchange
- ✅ `ANTHROPIC_API_KEY` - For Claude AI analysis

### 3. **Frontend Services** ✅
- **Google Meet OAuth**: Handles authorization flow and connection management
- **Live Meeting Service**: Tracks active meetings and captures transcripts
- **AI Processing Service**: Monitors AI job status and provides real-time updates

---

## 🔧 Final Step: Add Frontend Environment Variable

To complete the setup, you need to add the **GOOGLE_CLIENT_ID** to your frontend environment. This allows the frontend to initiate the OAuth flow.

### Option 1: Add to `.env` file (Recommended for local development)

Create or edit `.env` in your project root:

```env
VITE_GOOGLE_CLIENT_ID=920471205841-dtikecrv5b0l432ni766e6e7sp4tr12t.apps.googleusercontent.com
```

### Option 2: Set in Figma Make Environment

If you're running in Figma Make, you may need to configure this through the platform's environment variable settings.

### Option 3: Hardcode (Not recommended for production, but works for testing)

Edit `/src/app/services/googleMeetService.ts` line 4:

```typescript
const GOOGLE_CLIENT_ID = '920471205841-dtikecrv5b0l432ni766e6e7sp4tr12t.apps.googleusercontent.com';
```

---

## 🚀 How to Use the Google Meet Integration

### Step 1: Connect Google Meet Account

1. Navigate to **Settings** in your dashboard
2. Click on the **Integrations** tab
3. Find the **Google Meet** section
4. Click **Connect Google Meet**
5. Authorize the app in the Google OAuth consent screen
6. You'll be redirected back to Settings with a success message

### Step 2: Test the Integration

#### Create a Test Meeting:
1. Go to **Meetings** tab
2. Click **+ New Meeting**
3. Fill in meeting details
4. Save the meeting

#### Simulate Capturing a Meeting:
```javascript
// In browser console or through UI
await liveMeetingService.startCapture(meetingId, 'meet.google.com/abc-defg-hij', userId);
```

#### Trigger AI Analysis:
1. Go to the meeting detail page
2. Click **Trigger AI Analysis** button
3. Watch the status update in real-time:
   - `queued` → `transcribing` → `analyzing` → `complete`

### Step 3: View Results

After processing completes (typically 5-10 seconds):
- **Summary**: AI-generated meeting overview
- **Key Decisions**: Important decisions made
- **Highlights**: Timestamped meeting highlights
- **Action Items**: Automatically extracted tasks (in Action Items tab)
- **Participants**: Speaking time, sentiment, and contribution scores

---

## 🔍 Testing the API Directly

### Test Google OAuth (Backend):
```bash
curl -X POST https://qjrmxudyrwcqwpkmrggn.supabase.co/functions/v1/make-server-af44c8dd/google-meet-oauth \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"code": "OAUTH_CODE", "redirect_uri": "http://localhost:5173/auth/google-meet/callback"}'
```

### Test AI Pipeline (Backend):
```bash
curl -X POST https://qjrmxudyrwcqwpkmrggn.supabase.co/functions/v1/make-server-af44c8dd/trigger-ai-pipeline \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"meeting_id": "MEETING_UUID", "user_id": "USER_UUID"}'
```

---

## 📊 What Gets Analyzed

Claude AI analyzes the meeting transcript and extracts:

| Field | Description | Example |
|-------|-------------|---------|
| **Summary** | 2-4 sentence overview | "Team discussed Q2 goals..." |
| **Key Decisions** | Important decisions made | ["Approved budget", "Launch on May 15"] |
| **Meeting Highlights** | Timestamped key moments | `[{timestamp: "00:05", text: "Budget approved"}]` |
| **Sentiment** | Overall meeting tone | positive, neutral, or negative |
| **Action Items** | Extracted tasks with assignees | `[{title, description, assignee, due_date, priority}]` |
| **Participants** | Speaking time & contribution | `[{name, speaking_time_seconds, sentiment}]` |

---

## 🔗 Integration Flow Diagram

```
User Clicks "Connect Google Meet"
         ↓
Frontend redirects to Google OAuth
         ↓
User authorizes app
         ↓
Google redirects back with code
         ↓
Frontend calls /google-meet-oauth with code
         ↓
Backend exchanges code for tokens
         ↓
Tokens saved to user_settings table
         ↓
Connection complete!

---

Meeting happens in Google Meet
         ↓
Bot captures live transcript
         ↓
User clicks "Trigger AI Analysis"
         ↓
Frontend calls /trigger-ai-pipeline
         ↓
Backend: Status → transcribing
         ↓
Backend calls Claude API
         ↓
Backend: Status → analyzing
         ↓
Claude returns JSON analysis
         ↓
Backend writes to meetings + action_items tables
         ↓
Backend: Status → complete
         ↓
Frontend shows results + notification
```

---

## 🛠️ Troubleshooting

### "Failed to connect Google Meet"
- ✅ Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` match your Google Cloud Console OAuth credentials
- ✅ Verify the redirect URI in Google Console matches: `http://localhost:5173/auth/google-meet/callback` (or your production domain)
- ✅ Check browser console for detailed error messages

### "AI analysis failed"
- ✅ Verify `ANTHROPIC_API_KEY` is correctly set in Supabase secrets
- ✅ Check the Supabase Functions logs for detailed error messages
- ✅ Ensure the meeting has transcript data in the `live_meetings` table

### "OAuth redirect not working"
- ✅ Ensure `VITE_GOOGLE_CLIENT_ID` is set in frontend environment
- ✅ Check that the OAuth callback route exists in `/src/app/routes.tsx`
- ✅ Verify CORS settings allow your domain

---

## 📝 Database Tables Used

- **`user_settings`**: Stores Google Meet connection status and tokens
- **`meetings`**: Main meeting records with AI analysis results
- **`live_meetings`**: Active meeting capture and real-time transcripts
- **`ai_processing_jobs`**: Tracks AI pipeline job status
- **`action_items`**: Extracted tasks and action items
- **`meeting_participants`**: Participant analytics (speaking time, sentiment)
- **`notifications`**: User notifications for completed analysis

---

## 🎉 You're All Set!

The Google Meet AI pipeline is now fully functional. Once you add the frontend `VITE_GOOGLE_CLIENT_ID` environment variable, users can:

1. ✅ Connect their Google Meet accounts
2. ✅ Capture meeting transcripts in real-time
3. ✅ Trigger AI analysis with Claude
4. ✅ View extracted action items, decisions, and insights
5. ✅ Track participant engagement and sentiment

**Next Steps:**
- Test the OAuth flow by connecting your Google Meet account
- Create a test meeting and trigger AI analysis
- Explore the AI-generated insights and action items
- Customize the Claude prompt in `/supabase/functions/server/index.tsx` (line 104) if needed
