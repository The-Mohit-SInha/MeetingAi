import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface TestResult {
  step: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
}

export function TranscriptionTestPanel() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runTests = async () => {
    setTesting(true);
    setResults([]);
    const testResults: TestResult[] = [];

    // Test 1: Health check
    try {
      testResults.push({ step: 'Health Check', status: 'pending', message: 'Checking Groq API configuration...' });
      setResults([...testResults]);

      const healthResponse = await fetch('https://qjrmxudyrwcqwpkmrggn.supabase.co/functions/v1/transcribe/health');

      if (!healthResponse.ok) {
        testResults[0] = {
          step: 'Health Check',
          status: 'error',
          message: `Edge function not responding (${healthResponse.status})`,
          data: { configured: false },
        };
      } else {
        const healthData = await healthResponse.json();

        if (healthData.configured) {
          testResults[0] = {
            step: 'Health Check',
            status: 'success',
            message: `Groq API is configured (${healthData.model})`,
            data: healthData,
          };
        } else {
          testResults[0] = {
            step: 'Health Check',
            status: 'error',
            message: 'GROQ_API_KEY not set in Supabase environment',
            data: healthData,
          };
        }
      }
    } catch (error: any) {
      testResults[0] = {
        step: 'Health Check',
        status: 'error',
        message: error.message,
      };
    }
    setResults([...testResults]);

    // Test 2: Create test audio
    try {
      testResults.push({ step: 'Audio Generation', status: 'pending', message: 'Creating test audio...' });
      setResults([...testResults]);

      // Create a simple audio blob with a beep tone
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const sampleRate = audioContext.sampleRate;
      const duration = 2;
      const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Generate a 440 Hz tone (A4 note)
      for (let i = 0; i < channelData.length; i++) {
        channelData[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.3;
      }

      testResults[1] = {
        step: 'Audio Generation',
        status: 'success',
        message: `Created 2-second test audio (440 Hz tone)`,
      };
      setResults([...testResults]);
    } catch (error: any) {
      testResults[1] = {
        step: 'Audio Generation',
        status: 'error',
        message: error.message,
      };
      setResults([...testResults]);
    }

    setTesting(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 max-w-md">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          🧪 Transcription Test
        </h3>

        <button
          onClick={runTests}
          disabled={testing}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Testing...
            </>
          ) : (
            'Run Transcription Tests'
          )}
        </button>

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  result.status === 'success'
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                    : result.status === 'error'
                    ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                    : 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start gap-2">
                  {result.status === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  ) : result.status === 'error' ? (
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-gray-600 dark:text-gray-400 animate-spin flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{result.step}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      {result.message}
                    </p>
                    {result.data && (
                      <pre className="text-xs mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
