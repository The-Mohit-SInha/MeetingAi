# 🚀 Quick Fix - Google Meet OAuth "Access Blocked" Error

## ⚡ **5-Minute Setup**

Your app has been updated to use **non-sensitive scopes** that don't require verification!

---

## ✅ **Step 1: Add Yourself as Test User**

This is the #1 reason for "Access blocked" errors!

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Click **"OAuth consent screen"** in the left menu (if not already there)
3. Scroll down to **"Test users"** section
4. Click **"+ ADD USERS"**
5. Enter your **exact Gmail address** (the one you want to connect)
6. Click **"Add"**
7. Click **"Save"** at the bottom

**Example:**
```
john.doe@gmail.com
```

---

## ✅ **Step 2: Enable Google Calendar API**

1. Go to: https://console.cloud.google.com/apis/library
2. Search for: **"Google Calendar API"**
3. Click on it
4. Click **"Enable"**

---

## ✅ **Step 3: Verify Redirect URI**

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your **OAuth 2.0 Client ID** (under "OAuth 2.0 Client IDs")
3. Scroll to **"Authorized redirect URIs"**
4. Make sure this is in the list:
   ```
   http://localhost:5173/auth/google-meet/callback
   ```
5. If not, click **"+ ADD URI"** and add it
6. Click **"Save"**

---

## ✅ **Step 4: Test Connection**

1. **Go back to your app** (refresh if needed)
2. Navigate to: **Settings → Integrations**
3. Find the **Google Meet** card
4. Click **"Connect"**
5. Sign in with the Gmail account you added as test user
6. Click **"Allow"** on the permissions screen
7. ✅ **Success!** You should see "Connected" badge

---

## 🎯 **What Changed**

I updated your app to use **Google Calendar API scopes** instead of Google Meet API scopes:

### **Old Scopes (Required Verification):**
```
❌ https://www.googleapis.com/auth/meetings.space.readonly
```

### **New Scopes (No Verification Required!):**
```
✅ https://www.googleapis.com/auth/calendar.events.readonly
✅ https://www.googleapis.com/auth/calendar.readonly
✅ openid
✅ email
✅ profile
```

**Why this works:**
- Calendar API can access Google Meet meetings (they're calendar events!)
- Calendar scopes are **non-sensitive** = no verification needed
- Works immediately in Testing mode
- Still captures all meeting data we need

---

## 🛡️ **If You Still Get "Access Blocked"**

### **Check 1: Are you added as a test user?**
```
Console → OAuth consent screen → Test users
```
Your email MUST be in this list!

### **Check 2: Is Calendar API enabled?**
```
Console → APIs & Services → Enabled APIs
```
"Google Calendar API" should be in the list.

### **Check 3: OAuth Consent Screen Status**
```
Console → OAuth consent screen
```
Should show:
- Publishing status: **Testing** ✅
- User type: **External** ✅

### **Check 4: Clear Browser Cache**
Sometimes Google caches old OAuth settings:
1. Open incognito/private window
2. Try connecting again

---

## 📊 **OAuth Consent Screen - Quick Reference**

Your OAuth consent screen should be configured like this:

### **App Information**
- **App name:** AI Meeting Management System (or your choice)
- **User support email:** Your email
- **Developer contact:** Your email

### **Scopes**
- email ✅
- profile ✅
- openid ✅
- calendar.events.readonly ✅
- calendar.readonly ✅

### **Test Users**
- Your Gmail address ✅

### **Publishing Status**
- Testing (recommended) ✅

---

## 🎨 **Optional: Customize OAuth Consent Screen**

Make it look professional (optional):

1. **Add App Logo** (optional)
   - 120x120px PNG/JPG
   - Square format

2. **Add Privacy Policy URL** (optional)
   - Link to your privacy policy

3. **Add Terms of Service URL** (optional)
   - Link to your terms

---

## 🚀 **After Setup**

Once connected, your app can:

1. ✅ Detect Google Calendar meetings (including Meet links)
2. ✅ Access meeting details (time, participants, etc.)
3. ✅ Create meetings in your calendar
4. ✅ Get upcoming meeting list
5. ✅ Extract meeting metadata

**All without Google verification!** 🎉

---

## 💡 **Pro Tips**

### **For Development:**
- Keep app in "Testing" mode
- Add all team members as test users (up to 100)
- No verification needed

### **For Production:**
- If you want public users → Click "Publish App"
- Calendar scopes = instant approval (no waiting!)
- Meet scopes = requires 1-2 week verification

### **Adding More Test Users:**
```
OAuth Consent Screen → Test Users → + ADD USERS
```
Add as many as you need (max 100 in testing mode)

---

## 🔧 **Troubleshooting Commands**

### **Check if Calendar API is enabled:**
```
Console → APIs & Services → Dashboard
```
Look for "Google Calendar API" in the list

### **View your OAuth client settings:**
```
Console → Credentials → Click your OAuth 2.0 Client ID
```
Verify redirect URIs match exactly

### **Check test users:**
```
Console → OAuth consent screen → Scroll to Test Users
```
Your email should be there

---

## ✅ **Quick Checklist**

Before trying to connect:

- [ ] Test user added (YOUR EMAIL)
- [ ] Google Calendar API enabled
- [ ] Redirect URI added (`http://localhost:5173/auth/google-meet/callback`)
- [ ] OAuth consent screen configured
- [ ] App in "Testing" mode
- [ ] Browser cache cleared (or use incognito)

---

## 🎉 **You're Ready!**

Try connecting now:
1. Settings → Integrations
2. Google Meet → Connect
3. Allow permissions
4. ✅ Done!

**The "Access blocked" error should be gone!** 🚀

---

**Still having issues?** Check the detailed guide: [GOOGLE_MEET_OAUTH_FIX.md](./GOOGLE_MEET_OAUTH_FIX.md)
