/**
 * Direct Groq API Transcription Service
 * Calls Groq API directly from the browser using the API key
 */

const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

export interface TranscriptionResult {
  text: string;
  duration?: number;
  language?: string;
}

/**
 * Transcribe audio using Groq's Whisper API directly
 */
export async function transcribeWithGroqDirect(
  audioBlob: Blob,
  options: {
    language?: string;
    temperature?: number;
    model?: string;
  } = {}
): Promise<string> {
  const {
    language = 'en',
    temperature = 0,
    model = 'whisper-large-v3-turbo'
  } = options;

  try {
    console.log('🎯 Starting Groq direct transcription...', {
      size: `${(audioBlob.size / 1024 / 1024).toFixed(2)} MB`,
      type: audioBlob.type,
      model,
    });

    // Check file size
    const maxSize = 25 * 1024 * 1024; // 25MB limit
    if (audioBlob.size > maxSize) {
      throw new Error(`Audio file too large (${(audioBlob.size / 1024 / 1024).toFixed(2)} MB). Maximum is 25 MB.`);
    }

    if (audioBlob.size < 1000) {
      throw new Error(`Audio file too small (${audioBlob.size} bytes). May be empty or corrupted.`);
    }

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', model);
    formData.append('language', language);
    formData.append('temperature', temperature.toString());
    formData.append('response_format', 'verbose_json');

    console.log('📤 Sending request to Groq API...');

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: formData,
    });

    console.log('📥 Groq response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Groq API error:', errorText);

      let errorMessage = `Groq API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorJson.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    const result: TranscriptionResult = await response.json();
    const transcript = result.text || '';

    console.log('✅ Groq transcription complete:', {
      length: transcript.length,
      duration: result.duration,
      language: result.language,
      preview: transcript.substring(0, 100) + (transcript.length > 100 ? '...' : ''),
    });

    if (!transcript || transcript.trim().length === 0) {
      console.warn('⚠️ Transcription returned empty text - audio may contain no speech');
      return '';
    }

    return transcript.trim();
  } catch (error: any) {
    console.error('❌ Groq direct transcription error:', error);
    throw error;
  }
}

/**
 * Convert video/webm blob to audio format that Groq accepts better
 * Extracts audio track and converts to a more compatible format
 */
export async function convertToAudioBlob(videoBlob: Blob): Promise<Blob> {
  try {
    console.log('🔄 Converting video to audio...', {
      inputSize: `${(videoBlob.size / 1024 / 1024).toFixed(2)} MB`,
      inputType: videoBlob.type,
    });

    // Decode video to extract audio using Web Audio API
    const arrayBuffer = await videoBlob.arrayBuffer();
    const audioContext = new AudioContext();

    let audioBuffer: AudioBuffer;
    try {
      audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    } catch (decodeError) {
      console.error('❌ Failed to decode audio from video:', decodeError);
      throw new Error('Could not decode audio from video - video may not contain audio track');
    }

    console.log('✅ Audio decoded:', {
      duration: `${audioBuffer.duration.toFixed(2)}s`,
      sampleRate: audioBuffer.sampleRate,
      channels: audioBuffer.numberOfChannels,
    });

    // Check if audio is silent
    const channelData = audioBuffer.getChannelData(0);
    let maxAmplitude = 0;
    for (let i = 0; i < channelData.length; i++) {
      const abs = Math.abs(channelData[i]);
      if (abs > maxAmplitude) {
        maxAmplitude = abs;
      }
    }
    console.log('🔊 Max audio amplitude:', maxAmplitude);

    if (maxAmplitude < 0.001) {
      throw new Error('Audio appears to be silent (max amplitude < 0.001). No audio was captured.');
    }

    // Create offline context to render audio to WAV
    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );

    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start();

    const renderedBuffer = await offlineContext.startRendering();

    // Convert to WAV blob
    const wavBlob = audioBufferToWav(renderedBuffer);

    console.log('✅ Converted to WAV:', {
      outputSize: `${(wavBlob.size / 1024 / 1024).toFixed(2)} MB`,
      outputType: wavBlob.type,
    });

    return wavBlob;
  } catch (error) {
    console.error('❌ Audio conversion error:', error);
    throw error;
  }
}

/**
 * Convert AudioBuffer to WAV Blob
 */
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numberOfChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numberOfChannels * bytesPerSample;

  const data = [];
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = buffer.getChannelData(channel)[i];
      const intSample = Math.max(-1, Math.min(1, sample)) * 0x7FFF;
      data.push(intSample < 0 ? intSample | 0x8000 : intSample);
    }
  }

  const dataLength = data.length * bytesPerSample;
  const bufferLength = 44 + dataLength;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, format, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // Write audio data
  let offset = 44;
  for (const sample of data) {
    view.setInt16(offset, sample, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
