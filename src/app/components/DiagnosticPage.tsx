// Simple diagnostic to test the app state
import { useAuth } from '../context/AuthContext';

export function DiagnosticPage() {
  const { user, loading, error, isConfigured } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF8F0] via-[#FFF5EB] to-[#FFE4CC] p-6">
      <div className="max-w-2xl w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">🔍 App Diagnostic</h1>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-700">Loading State:</p>
            <p className="text-gray-600">{loading ? '⏳ Loading...' : '✅ Loaded'}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-700">Supabase Configured:</p>
            <p className="text-gray-600">{isConfigured ? '✅ Yes' : '❌ No (Local Mode)'}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-700">User Authenticated:</p>
            <p className="text-gray-600">{user ? `✅ Yes (${user.email})` : '❌ No'}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-700">Error:</p>
            <p className="text-gray-600">{error || '✅ None'}</p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="font-semibold text-blue-800">Environment Variables:</p>
            <p className="text-blue-600 text-sm break-all">
              VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL || 'Not set'}
            </p>
            <p className="text-blue-600 text-sm">
              VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set ✅' : 'Not set ❌'}
            </p>
          </div>

          <div className="flex gap-4 mt-6">
            <a
              href="/login"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go to Login
            </a>
            <a
              href="/signup"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Signup
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
