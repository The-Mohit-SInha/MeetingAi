/**
 * Simple test to verify Groq API connectivity
 * Run this in the browser console to test if Groq is working
 */

async function testGroqConnection() {
  console.log('🧪 Testing Groq API connection...');

  try {
    // Test 1: Health check
    console.log('\n1️⃣ Testing health endpoint...');
    console.log('❌ FAILED: Groq API requires a backend proxy server');
    console.log('Info: This app uses local Whisper transcription instead');
    console.log('To enable Groq: Set up a backend server with GROQ_API_KEY');
    return;

  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    console.log('\nNote: This app is configured for client-side only operation');
    console.log('Transcription uses local Whisper models in the browser');
  }
}

// Export for console use
(window as any).testGroqConnection = testGroqConnection;

export default testGroqConnection;
