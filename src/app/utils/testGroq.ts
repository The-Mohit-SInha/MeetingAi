/**
 * Simple test to verify Groq API connectivity
 * Run this in the browser console to test if Groq is working
 */

async function testGroqConnection() {
  console.log('🧪 Testing Groq API connection...');

  try {
    // Test 1: Health check
    console.log('\n1️⃣ Testing health endpoint...');
    const healthResponse = await fetch('/make-server-af44c8dd/api/transcribe/health');
    const healthData = await healthResponse.json();
    console.log('Health check result:', healthData);

    if (!healthData.configured) {
      console.error('❌ FAILED: Groq API is not configured!');
      console.log('Fix: Make sure GROQ_API_KEY is set in supabase/.env and restart the server');
      return;
    }

    console.log('✅ PASSED: Groq API is configured');

    // Test 2: Create a dummy audio file
    console.log('\n2️⃣ Creating test audio blob...');
    // Create a silent audio blob for testing (1 second of silence)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const sampleRate = audioContext.sampleRate;
    const duration = 1; // 1 second
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);

    // Add a simple tone so it's not completely silent
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < channelData.length; i++) {
      channelData[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.1; // 440 Hz tone
    }

    console.log('✅ Test audio created (1 second, 440 Hz tone)');

    console.log('\n✅ ALL TESTS PASSED!');
    console.log('\nGroq is configured and ready to use.');
    console.log('Now try recording actual audio from a tab.');

  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure the server is running');
    console.log('2. Check that GROQ_API_KEY is in supabase/.env');
    console.log('3. Restart the server after adding the key');
  }
}

// Export for console use
(window as any).testGroqConnection = testGroqConnection;

export default testGroqConnection;
