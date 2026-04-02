# 🚀 Supabase Quick Setup - Next Steps

## ✅ What's Already Done

1. ✅ Supabase CLI installed and initialized
2. ✅ Project configuration created (`supabase/config.toml`)
3. ✅ Email confirmations **DISABLED** for development
4. ✅ Database schema prepared (`database/schema.sql`)
5. ✅ `.env.local` file created (needs your credentials)
6. ✅ Supabase client configured (`src/lib/supabase.ts`)

---

## 🎯 Two Options to Proceed

### **Option 1: Use Remote Supabase (Recommended - Production Ready)**

#### Step 1: Create Supabase Project (2 minutes)

1. Go to **https://supabase.com** and sign up/login
2. Click **"New Project"**
3. Fill in:
   - **Name**: `meeting-action-system` (or your choice)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose one closest to you
4. Click **"Create new project"** and wait ~2 minutes

#### Step 2: Get Your Credentials

1. In your Supabase dashboard, click **Settings** (gear icon) → **API**
2. Copy these two values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

#### Step 3: Update Environment Variables

Edit `.env.local` file and replace with your actual credentials:

```bash
VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

#### Step 4: Deploy Database Schema

1. In Supabase dashboard, go to **SQL Editor** (lightning icon on left)
2. Click **"+ New query"**
3. Copy the entire contents of `database/schema.sql` from this project
4. Paste into the SQL Editor
5. Click **"Run"** (or Ctrl/Cmd + Enter)
6. Wait for: ✅ **"Success. No rows returned"**

#### Step 5: Configure Auth Settings

1. Go to **Authentication** → **Providers** → **Email**
2. Make sure:
   - ✅ **"Enable Email provider"** is ON
   - ✅ **"Confirm email"** is OFF (for development)
3. Click **"Save"**

#### Step 6: Run and Test! 🎉

```bash
pnpm vite
```

Then:
1. Open **http://localhost:5173** in your browser
2. Click **"Sign up"**
3. Create your first account!

---

### **Option 2: Local Development (No Account Needed)**

#### Start Local Supabase

```bash
# Start all Supabase services locally (Docker required)
/tmp/supabase start

# This will start:
# - PostgreSQL database
# - Auth server
# - Realtime server
# - Storage server
# - Studio UI (http://localhost:54323)
```

The command will output local credentials automatically. Copy them to `.env.local`:

```bash
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<the-anon-key-from-output>
```

#### Run Migrations

```bash
# Copy schema to migrations folder
cp database/schema.sql supabase/migrations/20260402000000_initial_schema.sql

# Apply migrations
/tmp/supabase db reset
```

#### Run and Test!

```bash
pnpm vite
```

Open **http://localhost:5173** and sign up!

---

## 🧪 After Setup - Test These Features

Once your environment is running, test:

1. ✅ **Sign up** with a new account
2. ✅ **Login** with your credentials
3. ✅ **Create a meeting** from the Meetings page
4. ✅ **Add action items** from the Action Items page
5. ✅ **Edit your profile** from the Profile page
6. ✅ **View analytics** on the Dashboard
7. ✅ **Test notifications**
8. ✅ **Export data** as CSV/JSON

---

## 📝 Current Status

- **Dev Server**: ⏳ Waiting to be started (run `pnpm vite`)
- **Supabase**: 🔴 Not connected yet (needs credentials in `.env.local`)
- **Database Schema**: 📋 Ready to deploy (`database/schema.sql`)
- **Auth Settings**: ⚙️ Configured (email confirmations disabled)

---

## 🆘 Troubleshooting

### Dev server fails to start
```bash
# Kill any process on port 5173
pkill -f vite
# Try again
pnpm vite
```

### "Invalid API key" error
- Make sure you copied the full anon key from Supabase
- Restart dev server after editing `.env.local`
- Check there are no extra spaces in the values

### "Permission denied" database errors
- Make sure you ran the **full** `database/schema.sql` in Supabase SQL Editor
- Check that Row Level Security policies were created
- Verify you're logged in with a valid session

### Local Supabase won't start
- Make sure Docker is installed and running
- Try: `docker ps` to verify Docker works
- Check ports 54321-54324 aren't already in use

---

## ✅ Quick Commands Reference

```bash
# Start dev server
pnpm vite

# Start local Supabase (Option 2)
/tmp/supabase start

# Stop local Supabase
/tmp/supabase stop

# View Supabase Studio (local)
# Open: http://localhost:54323

# Check Supabase status
/tmp/supabase status

# Apply migrations
/tmp/supabase db reset

# View logs
/tmp/supabase logs
```

---

## 🎯 What to Do Next

**Choose your path:**

- **For quick testing → Option 2** (Local Development)
- **For production use → Option 1** (Remote Supabase)

Then come back and I'll help you test everything! 🚀
