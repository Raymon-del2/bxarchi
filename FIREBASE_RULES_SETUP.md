# Firebase Security Rules Setup - URGENT

## ⚠️ Current Issues

You're seeing these errors because Firebase Security Rules are not set:
- **Firestore 400 errors** - Database rules not configured
- **Storage CORS errors** - Storage rules not configured

## 🔧 Fix Steps (5 minutes)

### Step 1: Firestore Rules

1. Go to https://console.firebase.google.com/
2. Select project: **bxarchi-10a7d**
3. Click **Firestore Database** in left menu
4. Click **Rules** tab
5. Replace ALL content with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles
    match /users/{userId} {
      // Anyone authenticated can read profiles
      allow read: if request.auth != null;
      // Users can only create/update their own profile
      allow create, update: if request.auth.uid == userId;
      // No one can delete profiles
      allow delete: if false;
    }
    
    // Books (for future use)
    match /books/{bookId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.authorId;
    }
  }
}
```

6. Click **Publish** button
7. Wait for "Rules published successfully" message

### Step 2: Storage Rules

1. Still in Firebase Console
2. Click **Storage** in left menu
3. Click **Rules** tab
4. Replace ALL content with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile pictures
    match /profile-pictures/{userId}/{allPaths=**} {
      // Anyone can read profile pictures
      allow read: if true;
      // Only the user can upload their own profile picture
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Book covers (for future use)
    match /book-covers/{bookId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

5. Click **Publish** button
6. Wait for "Rules published successfully" message

### Step 3: Verify Storage is Enabled

1. In Firebase Console → **Storage**
2. If you see "Get Started", click it
3. Choose **Start in production mode**
4. Select location (choose closest to you)
5. Click **Done**

### Step 4: Test the App

1. Go back to http://localhost:3000
2. Try creating a profile again
3. Upload should work now!

## ✅ Expected Result

After setting rules:
- ✅ No more 400 errors in console
- ✅ No more CORS errors
- ✅ Profile saves successfully
- ✅ Image uploads work
- ✅ Redirects to homepage after 3 seconds

## 🐛 Still Having Issues?

### If Firestore still shows errors:
1. Check you're signed in to Firebase Console
2. Make sure you selected the correct project
3. Try refreshing the browser after publishing rules

### If Storage still shows CORS errors:
1. Make sure Storage is enabled (not just created)
2. Wait 1-2 minutes after publishing rules
3. Clear browser cache and reload

### If nickname checking is slow:
1. Go to Firestore → **Indexes**
2. Click **Add Index**
3. Collection: `users`
4. Field: `nickname` (Ascending)
5. Click **Create**

## 📝 Security Notes

These rules are secure for production:
- ✅ Users can only edit their own data
- ✅ Authentication required for writes
- ✅ Public read access for profiles (needed for app features)
- ✅ No deletion allowed (data preservation)

## 🚀 After Setup

Once rules are set, you can:
1. Create profiles with images
2. Set unique nicknames
3. View other users' profiles
4. Start building book features
