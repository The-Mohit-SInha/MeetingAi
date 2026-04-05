/**
 * Video OCR Service
 * Extracts participant names from video frames using vision APIs
 * This reads the text overlays showing participant names in online meetings
 */

import Tesseract from 'tesseract.js';
import { extractParticipantsWithGemini } from './geminiVisionService';

export interface ExtractedParticipant {
  name: string;
  confidence: number;
  frameIndex: number;
}

/**
 * Extract frames from a video blob at regular intervals
 */
async function extractVideoFrames(
  videoBlob: Blob,
  numFrames: number = 10
): Promise<ImageData[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const frames: ImageData[] = [];
    const videoUrl = URL.createObjectURL(videoBlob);

    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = async () => {
      const duration = video.duration;
      const interval = duration / numFrames;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      console.log('🎬 Video metadata:', {
        duration: `${duration.toFixed(2)}s`,
        width: video.videoWidth,
        height: video.videoHeight,
        framestoExtract: numFrames,
      });

      try {
        for (let i = 0; i < numFrames; i++) {
          const time = i * interval;

          // Seek to the specific time
          await new Promise<void>((seekResolve) => {
            video.currentTime = time;
            video.onseeked = () => seekResolve();
          });

          // Draw the current frame to canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Extract image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          frames.push(imageData);

          console.log(`📸 Extracted frame ${i + 1}/${numFrames} at ${time.toFixed(2)}s`);
        }

        URL.revokeObjectURL(videoUrl);
        resolve(frames);
      } catch (error) {
        URL.revokeObjectURL(videoUrl);
        reject(error);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(videoUrl);
      reject(new Error('Failed to load video'));
    };
  });
}

/**
 * Preprocess image to improve OCR accuracy for name overlays
 * Meeting platforms show names with high contrast on video tiles
 */
function preprocessImageForOCR(imageData: ImageData): ImageData {
  const data = new Uint8ClampedArray(imageData.data);

  // Increase contrast to make text more readable
  const contrast = 1.5;
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let i = 0; i < data.length; i += 4) {
    data[i] = factor * (data[i] - 128) + 128;     // Red
    data[i + 1] = factor * (data[i + 1] - 128) + 128; // Green
    data[i + 2] = factor * (data[i + 2] - 128) + 128; // Blue
    // Alpha stays the same
  }

  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Extract text from an image using Tesseract OCR
 * Optimized for reading participant name overlays in video meetings
 */
async function extractTextFromImage(imageData: ImageData): Promise<string> {
  try {
    // Preprocess the image for better OCR
    const processedImage = preprocessImageForOCR(imageData);

    const result = await Tesseract.recognize(processedImage, 'eng', {
      logger: () => {}, // Disable logging for cleaner output
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .@-',
    });

    return result.data.text;
  } catch (error) {
    console.error('❌ OCR failed:', error);
    return '';
  }
}

/**
 * Parse participant names from OCR text
 * Optimized for name overlays shown in Zoom, Meet, Teams, etc.
 */
function parseParticipantNames(ocrText: string): string[] {
  const names = new Set<string>();

  // Split into lines - names are often on separate lines
  const lines = ocrText.split('\n').map(line => line.trim());

  for (const line of lines) {
    // Clean up the text but preserve spaces between names
    const cleanText = line.replace(/[^a-zA-Z\s.-]/g, ' ').trim();

    if (cleanText.length === 0) continue;

    // Pattern 1: Full names (First Last or First Middle Last)
    // Matches: "John Smith", "Sarah Johnson", "Mary Anne Davis"
    const fullNamePattern = /\b([A-Z][a-z]{1,15}(?:\s+[A-Z][a-z]{1,15}){1,2})\b/g;
    let match;
    while ((match = fullNamePattern.exec(cleanText)) !== null) {
      const name = match[1].trim();
      if (isValidParticipantName(name)) {
        names.add(name);
      }
    }

    // Pattern 2: Single capitalized words that might be first names or usernames
    // Common in informal meetings: "John", "Sarah", etc.
    if (cleanText.length >= 3 && cleanText.length <= 20) {
      const singleNamePattern = /^([A-Z][a-z]{2,15})$/;
      const singleMatch = cleanText.match(singleNamePattern);
      if (singleMatch && isValidParticipantName(singleMatch[1])) {
        names.add(singleMatch[1]);
      }
    }

    // Pattern 3: Names with common meeting platform formats
    // "John Smith (Host)", "Sarah (Organizer)", "Mike (Guest)"
    const platformPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*\((?:Host|Organizer|Guest|Me|You)\)/i;
    const platformMatch = line.match(platformPattern);
    if (platformMatch && isValidParticipantName(platformMatch[1])) {
      names.add(platformMatch[1].trim());
    }
  }

  return Array.from(names);
}

/**
 * Check if a string is a valid participant name
 * Filters out common UI text and invalid patterns
 */
function isValidParticipantName(name: string): boolean {
  const normalizedName = name.toLowerCase();

  // Must be reasonable length
  if (name.length < 2 || name.length > 40) return false;

  // Filter out common UI text that appears in meeting platforms
  const uiKeywords = [
    'mute', 'unmute', 'audio', 'video', 'camera', 'mic', 'microphone',
    'share', 'screen', 'chat', 'participants', 'leave', 'end', 'meeting',
    'join', 'settings', 'options', 'more', 'reactions', 'hand', 'raise',
    'gallery', 'speaker', 'view', 'record', 'recording', 'breakout',
    'waiting', 'room', 'admit', 'everyone', 'host', 'cohost', 'minimize'
  ];

  for (const keyword of uiKeywords) {
    if (normalizedName.includes(keyword)) return false;
  }

  // Filter out common words that might be misread as names
  const commonWords = [
    'the', 'and', 'for', 'are', 'with', 'this', 'that', 'from',
    'your', 'have', 'more', 'what', 'when', 'where', 'which', 'click'
  ];

  if (commonWords.includes(normalizedName)) return false;

  return true;
}

/**
 * Extract participant names from video using Vision AI
 * This reads the name overlays shown in online meeting recordings
 * Uses Gemini Vision API (free tier) for better accuracy, falls back to Tesseract OCR
 */
export async function extractParticipantsFromVideo(
  videoBlob: Blob,
  options: {
    numFrames?: number;
    minConfidence?: number;
    geminiApiKey?: string;
  } = {}
): Promise<string[]> {
  const { numFrames = 8, minConfidence = 60, geminiApiKey } = options;

  try {
    console.log('👁️ ═══════════════════════════════════════════════════════');
    console.log('👁️ EXTRACTING PARTICIPANTS FROM VIDEO');
    console.log('👁️ ═══════════════════════════════════════════════════════');
    console.log('📊 Video size:', `${(videoBlob.size / 1024 / 1024).toFixed(2)} MB`);
    console.log('🎬 Extracting', numFrames, 'frames for analysis...');

    // Extract frames from the video
    const frames = await extractVideoFrames(videoBlob, numFrames);
    console.log('✅ Extracted', frames.length, 'frames');

    // Try Gemini Vision API first if API key is provided
    if (geminiApiKey && geminiApiKey.trim().length > 0) {
      console.log('🤖 Using Gemini Vision API for intelligent name extraction...');
      try {
        const geminiResults = await extractParticipantsWithGemini(frames, geminiApiKey);
        if (geminiResults.length > 0) {
          return geminiResults;
        }
        console.log('⚠️ Gemini Vision found no participants, falling back to Tesseract OCR...');
      } catch (error) {
        console.warn('⚠️ Gemini Vision API failed, falling back to Tesseract OCR:', error);
      }
    } else {
      console.log('ℹ️ No Gemini API key provided, using Tesseract OCR...');
      console.log('💡 Tip: Add VITE_GEMINI_API_KEY to .env for better name extraction');
    }

    // Fallback to Tesseract OCR
    console.log('📝 Using Tesseract OCR for text extraction...');
    const allNames = new Set<string>();
    const participantCounts = new Map<string, number>();

    for (let i = 0; i < frames.length; i++) {
      console.log(`🔍 Processing frame ${i + 1}/${frames.length} with OCR...`);

      const text = await extractTextFromImage(frames[i]);
      const namesInFrame = parseParticipantNames(text);

      console.log(`  📝 Frame ${i + 1} OCR text:`, text.substring(0, 100) + '...');
      console.log(`  👥 Names found:`, namesInFrame.length > 0 ? namesInFrame.join(', ') : 'none');

      // Count occurrences of each name across frames
      namesInFrame.forEach(name => {
        allNames.add(name);
        participantCounts.set(name, (participantCounts.get(name) || 0) + 1);
      });
    }

    // Filter names that appear in multiple frames (more reliable)
    // Lower threshold to 1 since name overlays might not be visible in all frames
    const reliableParticipants = Array.from(allNames).filter(name => {
      const count = participantCounts.get(name) || 0;
      return count >= 1; // Accept names that appear in at least 1 frame with good OCR
    });

    console.log('👁️ ═══════════════════════════════════════════════════════');
    console.log('✅ EXTRACTION COMPLETE');
    console.log('👥 Total unique names found:', allNames.size);
    console.log('📊 Name frequency across frames:');
    Array.from(participantCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([name, count]) => {
        console.log(`   ${name}: ${count} frame(s)`);
      });
    console.log('👥 Reliable participants:', reliableParticipants.length);
    console.log('📋 Participants:', reliableParticipants.join(', ') || 'none');
    console.log('👁️ ═══════════════════════════════════════════════════════');

    return reliableParticipants;
  } catch (error: any) {
    console.error('❌ Video OCR extraction failed:', error);
    console.error('This is expected if the video has no visible name overlays');
    return [];
  }
}

/**
 * Faster version: Extract participant names from a single frame
 * Use this for quick analysis when you don't need high reliability
 */
export async function extractParticipantsFromVideoQuick(
  videoBlob: Blob
): Promise<string[]> {
  try {
    console.log('⚡ Quick OCR extraction from video...');

    // Extract just one frame from the middle of the video
    const frames = await extractVideoFrames(videoBlob, 1);

    if (frames.length === 0) {
      return [];
    }

    const text = await extractTextFromImage(frames[0]);
    const names = parseParticipantNames(text);

    console.log('⚡ Quick extraction found:', names.length, 'participants');
    return names;
  } catch (error) {
    console.error('❌ Quick video OCR failed:', error);
    return [];
  }
}
