/**
 * Test utility for Gemini Vision API
 * Use this to verify the API key works and can read names from meeting screenshots
 */

export async function testGeminiVisionWithImage(apiKey: string, imageUrl: string): Promise<void> {
  console.log('🧪 ═══════════════════════════════════════════════════════');
  console.log('🧪 TESTING GEMINI VISION API');
  console.log('🧪 ═══════════════════════════════════════════════════════');
  console.log('🔑 API Key:', apiKey ? `${apiKey.substring(0, 15)}...` : 'NONE');

  if (!apiKey) {
    console.error('❌ No API key provided!');
    return;
  }

  try {
    // Convert image URL to base64
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve) => {
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.readAsDataURL(blob);
    });

    const base64Image = await base64Promise;
    console.log('📸 Image loaded, size:', (base64Image.length / 1024).toFixed(2), 'KB');

    // Call Gemini Vision API
    console.log('🔄 Calling Gemini Vision API...');
    const apiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Look at this Google Meet screenshot. Find ALL participant names visible on the video tiles. Names appear as white text at the bottom of each video tile. The person speaking has a GREEN BORDER. List all names you can see, separated by commas.`
              },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: base64Image
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 200
          }
        })
      }
    );

    console.log('📡 API Response Status:', apiResponse.status);

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('❌ API Error:', errorText);
      throw new Error(`API returned ${apiResponse.status}: ${errorText}`);
    }

    const result = await apiResponse.json();
    console.log('✅ API Response:', JSON.stringify(result, null, 2));

    const extractedText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('📝 Extracted Names:', extractedText);

    console.log('🧪 ═══════════════════════════════════════════════════════');
    console.log('✅ TEST COMPLETE');
    console.log('🧪 ═══════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Expose globally for console testing
(window as any).testGeminiVision = testGeminiVisionWithImage;
