# 🧪 Testing Checklist - Refactored Features

## ✅ Quick Testing Guide

After refactoring 13 major files, use this checklist to verify everything works correctly.

---

## 🎯 Priority Tests

### 1. **Likes Screen** ✅

**Route**: `app/(main)/likes.tsx`  
**Screen**: `src/features/matching/screens/LikesScreen.tsx`

**Test Steps:**

- [ ] Navigate to Likes tab
- [ ] Verify matches load from database
- [ ] Test filter functionality (All/New/Mutual)
- [ ] Tap on a match card
- [ ] Verify like/unlike functionality
- [ ] Check empty state when no matches

**Expected**: All UI renders correctly, database queries work, navigation functions

---

### 2. **Edit Profile Screen** ✅

**Route**: `app/(main)/profile-settings/edit.tsx`  
**Screen**: `src/features/profile/screens/EditProfileScreen.tsx`

**Test Steps:**

- [ ] Navigate to Profile → Edit Profile
- [ ] Verify existing profile data loads
- [ ] Edit name, age, bio fields
- [ ] Upload a new photo
- [ ] Remove a photo
- [ ] Save changes
- [ ] Verify data persists to Supabase

**Expected**: Profile loads, edits save, photos upload correctly

---

### 3. **User Type Selection** ✅

**Route**: `app/(auth)/user-type-selection.tsx`  
**Screen**: `src/features/auth/screens/UserTypeSelectionScreen.tsx`

**Test Steps:**

- [ ] Start new signup flow
- [ ] See user type selection screen
- [ ] Select "Filipina" option
- [ ] Select "Foreign Man" option
- [ ] Verify Continue button enables/disables
- [ ] Continue to signup
- [ ] Verify userType param passed correctly

**Expected**: Selection works, navigation passes correct userType

---

### 4. **Profile Settings Screens** ✅

#### Preferences Screen

**Route**: `app/(main)/profile-settings/preferences.tsx`  
**Screen**: `src/features/profile/screens/PreferencesScreen.tsx`

**Test Steps:**

- [ ] Navigate to Profile → Preferences
- [ ] Verify preferences load from database
- [ ] Change age range (min/max)
- [ ] Change max distance
- [ ] Update "Looking For" text
- [ ] Save changes
- [ ] Verify data persists to Supabase

**Expected**: Preferences load and save correctly

---

#### Privacy Screen

**Route**: `app/(main)/profile-settings/privacy.tsx`  
**Screen**: `src/features/profile/screens/PrivacyScreen.tsx`

**Test Steps:**

- [ ] Navigate to Profile → Privacy
- [ ] Toggle "Show Online Status"
- [ ] Toggle "Show Distance"
- [ ] Toggle "Read Receipts"
- [ ] Toggle "Profile Visible"
- [ ] Verify switches respond correctly

**Expected**: All switches work, settings apply

---

#### Notifications Screen

**Route**: `app/(main)/profile-settings/notifications.tsx`  
**Screen**: `src/features/profile/screens/NotificationsScreen.tsx`

**Test Steps:**

- [ ] Navigate to Profile → Notifications
- [ ] Toggle "Enable Push Notifications"
- [ ] Toggle "New Matches"
- [ ] Toggle "New Messages"
- [ ] Toggle "New Likes"
- [ ] Toggle "Email Updates"
- [ ] Verify switches respond correctly

**Expected**: All notification toggles work

---

#### About Screen

**Route**: `app/(main)/profile-settings/about.tsx`  
**Screen**: `src/features/profile/screens/AboutScreen.tsx`

**Test Steps:**

- [ ] Navigate to Profile → About
- [ ] Verify app name and version display
- [ ] Read app description
- [ ] View feature cards (Safe & Secure, Verified Profiles, Meaningful Connections)
- [ ] Tap "Visit Our Website" button
- [ ] Verify external link opens

**Expected**: Static content displays, website link works

---

#### Help Screen

**Route**: `app/(main)/profile-settings/help.tsx`  
**Screen**: `src/features/profile/screens/HelpScreen.tsx`

**Test Steps:**

- [ ] Navigate to Profile → Help & Support
- [ ] Tap "FAQ" option
- [ ] Tap "User Guide" option
- [ ] Tap "Terms of Service" (should navigate to terms screen)
- [ ] Tap "Privacy Policy" (should navigate to privacy screen)
- [ ] Tap "Contact Support" (should open email app)
- [ ] Tap "Live Chat" option
- [ ] Verify contact email displays correctly

**Expected**: All navigation and links work correctly

---

### 5. **Account API** ✅

**Entry Point**: `src/features/account/api/accountApi.ts`  
**Modules**: basicInfoApi, photosApi, locationApi, verificationApi, preferencesApi

**Test Steps:**

- [ ] Import accountApi in a component
- [ ] Call `accountApi.saveBasicInfo()`
- [ ] Call `accountApi.addPhoto()`
- [ ] Call `accountApi.removePhoto()`
- [ ] Call `accountApi.saveLocation()`
- [ ] Call `accountApi.updatePreferences()`
- [ ] Verify backward compatibility (existing code still works)

**Expected**: All API functions work, no breaking changes

---

### 6. **Main Layout** ✅

**Route**: `app/(main)/_layout.tsx`  
**Component**: `src/components/ui/TabIconContainer.tsx`

**Test Steps:**

- [ ] Navigate between all tabs (Discover, Likes, Messages, Profile)
- [ ] Verify tab icons display correctly
- [ ] Verify focused tab has correct styling
- [ ] Verify tab bar shows on main screens
- [ ] Verify tab bar hides on chat/call screens
- [ ] Verify tab bar hides on profile settings screens

**Expected**: Tab navigation works, styling correct, tab bar shows/hides appropriately

---

## 🔍 Integration Tests

### Navigation Flow

- [ ] Discover → Likes → Messages → Profile
- [ ] Profile → Edit Profile → Back
- [ ] Profile → Preferences → Save → Back
- [ ] Messages → Chat → Back (tab bar should hide)
- [ ] Auth → User Type Selection → Signup

### Database Operations

- [ ] Create profile
- [ ] Update profile
- [ ] Upload photos
- [ ] Delete photos
- [ ] Save preferences
- [ ] Load matches
- [ ] Like/unlike users

### State Management

- [ ] Zustand stores work correctly
- [ ] Auth state persists
- [ ] Profile data syncs
- [ ] Navigation state maintained

---

## 🐛 Edge Cases

### Error Handling

- [ ] Network error during profile load
- [ ] Invalid data in forms
- [ ] Photo upload failure
- [ ] Database query errors
- [ ] Authentication errors

### UI States

- [ ] Loading states display
- [ ] Empty states display
- [ ] Error states display
- [ ] Success messages show
- [ ] Form validation works

### Performance

- [ ] Screens load quickly
- [ ] No unnecessary re-renders
- [ ] Images load efficiently
- [ ] Scrolling is smooth

---

## 📊 TypeScript Compilation

**Status**: ✅ 0 Errors

```bash
# Run TypeScript check
npx tsc --noEmit
```

**Expected**: No compilation errors

---

## 🚀 Running the App

### Start Development Server

```bash
npx expo start
```

### Test on Devices

- [ ] iOS Simulator
- [ ] Android Emulator
- [ ] Physical iOS device
- [ ] Physical Android device

---

## ✅ Success Criteria

**All Tests Pass When:**

- ✅ No TypeScript errors
- ✅ All screens render correctly
- ✅ Navigation works smoothly
- ✅ Database queries execute successfully
- ✅ Forms save data correctly
- ✅ Photos upload/delete properly
- ✅ Tab bar shows/hides appropriately
- ✅ No runtime errors in console
- ✅ App performance is good
- ✅ User experience is smooth

---

## 🎉 Final Verification

Once all tests pass:

- [ ] Create a test account
- [ ] Complete full onboarding flow
- [ ] Use all features at least once
- [ ] Verify data persists across sessions
- [ ] Test logout and login
- [ ] Verify profile edits save
- [ ] Test match interactions
- [ ] Send messages
- [ ] Check notifications

---

## 📝 Notes

**If Issues Found:**

1. Check browser/app console for errors
2. Verify Supabase connection
3. Check file paths and imports
4. Verify TypeScript types
5. Review component props
6. Test on different devices

**Reporting Issues:**

- Note the screen/feature
- Describe expected vs actual behavior
- Include console errors
- Mention device/platform
- Steps to reproduce

---

_Generated: December 2024_  
_Status: Ready for Testing_
