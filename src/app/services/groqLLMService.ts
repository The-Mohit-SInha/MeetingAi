/**
 * Groq LLM Service - Uses Groq's free LLM API for text processing
 * Provides meeting summarization and action item extraction
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Get Groq API key from localStorage or environment variable
function getGroqApiKey(): string {
  // First, try to get from localStorage (user can set in Settings)
  const localKey = localStorage.getItem('groq_api_key');
  if (localKey && localKey !== 'your-groq-api-key-here') {
    return localKey;
  }

  // Fallback to environment variable
  const envKey = import.meta.env.VITE_GROQ_API_KEY;
  if (envKey && envKey !== 'your-groq-api-key-here') {
    return envKey;
  }

  // Default fallback key (replace with actual key or remove)
  return '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';
}

export interface MeetingSummary {
  summary: string;
  keyPoints: string[];
  participants?: string[];
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
4. Identify all participants in the meeting by looking for introductions (e.g., "This is John", "I'm Sarah"), direct addresses (e.g., "Hey Mike", "Thanks David"), or names mentioned in the conversation

For each action item, identify:
- What needs to be done (title)
- More details if available (description)
- Who should do it if mentioned in the conversation (assignee) - extract the actual person's name from the transcript
- Priority level (high/medium/low) based on urgency words like "urgent", "ASAP", "important", etc.

IMPORTANT: When assigning action items, use the actual names of people mentioned in the transcript. Look for phrases like:
- "[Name] will do X"
- "Can [Name] handle X?"
- "[Name] is responsible for X"
- "Let's have [Name] take care of X"

Respond ONLY with a valid JSON object in this exact format:
{
  "summary": "Brief summary here",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "participants": ["name1", "name2", "name3"],
  "actionItems": [
    {
      "title": "Action title",
      "description": "More details",
      "assignee": "Actual person's name from transcript or null",
      "priority": "high|medium|low"
    }
  ]
}

Meeting Title: ${meetingTitle || 'Untitled Meeting'}

Transcript:
${transcript}`;

    const GROQ_API_KEY = getGroqApiKey();

    if (!GROQ_API_KEY) {
      throw new Error('Groq API key not configured. Please set it in Settings or environment variables.');
    }

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

      // Special handling for 401 errors
      if (response.status === 401) {
        throw new Error(
          'Invalid Groq API key. Please:\n' +
          '1. Go to Settings → API Keys\n' +
          '2. Get your API key from https://console.groq.com/keys\n' +
          '3. Enter it in the Groq API Key field\n' +
          '4. Click "Save API Keys"\n\n' +
          'The default API key is invalid or expired.'
        );
      }

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
        participants: Array.isArray(parsed.participants) ? parsed.participants : [],
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
        participants: [],
        actionItems: []
      };
    }

    console.log('✅ Meeting summary generated:', {
      summaryLength: summary.summary.length,
      keyPointsCount: summary.keyPoints.length,
      participantsCount: summary.participants?.length || 0,
      actionItemsCount: summary.actionItems.length,
    });

    return summary;
  } catch (error: any) {
    console.error('❌ Failed to generate meeting summary:', error);

    // Return a basic summary on error
    return {
      summary: 'Meeting transcript captured. Summary generation failed.',
      keyPoints: [],
      participants: [],
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

    const GROQ_API_KEY = getGroqApiKey();

    if (!GROQ_API_KEY) {
      return transcript.substring(0, 200) + (transcript.length > 200 ? '...' : '');
    }

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
      const errorText = await response.text();
      console.error('❌ Groq API error:', errorText);

      // Special handling for 401 errors
      if (response.status === 401) {
        throw new Error(
          'Invalid Groq API key. Please:\n' +
          '1. Go to Settings → API Keys\n' +
          '2. Get your API key from https://console.groq.com/keys\n' +
          '3. Enter it in the Groq API Key field\n' +
          '4. Click "Save API Keys"\n\n' +
          'The default API key is invalid or expired.'
        );
      }

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

/**
 * Generate a suitable meeting title from transcript
 */
export async function generateMeetingTitle(transcript: string): Promise<string> {
  try {
    if (!transcript || transcript.trim().length === 0) {
      return 'Untitled Meeting';
    }

    // Use only first 1000 characters for title generation (faster)
    const shortTranscript = transcript.substring(0, 1000);

    const prompt = `Based on this meeting transcript excerpt, generate a short, descriptive meeting title (max 6 words). The title should capture the main topic or purpose of the meeting. Respond with ONLY the title, nothing else.

Transcript excerpt:
${shortTranscript}`;

    const GROQ_API_KEY = getGroqApiKey();

    if (!GROQ_API_KEY) {
      // Generate a simple title from first few words if no API key
      const words = transcript.split(' ').slice(0, 6).join(' ');
      return words.length > 50 ? words.substring(0, 47) + '...' : words;
    }

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
        temperature: 0.5,
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Groq API error:', errorText);

      // Special handling for 401 errors
      if (response.status === 401) {
        throw new Error(
          'Invalid Groq API key. Please:\n' +
          '1. Go to Settings → API Keys\n' +
          '2. Get your API key from https://console.groq.com/keys\n' +
          '3. Enter it in the Groq API Key field\n' +
          '4. Click "Save API Keys"\n\n' +
          'The default API key is invalid or expired.'
        );
      }

      throw new Error(`Groq API error: ${response.status}`);
    }

    const result = await response.json();
    let title = result.choices?.[0]?.message?.content?.trim() || 'Meeting Discussion';

    // Clean up the title (remove quotes, extra punctuation)
    title = title.replace(/^["']|["']$/g, '').replace(/\.$/, '').trim();

    // Limit to reasonable length
    if (title.length > 60) {
      title = title.substring(0, 57) + '...';
    }

    console.log('📝 Generated meeting title:', title);
    return title;
  } catch (error) {
    console.error('❌ Title generation failed:', error);
    return 'Meeting Discussion';
  }
}
