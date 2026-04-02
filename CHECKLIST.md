# ✅ Supabase Setup Checklist

## 🎯 Quick Setup (5 minutes)

### Step 1: Create Supabase Project
- [ ] Go to https://supabase.com
- [ ] Sign up / Log in
- [ ] Click "New Project"
- [ ] Name: `meeting-action-system`
- [ ] Set strong database password (save it!)
- [ ] Choose region closest to you
- [ ] Wait ~2 minutes for provisioning

### Step 2: Get Your Credentials
- [ ] In Supabase dashboard: Settings → API
- [ ] Copy **Project URL** (e.g., `https://xxxxx.supabase.co`)
- [ ] Copy **anon public** key (starts with `eyJ...`)

### Step 3: Update .env.local
- [ ] Open `.env.local` in this project
- [ ] Replace `VITE_SUPABASE_URL` with your Project URL
- [ ] Replace `VITE_SUPABASE_ANON_KEY` with your anon key
- [ ] Save the file

### Step 4: Deploy Database Schema
- [ ] In Supabase: Go to **SQL Editor** (left sidebar)
- [ ] Click **"+ New query"**
- [ ] Open `database/schema.sql` from this project
- [ ] Copy **ALL** the SQL code
- [ ] Paste into Supabase SQL Editor
- [ ] Click **"Run"** (or Ctrl+Enter / Cmd+Enter)
- [ ] Verify: ✅ "Success. No rows returned"

### Step 5: Configure Authentication
- [ ] In Supabase: Authentication → Providers → Email
- [ ] Ensure **"Enable Email provider"** is ON
- [ ] Turn **OFF** "Confirm email" (for dev only!)
- [ ] Click **"Save"**

### Step 6: Test Connection (Optional)
```bash
./test-connection.sh
```
Should see: ✅ Connection successful!

### Step 7: Start Dev Server
```bash
pnpm vite
```

### Step 8: Test the App! 🎉
- [ ] Open http://localhost:5173
- [ ] Click **"Sign up"**
- [ ] Fill in your details
- [ ] Click **"Create Account"**
- [ ] You should be logged in! 🚀

---

## 🧪 Features to Test After Setup

Once logged in, test these:

- [ ] **Dashboard** - View metrics and charts
- [ ] **Create Meeting** - Meetings page → "+ New Meeting"
- [ ] **Add Action Items** - Action Items page → "+ Add Action"
- [ ] **Schedule Meeting** - Calendar page → "+ Schedule Meeting"
- [ ] **Edit Profile** - Profile page → "Edit Profile"
- [ ] **Upload Avatar** - Profile → Click camera icon
- [ ] **View Notifications** - Bell icon → Check notifications
- [ ] **Update Settings** - Settings page → Change preferences
- [ ] **Export Data** - Meetings/Actions → Click export button
- [ ] **View Analytics** - Analytics page → Check charts
- [ ] **Logout & Login** - Test session persistence

---

## 🛠️ Helper Scripts

### Automated Setup (after getting credentials)
```bash
./setup-supabase.sh
```

### Test Connection
```bash
./test-connection.sh
```

### View Supabase CLI Status
```bash
/tmp/supabase status
```

---

## 🐛 Common Issues & Fixes

### Issue: "Invalid API key"
**Fix:**
- Check `.env.local` has correct values (no extra spaces)
- Restart dev server: Kill and run `pnpm vite` again
- Verify anon key is complete (should be ~200+ characters)

### Issue: "Permission denied" on database operations
**Fix:**
- Re-run the FULL `database/schema.sql` in Supabase SQL Editor
- Check no errors occurred during SQL execution
- Verify you're logged in (check browser console for auth tokens)

### Issue: "Email not confirmed" error
**Fix:**
- Go to: Authentication → Providers → Email
- Turn OFF "Confirm email"
- Click Save
- Try signup again

### Issue: Signup button doesn't work
**Fix:**
- Open browser console (F12)
- Check for errors
- Verify `.env.local` values are correct
- Run `./test-connection.sh` to verify connection

### Issue: Charts not showing data
**Fix:**
- Create some test data first (meetings, actions)
- Refresh the page
- Check browser console for errors

---

## 📊 What Gets Created in Supabase

After running the schema, you'll have:

**Tables:**
- `users` - User profiles
- `meetings` - Meeting records
- `meeting_participants` - Attendees
- `action_items` - Tasks from meetings
- `notifications` - User notifications
- `user_settings` - User preferences

**Security:**
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Secure policies for all CRUD operations

**Storage:**
- `avatars` bucket for profile pictures
- Public read access
- User-specific upload policies

**Views:**
- `meeting_stats` - Meeting analytics
- `action_item_stats` - Action item analytics

---

## 📱 Production Deployment (Optional)

When ready to deploy:

1. **Create production Supabase project**
   - Same steps as above
   - Use production-grade password
   - Enable email confirmations
   - Configure SMTP for emails

2. **Deploy to Vercel/Netlify**
   - Push code to GitHub
   - Connect to Vercel/Netlify
   - Add environment variables
   - Deploy!

3. **Security**
   - Enable email confirmation
   - Configure SMTP (SendGrid, Postmark, etc.)
   - Set up custom domain
   - Enable 2FA for Supabase account
   - Review RLS policies

---

## ✅ Completion Checklist

- [ ] Supabase project created
- [ ] `.env.local` updated with real credentials
- [ ] Database schema deployed successfully
- [ ] Email confirmation disabled (dev)
- [ ] Connection test passed
- [ ] Dev server running
- [ ] Successfully signed up
- [ ] Successfully logged in
- [ ] Created test meeting
- [ ] Created test action item
- [ ] Viewed dashboard with data

**When all checked → You're ready to build! 🚀**

---

## 🆘 Need Help?

If stuck:
1. Check this checklist from the top
2. Review `SUPABASE_QUICKSTART.md` for detailed steps
3. Check Supabase logs in dashboard
4. Run `./test-connection.sh` to diagnose
5. Check browser console (F12) for frontend errors

---

## 📚 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **Setup Guide**: `SUPABASE_QUICKSTART.md`
- **Integration Status**: `INTEGRATION_STATUS.md`
- **Full Setup Guide**: `SETUP_GUIDE.md`

---

**Last Updated**: April 2, 2026
