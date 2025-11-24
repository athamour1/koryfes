# Scout Badges - Testing Checklist

**Test Date:** _____________  
**Tester:** _____________  
**Environment:** Production / Staging / Development

---

## 🔐 Authentication & Authorization

### Login/Register
- [ ] User can register with valid credentials
- [ ] User can login with correct credentials
- [ ] Invalid credentials show error message
- [ ] JWT token is properly stored
- [ ] User remains logged in after page refresh
- [ ] Logout works correctly
- [ ] Forgot password email is sent
- [ ] Password reset link works
- [ ] Password can be reset successfully

### Role-Based Access
- [ ] Super admin can access all pages
- [ ] Admin can access location-scoped pages
- [ ] Unit leader can access unit pages
- [ ] Regular user has appropriate access
- [ ] Unauthorized access is blocked

---

## 👤 Super Admin Testing

### User Management
- [ ] Can view all users across all locations
- [ ] Can create new user
- [ ] Can update user details
- [ ] Can delete user (not self)
- [ ] Cannot delete themselves
- [ ] Can assign user to location
- [ ] Can assign user to unit
- [ ] Can change user role
- [ ] Can upload user profile image
- [ ] User search works
- [ ] User filtering by location works
- [ ] User filtering by name works

### Unit Management
- [ ] Can view all units across all locations
- [ ] Can create new unit
- [ ] Can update unit details
- [ ] Can delete unit
- [ ] Can upload unit photo
- [ ] Can assign unit leader
- [ ] Unit filtering by location works

### Location Management
- [ ] Can view all locations
- [ ] Can create new location
- [ ] Can update location details
- [ ] Can delete location
- [ ] Can assign admin to location

### Badge Management (Legacy)
- [ ] Can view all badges
- [ ] Can create new badge
- [ ] Can update badge details
- [ ] Can delete badge
- [ ] Can assign badge to user
- [ ] Can update badge acquisition date
- [ ] Can remove badge from user

### Progress System - Peaks
- [ ] Can view all peaks
- [ ] Can create new peak
- [ ] Can update peak details
- [ ] Can delete peak
- [ ] Can set peak order
- [ ] Can award Promise peak to user
- [ ] Peak images display correctly

### Progress System - Paths
- [ ] Can view all paths
- [ ] Can create new path
- [ ] Can update path details
- [ ] Can delete path
- [ ] Can award path to user
- [ ] Path categories work

### Progress System - Scout Diplomas
- [ ] Can view all scout diplomas
- [ ] Can create scout diploma (levels 1-3)
- [ ] Can update scout diploma details
- [ ] Can delete scout diploma
- [ ] Can award scout diploma to user
- [ ] Diploma levels are enforced

### Progress System - Elective Diplomas
- [ ] Can view all elective diplomas
- [ ] Can create elective diploma
- [ ] Can update elective diploma details
- [ ] Can delete elective diploma
- [ ] Can award elective diploma to user

### User Progress Management
- [ ] Can view any user's progress
- [ ] Can award Promise peak
- [ ] Can award paths
- [ ] Can award scout diplomas
- [ ] Can award elective diplomas
- [ ] Automatic peak unlock works (Bronze)
- [ ] Automatic peak unlock works (Silver)
- [ ] Automatic peak unlock works (Gold)

### Dashboard & Statistics
- [ ] Can view admin dashboard
- [ ] Total users count is correct
- [ ] Total badges count is correct
- [ ] Awarded badges count is correct
- [ ] Top users chart displays
- [ ] Badge distribution chart displays

---

## 👨‍💼 Admin (Captain) Testing

**Test with location-scoped admin account**

### User Management
- [ ] Can view users in their location only
- [ ] Can create user (user role, their location)
- [ ] Can update user in their location
- [ ] Can delete user in their location
- [ ] Cannot create admin/super_admin users
- [ ] Cannot modify users in other locations
- [ ] Cannot modify other admins
- [ ] Cannot change user locations
- [ ] Can upload profile image for users in their location
- [ ] User search works for their location

### Unit Management
- [ ] Can view units in their location only
- [ ] Can create unit in their location
- [ ] Can update unit in their location
- [ ] Can delete unit in their location
- [ ] Can upload unit photo
- [ ] Cannot access units in other locations

### Badge Assignment (Legacy)
- [ ] Can view all badges
- [ ] Can assign badge to user in their location
- [ ] Can update badge date for user in their location
- [ ] Can remove badge from user in their location
- [ ] Cannot assign to users in other locations
- [ ] Cannot create/update/delete badge definitions

### Progress Management
- [ ] Can view progress for users in their location
- [ ] Can award Promise peak to user in their location
- [ ] Can award paths to user in their location
- [ ] Can award diplomas to user in their location
- [ ] Cannot award to users in other locations

### Dashboard
- [ ] Can view dashboard with location statistics
- [ ] Statistics show only their location data
- [ ] Top users show only from their location

### Restrictions
- [ ] Cannot access location management
- [ ] Cannot access super admin features
- [ ] Cannot modify badge definitions
- [ ] Cannot modify peak definitions
- [ ] Cannot modify path definitions
- [ ] Cannot modify diploma definitions

---

## 👤 Unit Leader Testing

**Test with user account that has unitRole: 'leader'**

### Unit Management
- [ ] Can view own unit details
- [ ] Can update unit photo
- [ ] Can view unit members
- [ ] Cannot modify unit details
- [ ] Cannot create/delete units
- [ ] Cannot access other units

### User Viewing
- [ ] Can view members of their unit
- [ ] Cannot modify user details

### Restrictions
- [ ] Cannot access admin features
- [ ] Cannot manage badges
- [ ] Cannot manage progress

---

## 🙋 Regular User Testing

### Profile Management
- [ ] Can view own profile
- [ ] Can update own name
- [ ] Can upload own profile image
- [ ] Can customize avatar (Beanheads editor)
- [ ] Avatar changes save correctly
- [ ] Profile changes persist after logout/login

### Avatar Editor
- [ ] All avatar options load
- [ ] Can change skin tone
- [ ] Can change eyes
- [ ] Can change hair style
- [ ] Can change clothing
- [ ] Can change accessories
- [ ] Can randomize avatar
- [ ] Preview updates in real-time
- [ ] Save button works

### Progress Viewing
- [ ] Can view own progress page
- [ ] Current peak displays correctly
- [ ] Completed paths count is accurate
- [ ] Scout diplomas display correctly
- [ ] Elective diplomas display correctly
- [ ] Progress chart displays
- [ ] Peak images show correctly

### Community Features
- [ ] Can view Scouts Community page
- [ ] Can see list of other users
- [ ] Can click to view user profiles
- [ ] User profile page shows progress
- [ ] User avatar displays correctly
- [ ] Search users works

### Unit Viewing
- [ ] Can view own unit page
- [ ] Unit photo displays
- [ ] Unit details are correct
- [ ] Cannot modify unit (unless leader)

### Restrictions
- [ ] Cannot access admin pages
- [ ] Cannot modify other users
- [ ] Cannot award badges/progress to self
- [ ] Cannot access location management

---

## 🎨 UI/UX Testing

### General Interface
- [ ] Navigation menu works
- [ ] All pages load without errors
- [ ] Buttons have hover effects
- [ ] Forms validate input correctly
- [ ] Error messages display clearly
- [ ] Success notifications appear
- [ ] Loading states show during API calls
- [ ] Icons display correctly

### Responsive Design
- [ ] Mobile layout works (<768px)
- [ ] Tablet layout works (768px-1024px)
- [ ] Desktop layout works (>1024px)
- [ ] Navigation drawer works on mobile
- [ ] Tables scroll horizontally on mobile
- [ ] Cards stack properly on mobile
- [ ] Forms are usable on mobile

### Dark Mode
- [ ] Dark mode toggle works
- [ ] Dark mode preference persists
- [ ] All pages support dark mode
- [ ] Cards have correct dark mode colors
- [ ] Text is readable in dark mode
- [ ] Images/icons work in dark mode
- [ ] Scrollbar is styled in dark mode

### Internationalization
- [ ] Can switch between Greek and English
- [ ] Language preference persists
- [ ] All UI text translates
- [ ] Date formats are localized
- [ ] Number formats are correct

### Page-Specific UI
- [ ] Login page background is interactive
- [ ] Admin dashboard charts render
- [ ] User profile displays avatar
- [ ] Progress page shows visual indicators
- [ ] Community page cards look good
- [ ] Admin tables have proper styling
- [ ] Hero headers show on desktop
- [ ] Hero headers hide on mobile

---

## 🔄 Data Flow & Integration

### User CRUD Operations
- [ ] Create user → appears in list
- [ ] Update user → changes reflect immediately
- [ ] Delete user → removed from list
- [ ] Assign badge → shows in user profile
- [ ] Remove badge → removed from user profile

### Unit CRUD Operations
- [ ] Create unit → appears in list
- [ ] Update unit → changes reflect
- [ ] Delete unit → removed from list
- [ ] Upload photo → displays correctly

### Progress System Flow
- [ ] Award Promise peak → user has peak
- [ ] Award 4 paths + diplomas → Bronze unlocks
- [ ] Award 8 paths + diplomas → Silver unlocks
- [ ] Award 12 paths + diplomas → Gold unlocks
- [ ] Progress displays on user profile
- [ ] Progress displays in My Progress page

### Search & Filter
- [ ] User search by name works
- [ ] User filter by location works
- [ ] Unit filter by location works
- [ ] Empty results show message
- [ ] Search clears correctly

---

## 📱 PWA Features (Quasar CLI Version)

### Installation
- [ ] PWA install prompt appears
- [ ] Can install on desktop
- [ ] Can install on mobile
- [ ] App icon appears correctly
- [ ] App name displays correctly

### Offline Functionality
- [ ] Service worker registers
- [ ] Static assets cache
- [ ] Previously visited pages work offline
- [ ] Shows offline indicator

### Updates
- [ ] Update notification appears
- [ ] Can trigger app update
- [ ] New version loads correctly

---

## 🔒 Security Testing

### Authentication Security
- [ ] Passwords are hashed (not visible in DB)
- [ ] JWT tokens expire correctly
- [ ] Invalid tokens are rejected
- [ ] Session timeout works

### Authorization Security
- [ ] Cannot access API without token
- [ ] Cannot access admin endpoints as user
- [ ] Cannot modify users in other locations
- [ ] Cannot escalate own role
- [ ] CORS is properly configured

### Input Validation
- [ ] SQL injection prevented
- [ ] XSS attacks prevented
- [ ] Email validation works
- [ ] Required fields are enforced
- [ ] File upload size limits work
- [ ] File type validation works

---

## 🐛 Error Handling

### Network Errors
- [ ] Shows error on network failure
- [ ] Shows error on 404
- [ ] Shows error on 500
- [ ] Shows error on 401 (Unauthorized)
- [ ] Shows error on 403 (Forbidden)

### Form Errors
- [ ] Shows validation errors inline
- [ ] Highlights invalid fields
- [ ] Error messages are clear
- [ ] Can retry after error

### File Upload Errors
- [ ] Shows error for oversized files
- [ ] Shows error for invalid file types
- [ ] Shows error on upload failure

---

## 📊 Performance Testing

### Page Load Times
- [ ] Login page loads < 2s
- [ ] Dashboard loads < 3s
- [ ] User list loads < 2s
- [ ] Profile page loads < 2s

### API Response Times
- [ ] User list API < 1s
- [ ] Create user API < 500ms
- [ ] Update user API < 500ms
- [ ] Progress API < 1s

### Image Loading
- [ ] Profile images load quickly
- [ ] Unit photos load quickly
- [ ] Avatar preview is smooth
- [ ] Lazy loading works

---

## 🌐 Cross-Browser Testing

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] Chrome Mobile
- [ ] Safari iOS
- [ ] Firefox Mobile
- [ ] Samsung Internet

---

## 📝 Notes & Issues

### Issues Found
```
Issue #1:
- Description: 
- Steps to reproduce:
- Expected behavior:
- Actual behavior:
- Priority: High / Medium / Low

Issue #2:
- Description:
- Steps to reproduce:
- Expected behavior:
- Actual behavior:
- Priority: High / Medium / Low
```

### General Notes
```
- 
- 
- 
```

---

## ✅ Testing Summary

**Total Items Tested:** _____ / _____  
**Passing:** _____  
**Failing:** _____  
**Not Tested:** _____

**Critical Issues:** _____  
**Major Issues:** _____  
**Minor Issues:** _____

**Overall Status:** ⬜ Pass | ⬜ Fail | ⬜ Partial

**Tester Signature:** _________________  
**Date Completed:** _________________

---

**Version:** 1.0  
**Last Updated:** 2025-11-24
