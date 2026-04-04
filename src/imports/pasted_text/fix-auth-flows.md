Now I have a complete picture of every bug. Here is the prompt:

---

> **Figma Make Prompt — Fix Gmail login and stuck loading screen**
>
> There are two separate broken flows. Fix both completely.
>
> **Bug 1 — Gmail login redirects back but doesn't log in.**
>
> The `signInWithOAuth` call in `Login.tsx` is missing the `queryParams` needed for Google to return a refresh token, and more critically `detectSessionInUrl` in `src/lib/supabase.ts` is set to `false`, which means Supabase never automatically reads the session from the URL after the redirect. Fix both:
>
> **In `src/lib/supabase.ts`**, change `detectSessionInUrl: false` to `detectSessionInUrl: true`. The full `auth` config block must be:
> ```typescript
> auth: {
>   persistSession: true,
>   autoRefreshToken: true,
>   detectSessionInUrl: true,
>   flowType: 'pkce',
>   storage: window.localStorage,
> },
> ```
>
> **In `src/app/components/Login.tsx`**, update `handleGoogleSignIn` to add `queryParams` and ensure the redirect URL is exactly `/auth/callback`:
> ```typescript
> const handleGoogleSignIn = async () => {
>   setError('');
>   setGoogleLoading(true);
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
>     setGoogleLoading(false);
>   }
> };
> ```
>
> Do the same in `src/app/components/Signup.tsx` — find the equivalent Google sign-in handler and apply the same `queryParams` block and same `redirectTo` value.
>
> **In `src/app/components/AuthCallback.tsx`**, the current code calls `exchangeCodeForSession(code)` passing only the bare code string. This is wrong — it must receive the full URL. Replace the entire `handleCallback` function body with:
> ```typescript
> const handleCallback = async () => {
>   try {
>     const url = new URL(window.location.href);
>     const code = url.searchParams.get('code');
>     const errorParam = url.searchParams.get('error');
>     const errorDescription = url.searchParams.get('error_description');
>
>     if (errorParam) {
>       if (!cancelled) setError(errorDescription || errorParam);
>       return;
>     }
>
>     // First check if detectSessionInUrl already handled it
>     const { data: { session: existingSession } } = await supabase.auth.getSession();
>     if (existingSession?.user) {
>       if (!cancelled) navigate('/', { replace: true });
>       return;
>     }
>
>     if (!code) {
>       if (!cancelled) setError('No authorization code received. Please try signing in again.');
>       return;
>     }
>
>     // Exchange using the full URL (required for PKCE)
>     const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href);
>
>     if (exchangeError) {
>       if (!cancelled) setError(exchangeError.message);
>       return;
>     }
>
>     if (data.session) {
>       if (!cancelled) navigate('/', { replace: true });
>     } else {
>       if (!cancelled) setError('Failed to establish session. Please try again.');
>     }
>   } catch (err: any) {
>     if (!cancelled) setError(err.message || 'An unexpected error occurred.');
>   }
> };
> ```
>
> **In `src/app/App.tsx`**, the `/auth/callback` route is missing entirely from the `<Routes>` block. Add it right after the `/signup` route, outside the `ProtectedRoute` wrapper:
> ```tsx
> <Route path="/auth/callback" element={<AuthCallback />} />
> ```
> Also add the import at the top: `import { AuthCallback } from './components/AuthCallback';`
>
> **In `src/app/context/AuthContext.tsx`**, the `onAuthStateChange` handler uses `.single()` when checking for an existing user profile, which throws an error if the row doesn't exist. This crashes the profile creation for Google users silently. Change `.single()` to `.maybeSingle()` in the profile existence check:
> ```typescript
> const { data: existingUser } = await supabase
>   .from('users')
>   .select('id')
>   .eq('id', session.user.id)
>   .maybeSingle();  // changed from .single()
> ```
>
> ---
>
> **Bug 2 — After login, the dashboard is stuck on a loading screen forever.**
>
> After a Google OAuth login, the `users` table row is created by `onAuthStateChange`, but `DashboardLayout.tsx` immediately calls `userAPI.getProfile(user.id)` which calls `supabase.from('users').select('*').eq('id', userId).single()`. If the profile row hasn't been written yet (race condition), this throws an error and the component silently fails — but other components like `Overview.tsx` also stay stuck because they wait for `user` to be non-null but can hang on Supabase queries if the `users` row is missing.
>
> Fix this in three places:
>
> **In `src/app/services/api.ts`**, change `userAPI.getProfile` to use `.maybeSingle()` instead of `.single()`, and return a fallback object if the profile doesn't exist yet instead of throwing:
> ```typescript
> async getProfile(userId: string) {
>   const { data, error } = await supabase
>     .from('users')
>     .select('*')
>     .eq('id', userId)
>     .maybeSingle();
>
>   if (error) throw error;
>   // Return a minimal fallback if profile doesn't exist yet (race condition on first OAuth login)
>   return data ?? { id: userId, name: '', email: '', role: null, department: null, avatar: null, location: null, bio: null, join_date: new Date().toISOString().split('T')[0], created_at: new Date().toISOString() };
> },
> ```
>
> **In `src/app/components/DashboardLayout.tsx`**, wrap the `fetchUserProfile` call in a retry loop so it handles the race condition where the profile row doesn't exist the first milliseconds after OAuth:
> ```typescript
> useEffect(() => {
>   const fetchUserProfile = async () => {
>     if (!user) return;
>     // Retry up to 5 times with 600ms delay — handles race condition on first Google OAuth login
>     for (let attempt = 0; attempt < 5; attempt++) {
>       try {
>         const profile = await userAPI.getProfile(user.id);
>         if (profile && profile.email) {
>           setUserProfile(profile);
>           return;
>         }
>       } catch (error) {
>         console.warn(`Profile fetch attempt ${attempt + 1} failed:`, error);
>       }
>       await new Promise(r => setTimeout(r, 600));
>     }
>     // Final fallback: use auth user metadata directly
>     setUserProfile({
>       name: user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'User',
>       email: user.email || '',
>       avatar: user.user_metadata?.avatar_url || null,
>     });
>   };
>
>   fetchUserProfile();
>
>   const hasSeenOnboarding = localStorage.getItem('gmeet_onboarding_done');
>   if (!hasSeenOnboarding) {
>     setShowOnboarding(true);
>   }
> }, [user]);
> ```
>
> **In `src/app/components/ProtectedRoute.tsx`**, the current `useEffect` calls `navigate('/login')` immediately when `loading` is false and `user` is null. After OAuth redirect, there is a brief window where `loading` is false but `onAuthStateChange` hasn't fired yet, causing an incorrect redirect to `/login`. Fix by adding a guard that waits for a Supabase session check before redirecting:
> ```typescript
> import { supabase } from '../../lib/supabase';
>
> // inside the component, replace the existing useEffect with:
> useEffect(() => {
>   if (loading) return;
>   if (user) return;
>
>   // Don't redirect immediately — verify there's truly no session first
>   // This prevents a race condition after Google OAuth redirect
>   let cancelled = false;
>   const timer = setTimeout(async () => {
>     if (cancelled) return;
>     const { data: { session } } = await supabase.auth.getSession();
>     if (!session && !cancelled) {
>       navigate('/login', { replace: true });
>     }
>   }, 200);
>
>   return () => {
>     cancelled = true;
>     clearTimeout(timer);
>   };
> }, [user, loading, navigate]);
> ```
>
> Do not change any visual styling, any Tailwind classes, any form layout, or any other component. These are purely functional auth and data-loading fixes. Keep all existing `motion` animations, the `glass-card` class, and every other UI element exactly as they are.