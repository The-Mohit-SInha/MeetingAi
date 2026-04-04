import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { googleMeetOAuth } from '../services/googleMeetService';

export function GoogleMeetCallback() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting your Google Meet account...');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage('Google authorization was denied. Please try again.');
      setTimeout(() => navigate('/settings', { replace: true }), 3000);
      return;
    }

    if (!code || !user) return;

    googleMeetOAuth.exchangeCode(code, user.id)
      .then(() => {
        setStatus('success');
        setMessage('Google Meet connected successfully!');
        setTimeout(() => navigate('/settings', { replace: true }), 2000);
      })
      .catch(() => {
        setStatus('error');
        setMessage('Failed to connect Google Meet. Please try again.');
        setTimeout(() => navigate('/settings', { replace: true }), 3000);
      });
  }, [searchParams, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #f5f5dc 0%, #faf8f3 50%, #f0ece2 100%)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl p-12 text-center shadow-xl max-w-sm w-full mx-4"
        style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.5)' }}>
        {status === 'loading' && <Loader2 className="w-14 h-14 animate-spin text-purple-600 mx-auto mb-4" />}
        {status === 'success' && <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />}
        {status === 'error' && <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />}
        <p className="text-gray-700 font-semibold text-lg">{message}</p>
        <p className="text-gray-500 text-sm mt-2">Redirecting to Settings...</p>
      </motion.div>
    </div>
  );
}
