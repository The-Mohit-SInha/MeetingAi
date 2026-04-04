# Audio Transcription Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                                │
│                                                                       │
│  ┌──────────────┐                           ┌──────────────┐        │
│  │  Microphone  │                           │ Browser Tab  │        │
│  │   Recording  │                           │  Recording   │        │
│  └──────┬───────┘                           └──────┬───────┘        │
│         │                                          │                 │
│         │ getUserMedia()                           │ getDisplayMedia()│
│         │ + Web Speech API                         │ + MediaRecorder │
│         │                                          │                 │
└─────────┼──────────────────────────────────────────┼─────────────────┘
          │                                          │
          │                                          │
          ▼                                          ▼
┌─────────────────────┐                    ┌─────────────────────┐
│  Real-time Speech   │                    │  Audio Blob         │
│  Recognition        │                    │  (WebM)             │
│                     │                    │                     │
│  ✅ Live transcript │                    │  📼 Recorded audio  │
│  ✅ No API needed   │                    │  📦 Sent to server  │
└─────────┬───────────┘                    └──────────┬──────────┘
          │                                           │
          │                                           │
          │                                           ▼
          │                              ┌────────────────────────┐
          │                              │  Edge Function         │
          │                              │  /api/transcribe       │
          │                              │                        │
          │                              │  🔍 Check Groq config  │
          │                              └───────────┬────────────┘
          │                                          │
          │                                          │
          │                              ┌───────────┴────────────┐
          │                              │                        │
          │                              ▼                        ▼
          │                    ┌──────────────────┐    ┌──────────────────┐
          │                    │  Groq Whisper    │    │  Local Whisper   │
          │                    │  API (Primary)   │    │  (Fallback)      │
          │                    │                  │    │                  │
          │                    │  ⚡ Fast         │    │  🌐 Offline      │
          │                    │  ✨ High quality │    │  🔒 Private      │
          │                    │  🆓 Free tier    │    │  🆓 Always free  │
          │                    └────────┬─────────┘    └────────┬─────────┘
          │                             │                       │
          │                             │                       │
          │                             └───────────┬───────────┘
          │                                         │
          │                                         ▼
          │                              ┌──────────────────────┐
          │                              │   Transcript Text    │
          │                              │   (High Quality)     │
          │                              └──────────┬───────────┘
          │                                         │
          └─────────────────────────────────────────┤
                                                    │
                                                    ▼
                                          ┌──────────────────┐
                                          │  Save Meeting    │
                                          │  with Transcript │
                                          │                  │
                                          │  📝 Full text    │
                                          │  💾 Supabase DB  │
                                          │  🤖 Trigger AI   │
                                          └────────┬─────────┘
                                                   │
                                                   ▼
                                          ┌──────────────────┐
                                          │  AI Analysis     │
                                          │  (Claude API)    │
                                          │                  │
                                          │  📊 Summary      │
                                          │  ✅ Action items │
                                          │  👥 Participants │
                                          └──────────────────┘
```

## Component Breakdown

### Frontend (`Meetings.tsx`)
- Handles audio capture (mic or tab)
- Manages recording state
- Displays live transcript
- Sends audio to backend

### Transcription Service (`groqTranscriptionService.ts`)
- Prepares audio blob
- Sends to edge function
- Handles errors
- Returns transcript

### Edge Function (`server/index.tsx`)
- `/api/transcribe` endpoint
- Proxies to Groq API
- Returns transcript JSON

### Groq API (External)
- OpenAI-compatible Whisper API
- Fast, accurate transcription
- Free tier available

### Local Whisper (Browser)
- Transformers.js + ONNX
- Runs in WebAssembly
- 40MB model download
- Fallback option

## Data Flow

1. **User clicks "Record Audio"**
2. **Choose source**: Microphone or Tab
3. **Recording starts**:
   - Mic: Live transcript via Web Speech API
   - Tab: Audio chunks recorded
4. **User stops recording**
5. **Transcription**:
   - Tab audio → Groq API (or local Whisper)
   - Mic: Already transcribed live
6. **Meeting saved** with transcript
7. **AI analysis** triggered (optional)
8. **Action items extracted** automatically

## Tech Stack

- **React**: UI components
- **MediaStream API**: Audio capture
- **Web Speech API**: Real-time transcription (mic mode)
- **MediaRecorder API**: Audio recording
- **Groq Whisper API**: High-quality transcription
- **Transformers.js**: Local transcription fallback
- **Supabase**: Data storage
- **Hono**: Edge function framework
- **Deno**: Edge runtime

## Free Services Used

1. **Groq**: 14,400 requests/day (free forever)
2. **Web Speech API**: Built into browsers (free)
3. **Transformers.js**: Open source (free)
4. **Supabase**: Generous free tier

**Total Cost: $0** for typical usage!
