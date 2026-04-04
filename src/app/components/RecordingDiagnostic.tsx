import { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function RecordingDiagnostic() {
  const { theme } = useTheme();
  const [diagnostics, setDiagnostics] = useState<{
    getDisplayMedia: boolean | null;
    mediaRecorder: boolean | null;
    webmOpus: boolean | null;
    userMedia: boolean | null;
  }>({
    getDisplayMedia: null,
    mediaRecorder: null,
    webmOpus: null,
    userMedia: null,
  });
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const runDiagnostics = async () => {
    setTesting(true);
    const results: string[] = [];

    // Check getDisplayMedia API
    const hasGetDisplayMedia = !!navigator.mediaDevices?.getDisplayMedia;
    setDiagnostics(prev => ({ ...prev, getDisplayMedia: hasGetDisplayMedia }));
    results.push(`getDisplayMedia: ${hasGetDisplayMedia ? '✅ Available' : '❌ Not available'}`);

    // Check MediaRecorder API
    const hasMediaRecorder = typeof MediaRecorder !== 'undefined';
    setDiagnostics(prev => ({ ...prev, mediaRecorder: hasMediaRecorder }));
    results.push(`MediaRecorder: ${hasMediaRecorder ? '✅ Available' : '❌ Not available'}`);

    // Check webm/opus support
    const supportsWebmOpus = hasMediaRecorder && MediaRecorder.isTypeSupported('audio/webm;codecs=opus');
    setDiagnostics(prev => ({ ...prev, webmOpus: supportsWebmOpus }));
    results.push(`audio/webm;codecs=opus: ${supportsWebmOpus ? '✅ Supported' : '⚠️ Not supported'}`);

    // Check getUserMedia (microphone)
    const hasUserMedia = !!navigator.mediaDevices?.getUserMedia;
    setDiagnostics(prev => ({ ...prev, userMedia: hasUserMedia }));
    results.push(`getUserMedia: ${hasUserMedia ? '✅ Available' : '❌ Not available'}`);

    // Check permissions policy
    results.push('');
    results.push('🔒 Checking Permissions Policy...');
    try {
      const permissionStatus = (document as any).featurePolicy?.allowsFeature?.('display-capture');
      if (permissionStatus === false) {
        results.push('❌ BLOCKED: display-capture is disallowed by permissions policy');
        results.push('   This is a Figma Make sandbox restriction');
        results.push('   Tab capture will NOT work in this environment');
        results.push('');
        results.push('💡 Solution: Deploy app to a standard web host (Vercel, Netlify, etc.)');
        setTestResults(results);
        setTesting(false);
        return;
      } else {
        results.push('✅ display-capture is allowed');
      }
    } catch (error) {
      results.push('⚠️ Could not check permissions policy');
    }

    // Try actual tab capture
    if (hasGetDisplayMedia) {
      try {
        results.push('');
        results.push('🎬 Testing actual tab capture...');
        setTestResults([...results]);

        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        } as any);

        const audioTracks = stream.getAudioTracks();
        const videoTracks = stream.getVideoTracks();

        results.push(`✅ Screen sharing granted`);
        results.push(`  - Video tracks: ${videoTracks.length}`);
        results.push(`  - Audio tracks: ${audioTracks.length}`);

        if (audioTracks.length === 0) {
          results.push('❌ NO AUDIO TRACKS - User must check "Share tab audio" in the dialog!');
        } else {
          results.push(`✅ Audio track detected: ${audioTracks[0].label}`);
          results.push(`  - Enabled: ${audioTracks[0].enabled}`);
          results.push(`  - Ready state: ${audioTracks[0].readyState}`);

          // Test MediaRecorder with this stream
          try {
            const recorder = new MediaRecorder(new MediaStream(audioTracks), {
              mimeType: 'audio/webm;codecs=opus',
            });
            const chunks: Blob[] = [];
            recorder.ondataavailable = (e) => {
              if (e.data.size > 0) {
                chunks.push(e.data);
                results.push(`📦 Chunk received: ${e.data.size} bytes`);
                setTestResults([...results]);
              }
            };
            recorder.start(1000);
            results.push('🎙️ MediaRecorder started, recording for 3 seconds...');
            setTestResults([...results]);

            setTimeout(() => {
              recorder.stop();
              results.push(`✅ Recording stopped, ${chunks.length} chunks captured`);
              results.push(`📊 Total size: ${chunks.reduce((sum, c) => sum + c.size, 0)} bytes`);
              if (chunks.length === 0 || chunks.reduce((sum, c) => sum + c.size, 0) === 0) {
                results.push('❌ NO DATA CAPTURED - Check if tab has audio playing!');
              }
              setTestResults([...results]);
              stream.getTracks().forEach(t => t.stop());
              setTesting(false);
            }, 3000);
            return; // Don't set testing to false yet
          } catch (err) {
            results.push(`❌ MediaRecorder error: ${err}`);
            setTestResults([...results]);
            stream.getTracks().forEach(t => t.stop());
          }
        }

        // Stop the stream after test
        stream.getTracks().forEach(t => t.stop());
      } catch (err: any) {
        results.push(`❌ Tab capture failed: ${err.message}`);
        if (err.name === 'NotAllowedError') {
          results.push('  - User denied permission');
        } else if (err.name === 'NotFoundError') {
          results.push('  - No suitable media found');
        } else if (err.message.includes('permissions policy')) {
          results.push('  - BLOCKED by browser permissions policy');
          results.push('  - This environment restricts display capture');
          results.push('');
          results.push('💡 This is a Figma Make limitation');
          results.push('   Deploy to a standard web host to enable tab capture');
        }
      }
    }

    setTestResults(results);
    setTesting(false);
  };

  return (
    <div className={`rounded-xl border p-6 ${
      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Recording Diagnostics
      </h3>

      <div className="space-y-3 mb-4">
        {Object.entries(diagnostics).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2">
            {value === true && <CheckCircle2 className="w-5 h-5 text-green-500" />}
            {value === false && <XCircle className="w-5 h-5 text-red-500" />}
            {value === null && <AlertCircle className="w-5 h-5 text-gray-400" />}
            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={runDiagnostics}
        disabled={testing}
        className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-lg hover:from-red-600 hover:to-orange-700 disabled:opacity-50"
      >
        {testing ? 'Testing...' : 'Run Diagnostics'}
      </button>

      {testResults.length > 0 && (
        <div className={`mt-4 p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          <pre className={`text-xs font-mono whitespace-pre-wrap ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {testResults.join('\n')}
          </pre>
        </div>
      )}

      <div className={`mt-4 p-4 rounded-lg ${
        theme === 'dark' ? 'bg-blue-900/20 border border-blue-800/30' : 'bg-blue-50 border border-blue-200'
      }`}>
        <p className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
          <strong>Common Issues:</strong>
        </p>
        <ul className={`text-xs mt-2 space-y-1 list-disc list-inside ${
          theme === 'dark' ? 'text-blue-400/80' : 'text-blue-700'
        }`}>
          <li>If no audio tracks: Make sure "Share tab audio" is checked in the browser dialog</li>
          <li>If no data captured: Ensure the tab you're sharing is actually playing audio</li>
          <li>Chrome/Edge required for best tab audio capture support</li>
          <li>Test with a tab playing music or a video to verify audio capture works</li>
        </ul>
      </div>
    </div>
  );
}
