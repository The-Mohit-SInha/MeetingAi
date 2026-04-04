import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { Loader2, CheckCircle, AlertCircle, Video } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { googleMeetOAuth } from '../services/googleMeetService';

export function GoogleMeetCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting your Google Meet account...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage(`Authorization failed: ${error}`);
          setTimeout(() => navigate('/settings'), 3000);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('No authorization code received');
          setTimeout(() => navigate('/settings'), 3000);
          return;
        }

        if (!user) {
          setStatus('error');
          setMessage('Please sign in first');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        setMessage('Exchanging authorization code...');
        const result = await googleMeetOAuth.exchangeCode(code, user.id);

        if (!result.success) {
          setStatus('error');
          setMessage(result.error || 'Failed to connect Google Meet');
          setTimeout(() => navigate('/settings'), 3000);
          return;
        }

        setStatus('success');
        setMessage('Google Meet connected successfully!');
        setTimeout(() => navigate('/settings'), 2000);
      } catch (err: any) {
        console.error('Callback error:', err);
        setStatus('error');
        setMessage(err.message || 'An unexpected error occurred');
        setTimeout(() => navigate('/settings'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 to-cream-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-center"
      >
        <div className="mb-6">
          {status === 'loading' && (
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
          )}
          {status === 'error' && (
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {status === 'loading' && 'Connecting...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Connection Failed'}
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>

        {status === 'loading' && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Video className="w-4 h-4" />
            <span>Setting up Google Meet integration</span>
          </div>
        )}

        {status !== 'loading' && (
          <button
            onClick={() => navigate('/settings')}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            Return to Settings
          </button>
        )}
      </motion.div>
    </div>
  );
}
