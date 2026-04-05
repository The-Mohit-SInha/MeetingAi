/**
 * Transcript Formatting Service
 * Uses AI to format transcripts with speaker labels extracted from the conversation
 */

const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface FormattedTranscript {
  formattedText: string;
  participants: string[];
}

/**
 * Format a raw transcript with speaker labels using AI
 * Extracts speaker names from the conversation and formats as "Name: dialogue"
 */
export async function formatTranscriptWithSpeakers(
  rawTranscript: string,
  accountHolderName?: string,
  knownParticipants?: string[]
): Promise<FormattedTranscript> {
  try {
    console.log('🎭 Formatting transcript with speaker labels...');
    console.log('📝 Raw transcript length:', rawTranscript.length, 'chars');

    if (!rawTranscript || rawTranscript.trim().length === 0) {
      throw new Error('Transcript is empty');
    }

    const knownParticipantsPrompt = knownParticipants && knownParticipants.length > 0
      ? `\n\n🎯 CRITICAL - KNOWN PARTICIPANTS FROM VIDEO:
${knownParticipants.map((name, i) => `   ${i + 1}. ${name}`).join('\n')}

⚠️ MANDATORY INSTRUCTIONS:
- These names were extracted from the video recording by reading the name overlays on video tiles
- You MUST use ONLY these exact names as speaker labels in the formatted transcript
- DO NOT use "Unknown Speaker", "Speaker 1", "Speaker 2", etc.
- If there are ${knownParticipants.length} participants in the list, assign dialogue to these ${knownParticipants.length} people
- Match the dialogue to the appropriate person based on conversation context
- Example: If participant list is ["John Smith", "Sarah Miller"], format transcript as:
  "John Smith: Hey everyone!

  Sarah Miller: Thanks for joining!"

REMEMBER: The names above are the ACTUAL people in the meeting. Use them!`
      : '';

    const prompt = `You are an expert at analyzing meeting transcripts and identifying speakers.

Given the following raw meeting transcript, please:

1. FIRST: Check if there is a "KNOWN PARTICIPANTS FROM VIDEO" list below
2. IF there is a known participants list, you MUST use ONLY those exact names as speaker labels
3. DO NOT use "Unknown Speaker" when you have known participant names available
4. Assign dialogue to the participants based on conversation flow and context

FORMAT REQUIREMENTS:
- Use "Name: what they said" format
- Each speaker's dialogue should be on a separate line with a blank line between speakers
- Use the EXACT names from the Known Participants list
- Track conversation flow to determine who is speaking when

${accountHolderName ? `IMPORTANT: The account holder's name is "${accountHolderName}". When you see speech from microphone labeled "[Account holder speaking]", attribute that to "${accountHolderName}".` : ''}${knownParticipantsPrompt}

Respond ONLY with a valid JSON object in this exact format:
{
  "formattedTranscript": "Name1: dialogue here\\n\\nName2: response here\\n\\nName1: more dialogue...",
  "participants": ["Name1", "Name2", "Name3"]
}

Raw Transcript:
${rawTranscript}`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an expert AI assistant specialized in transcript analysis, speaker diarization, and conversational analysis. You excel at identifying different speakers from context clues, speech patterns, and conversational flow. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2, // Lower temperature for more consistent speaker identification
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      }),
    });

    console.log('📥 Groq formatting response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Groq API error:', errorText);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in response');
    }

    console.log('🧠 Raw formatting response:', content.substring(0, 200) + '...');

    const parsed = JSON.parse(content);

    const formattedTranscript: FormattedTranscript = {
      formattedText: parsed.formattedTranscript || rawTranscript,
      participants: Array.isArray(parsed.participants) ? parsed.participants : []
    };

    console.log('✅ Transcript formatting complete:', {
      participantsFound: formattedTranscript.participants.length,
      formattedLength: formattedTranscript.formattedText.length,
      participants: formattedTranscript.participants
    });

    return formattedTranscript;
  } catch (error: any) {
    console.error('❌ Transcript formatting failed:', error);

    // Fallback: return the raw transcript
    return {
      formattedText: rawTranscript,
      participants: []
    };
  }
}

/**
 * Format combined transcript from microphone and tab audio
 */
export async function formatCombinedTranscript(
  micTranscript: string,
  tabTranscript: string,
  accountHolderName: string,
  videoExtractedParticipants?: string[]
): Promise<FormattedTranscript> {
  try {
    console.log('🎭 ═══════════════════════════════════════════════════════');
    console.log('🎭 FORMATTING COMBINED TRANSCRIPT WITH SPEAKER LABELS');
    console.log('🎭 ═══════════════════════════════════════════════════════');

    // Combine the transcripts
    let combinedRaw = '';

    if (micTranscript && micTranscript.trim().length > 0) {
      combinedRaw += `[Account holder speaking]: ${micTranscript}\n\n`;
    }

    if (tabTranscript && tabTranscript.trim().length > 0) {
      combinedRaw += `[Other participants]: ${tabTranscript}`;
    }

    if (!combinedRaw.trim()) {
      throw new Error('No transcript content to format');
    }

    console.log('📝 Combined raw transcript length:', combinedRaw.length, 'chars');
    if (videoExtractedParticipants && videoExtractedParticipants.length > 0) {
      console.log('👁️ Video-extracted participants to help with identification:', videoExtractedParticipants.join(', '));
    }

    // Use AI to format with speaker labels
    const result = await formatTranscriptWithSpeakers(combinedRaw, accountHolderName, videoExtractedParticipants);

    console.log('🎭 ═══════════════════════════════════════════════════════');
    console.log('✅ TRANSCRIPT FORMATTING COMPLETE');
    console.log('👥 Participants identified:', result.participants.join(', '));
    console.log('📏 Formatted transcript length:', result.formattedText.length, 'chars');
    console.log('📝 Preview:', result.formattedText.substring(0, 300) + '...');
    console.log('🎭 ═══════════════════════════════════════════════════════');

    return result;
  } catch (error: any) {
    console.error('❌ Combined transcript formatting failed:', error);

    // Fallback: basic formatting
    let fallbackText = '';
    if (micTranscript) {
      fallbackText += `${accountHolderName}: ${micTranscript}\n\n`;
    }
    if (tabTranscript) {
      fallbackText += `[Meeting Participants]: ${tabTranscript}`;
    }

    return {
      formattedText: fallbackText,
      participants: [accountHolderName]
    };
  }
}
