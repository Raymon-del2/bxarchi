# Profile Setup Feature

## Overview
After creating a new account (via email or Google), users are redirected to a profile setup page where they can complete their profile with additional information.

## Features

### Profile Setup Page (`/setup-profile`)
- **Profile Picture Upload**
  - Supports JPG, PNG, GIF formats
  - Maximum file size: 5MB
  - Images stored in Firebase Storage at `profile-pictures/{userId}/`
  - Real-time preview before upload

- **Required Fields**
  - Nickname (max 50 characters)

- **Optional Fields**
  - Bio (max 500 characters with counter)

- **Read-only Fields**
  - Email (automatically filled from Firebase Auth)

### User Flow

1. **New User Registration**
   - User creates account via email/password or Google
   - Automatically redirected to `/setup-profile`

2. **Profile Setup**
   - Upload profile picture (optional)
   - Enter nickname (required)
   - Add bio (optional)
   - Click "Complete Profile" or "Skip for now"

3. **Data Storage**
   - Profile picture → Firebase Storage
   - User data → Firestore `users` collection
   - Firebase Auth profile updated with photoURL

### Existing User Sign-In
- Login page (`/login`) is for existing users only
- Clear messaging: "Welcome Back!" and "Sign in with your existing account"
- Google sign-in on login page is for existing Google users
- New users directed to registration page

## Data Structure

### Firestore User Profile
```typescript
{
  uid: string;
  email: string;
  displayName: string;
  nickname?: string;
  bio?: string;
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Firebase Storage Structure
```
profile-pictures/
  └── {userId}/
      └── {userId}_{timestamp}.{ext}

book-covers/
  └── {bookId}/
      └── {bookId}_{timestamp}.{ext}
```

## Files Created/Modified

### New Files
- `src/app/setup-profile/page.tsx` - Profile setup page
- `src/lib/firebase/firestore.ts` - Firestore helper functions
- `src/lib/firebase/storage.ts` - Storage helper functions

### Modified Files
- `src/app/register/page.tsx` - Redirects to profile setup
- `src/app/login/page.tsx` - Updated messaging for existing users
- `src/components/layout/Navbar.tsx` - Shows profile picture and nickname
- `next.config.js` - Added Firebase Storage domains

## Security Considerations

### Firestore Rules (to be set in Firebase Console)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Anyone can read user profiles
      allow read: if request.auth != null;
      // Users can only write their own profile
      allow write: if request.auth.uid == userId;
    }
  }
}
```

### Storage Rules (to be set in Firebase Console)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile-pictures/{userId}/{allPaths=**} {
      // Anyone can read profile pictures
      allow read: if true;
      // Only the user can upload their own profile picture
      allow write: if request.auth.uid == userId;
    }
  }
}
```

## Testing Checklist

- [ ] Create new account with email/password
- [ ] Verify redirect to profile setup
- [ ] Upload profile picture
- [ ] Enter nickname and bio
- [ ] Complete profile and verify redirect to home
- [ ] Check navbar shows profile picture
- [ ] Test "Skip for now" button
- [ ] Create account with Google
- [ ] Verify Google profile picture is used
- [ ] Sign out and sign in again
- [ ] Verify profile data persists

## Future Enhancements

- Edit profile page
- Crop/resize profile pictures
- Multiple profile picture options
- Cover photos
- Social media links
- Email verification requirement
- Profile completion percentage
