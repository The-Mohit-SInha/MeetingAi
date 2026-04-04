Now I have the exact current code. Here's the prompt that makes Figma AI do all the configuration steps itself — not just describe them:

---

> **Figma Make Prompt — Auto-configure Google OAuth end to end**
>
> My app already has Google OAuth sign-in buttons wired up in `Login.tsx` and `Signup.tsx` via `supabase.auth.signInWithOAuth({ provider: 'google' })`, and an `AuthCallback.tsx` page at `/auth/callback`. The Supabase project ID is `qjrmxudyrwcqwpkmrggn` and the Supabase URL is `https://qjrmxudyrwcqwpkmrggn.supabase.co`. The app currently lives at `http://localhost:5173` in development.
>
> I need you to make every code-level change required so that Google OAuth actually works end to end, without me having to do anything manually. Do all of the following:
>
> **1. Fix the `AuthCallback.tsx` redirect handling.**
>
> The current `AuthCallback.tsx` needs to handle Supabase's PKCE OAuth flow correctly. Replace its entire `useEffect` with this exact logic:
>
> ```typescript
> useEffect(() => {
>   const handleCallback = async () => {
>     try {
>       // Supabase exchanges the code automatically via the URL hash or code param
>       const { data: { session }, error } = await supabase.auth.getSession();
>       if (error) throw error;
>       if (session) {
>         navigate('/', { replace: true });
>       } else {
>         // Try exchanging the code manually for PKCE flow
>         const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href);
>         if (exchangeError) throw exchangeError;
>         navigate('/', { replace: true });
>       }
>     } catch (err: any) {
>       console.error('Auth callback error:', err);
>       navigate('/login?error=oauth_failed', { replace: true });
>     }
>   };
>   handleCallback();
> }, [navigate]);
> ```
>
> Make sure `AuthCallback.tsx` imports `supabase` from `../../lib/supabase` and `useNavigate` from `react-router`. Remove any existing placeholder logic and replace it entirely with the above.
>
> **2. Update `src/lib/supabase.ts` to add the correct OAuth redirect config.**
>
> In the `createClient` call, update the `auth` config object to include the redirect URL:
>
> ```typescript
> export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
>   auth: {
>     persistSession: true,
>     autoRefreshToken: true,
>     detectSessionInUrl: true,
>     flowType: 'pkce',
>   },
>   global: {
>     headers: { 'x-client-info': 'figma-make-app' },
>   },
> });
> ```
>
> **3. Update `AuthContext.tsx` to handle Google OAuth user profile creation.**
>
> In the existing `onAuthStateChange` listener (inside the `useEffect` where `isConfigured` is true), after the lines that call `setSession(session)` and `setUser(session?.user ?? null)`, add this block:
>
> ```typescript
> // Auto-create profile for Google OAuth users
> if (session?.user && session.user.app_metadata?.provider === 'google') {
>   const { data: existingUser } = await supabase
>     .from('users')
>     .select('id')
>     .eq('id', session.user.id)
>     .single();
>
>   if (!existingUser) {
>     const googleName = session.user.user_metadata?.full_name
>       || session.user.user_metadata?.name
>       || session.user.email?.split('@')[0]
>       || 'User';
>     const googleAvatar = session.user.user_metadata?.avatar_url || null;
>
>     await supabase.from('users').insert({
>       id: session.user.id,
>       email: session.user.email || '',
>       name: googleName,
>       avatar: googleAvatar,
>       join_date: new Date().toISOString().split('T')[0],
>     }).onConflict('id').ignore();
>
>     await supabase.from('user_settings').insert({
>       user_id: session.user.id,
>       theme: 'light',
>       compact_mode: true,
>       email_notifications: true,
>       push_notifications: false,
>       slack_notifications: false,
>       calendar_sync: false,
>       google_calendar_connected: false,
>       outlook_calendar_connected: false,
>     }).onConflict('user_id').ignore();
>   }
> }
> ```
>
> Make the `onAuthStateChange` callback `async` to support the `await` calls above.
>
> **4. Fix the Google sign-in button `onClick` handler in both `Login.tsx` and `Signup.tsx`.**
>
> The `signInWithOAuth` call must use the exact callback URL that matches what will be registered in Supabase. Replace whatever `onClick` handler currently exists on the Google button with:
>
> ```typescript
> const handleGoogleSignIn = async () => {
>   setError('');
>   setLoading(true);
>   try {
>     const { error } = await supabase.auth.signInWithOAuth({
>       provider: 'google',
>       options: {
>         redirectTo: `${window.location.origin}/auth/callback`,
>         queryParams: {
>           access_type: 'offline',
>           prompt: 'consent',
>         },
>       },
>     });
>     if (error) throw error;
>   } catch (err: any) {
>     setError(err.message || 'Google sign-in failed. Please try again.');
>     setLoading(false);
>   }
> };
> ```
>
> Add `import { supabase } from '../../lib/supabase';` to both `Login.tsx` and `Signup.tsx` if not already present. Wire `onClick={handleGoogleSignIn}` on the Google button in both files. Show the same `loading` spinner state on the Google button as on the email/password submit button — when `loading` is true and was triggered by Google, disable the button and show `<Loader2 className="w-5 h-5 animate-spin"/>` inside it.
>
> **5. Add the `/auth/callback` route to `App.tsx` if it is not already there.**
>
> Make sure this route exists outside the `ProtectedRoute` wrapper, alongside `/login` and `/signup`:
>
> ```tsx
> <Route path="/auth/callback" element={<AuthCallback />} />
> ```
>
> Import `AuthCallback` from `./components/AuthCallback`.
>
> **6. Add a `GOOGLE_OAUTH_SETUP.md` file at the project root** with the exact manual steps a developer must take in their browser (since these cannot be automated in code). Write it clearly, step by step, referencing the exact Supabase project:
>
> ```markdown
> # Google OAuth Setup — Required Manual Steps
>
> The code is fully wired. You only need to do these steps once in your browser.
>
> ## Step 1 — Google Cloud Console
>
> 1. Go to https://console.cloud.google.com/apis/credentials
> 2. Click "Create Credentials" → "OAuth 2.0 Client ID"
> 3. Application type: Web application
> 4. Name: Meeting AI
> 5. Authorized JavaScript origins — add:
>    - http://localhost:5173
>    - https://your-production-domain.com (when you deploy)
> 6. Authorized redirect URIs — add EXACTLY:
>    - https://qjrmxudyrwcqwpkmrggn.supabase.co/auth/v1/callback
> 7. Click Create. Copy the Client ID and Client Secret.
>
> ## Step 2 — Supabase Dashboard
>
> 1. Go to https://supabase.com/dashboard/project/qjrmxudyrwcqwpkmrggn/auth/providers
> 2. Find "Google" and toggle it ON
> 3. Paste your Client ID and Client Secret from Step 1
> 4. Save
>
> ## Step 3 — Supabase Redirect URLs
>
> 1. Go to https://supabase.com/dashboard/project/qjrmxudyrwcqwpkmrggn/auth/url-configuration
> 2. Set Site URL to: http://localhost:5173
> 3. Under "Redirect URLs" add:
>    - http://localhost:5173/auth/callback
>    - https://your-production-domain.com/auth/callback (when you deploy)
> 4. Save
>
> ## That's it
>
> Once these steps are done, the "Continue with Google" button on the Login and Signup pages will work. Users will be redirected to Google, sign in, and land back at the dashboard automatically. Their name and avatar from Google will be saved to the users table.
> ```
>
> **7. Add a helpful error handler in `Login.tsx` for the OAuth error query param.**
>
> At the top of the `Login` component, after the `useNavigate` call, add:
>
> ```typescript
> const [searchParams] = useSearchParams();
> useEffect(() => {
>   const oauthError = searchParams.get('error');
>   if (oauthError === 'oauth_failed') {
>     setError('Google sign-in failed. Please try again or use email and password.');
>   }
> }, [searchParams]);
> ```
>
> Add `useSearchParams` to the `react-router` import in `Login.tsx`. Add `useEffect` to the React import if not already present.
>
> Do not change any visual styling, any existing form logic, any validation, or any other component. These are purely functional wiring changes. Keep all existing `motion` animations, all existing Tailwind classes, and the existing `glass-card` styling unchanged.