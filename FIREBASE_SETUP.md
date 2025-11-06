# Firebase Setup Guide for BXARCHI

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Enter project name: **BXARCHI**
4. Follow the setup wizard

## Step 2: Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click "Get started"
3. Enable the following sign-in methods:
   - **Email/Password** - Click and enable
   - **Google** - Click, enable, and configure

## Step 3: Register Your Web App

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the **Web** icon (`</>`)
4. Register app with nickname: **BXARCHI Web**
5. Copy the Firebase configuration object

## Step 4: Configure Environment Variables

1. Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Firebase config values:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key-here"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
   ```

## Step 5: Configure Google Sign-In (Optional)

1. In Firebase Console > Authentication > Sign-in method > Google
2. Add your authorized domains:
   - `localhost` (for development)
   - Your production domain (when deployed)

## Step 6: Set Up Firestore Database (for storing books)

1. In Firebase Console, go to **Build > Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (for development)
4. Select a location closest to your users
5. Click "Enable"

## Step 7: Set Up Storage (for book covers/images)

1. In Firebase Console, go to **Build > Storage**
2. Click "Get started"
3. Start in **test mode** (for development)
4. Click "Done"

## Step 8: Restart Development Server

After setting up environment variables:

```bash
# Stop the current dev server (Ctrl+C)
npm run dev
```

## Testing Authentication

1. Navigate to `http://localhost:3000`
2. Click "Get Started" or "Sign In"
3. Try creating an account with email/password
4. Try signing in with Google

## Security Rules (Production)

Before deploying to production, update your Firestore and Storage security rules:

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    match /books/{bookId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.authorId;
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /book-covers/{bookId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Make sure all environment variables are set correctly
- Restart the development server after adding `.env.local`

### "Firebase: Error (auth/unauthorized-domain)"
- Add your domain to authorized domains in Firebase Console
- Go to Authentication > Settings > Authorized domains

### Google Sign-In not working
- Ensure Google sign-in is enabled in Firebase Console
- Check that your domain is authorized
- Make sure you're using HTTPS in production

## Next Steps

After authentication is working:
- Set up user profiles in Firestore
- Create book creation functionality
- Implement book storage with Firebase Storage
- Add real-time updates with Firestore listeners
