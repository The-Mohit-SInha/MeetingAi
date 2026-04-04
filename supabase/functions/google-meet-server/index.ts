import { Hono } from "npm:hono@4";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Enable logger for debugging
app.use('*', logger(console.log));

// Enable CORS for all routes
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    service: "google-meet-server"
  });
});

// Google OAuth token exchange endpoint
app.post("/oauth/google-meet/exchange", async (c) => {
  try {
    const { code, redirect_uri, user_id } = await c.req.json();
    
    if (!code || !redirect_uri) {
      return c.json({ error: "Missing required parameters" }, 400);
    }

    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        redirect_uri,
        client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '',
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();
    
    if (tokens.error) {
      console.error('Google token exchange error:', tokens);
      return c.json({ 
        error: tokens.error_description || tokens.error,
        details: tokens
      }, 400);
    }

    // Get user info from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    
    const userInfo = await userRes.json();

    // Store tokens in Supabase if user_id provided
    if (user_id) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') || '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
      );

      await supabase
        .from('user_settings')
        .update({
          google_meet_connected: true,
          google_meet_email: userInfo.email,
          google_meet_access_token: tokens.access_token,
          google_meet_refresh_token: tokens.refresh_token,
        })
        .eq('user_id', user_id);
    }

    return c.json({
      success: true,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      email: userInfo.email,
      expires_in: tokens.expires_in,
    });
  } catch (err: any) {
    console.error('Google Meet OAuth error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Refresh Google OAuth token endpoint
app.post("/oauth/google-meet/refresh", async (c) => {
  try {
    const { refresh_token, user_id } = await c.req.json();
    
    if (!refresh_token) {
      return c.json({ error: "Missing refresh_token" }, 400);
    }

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token,
        client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '',
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
        grant_type: 'refresh_token',
      }),
    });

    const tokens = await tokenRes.json();
    
    if (tokens.error) {
      console.error('Token refresh error:', tokens);
      return c.json({ error: tokens.error_description || tokens.error }, 400);
    }

    // Update stored access token if user_id provided
    if (user_id) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') || '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
      );

      await supabase
        .from('user_settings')
        .update({
          google_meet_access_token: tokens.access_token,
        })
        .eq('user_id', user_id);
    }

    return c.json({
      success: true,
      access_token: tokens.access_token,
      expires_in: tokens.expires_in,
    });
  } catch (err: any) {
    console.error('Token refresh error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Fetch Google Calendar events (meetings) endpoint
app.post("/calendar/events", async (c) => {
  try {
    const { access_token, timeMin, timeMax, maxResults = 50 } = await c.req.json();
    
    if (!access_token) {
      return c.json({ error: "Missing access_token" }, 400);
    }

    const params = new URLSearchParams({
      orderBy: 'startTime',
      singleEvents: 'true',
      maxResults: maxResults.toString(),
    });

    if (timeMin) params.append('timeMin', timeMin);
    if (timeMax) params.append('timeMax', timeMax);

    const eventsRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const events = await eventsRes.json();
    
    if (events.error) {
      console.error('Calendar API error:', events.error);
      return c.json({ error: events.error.message }, events.error.code || 400);
    }

    // Filter for Google Meet events
    const meetEvents = (events.items || []).filter((event: any) => 
      event.hangoutLink || event.conferenceData?.conferenceId
    );

    return c.json({
      success: true,
      events: meetEvents,
      total: meetEvents.length,
    });
  } catch (err: any) {
    console.error('Calendar events fetch error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Trigger AI pipeline for meeting analysis
app.post("/ai/analyze-meeting", async (c) => {
  try {
    const { meeting_id, user_id } = await c.req.json();
    
    if (!meeting_id || !user_id) {
      return c.json({ error: "Missing required parameters" }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Create AI processing job
    await supabase.from('ai_processing_jobs').insert({
      meeting_id,
      user_id,
      job_type: 'full_pipeline',
      status: 'running',
      started_at: new Date().toISOString(),
    });

    // Update meeting status
    await supabase
      .from('meetings')
      .update({ ai_processing_status: 'transcribing' })
      .eq('id', meeting_id);

    // Get live transcript data
    const { data: liveData } = await supabase
      .from('live_meetings')
      .select('live_transcript_chunk')
      .eq('meeting_id', meeting_id)
      .maybeSingle();

    const rawTranscript = liveData?.live_transcript_chunk || '';

    // Update status to analyzing
    await supabase
      .from('meetings')
      .update({ ai_processing_status: 'analyzing' })
      .eq('id', meeting_id);

    // Call Claude API for analysis
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY') || '';
    let analysis: any = {
      summary: 'AI analysis completed.',
      key_decisions: [],
      meeting_highlights: [],
      sentiment: 'neutral',
      action_items: [],
      participants: [],
    };

    if (anthropicKey && rawTranscript) {
      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{
            role: 'user',
            content: `You are an AI meeting analyst. Analyze this meeting transcript and respond ONLY with a valid JSON object (no markdown, no preamble) with exactly these fields:
{
  "summary": "2-4 sentence meeting overview",
  "key_decisions": ["decision 1", "decision 2"],
  "meeting_highlights": [{"timestamp": "00:05", "text": "highlight description"}],
  "sentiment": "positive|neutral|negative",
  "action_items": [{"title": "task title", "description": "task detail", "assignee": "person name or Unassigned", "due_date": "YYYY-MM-DD", "priority": "high|medium|low"}],
  "participants": [{"name": "person name", "speaking_time_seconds": 120, "word_count": 300, "sentiment": "positive|neutral|negative", "contribution_score": 0.75, "tasks_assigned": 2}]
}

Meeting transcript:
${rawTranscript}`,
          }],
        }),
      });

      const claudeData = await claudeRes.json();
      
      if (claudeData.content && claudeData.content[0]) {
        try {
          const text = claudeData.content[0].text.replace(/```json|```/g, '').trim();
          analysis = JSON.parse(text);
        } catch (parseError) {
          console.error('Failed to parse Claude response:', parseError);
        }
      }
    }

    // Write analysis results to database
    await supabase.from('meetings').update({
      summary: analysis.summary,
      transcript: rawTranscript,
      key_decisions: analysis.key_decisions,
      meeting_highlights: analysis.meeting_highlights,
      sentiment: analysis.sentiment,
      ai_processed: true,
      ai_processing_status: 'complete',
    }).eq('id', meeting_id);

    // Create action items
    if (analysis.action_items && analysis.action_items.length > 0) {
      const dueDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
      
      await supabase.from('action_items').insert(
        analysis.action_items.map((item: any) => ({
          meeting_id,
          user_id,
          title: item.title,
          description: item.description || '',
          assignee: item.assignee || 'Unassigned',
          due_date: item.due_date || dueDate,
          priority: item.priority || 'medium',
          status: 'todo',
          progress: 0,
        }))
      );
    }

    // Update participant analytics
    if (analysis.participants && analysis.participants.length > 0) {
      for (const participant of analysis.participants) {
        await supabase
          .from('meeting_participants')
          .update({
            speaking_time_seconds: participant.speaking_time_seconds || 0,
            word_count: participant.word_count || 0,
            sentiment: participant.sentiment || 'neutral',
            contribution_score: participant.contribution_score || 0,
            tasks_assigned: participant.tasks_assigned || 0,
          })
          .eq('meeting_id', meeting_id)
          .ilike('participant_name', `%${participant.name}%`);
      }
    }

    // Create notification
    await supabase.from('notifications').insert({
      user_id,
      type: 'meeting',
      title: 'AI analysis complete',
      message: `Your meeting has been fully analyzed. ${analysis.action_items?.length || 0} action items extracted.`,
      link: `/meetings/${meeting_id}`,
    });

    // Mark job complete
    await supabase
      .from('ai_processing_jobs')
      .update({
        status: 'complete',
        completed_at: new Date().toISOString(),
        output_data: {
          summary: analysis.summary,
          action_items_count: analysis.action_items?.length || 0,
        },
      })
      .eq('meeting_id', meeting_id);

    return c.json({
      success: true,
      analysis: {
        summary: analysis.summary,
        action_items_count: analysis.action_items?.length || 0,
        sentiment: analysis.sentiment,
      },
    });
  } catch (err: any) {
    console.error('AI analysis error:', err);
    
    // Update job status to failed
    if (meeting_id) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') || '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
      );
      
      await supabase
        .from('ai_processing_jobs')
        .update({
          status: 'failed',
          error_message: err.message,
          completed_at: new Date().toISOString(),
        })
        .eq('meeting_id', meeting_id);
    }
    
    return c.json({ error: err.message }, 500);
  }
});

// Disconnect Google Meet integration
app.post("/oauth/google-meet/disconnect", async (c) => {
  try {
    const { user_id } = await c.req.json();
    
    if (!user_id) {
      return c.json({ error: "Missing user_id" }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    await supabase
      .from('user_settings')
      .update({
        google_meet_connected: false,
        google_meet_email: null,
        google_meet_access_token: null,
        google_meet_refresh_token: null,
      })
      .eq('user_id', user_id);

    return c.json({ success: true });
  } catch (err: any) {
    console.error('Disconnect error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Default 404 handler
app.all("*", (c) => {
  return c.json({ error: "Endpoint not found" }, 404);
});

Deno.serve(app.fetch);
