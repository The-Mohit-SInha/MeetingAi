# 🔧 Fix "Access blocked: Authorization Error" - Google Meet OAuth

## Problem
When clicking "Connect Google Meet" in Settings, you see:
```
Access blocked: Authorization Error
Error 400: admin_policy_enforced
```

This happens because Google Cloud Console OAuth settings need configuration.

---

## ✅ **Complete Fix (5 minutes)**

### **Step 1: Go to Google Cloud Console**

1. Open: https://console.cloud.google.com/
2. Select your project (or create one if needed)
3. In the search bar, type **"OAuth consent screen"** and select it

---

### **Step 2: Configure OAuth Consent Screen**

#### **2a. Choose User Type**

- If you see the setup screen:
  - Select **"External"** (for testing with any Gmail account)
  - Click **"Create"**

#### **2b. Fill in App Information**

**App Information:**
- **App name:** `AI Meeting Management System` (or your app name)
- **User support email:** Your email address
- **App logo:** (Optional - skip for now)

**App Domain (Optional):**
- Leave blank for testing

**Developer contact information:**
- **Email addresses:** Your email address

**Click "Save and Continue"**

---

### **Step 3: Add Required Scopes**

Click **"Add or Remove Scopes"**

**Add these scopes:**

```
✅ email
✅ profile
✅ openid
✅ https://www.googleapis.com/auth/meetings.space.created
✅ https://www.googleapis.com/auth/meetings.space.readonly
```

**Important Notes:**
- If you see a warning about "Restricted scopes" → **Ignore it for now** (we'll handle this)
- If `meetings.space.*` scopes are not available, that's OK - we'll use alternatives

**Click "Update" → "Save and Continue"**

---

### **Step 4: Add Test Users (CRITICAL!)**

⚠️ **THIS IS THE MOST IMPORTANT STEP!**

When your app is in "Testing" mode, ONLY test users can sign in.

1. Click **"Add Users"** button
2. Enter the **exact Gmail address** you want to sign in with
3. Click **"Add"**
4. Click **"Save and Continue"**

**Example:**
```
yourname@gmail.com
```

---

### **Step 5: Review and Complete**

1. Review the summary
2. Click **"Back to Dashboard"**

---

### **Step 6: Verify OAuth Client Settings**

1. In Google Cloud Console, search for **"Credentials"**
2. Find your OAuth 2.0 Client ID
3. Click the **pencil icon (Edit)**

**Authorized JavaScript origins:**
```
http://localhost:5173
https://your-production-domain.com
```

**Authorized redirect URIs:**
```
http://localhost:5173/auth/google-meet/callback
https://your-production-domain.com/auth/google-meet/callback
```

4. Click **"Save"**

---

## 🚀 **Quick Fix - Alternative Scopes**

If Google Meet API scopes are causing issues, use **Google Calendar API** instead (it can access meetings):

### **Enable Google Calendar API:**

1. Google Cloud Console → **"APIs & Services"** → **"Library"**
2. Search for **"Google Calendar API"**
3. Click **"Enable"**

### **Use These Scopes Instead:**

```
✅ https://www.googleapis.com/auth/calendar.events.readonly
✅ https://www.googleapis.com/auth/calendar.readonly
```

These scopes are non-sensitive and won't require verification!

---

## 🎯 **Test the Fix**

1. **Go back to your app** → Settings → Integrations
2. Click **"Connect"** on Google Meet card
3. You should now see the Google sign-in screen
4. **Select the test user email you added**
5. Click **"Allow"**
6. ✅ Success! You'll see "Connected" badge

---

## ⚠️ **Common Errors & Fixes**

### Error: "Access blocked: This app's request is invalid"
**Fix:** Add your email to Test Users (Step 4)

### Error: "redirect_uri_mismatch"
**Fix:** Add exact redirect URI to OAuth client (Step 6)

### Error: "admin_policy_enforced"
**Fix:** 
- Remove restricted scopes
- Use Calendar API scopes instead
- Or publish app for verification

### Error: "This app isn't verified"
**Fix:** 
- Click "Advanced" → "Go to [App Name] (unsafe)"
- This is normal for testing apps

---

## 🔐 **Publishing Your App (Optional)**

If you want to allow any user (not just test users):

### **Option 1: Keep in Testing Mode (Recommended for Development)**
- App remains private
- Only test users (up to 100) can sign in
- No verification needed
- Refresh token expires after 7 days

### **Option 2: Publish to Production**
1. OAuth Consent Screen → Click **"Publish App"**
2. If using sensitive scopes → Submit for **Google Verification** (takes 1-2 weeks)
3. If using non-sensitive scopes → Instant approval!

**Sensitive Scopes (require verification):**
- `meetings.space.*`
- `gmail.*`
- `drive.*`

**Non-Sensitive Scopes (no verification):**
- `email`, `profile`, `openid`
- `calendar.readonly`
- `userinfo.*`

---

## 🎨 **Simplified Setup (Using Calendar API)**

For quick setup without verification issues:

### **1. Enable Google Calendar API**
```
Google Cloud Console → APIs & Services → Library → Google Calendar API → Enable
```

### **2. Use These Scopes Only**
```javascript
// In your OAuth flow, use:
const scopes = [
  'email',
  'profile',
  'https://www.googleapis.com/auth/calendar.events.readonly'
];
```

### **3. Add Test Users**
```
OAuth Consent Screen → Test Users → Add your Gmail
```

### **4. Connect**
```
Settings → Integrations → Connect Google Meet
```

✅ **No verification needed!** Calendar scopes are non-sensitive.

---

## 📝 **Current App Configuration**

Your app is currently configured to request:

**Backend (Supabase Edge Function):**
- Using Google Meet API scopes
- Calendar events access
- Meeting details reading

**Frontend:**
- OAuth redirect to `/auth/google-meet/callback`
- Stores tokens in `user_settings` table

---

## 🔄 **Update App to Use Calendar API (Recommended)**

I can update your app to use Google Calendar API instead of Google Meet API. This will:
- ✅ No verification required
- ✅ Works immediately
- ✅ Can still detect meetings
- ✅ Get meeting details

Would you like me to update the code to use Calendar API scopes?

---

## 🆘 **Still Getting Errors?**

### Check These:

1. **Test User Added?**
   - OAuth Consent Screen → Test Users
   - Your email must be in the list

2. **Correct Redirect URI?**
   ```
   http://localhost:5173/auth/google-meet/callback
   ```
   Must match EXACTLY in OAuth client settings

3. **APIs Enabled?**
   - Google Calendar API: Enabled
   - (Optional) Google Meet API: Enabled

4. **Browser Cache?**
   - Clear cookies for accounts.google.com
   - Try incognito mode

---

## 📊 **Verification Requirements by Scope**

| Scope | Requires Verification? |
|-------|----------------------|
| `email`, `profile`, `openid` | ❌ No |
| `calendar.readonly` | ❌ No |
| `calendar.events.readonly` | ❌ No |
| `meetings.space.*` | ⚠️ Yes (if published) |
| `gmail.*` | ⚠️ Yes (if published) |
| `drive.*` | ⚠️ Yes (if published) |

**Recommendation:** Use Calendar scopes to avoid verification!

---

## ✅ **Quick Checklist**

Before trying to connect again:

- [ ] OAuth Consent Screen configured
- [ ] User Type set to "External"
- [ ] App name and email filled in
- [ ] Scopes added (use Calendar scopes)
- [ ] **YOUR EMAIL ADDED TO TEST USERS** ← Most important!
- [ ] Redirect URI matches exactly
- [ ] Google Calendar API enabled

---

## 🎉 **After Fixing**

Once configured, you'll be able to:
1. Connect Google Meet with one click
2. Auto-detect live meetings
3. Capture transcripts
4. Run AI analysis
5. Extract action items

**The error will be gone and OAuth will work smoothly!** 🚀

---

## 💡 **Pro Tips**

1. **Always use Testing mode during development**
   - No verification needed
   - Quick iterations
   - Up to 100 test users

2. **Use non-sensitive scopes when possible**
   - Calendar API instead of Meet API
   - Faster approval
   - Less restrictive

3. **Add multiple test users**
   - Add all team members
   - Add test accounts
   - Easy to manage

4. **Keep credentials secure**
   - Never commit OAuth secrets
   - Use environment variables
   - Rotate keys periodically

---

**Need help with a specific error?** Share the exact error message and I'll provide a targeted fix!
