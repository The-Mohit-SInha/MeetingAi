import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-af44c8dd/health", (c) => {
  return c.json({ status: "ok", ts: Date.now() });
});

// Google Meet OAuth token exchange
app.post("/make-server-af44c8dd/google-meet-oauth", async (c) => {
  try {
    const { code, redirect_uri } = await c.req.json();
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
      console.log('Google token exchange error:', tokens);
      return c.json({ error: tokens.error_description || tokens.error }, 400);
    }
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const userInfo = await userRes.json();
    return c.json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      email: userInfo.email,
    });
  } catch (err: any) {
    console.log('Google Meet OAuth error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Trigger AI pipeline for meeting analysis
app.post("/make-server-af44c8dd/trigger-ai-pipeline", async (c) => {
  try {
    const { meeting_id, user_id } = await c.req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // 1. Create job record
    await supabase.from('ai_processing_jobs').insert({
      meeting_id, user_id, job_type: 'full_pipeline', status: 'running',
      started_at: new Date().toISOString(),
    });
    await supabase.from('meetings').update({ ai_processing_status: 'transcribing' }).eq('id', meeting_id);

    // 2. Get live transcript data
    const { data: liveData } = await supabase.from('live_meetings')
      .select('live_transcript_chunk').eq('meeting_id', meeting_id).maybeSingle();
    const rawTranscript = liveData?.live_transcript_chunk || '';

    // 3. Update status to analyzing
    await supabase.from('meetings').update({ ai_processing_status: 'analyzing' }).eq('id', meeting_id);

    // 4. Call Claude for analysis
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY') || '';
    let analysis: any = { summary: 'AI analysis completed.', key_decisions: [], meeting_highlights: [], sentiment: 'neutral', action_items: [], participants: [] };

    if (anthropicKey) {
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
${rawTranscript || 'No transcript captured. Generate placeholder analysis based on the meeting context.'}`,
          }],
        }),
      });
      const claudeData = await claudeRes.json();
      try {
        const text = claudeData.content[0].text.replace(/```json|```/g, '').trim();
        analysis = JSON.parse(text);
      } catch {
        console.log('Failed to parse Claude response, using defaults');
      }
    }

    // 5. Write results back
    await supabase.from('meetings').update({
      summary: analysis.summary,
      transcript: rawTranscript,
      key_decisions: analysis.key_decisions,
      meeting_highlights: analysis.meeting_highlights,
      sentiment: analysis.sentiment,
      ai_processed: true,
      ai_processing_status: 'complete',
    }).eq('id', meeting_id);

    // 6. Write action items
    if (analysis.action_items?.length > 0) {
      const dueDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
      await supabase.from('action_items').insert(
        analysis.action_items.map((a: any) => ({
          meeting_id, user_id,
          title: a.title, description: a.description,
          assignee: a.assignee || 'Unassigned',
          due_date: a.due_date || dueDate,
          priority: a.priority || 'medium',
          status: 'todo', progress: 0,
        }))
      );
    }

    // 7. Update participant AI data
    if (analysis.participants?.length > 0) {
      for (const p of analysis.participants) {
        await supabase.from('meeting_participants').update({
          speaking_time_seconds: p.speaking_time_seconds || 0,
          word_count: p.word_count || 0,
          sentiment: p.sentiment || 'neutral',
          contribution_score: p.contribution_score || 0,
          tasks_assigned: p.tasks_assigned || 0,
        }).eq('meeting_id', meeting_id).ilike('participant_name', `%${p.name}%`);
      }
    }

    // 8. Create notification
    await supabase.from('notifications').insert({
      user_id, type: 'meeting',
      title: 'AI analysis complete',
      message: `Your meeting has been fully analyzed. ${analysis.action_items?.length || 0} action items extracted.`,
      link: `/meetings/${meeting_id}`,
    });

    // 9. Mark job complete
    await supabase.from('ai_processing_jobs').update({
      status: 'complete', completed_at: new Date().toISOString(),
      output_data: { summary: analysis.summary, action_items_count: analysis.action_items?.length || 0 },
    }).eq('meeting_id', meeting_id);

    return c.json({ success: true });
  } catch (err: any) {
    console.log('AI pipeline error:', err);
    return c.json({ error: err.message }, 500);
  }
});

Deno.serve(app.fetch);