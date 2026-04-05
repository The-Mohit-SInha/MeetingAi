/**
 * Groq LLM Service - Uses Groq's free LLM API for text processing
 * Provides meeting summarization and action item extraction
 */

const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface MeetingSummary {
  summary: string;
  keyPoints: string[];
  actionItems: Array<{
    title: string;
    description: string;
    assignee?: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

/**
 * Generate a meeting summary and extract action items using Groq's LLM
 */
export async function generateMeetingSummary(
  transcript: string,
  meetingTitle?: string
): Promise<MeetingSummary> {
  try {
    console.log('🤖 Generating meeting summary with Groq LLM...');

    if (!transcript || transcript.trim().length === 0) {
      throw new Error('Transcript is empty');
    }

    const prompt = `You are an AI assistant that analyzes meeting transcripts. Given the following meeting transcript, please:

1. Provide a concise summary (2-3 sentences) of what was discussed
2. List 3-5 key points from the meeting
3. Extract any action items, tasks, or to-dos mentioned (e.g., "bring information about X", "send the report", "schedule a follow-up", etc.)

For each action item, identify:
- What needs to be done (title)
- More details if available (description)
- Who should do it if mentioned (assignee)
- Priority level (high/medium/low) based on urgency words like "urgent", "ASAP", "important", etc.

Respond ONLY with a valid JSON object in this exact format:
{
  "summary": "Brief summary here",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "actionItems": [
    {
      "title": "Action title",
      "description": "More details",
      "assignee": "Person's name or null",
      "priority": "high|medium|low"
    }
  ]
}

Meeting Title: ${meetingTitle || 'Untitled Meeting'}

Transcript:
${transcript}`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Fast and capable model
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant that analyzes meeting transcripts and extracts summaries and action items. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent output
        max_tokens: 2000,
        response_format: { type: 'json_object' } // Ensure JSON response
      }),
    });

    console.log('📥 Groq LLM response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Groq LLM API error:', errorText);
      throw new Error(`Groq LLM API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in LLM response');
    }

    console.log('🧠 Raw LLM response:', content);

    // Parse the JSON response
    let summary: MeetingSummary;
    try {
      const parsed = JSON.parse(content);

      // Validate and normalize the response
      summary = {
        summary: parsed.summary || 'Meeting discussion recorded.',
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
        actionItems: Array.isArray(parsed.actionItems)
          ? parsed.actionItems.map((item: any) => ({
              title: item.title || 'Untitled task',
              description: item.description || '',
              assignee: item.assignee || null,
              priority: ['high', 'medium', 'low'].includes(item.priority)
                ? item.priority
                : 'medium'
            }))
          : []
      };
    } catch (parseError) {
      console.error('❌ Failed to parse LLM JSON response:', parseError);
      console.error('Raw content:', content);

      // Fallback: extract text summary
      summary = {
        summary: content.substring(0, 300) + (content.length > 300 ? '...' : ''),
        keyPoints: [],
        actionItems: []
      };
    }

    console.log('✅ Meeting summary generated:', {
      summaryLength: summary.summary.length,
      keyPointsCount: summary.keyPoints.length,
      actionItemsCount: summary.actionItems.length,
    });

    return summary;
  } catch (error: any) {
    console.error('❌ Failed to generate meeting summary:', error);

    // Return a basic summary on error
    return {
      summary: 'Meeting transcript captured. Summary generation failed.',
      keyPoints: [],
      actionItems: []
    };
  }
}

/**
 * Quick summary generation for shorter transcripts (uses faster model)
 */
export async function generateQuickSummary(transcript: string): Promise<string> {
  try {
    if (!transcript || transcript.trim().length === 0) {
      return 'No transcript available.';
    }

    const prompt = `Summarize this meeting transcript in 1-2 sentences:\n\n${transcript}`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Fastest model
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const result = await response.json();
    const summary = result.choices?.[0]?.message?.content || transcript.substring(0, 200) + '...';

    return summary.trim();
  } catch (error) {
    console.error('❌ Quick summary failed:', error);
    return transcript.substring(0, 200) + (transcript.length > 200 ? '...' : '');
  }
}
