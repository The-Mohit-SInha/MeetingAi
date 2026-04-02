# 🎯 QUICK START - Complete These 5 Steps!

## Step 1: Create Supabase Account (2 min)
1. Go to **https://supabase.com**
2. Click "Start your project" → Sign up
3. Click "New Project"
4. Name: `meeting-action-system`
5. Set database password (save it!)
6. Choose your region
7. Click "Create new project"
8. ⏳ Wait ~2 minutes

## Step 2: Get Your API Keys (30 sec)
1. In Supabase dashboard: **Settings** → **API**
2. Copy these two values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

## Step 3: Update .env.local (30 sec)
Open `.env.local` and replace:
```bash
VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-goes-here
```

## Step 4: Run the Database Setup (1 min)
1. In Supabase dashboard: **SQL Editor** → **+ New query**
2. Open `database/schema.sql` from this project
3. Copy **ALL** of it
4. Paste into Supabase SQL Editor
5. Click **"Run"**
6. Should see: ✅ "Success. No rows returned"

## Step 5: Disable Email Confirmation (30 sec)
1. In Supabase: **Authentication** → **Providers** → **Email**
2. Turn **OFF** "Confirm email"
3. Click **"Save"**

---

## 🚀 DONE! Now Run:
```bash
pnpm vite
```

Then open **http://localhost:5173** and click "Sign up"!

---

## 📋 Need More Help?
- **Detailed Guide**: See `SUPABASE_QUICKSTART.md`
- **Step-by-Step Checklist**: See `CHECKLIST.md`
- **Full Documentation**: See `SETUP_GUIDE.md`

## 🛠️ Helper Scripts
```bash
# Test if Supabase is connected
./test-connection.sh

# Automated setup guide
./setup-supabase.sh
```

**That's it! You're ready to build! 🎉**
