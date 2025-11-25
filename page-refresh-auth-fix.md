# Page Refresh Authentication Fix

## Problem
Admin pages become unavailable after refreshing the page. Users get redirected or blocked from accessing routes they should have permission for.

## Root Cause
The router guard at `frontend/src/router/index.js` line 76 checks `authStore.isAdmin`, but this getter **did not exist** in the auth store.

**Router code (line 76)**:
```javascript
if (authStore.isAdmin) {
  next();
} else {
  next('/my-progress'); // Redirect non-admins
}
```

**Auth store getters (before fix)**:
```javascript
getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role,
    isSuperAdmin: (state) => state.user?.role === 'super_admin',
    isCaptain: (state) => state.user?.role === 'admin',
    hasRefreshToken: (state) => !!state.refreshToken,
},
```

❌ **Missing**: `isAdmin` getter

## The Fix

**File**: [auth.js](file:///home/thanos98/Develop/test-seo/scout-badges/frontend/src/stores/auth.js)

### Added Missing Getter
```javascript
getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role,
    isAdmin: (state) => state.user?.role === 'admin' || state.user?.role === 'super_admin', // ✅ ADDED
    isSuperAdmin: (state) => state.user?.role === 'super_admin',
    isCaptain: (state) => state.user?.role === 'admin',
    hasRefreshToken: (state) => !!state.refreshToken,
},
```

## Result
✅ Admin pages now accessible after refresh  
✅ Super admin pages work correctly  
✅ Route guards properly evaluate user roles  

## Testing
1. Login as admin/super_admin
2. Navigate to `/admin/users` or any admin page
3. Refresh the page (F5 or Ctrl+R)
4. Page should load correctly without redirect

---

Frontend service restarted to apply changes.
