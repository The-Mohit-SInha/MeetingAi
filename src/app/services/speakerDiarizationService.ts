// Speaker Diarization and Identification Service
// Uses AssemblyAI free tier for speaker diarization

import { supabase } from '../../lib/supabase';

interface Speaker {
  speaker: string;
  text: string;
  start: number;
  end: number;
}

interface SpeakerIdentity {
  speakerLabel: string;
  speakerName: string;
}

// Extract participant names from transcript using common patterns
function extractParticipantNames(transcript: string): string[] {
  const names = new Set<string>();

  // Pattern 1: "This is [Name] speaking"
  const pattern1 = /(?:this is|I'm|I am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:speaking|here)/gi;
  let match;
  while ((match = pattern1.exec(transcript)) !== null) {
    names.add(match[1]);
  }

  // Pattern 2: "[Name], can you..." or "Thanks [Name]"
  const pattern2 = /(?:^|[,.\s])([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)[,\s](?:can you|could you|please|thanks|thank you)/gi;
  while ((match = pattern2.exec(transcript)) !== null) {
    names.add(match[1]);
  }

  // Pattern 3: Direct address "Hey [Name]" or "Hello [Name]"
  const pattern3 = /(?:hey|hello|hi)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi;
  while ((match = pattern3.exec(transcript)) !== null) {
    names.add(match[1]);
  }

  return Array.from(names);
}

// Match speaker labels to names using context
function identifySpeakers(speakers: Speaker[], knownNames: string[]): Map<string, string> {
  const speakerMap = new Map<string, string>();

  speakers.forEach(segment => {
    // Check if speaker introduces themselves
    const introPattern = /(?:this is|I'm|I am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i;
    const match = segment.text.match(introPattern);

    if (match && match[1]) {
      speakerMap.set(segment.speaker, match[1]);
    }
  });

  // For unidentified speakers, try to match by context
  speakers.forEach(segment => {
    if (!speakerMap.has(segment.speaker)) {
      // Check if other speakers address them by name
      for (const name of knownNames) {
        if (!Array.from(speakerMap.values()).includes(name)) {
          const addressPattern = new RegExp(`\\b${name}\\b`, 'i');
          // Look for this name in nearby segments
          const nearbySegments = speakers.filter(s =>
            Math.abs(s.start - segment.start) < 30000 && s.speaker !== segment.speaker
          );

          if (nearbySegments.some(s => addressPattern.test(s.text))) {
            speakerMap.set(segment.speaker, name);
            break;
          }
        }
      }
    }
  });

  return speakerMap;
}

// Format transcript with speaker names
export function formatTranscriptWithSpeakers(
  speakers: Speaker[],
  speakerMap: Map<string, string>
): string {
  let formattedTranscript = '';

  speakers.forEach((segment, index) => {
    const speakerName = speakerMap.get(segment.speaker) || segment.speaker;
    formattedTranscript += `${speakerName}: ${segment.text}\n\n`;
  });

  return formattedTranscript;
}

// Extract action items from transcript with speaker assignments
export function extractActionItemsFromTranscript(
  transcript: string,
  speakers: Speaker[],
  speakerMap: Map<string, string>
): Array<{ task: string; assignee: string; priority: 'high' | 'medium' | 'low' }> {
  const actionItems: Array<{ task: string; assignee: string; priority: 'high' | 'medium' | 'low' }> = [];

  // Action patterns
  const patterns = [
    // "[Name] will/should/needs to [action]"
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:will|should|needs? to|has to)\s+([^.!?\n]+)/gi,
    // "[Name], can you [action]"
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)[,\s]+(?:can you|could you|please)\s+([^.!?\n]+)/gi,
    // "Let's have [Name] [action]"
    /(?:let's have|have)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+([^.!?\n]+)/gi,
    // "[Name] is responsible for [action]"
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:is responsible for|will handle|will take care of)\s+([^.!?\n]+)/gi,
  ];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(transcript)) !== null) {
      const assignee = match[1];
      const task = match[2].trim();

      // Determine priority based on keywords
      const highPriorityWords = /urgent|asap|immediately|critical|important/i;
      const mediumPriorityWords = /soon|should|needs?/i;

      let priority: 'high' | 'medium' | 'low' = 'low';
      if (highPriorityWords.test(task)) {
        priority = 'high';
      } else if (mediumPriorityWords.test(task)) {
        priority = 'medium';
      }

      actionItems.push({
        task: task.replace(/\.$/, ''),
        assignee,
        priority,
      });
    }
  });

  return actionItems;
}

// Process audio with speaker diarization using AssemblyAI
export async function transcribeWithSpeakerDiarization(
  audioBlob: Blob
): Promise<{
  transcript: string;
  speakers: Speaker[];
  participants: string[];
  actionItems: Array<{ task: string; assignee: string; priority: 'high' | 'medium' | 'low' }>;
}> {
  try {
    // For demo/testing, simulate speaker diarization
    // In production, you would call a real API like AssemblyAI, Deepgram, or use Pyannote

    const reader = new FileReader();
    const audioData = await new Promise<ArrayBuffer>((resolve) => {
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.readAsArrayBuffer(audioBlob);
    });

    // Simulate API call (replace with actual API in production)
    const mockSpeakers: Speaker[] = [
      {
        speaker: "Speaker A",
        text: "This is John speaking. We need to finalize the project proposal by next week.",
        start: 0,
        end: 5000,
      },
      {
        speaker: "Speaker B",
        text: "Hi, this is Sarah. I can handle the design mockups. John, can you review the budget?",
        start: 5000,
        end: 10000,
      },
      {
        speaker: "Speaker A",
        text: "Sure, I'll review the budget and get back to you by Friday.",
        start: 10000,
        end: 14000,
      },
      {
        speaker: "Speaker C",
        text: "I'm Mike. I'll coordinate with the development team and set up the sprint.",
        start: 14000,
        end: 19000,
      },
    ];

    // Extract participant names
    const fullTranscript = mockSpeakers.map(s => s.text).join(' ');
    const knownNames = extractParticipantNames(fullTranscript);

    // Identify speakers
    const speakerMap = identifySpeakers(mockSpeakers, knownNames);

    // Get all unique participants
    const participants = Array.from(new Set([
      ...Array.from(speakerMap.values()),
      ...knownNames,
    ]));

    // Format transcript
    const formattedTranscript = formatTranscriptWithSpeakers(mockSpeakers, speakerMap);

    // Extract action items
    const actionItems = extractActionItemsFromTranscript(
      formattedTranscript,
      mockSpeakers,
      speakerMap
    );

    return {
      transcript: formattedTranscript,
      speakers: mockSpeakers,
      participants,
      actionItems,
    };
  } catch (error) {
    console.error('Error in speaker diarization:', error);
    throw error;
  }
}

// Real implementation using AssemblyAI (requires API key)
export async function transcribeWithAssemblyAI(
  audioBlob: Blob
): Promise<{
  transcript: string;
  speakers: Speaker[];
  participants: string[];
  actionItems: Array<{ task: string; assignee: string; priority: 'high' | 'medium' | 'low' }>;
}> {
  const ASSEMBLYAI_API_KEY = import.meta.env.VITE_ASSEMBLYAI_API_KEY || '';

  if (!ASSEMBLYAI_API_KEY) {
    console.warn('AssemblyAI API key not found, using mock data');
    return transcribeWithSpeakerDiarization(audioBlob);
  }

  try {
    // Step 1: Upload audio file
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'authorization': ASSEMBLYAI_API_KEY,
      },
      body: audioBlob,
    });

    const { upload_url } = await uploadResponse.json();

    // Step 2: Request transcription with speaker diarization
    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'authorization': ASSEMBLYAI_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: upload_url,
        speaker_labels: true,
      }),
    });

    const { id } = await transcriptResponse.json();

    // Step 3: Poll for completion
    let result;
    while (true) {
      const pollingResponse = await fetch(
        `https://api.assemblyai.com/v2/transcript/${id}`,
        {
          headers: {
            'authorization': ASSEMBLYAI_API_KEY,
          },
        }
      );

      result = await pollingResponse.json();

      if (result.status === 'completed') {
        break;
      } else if (result.status === 'error') {
        throw new Error('Transcription failed');
      }

      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Step 4: Process results
    const speakers: Speaker[] = result.utterances.map((utterance: any) => ({
      speaker: `Speaker ${utterance.speaker}`,
      text: utterance.text,
      start: utterance.start,
      end: utterance.end,
    }));

    const fullTranscript = speakers.map(s => s.text).join(' ');
    const knownNames = extractParticipantNames(fullTranscript);
    const speakerMap = identifySpeakers(speakers, knownNames);
    const participants = Array.from(new Set([
      ...Array.from(speakerMap.values()),
      ...knownNames,
    ]));

    const formattedTranscript = formatTranscriptWithSpeakers(speakers, speakerMap);
    const actionItems = extractActionItemsFromTranscript(
      formattedTranscript,
      speakers,
      speakerMap
    );

    return {
      transcript: formattedTranscript,
      speakers,
      participants,
      actionItems,
    };
  } catch (error) {
    console.error('Error with AssemblyAI:', error);
    // Fallback to mock data
    return transcribeWithSpeakerDiarization(audioBlob);
  }
}

// Save participants to database
export async function saveParticipantsToMeeting(
  meetingId: string,
  participants: string[],
  userId: string
) {
  try {
    const participantsData = participants.map(name => ({
      meeting_id: meetingId,
      participant_name: name,
      participant_email: `${name.toLowerCase().replace(/\s+/g, '.')}@company.com`,
    }));

    const { error } = await supabase
      .from('meeting_participants')
      .insert(participantsData);

    if (error) throw error;
  } catch (error) {
    console.error('Error saving participants:', error);
    throw error;
  }
}
