/**
 * Groq Transcription Service - Using Groq's free Whisper API
 *
 * Groq provides a free tier for their Whisper API with excellent transcription quality.
 * Sign up at https://console.groq.com/ to get a free API key.
 *
 * Free tier limits:
 * - 14,400 requests per day
 * - 30 requests per minute
 * - Audio file size limit: 25MB
 */

export interface TranscriptionOptions {
  language?: string;
  temperature?: number;
  onProgress?: (chunk: string) => void;
}

/**
 * Transcribe audio using Groq's Whisper API via our edge function proxy
 */
export async function transcribeWithGroq(
  audioBlob: Blob,
  options: TranscriptionOptions = {}
): Promise<string> {
  const { language = 'en', temperature = 0, onProgress } = options;

  try {
    console.log('🎯 Starting Groq transcription...', {
      size: `${(audioBlob.size / 1024 / 1024).toFixed(2)} MB`,
      type: audioBlob.type,
    });

    // Check file size
    const maxSize = 25 * 1024 * 1024; // 25MB limit
    if (audioBlob.size > maxSize) {
      throw new Error(`Audio file too large (${(audioBlob.size / 1024 / 1024).toFixed(2)} MB). Maximum is 25 MB.`);
    }

    if (audioBlob.size < 100) {
      throw new Error(`Audio file too small (${audioBlob.size} bytes). May be empty or corrupted.`);
    }

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-large-v3-turbo'); // Fast and accurate
    formData.append('language', language);
    formData.append('temperature', temperature.toString());
    formData.append('response_format', 'verbose_json'); // Get detailed response

    console.log('📤 Sending request to /make-server-af44c8dd/api/transcribe...');

    // Call our edge function proxy
    const response = await fetch('/make-server-af44c8dd/api/transcribe', {
      method: 'POST',
      body: formData,
    });

    console.log('📥 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      console.error('❌ Transcription API error:', error);
      throw new Error(error.error || `Transcription failed: ${response.status}`);
    }

    const result = await response.json();
    const transcript = result.text || '';

    console.log('✅ Groq transcription complete:', {
      length: transcript.length,
      duration: result.duration,
      language: result.language,
      preview: transcript.substring(0, 100) + (transcript.length > 100 ? '...' : ''),
    });

    if (!transcript || transcript.trim().length === 0) {
      console.warn('⚠️ Transcription returned empty text');
      throw new Error('Transcription returned empty text - audio may contain no speech or be corrupted');
    }

    return transcript.trim();
  } catch (error: any) {
    console.error('❌ Groq transcription error:', error);
    throw error;
  }
}

/**
 * Transcribe audio in chunks for longer recordings (sends chunks as they're recorded)
 * This provides progressive transcription for better UX
 */
export async function transcribeChunksWithGroq(
  audioChunks: Blob[],
  onProgress?: (transcript: string, chunkIndex: number) => void
): Promise<string> {
  const transcripts: string[] = [];

  console.log(`🔄 Transcribing ${audioChunks.length} audio chunks...`);

  for (let i = 0; i < audioChunks.length; i++) {
    const chunk = audioChunks[i];

    // Skip very small chunks (less than 100KB)
    if (chunk.size < 100 * 1024) {
      console.log(`⏭️ Skipping small chunk ${i + 1}/${audioChunks.length}`);
      continue;
    }

    try {
      console.log(`📝 Transcribing chunk ${i + 1}/${audioChunks.length} (${(chunk.size / 1024).toFixed(0)} KB)`);
      const text = await transcribeWithGroq(chunk);

      if (text.trim()) {
        transcripts.push(text);
        const fullTranscript = transcripts.join(' ');
        onProgress?.(fullTranscript, i);
        console.log(`✅ Chunk ${i + 1} transcribed:`, text.substring(0, 50) + '...');
      }
    } catch (error: any) {
      console.error(`⚠️ Failed to transcribe chunk ${i + 1}:`, error.message);
      // Continue with other chunks even if one fails
    }

    // Rate limiting: wait 100ms between requests to respect API limits
    if (i < audioChunks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  const finalTranscript = transcripts.join(' ').trim();
  console.log(`✅ All chunks transcribed. Total: ${finalTranscript.length} chars`);
  return finalTranscript;
}

/**
 * Check if Groq API is configured
 */
export async function isGroqConfigured(): Promise<boolean> {
  try {
    const response = await fetch('/make-server-af44c8dd/api/transcribe/health');
    if (!response.ok) {
      console.warn('⚠️ Health check failed:', response.status);
      return false;
    }
    const data = await response.json();
    console.log('🏥 Health check result:', data);
    return data.configured === true;
  } catch (error) {
    console.warn('⚠️ Health check error:', error);
    return false;
  }
}
