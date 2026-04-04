import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { authAPI, userAPI, settingsAPI } from '../services/api';
import { localSignIn, localSignUp, localSignOut, localGetCurrentUser } from '../../lib/localAuth';
import { initializeUserStorage } from '../services/localAPI';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  session: null,
  loading: true,
  error: null,
  isConfigured: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured] = useState(isSupabaseConfigured());

  useEffect(() => {
    // If Supabase isn't configured, use local storage authentication
    if (!isConfigured) {
      console.info(
        '📋 Running in LOCAL MODE (Supabase not configured)\n\n' +
        'The app is fully functional using localStorage.\n' +
        'You can sign up, log in, and all data persists locally.\n\n' +
        'To enable cloud backend (optional):\n' +
        '1. Create a .env.local file in your project root\n' +
        '2. Add:\n' +
        '   VITE_SUPABASE_URL=https://your-project.supabase.co\n' +
        '   VITE_SUPABASE_ANON_KEY=your-anon-key\n' +
        '3. Restart the dev server\n\n' +
        'See SETUP_GUIDE.md for detailed instructions.'
      );

      // Check if user is already logged in locally
      const localUser = localGetCurrentUser();
      setUser(localUser);
      setError(null);
      setLoading(false);
      return;
    }

    // Supabase is configured - log success message
    console.info(
      '🎉 SUPABASE CONNECTED! 🎉\n\n' +
      '✅ Cloud database: ACTIVE\n' +
      '✅ Authentication: READY\n' +
      '✅ Data persistence: ENABLED\n\n' +
      'Your data is now stored securely in the cloud!\n' +
      'Project: https://supabase.com/dashboard/project/qjrmxudyrwcqwpkmrggn\n\n' +
      'Need help? Check QUICK_START.md or VERIFY_SETUP.md'
    );

    // Check active session with error handling
    supabase.auth
      .getSession()
      .then(async ({ data: { session }, error: sessionError }) => {
        if (sessionError) {
          console.error('Failed to get session:', sessionError);
          setError(`Authentication error: ${sessionError.message}`);
          setLoading(false);
          return;
        }

        // If there's a session, verify the user still exists in the DB
        if (session?.user) {
          const { data: dbUser, error: dbError } = await supabase
            .from('users')
            .select('id')
            .eq('id', session.user.id)
            .maybeSingle();

          if (!dbUser) {
            console.warn('Session user not found in database — signing out stale session.');
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
            setLoading(false);
            return;
          }
        }

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Unexpected error getting session:', err);
        setError('Failed to connect to authentication service. Please check your internet connection.');
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setError(null);
      setLoading(false);

      // Handle Google OAuth user profile creation
      if (session?.user && session.user.app_metadata?.provider === 'google') {
        try {
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', session.user.id)
            .maybeSingle();

          if (!existingUser) {
            const googleName = session.user.user_metadata?.full_name
              || session.user.user_metadata?.name
              || session.user.email?.split('@')[0]
              || 'User';
            const googleAvatar = session.user.user_metadata?.avatar_url || null;

            await supabase.from('users').upsert({
              id: session.user.id,
              email: session.user.email || '',
              name: googleName,
              avatar: googleAvatar,
              role: null,
              department: null,
              location: null,
              bio: null,
              join_date: new Date().toISOString().split('T')[0],
            }, { onConflict: 'id', ignoreDuplicates: true });

            await supabase.from('user_settings').upsert({
              user_id: session.user.id,
              theme: 'light',
              compact_mode: true,
              email_notifications: true,
              push_notifications: false,
              slack_notifications: false,
              calendar_sync: false,
              google_calendar_connected: false,
              outlook_calendar_connected: false,
            }, { onConflict: 'user_id', ignoreDuplicates: true });
          }
        } catch (err) {
          console.error('Error creating Google OAuth user profile:', err);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [isConfigured]);

  const signIn = async (email: string, password: string) => {
    if (!isConfigured) {
      // Use local authentication
      const user = await localSignIn(email, password);
      setUser(user);
      initializeUserStorage(user.id);
      return;
    }
    const { user } = await authAPI.signIn(email, password);
    setUser(user);
  };

  const signUp = async (email: string, password: string, name: string) => {
    if (!isConfigured) {
      // Use local authentication
      const user = await localSignUp(email, password, name);
      setUser(user);
      initializeUserStorage(user.id);
      return;
    }
    const { user } = await authAPI.signUp(email, password, name);
    setUser(user);
  };

  const signOut = async () => {
    if (!isConfigured) {
      // Use local authentication
      await localSignOut();
      setUser(null);
      setSession(null);
      return;
    }
    await authAPI.signOut();
    setUser(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    if (!isConfigured) {
      throw new Error('Password reset is not available in local mode. Please contact support.');
    }
    await authAPI.resetPassword(email);
  };

  const value = {
    user,
    session,
    loading,
    error,
    isConfigured,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}