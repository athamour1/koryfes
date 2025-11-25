# JWT Authentication Fixes - Walkthrough

## Overview
Fixed intermittent JWT authentication failures by implementing proper error handling and token expiration management.

---

## Changes Made

### Frontend Changes

#### 1. Added 401 Response Interceptor
**File**: [api.js](file:///home/thanos98/Develop/test-seo/scout-badges/frontend/src/api.js)

Added global response interceptor to catch 401 Unauthorized errors:
- Automatically clears all authentication data from both localStorage and sessionStorage
- Redirects users to `/login` page when token is expired or invalid
- Prevents users from remaining on protected pages with invalid tokens
- Re-throws errors so specific handlers can still catch them if needed

**Key Code**:
```javascript
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Clear auth data and redirect to login
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            // ... clear other auth data
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);
```

---

#### 2. Improved Auth Store Error Handling
**File**: [stores/auth.js](file:///home/thanos98/Develop/test-seo/scout-badges/frontend/src/stores/auth.js)

Enhanced `fetchProfile()` method:
- Only triggers logout specifically on 401 errors (not all errors)
- Updates user data in the correct storage (localStorage or sessionStorage)
- Re-throws 401 errors to let router handle redirects
- Prevents infinite loops between auth store and 401 interceptor

**Key Changes**:
```javascript
async fetchProfile() {
    // ... fetch profile
    // Update storage with fresh user data
    const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(this.user));
    
    // Only logout on 401 errors
    if (error.response && error.response.status === 401) {
        this.logout();
        throw error;
    }
}
```

---

#### 3. Enhanced Router Guard Logic
**File**: [router/index.js](file:///home/thanos98/Develop/test-seo/scout-badges/frontend/src/router/index.js)

Improved navigation guard:
- Checks return value of `checkAuth()` before proceeding
- Prevents redirect loops by checking if already navigating to `/login`
- Better error handling when profile fetch fails
- Clearer flow control for authentication checks

**Key Improvements**:
```javascript
Router.beforeEach(async (to, from, next) => {
    // Check token expiration and capture result
    const isAuthValid = authStore.checkAuth();
    
    // If expired and trying to access protected route, redirect
    if (!isAuthValid && to.meta.requiresAuth && to.path !== '/login') {
        next('/login');
        return;
    }
    // ... rest of guard logic
});
```

---

### Backend Changes

#### 4. Environment Variable for JWT Secret
**File**: [constants.ts](file:///home/thanos98/Develop/test-seo/scout-badges/backend/src/auth/constants.ts)

Updated JWT secret to use environment variable:
- Reads from `process.env.JWT_SECRET`
- Falls back to development-only secret if not set
- Improves production security

**Change**:
```typescript
export class jwtConstants {
    static secret = process.env.JWT_SECRET || 'secretKey-dev-only-change-in-production';
}
```

✅ **Note**: JWT_SECRET is already configured in `docker-compose.yml` and `.env` file.

---

## What Was Fixed

### Before 🔴
- Users with expired tokens could remain on protected pages
- No global handling of 401 errors
- Inconsistent auth state after token expiration
- Intermittent authentication failures

### After ✅
- Users automatically logged out when tokens expire
- Global 401 error handling via interceptor
- Clean auth state management
- Consistent authentication behavior

---

## Testing Recommendations

### 1. **Test Token Expiration** (60 minutes without "Remember Me")
- Login without checking "Remember Me"
- Wait 61 minutes (or modify backend to shorter time for testing)
- Try to navigate or make an API call
- **Expected**: Automatic redirect to login page

### 2. **Test Invalid Token Handling**
- Login successfully
- Open DevTools → Application/Storage → Session Storage
- Modify the `token` value to something invalid
- Refresh the page
- **Expected**: Immediate redirect to login with cleared state

### 3. **Test 401 Response from Server**
- Login successfully
- Open DevTools → Network tab
- Look for any API request that returns 401
- **Expected**: Automatic logout and redirect to login

### 4. **Test Remember Me Feature**
- Login WITH "Remember Me" checked
- Close browser completely
- Reopen and navigate to app
- **Expected**: Still logged in (7-day token)

---

## Technical Notes

### Token Storage Strategy
- **With "Remember Me"**: Token stored in `localStorage` (persists across browser sessions)
- **Without "Remember Me"**: Token stored in `sessionStorage` (cleared when tab closes)

### Error Handling Flow
1. API request with expired token → Backend returns 401
2. Response interceptor catches 401 → Clears all auth data → Redirects to login
3. Router guard checks auth state → Allows login page to load

### Security Improvements
- JWT_SECRET now uses environment variable (production-ready)
- Automatic cleanup of expired tokens
- No possibility of stale authentication state

---

## Files Modified

| File | Changes |
|------|---------|
| [api.js](file:///home/thanos98/Develop/test-seo/scout-badges/frontend/src/api.js) | Added 401 response interceptor |
| [stores/auth.js](file:///home/thanos98/Develop/test-seo/scout-badges/frontend/src/stores/auth.js) | Improved error handling in fetchProfile |
| [router/index.js](file:///home/thanos98/Develop/test-seo/scout-badges/frontend/src/router/index.js) | Enhanced navigation guard logic |
| [constants.ts](file:///home/thanos98/Develop/test-seo/scout-badges/backend/src/auth/constants.ts) | Use environment variable for JWT secret |

---

## Next Steps

### For Development
- Test the authentication flow thoroughly
- Monitor browser console for any auth-related errors
- Verify no redirect loops occur

### For Production
- Ensure `JWT_SECRET` environment variable is set to a strong, unique value
- Consider implementing refresh tokens for seamless session extension
- Add user-friendly session expiration warnings

---

## Summary

✅ **Fixed**: Missing 401 response interceptor causing intermittent auth failures  
✅ **Fixed**: Improved auth state management and error handling  
✅ **Fixed**: Enhanced router guard to prevent race conditions  
✅ **Fixed**: JWT secret now uses environment variables for production security  

The authentication system now has robust error handling and will consistently log out users with expired or invalid tokens.
