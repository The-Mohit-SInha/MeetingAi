# 🎯 Step-by-Step: Fix "Access Blocked" Error (With Screenshots Guide)

## Problem
```
Access blocked: Authorization Error
Error 400: admin_policy_enforced
```

## ✅ **THE FIX (Follow exactly)**

---

## **Step 1: Add Your Email as Test User** (MOST IMPORTANT!)

### **1.1 Go to OAuth Consent Screen**
```
https://console.cloud.google.com/apis/credentials/consent
```

### **1.2 Scroll to "Test users" Section**
Look for this heading: **Test users**

### **1.3 Click "+ ADD USERS" Button**
It's a blue button below "Test users" heading

### **1.4 Enter Your Email**
Type your Gmail address (the one you want to connect):
```
your.email@gmail.com
```

### **1.5 Click "Add" Then "Save"**
- First click the **"Add"** button in the popup
- Then click **"SAVE"** at the bottom of the page

**✅ DONE! This is 90% of the fix!**

---

## **Step 2: Enable Google Calendar API**

### **2.1 Go to API Library**
```
https://console.cloud.google.com/apis/library
```

### **2.2 Search "Google Calendar API"**
Use the search bar at the top

### **2.3 Click on "Google Calendar API"**
Click the card that appears

### **2.4 Click "Enable"**
Big blue button at the top

**✅ Wait for "API Enabled" message**

---

## **Step 3: Verify Redirect URI**

### **3.1 Go to Credentials**
```
https://console.cloud.google.com/apis/credentials
```

### **3.2 Find Your OAuth 2.0 Client ID**
Under "OAuth 2.0 Client IDs" section, click on your client name

### **3.3 Check "Authorized redirect URIs"**
Scroll down to this section

### **3.4 Add This URI (if not already there):**
```
http://localhost:5173/auth/google-meet/callback
```

Click **"+ ADD URI"** if needed, paste the above, then click **"SAVE"**

**✅ DONE! URI configured**

---

## **Step 4: Test the Connection**

### **4.1 Refresh Your App**
Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac) to hard refresh

### **4.2 Go to Settings**
In your app: **Dashboard → Settings → Integrations Tab**

### **4.3 Click "Connect" on Google Meet Card**
Should open Google sign-in popup

### **4.4 Sign In**
Use the **exact email you added as test user**

### **4.5 Click "Allow"**
Grant permissions

### **4.6 Success!**
You should see:
- "Connected" badge on Google Meet card
- Your email displayed
- Green checkmark ✅

---

## 🎯 **What Each Step Does**

| Step | What It Fixes |
|------|---------------|
| **Step 1: Add Test User** | Allows your Gmail to access the app in Testing mode |
| **Step 2: Enable Calendar API** | Gives your app permission to read calendar/meeting data |
| **Step 3: Add Redirect URI** | Tells Google where to send you after OAuth |
| **Step 4: Test** | Verifies everything works! |

---

## ⚠️ **Common Mistakes**

### ❌ **Mistake 1: Wrong Email in Test Users**
```
Added: john@gmail.com
Tried to connect with: john.doe@gmail.com
Result: ❌ Access blocked
```
**Fix:** Email must match EXACTLY!

### ❌ **Mistake 2: Didn't Click "Save"**
```
Added test user → Closed browser
Result: ❌ Changes not saved
```
**Fix:** Always click "SAVE" at bottom of page!

### ❌ **Mistake 3: Wrong Redirect URI**
```
Added: http://localhost:5173/callback
Should be: http://localhost:5173/auth/google-meet/callback
Result: ❌ redirect_uri_mismatch error
```
**Fix:** Copy exact URI from Step 3.4!

### ❌ **Mistake 4: Forgot to Enable Calendar API**
```
Result: ❌ "Calendar API has not been used" error
```
**Fix:** Complete Step 2!

---

## 🔍 **How to Verify Each Step**

### **Verify Step 1 Completed:**
```
Console → OAuth consent screen → Test users section
```
You should see your email in a list

### **Verify Step 2 Completed:**
```
Console → APIs & Services → Enabled APIs
```
"Google Calendar API" should be in the list

### **Verify Step 3 Completed:**
```
Console → Credentials → Click OAuth client → Authorized redirect URIs
```
Should show: `http://localhost:5173/auth/google-meet/callback`

---

## 🎨 **Visual Flow**

```
1. Google Cloud Console
   ↓
2. OAuth Consent Screen
   ↓
3. Test Users → Add YOUR email → Save
   ↓
4. API Library
   ↓
5. Google Calendar API → Enable
   ↓
6. Credentials
   ↓
7. OAuth Client → Verify redirect URI
   ↓
8. Your App → Settings → Connect
   ↓
9. ✅ SUCCESS!
```

---

## 🚨 **If You See These Errors**

### **Error: "Access blocked: This app's request is invalid"**
**Cause:** Your email not in test users
**Fix:** Complete Step 1 again, make sure to click SAVE

### **Error: "Access blocked: admin_policy_enforced"**
**Cause:** Your Google Workspace admin blocked OAuth apps
**Fix:** 
- Use personal Gmail (not workspace email)
- Or ask admin to allow OAuth apps

### **Error: "redirect_uri_mismatch"**
**Cause:** Redirect URI doesn't match
**Fix:** Check Step 3.4 - copy exact URI

### **Error: "API has not been used in project"**
**Cause:** Calendar API not enabled
**Fix:** Complete Step 2

### **Popup says: "This app isn't verified"**
**This is NORMAL!** Click:
1. "Advanced"
2. "Go to [App Name] (unsafe)"
3. "Allow"

This is safe - it's your own app in testing mode!

---

## 📱 **Mobile Device Setup**

If testing on mobile (e.g., Expo/React Native):

### **Add Mobile Redirect URI:**
```
myapp://auth/google-meet/callback
```

### **For Web View:**
```
https://your-domain.com/auth/google-meet/callback
```

---

## 🎯 **Quick Commands (Copy-Paste)**

### **Go to OAuth Consent:**
```
https://console.cloud.google.com/apis/credentials/consent
```

### **Go to API Library:**
```
https://console.cloud.google.com/apis/library
```

### **Go to Credentials:**
```
https://console.cloud.google.com/apis/credentials
```

### **Check Enabled APIs:**
```
https://console.cloud.google.com/apis/dashboard
```

---

## ✅ **Final Checklist (Before Testing)**

Check off each item:

```
☐ 1. Opened https://console.cloud.google.com/apis/credentials/consent
☐ 2. Scrolled to "Test users" section
☐ 3. Clicked "+ ADD USERS"
☐ 4. Entered MY email: ___________________
☐ 5. Clicked "Add" button
☐ 6. Clicked "SAVE" at bottom of page
☐ 7. Saw success message
☐ 8. Went to https://console.cloud.google.com/apis/library
☐ 9. Searched "Google Calendar API"
☐ 10. Clicked "Enable"
☐ 11. Saw "API enabled" message
☐ 12. Went to Credentials page
☐ 13. Clicked my OAuth 2.0 Client
☐ 14. Checked "Authorized redirect URIs"
☐ 15. Verified http://localhost:5173/auth/google-meet/callback is there
☐ 16. Clicked "SAVE" (if I added URI)
☐ 17. Refreshed my app (Ctrl+Shift+R)
☐ 18. Ready to test!
```

**All checked?** You're good to go! 🚀

---

## 🎉 **Success Indicators**

After connecting, you should see:

### **In Your App (Settings → Integrations):**
```
✅ Google Meet card shows "Connected"
✅ Email displayed: your.email@gmail.com
✅ "Disconnect" button available
✅ Meeting preferences toggles active
```

### **In Google Cloud Console:**
```
✅ Test user list shows your email
✅ Google Calendar API in "Enabled APIs"
✅ OAuth client has correct redirect URI
```

---

## 💡 **Pro Tips**

1. **Use Incognito Mode for Testing**
   - Avoids cache issues
   - Fresh OAuth session
   - Easy to retry

2. **Add Multiple Test Users**
   - Add all team members
   - Up to 100 users in testing mode
   - No verification needed

3. **Keep App in Testing Mode**
   - Perfect for development
   - No Google review required
   - Can update anytime

4. **For Production Later**
   - Click "Publish App" when ready
   - Calendar scopes = instant approval
   - No waiting for verification!

---

## 🆘 **Still Stuck?**

### **Double-check these URLs match:**

**In Google Console (Credentials):**
```
http://localhost:5173/auth/google-meet/callback
```

**In Your App (.env file):**
```
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

**In Your Browser:**
```
http://localhost:5173
```

All three must use `localhost:5173` (not `127.0.0.1` or other port)!

---

## 📞 **Need More Help?**

See detailed guides:
- [QUICK_FIX_OAUTH.md](./QUICK_FIX_OAUTH.md) - Quick reference
- [GOOGLE_MEET_OAUTH_FIX.md](./GOOGLE_MEET_OAUTH_FIX.md) - Complete guide

---

**Follow these steps exactly and you'll be connected in 5 minutes!** ✅
