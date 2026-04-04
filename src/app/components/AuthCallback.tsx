/**
 * OAuth Callback Handler
 *
 * With detectSessionInUrl: true, the Supabase client automatically exchanges
 * the code from the URL. This component waits for that to complete
 * via onAuthStateChange, then navigates to the dashboard.
 */

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const errorParam = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    if (errorParam) {
      setError(errorDescription || errorParam);
      return;
    }

    const done = () => {
      if (handledRef.current) return false;
      handledRef.current = true;
      navigate('/', { replace: true });
      return true;
    };

    // 1) Listen for SIGNED_IN from detectSessionInUrl auto-exchange
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        done();
      }
    });

    // 2) Immediately check if session already exists (no artificial delay)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) { done(); return; }

      // 3) Brief wait then try manual exchange as fallback
      await new Promise(r => setTimeout(r, 150));
      if (handledRef.current) return;

      const code = url.searchParams.get('code');
      if (code) {
        try {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (data?.session) { done(); return; }
          if (exchangeError) {
            // Code may have been consumed by detectSessionInUrl — re-check
            const { data: { session: s2 } } = await supabase.auth.getSession();
            if (s2?.user) { done(); return; }
          }
        } catch {
          // Fall through to timeout
        }
      }
    };

    checkSession();

    // 4) Timeout after 5 seconds
    const timeout = setTimeout(() => {
      if (!handledRef.current) {
        setError('Sign-in is taking too long. Please try again.');
      }
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#FFF8F0] via-[#FFF5EB] to-[#FFE4CC]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center"
        >
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Sign-in Failed</h2>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
          >
            Back to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#FFF8F0] via-[#FFF5EB] to-[#FFE4CC]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center"
      >
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Signing you in...</p>
      </motion.div>
    </div>
  );
}
