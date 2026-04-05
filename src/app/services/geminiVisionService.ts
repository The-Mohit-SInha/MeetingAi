/**
 * Gemini Vision Service
 * Uses Google's Gemini Vision API to extract participant names from video frames
 * This is more accurate than OCR for reading names from meeting platform interfaces
 */

export interface GeminiVisionConfig {
  apiKey?: string;
}

/**
 * Extract participant names from an image using Gemini Vision API
 */
async function extractNamesFromImageWithGemini(
  imageDataUrl: string,
  apiKey: string
): Promise<string[]> {
  try {
    console.log('🔄 Calling Gemini Vision API...');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `This is a screenshot from an online meeting (Google Meet, Zoom, Microsoft Teams, etc.).

TASK: Find ALL participant names visible in this meeting interface.

WHERE TO LOOK:
- Look carefully at each video tile/box showing participants
- Names appear as WHITE TEXT on a DARK OVERLAY at the BOTTOM of each video tile
- The person currently speaking has a GREEN or COLORED BORDER around their video tile
- Look for text overlays that say names like "John Smith", "Sarah Miller", "Mike Johnson", etc.
- Some names may have tags like "(You)", "(Host)", "(Guest)", "(Presenter)"

IMPORTANT:
- Look at EVERY video tile in the grid, including small thumbnails
- Names are usually 2-20 characters long
- Extract the EXACT name as shown (first name and/or last name)
- Ignore UI buttons like "Mute", "Pin", "More options", "Share screen", "Leave call"
- If you see a name, include it even if it's partially visible

OUTPUT FORMAT:
Return ONLY the names as a comma-separated list. For example:
John Smith, Sarah Miller, Mike Johnson

If absolutely no participant names are visible anywhere, respond with: NONE

Participant names found:`,
                },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: imageDataUrl.split(',')[1], // Remove data:image/jpeg;base64, prefix
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    console.log('📡 Gemini API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API error response:', errorText);
      throw new Error(`Gemini API returned ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('📦 Gemini API full response:', JSON.stringify(result, null, 2));

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('📝 Gemini extracted text:', text);

    // Parse the response
    if (text.trim().toUpperCase() === 'NONE' || !text.trim()) {
      return [];
    }

    // Split by commas and clean up
    const names = text
      .split(/[,\n]/)
      .map((name) => name.trim())
      .filter((name) => name.length > 0 && name.length < 50)
      .filter((name) => !name.toLowerCase().includes('none'))
      .filter((name) => !name.toLowerCase().includes('no participant'))
      .filter((name) => {
        // Remove common false positives
        const lower = name.toLowerCase();
        return (
          !lower.includes('mute') &&
          !lower.includes('video') &&
          !lower.includes('audio') &&
          !lower.includes('share') &&
          !lower.includes('chat') &&
          !lower.includes('meeting')
        );
      });

    console.log('✅ Parsed names from response:', names.join(', ') || 'none');
    return names;
  } catch (error) {
    console.error('❌ Gemini Vision API call failed:', error);
    throw error; // Re-throw to let caller handle it
  }
}

/**
 * Convert ImageData to base64 JPEG data URL
 */
function imageDataToDataURL(imageData: ImageData): string {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.8);
}

/**
 * Extract participant names from video frames using Gemini Vision
 */
export async function extractParticipantsWithGemini(
  frames: ImageData[],
  apiKey: string
): Promise<string[]> {
  console.log('🤖 ═══════════════════════════════════════════════════════');
  console.log('🤖 EXTRACTING PARTICIPANTS USING GEMINI VISION API');
  console.log('🤖 ═══════════════════════════════════════════════════════');
  console.log('📊 Total frames to process:', frames.length);
  console.log('🔑 API key provided:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NONE');

  if (!apiKey || apiKey.trim().length === 0) {
    console.error('❌ No API key provided!');
    return [];
  }

  const allNames = new Set<string>();
  const nameFrequency = new Map<string, number>();
  let successfulFrames = 0;
  let failedFrames = 0;

  for (let i = 0; i < frames.length; i++) {
    console.log(`🔍 Processing frame ${i + 1}/${frames.length} with Gemini Vision...`);
    console.log(`   Frame dimensions: ${frames[i].width}x${frames[i].height}`);

    try {
      // Convert frame to data URL
      const dataUrl = imageDataToDataURL(frames[i]);
      console.log(`   Image size: ${(dataUrl.length / 1024).toFixed(2)} KB`);

      // Extract names using Gemini Vision
      const names = await extractNamesFromImageWithGemini(dataUrl, apiKey);

      console.log(`  👥 Frame ${i + 1} found:`, names.length > 0 ? names.join(', ') : 'none');

      if (names.length > 0) {
        successfulFrames++;
      }

      // Track frequency
      names.forEach((name) => {
        allNames.add(name);
        nameFrequency.set(name, (nameFrequency.get(name) || 0) + 1);
      });

      // Small delay to avoid rate limiting (100ms is enough)
      if (i < frames.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      failedFrames++;
      console.warn(`⚠️ Failed to process frame ${i + 1}:`, error);
      // Continue with other frames even if one fails
    }
  }

  // Sort by frequency - names appearing in more frames are more reliable
  const sortedNames = Array.from(allNames).sort((a, b) => {
    const freqA = nameFrequency.get(a) || 0;
    const freqB = nameFrequency.get(b) || 0;
    return freqB - freqA;
  });

  console.log('🤖 ═══════════════════════════════════════════════════════');
  console.log('✅ GEMINI VISION EXTRACTION COMPLETE');
  console.log('📊 Frames processed successfully:', successfulFrames);
  console.log('❌ Frames that failed:', failedFrames);
  console.log('👥 Total unique names found:', sortedNames.length);
  console.log('📊 Name frequency across frames:');
  sortedNames.forEach((name) => {
    const count = nameFrequency.get(name) || 0;
    console.log(`   ${name}: ${count} frame(s)`);
  });
  console.log('📋 Participants:', sortedNames.join(', ') || 'none');
  console.log('🤖 ═══════════════════════════════════════════════════════');

  return sortedNames;
}
