# 🔧 Troubleshooting Guide - Stuck on Loading Screen

## Problem: Site Stuck on Loading Screen After Deleting Gmail Account

If you're stuck on a loading screen after deleting a Gmail account that was previously used to sign in, follow these solutions:

---

## ✅ Solution 1: Use the Built-in Clear Session Button

**If you're on the loading screen:**

1. Wait for the "Taking too long? Clear session" button to appear (below the loading spinner)
2. Click the button
3. You'll be redirected to the login page

**This will:**
- Clear all localStorage
- Clear all sessionStorage  
- Sign out from Supabase
- Redirect to login

---

## ✅ Solution 2: Clear Session via Browser Console (Instant)

1. **While on the loading screen**, press `F12` to open Developer Tools
2. Click the **Console** tab
3. **Paste this code** and press Enter:

```javascript
// Clear all session data
localStorage.clear();
sessionStorage.clear();

// Clear all cookies
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

// Redirect to login
window.location.href = '/login';
```

4. The page will refresh and take you to the login screen

---

## ✅ Solution 3: Clear Browser Data Manually

### Chrome / Edge:
1. Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
2. Select:
   - ✅ Cookies and other site data
   - ✅ Cached images and files
3. Time range: **All time**
4. Click **Clear data**
5. Reload the site

### Firefox:
1. Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
2. Select:
   - ✅ Cookies
   - ✅ Cache
3. Time range: **Everything**
4. Click **OK**
5. Reload the site

### Safari:
1. Go to Safari → Settings → Privacy
2. Click **Manage Website Data**
3. Click **Remove All**
4. Confirm and reload the site

---

## ✅ Solution 4: Use Incognito/Private Mode

1. Open a new **Incognito/Private window**:
   - Chrome/Edge: `Ctrl+Shift+N` or `Cmd+Shift+N`
   - Firefox: `Ctrl+Shift+P` or `Cmd+Shift+P`
   - Safari: `Cmd+Shift+N`
2. Navigate to your site URL
3. You'll start with a fresh session

---

## 🔍 Why This Happens

When you sign in with Google OAuth, the app stores:
- Authentication tokens in Supabase
- User session in localStorage
- Cookies for session persistence

If you delete the Gmail account externally, these tokens become invalid but remain in your browser, causing the app to:
1. Detect a session exists
2. Try to verify the user in the database
3. Get stuck waiting for a response from a deleted account

---

## 🛡️ Prevention - Already Implemented!

The following fixes have been added to prevent this in the future:

### 1. **Stale Session Auto-Detection** ✅
The AuthContext now automatically:
- Checks if the user exists in the database
- Signs out stale sessions immediately
- Clears invalid tokens

### 2. **Clear Session Button on Loading Screen** ✅
The loading screen now shows:
- A "Taking too long? Clear session" button
- Instant session clearing
- Automatic redirect to login

### 3. **Enhanced Error Handling** ✅
The app now catches:
- Database connection errors
- Invalid user tokens
- Deleted account scenarios

---

## 📝 After Clearing Session

Once you've cleared the session, you can:

1. **Sign in with a different Gmail account**
   - Go to Login page
   - Click "Sign in with Google"
   - Choose your new account

2. **Create a new account with email/password**
   - Go to Login page
   - Click "Sign up"
   - Enter email, password, and name

3. **Sign in with an existing email account**
   - Use the email/password login form

---

## 🆘 Still Having Issues?

If you're still stuck after trying all solutions:

### Check Browser Console for Errors:
1. Press `F12` → Console tab
2. Look for red error messages
3. Common errors:
   - `Failed to get session` → Clear cookies and retry
   - `Database query failed` → Check internet connection
   - `User not found` → Session was already cleared

### Force Refresh:
- Windows: `Ctrl+Shift+R`
- Mac: `Cmd+Shift+R`
- This bypasses cache completely

### Try a Different Browser:
If one browser is stuck, try:
- Chrome → Firefox
- Edge → Safari
- Or use Incognito mode

---

## ✅ Quick Reference

| Symptom | Solution |
|---------|----------|
| Loading spinner forever | Click "Clear session" button |
| No "Clear session" button | Use browser console method |
| Console method doesn't work | Clear browser data manually |
| Still stuck | Use Incognito mode |
| Account deleted | Any solution above works |

---

## 🎯 Best Practice

**When changing Gmail accounts:**

1. Sign out properly **before** deleting the account:
   - Dashboard → Profile → Sign out
   - This prevents session issues

2. Or use the "Clear session" button on loading screen if you forgot

---

**All solutions are safe and won't delete any other browser data** (unless you choose "All time" in browser settings).

**Need more help?** Open Developer Console (F12) and check for specific error messages.
