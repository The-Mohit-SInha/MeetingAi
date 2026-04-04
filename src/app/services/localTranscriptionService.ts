/**
 * Local (in-browser) transcription service using Hugging Face Transformers.js
 * Runs the Whisper tiny model entirely client-side via WASM — completely free, no API keys.
 * Model is ~40MB, downloaded once and cached by the browser.
 */
import { pipeline, type AutomaticSpeechRecognitionPipeline } from '@huggingface/transformers';

let transcriber: AutomaticSpeechRecognitionPipeline | null = null;
let loadingPromise: Promise<AutomaticSpeechRecognitionPipeline> | null = null;

/**
 * Load (or return cached) Whisper pipeline.
 * onProgress is called during model download with a 0-1 value.
 */
export async function getTranscriber(
  onProgress?: (progress: number) => void
): Promise<AutomaticSpeechRecognitionPipeline> {
  if (transcriber) return transcriber;
  if (loadingPromise) return loadingPromise;

  loadingPromise = pipeline(
    'automatic-speech-recognition',
    'onnx-community/whisper-tiny.en',
    {
      dtype: 'q8',
      device: 'wasm',
      progress_callback: (p: any) => {
        if (p.status === 'progress' && onProgress) {
          onProgress(p.progress / 100);
        }
      },
    } as any,
  ).then((t) => {
    transcriber = t as AutomaticSpeechRecognitionPipeline;
    loadingPromise = null;
    return transcriber;
  });

  return loadingPromise;
}

/**
 * Decode a WebM/audio Blob into a Float32Array of 16 kHz mono PCM samples
 * (the format Whisper expects).
 */
async function decodeAudioBlob(blob: Blob): Promise<Float32Array> {
  const arrayBuffer = await blob.arrayBuffer();
  const audioCtx = new OfflineAudioContext(1, 1, 16000); // just to decode
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  // Resample to 16 kHz mono
  const offlineCtx = new OfflineAudioContext(1, Math.ceil(audioBuffer.duration * 16000), 16000);
  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineCtx.destination);
  source.start();
  const rendered = await offlineCtx.startRendering();
  return rendered.getChannelData(0);
}

/**
 * Transcribe an audio Blob using the local Whisper model.
 * Returns the full transcript string.
 */
export async function transcribeAudioBlob(
  blob: Blob,
  onProgress?: (progress: number) => void,
  onModelLoading?: (loading: boolean) => void,
): Promise<string> {
  console.log('🧠 Starting local transcription...');

  // 1. Load model
  onModelLoading?.(true);
  const asr = await getTranscriber(onProgress);
  onModelLoading?.(false);
  console.log('✅ Whisper model ready');

  // 2. Decode audio to 16kHz PCM
  console.log('🔊 Decoding audio blob...', (blob.size / 1024 / 1024).toFixed(2), 'MB');
  const pcmData = await decodeAudioBlob(blob);
  console.log('✅ Decoded to', pcmData.length, 'samples (', (pcmData.length / 16000).toFixed(1), 'seconds)');

  // 3. Run transcription
  console.log('🤖 Running Whisper inference...');
  const result = await asr(pcmData, {
    chunk_length_s: 30,
    stride_length_s: 5,
    return_timestamps: false,
  });

  const text = Array.isArray(result) ? result.map((r: any) => r.text).join(' ') : (result as any).text || '';
  console.log('✅ Transcription complete:', text.length, 'chars');
  return text.trim();
}
