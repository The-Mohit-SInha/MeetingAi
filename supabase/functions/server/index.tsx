import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// CORS configuration
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

// Logger
app.use("*", logger(console.log));

// Health check endpoint
app.get("/make-server-af44c8dd/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Trigger AI pipeline for meeting analysis
app.post("/make-server-af44c8dd/ai/analyze-meeting", async (c) => {
  let meeting_id: string | undefined;
  try {
    const body = await c.req.json();
    meeting_id = body.meeting_id;
    const user_id = body.user_id;

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
      .update({ ai_processing_status: 'analyzing' })
      .eq('id', meeting_id);

    // Obtain transcript
    const { data: meetingData } = await supabase
      .from('meetings')
      .select('transcript, recording_url')
      .eq('id', meeting_id)
      .single();

    let rawTranscript = meetingData?.transcript || '';

    // Fallback: check live_meetings table
    if (!rawTranscript || rawTranscript.startsWith('[')) {
      const { data: liveData } = await supabase
        .from('live_meetings')
        .select('live_transcript_chunk')
        .eq('meeting_id', meeting_id)
        .maybeSingle();

      if (liveData?.live_transcript_chunk) {
        rawTranscript = liveData.live_transcript_chunk;
      }
    }

    // If no transcript at all, mark complete gracefully
    if (!rawTranscript || rawTranscript.startsWith('[')) {
      await supabase.from('meetings').update({
        ai_processing_status: 'complete',
        status: 'completed',
        ai_processed: true,
        transcript: rawTranscript || '[No transcript available. Ensure speech was detected during recording.]',
        summary: 'No speech was detected in this recording. Try recording again with clearer audio.',
      }).eq('id', meeting_id);

      await supabase.from('ai_processing_jobs').update({
        status: 'complete',
        completed_at: new Date().toISOString(),
        output_data: { summary: 'No transcript available', action_items_count: 0 },
      }).eq('meeting_id', meeting_id);

      return c.json({ success: true, analysis: { summary: 'No transcript available', action_items_count: 0, sentiment: 'neutral' } });
    }

    // Analyze with Claude
    await supabase
      .from('meetings')
      .update({ ai_processing_status: 'analyzing' })
      .eq('id', meeting_id);

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
          console.log('Failed to parse Claude response:', parseError);
        }
      }
    }

    // Write results to database
    await supabase.from('meetings').update({
      summary: analysis.summary,
      transcript: rawTranscript,
      key_decisions: analysis.key_decisions,
      meeting_highlights: analysis.meeting_highlights,
      sentiment: analysis.sentiment,
      ai_processed: true,
      ai_processing_status: 'complete',
      status: 'completed',
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
    console.log('AI analysis error:', err);

    if (meeting_id) {
      try {
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

        await supabase
          .from('meetings')
          .update({ ai_processing_status: 'failed', status: 'completed' })
          .eq('id', meeting_id);
      } catch (_) { /* best effort */ }
    }

    return c.json({ error: err.message }, 500);
  }
});

// Groq Whisper transcription endpoint
app.post("/make-server-af44c8dd/api/transcribe", async (c) => {
  try {
    const groqApiKey = Deno.env.get('GROQ_API_KEY');

    if (!groqApiKey) {
      return c.json({
        error: "Groq API key not configured. Please add GROQ_API_KEY to your environment variables."
      }, 500);
    }

    // Get the uploaded file from FormData
    const formData = await c.req.formData();
    const audioFile = formData.get('file') as File;
    const model = formData.get('model') as string || 'whisper-large-v3-turbo';
    const language = formData.get('language') as string || 'en';
    const temperature = parseFloat(formData.get('temperature') as string || '0');
    const responseFormat = formData.get('response_format') as string || 'verbose_json';

    if (!audioFile) {
      return c.json({ error: "No audio file provided" }, 400);
    }

    console.log('🎯 Transcription request:', {
      model,
      language,
      size: `${(audioFile.size / 1024 / 1024).toFixed(2)} MB`,
      type: audioFile.type,
    });

    // Forward to Groq API
    const groqFormData = new FormData();
    groqFormData.append('file', audioFile, 'audio.webm');
    groqFormData.append('model', model);
    groqFormData.append('language', language);
    groqFormData.append('temperature', temperature.toString());
    groqFormData.append('response_format', responseFormat);

    const groqResponse = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: groqFormData,
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('Groq API error:', errorText);
      return c.json({
        error: `Groq API error: ${groqResponse.status} - ${errorText}`
      }, groqResponse.status);
    }

    const result = await groqResponse.json();
    console.log('✅ Transcription complete:', result.text?.substring(0, 100) + '...');

    return c.json(result);
  } catch (err: any) {
    console.error('Transcription error:', err);
    return c.json({ error: err.message || 'Transcription failed' }, 500);
  }
});

// Health check for transcription service
app.get("/make-server-af44c8dd/api/transcribe/health", (c) => {
  const groqApiKey = Deno.env.get('GROQ_API_KEY');
  return c.json({
    configured: !!groqApiKey,
    service: 'groq-whisper',
    model: 'whisper-large-v3-turbo',
  });
});

// Return 404 for all other routes
app.all("*", (c) => {
  return c.json({ error: "Not found" }, 404);
});

Deno.serve(app.fetch);
