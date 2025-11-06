# Firestore Security Rules for Chat Feature

## Add These Rules to Your Firestore Database

Go to **Firebase Console** → **Firestore Database** → **Rules** and add these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Existing users collection rules
    match /users/{userId} {
      allow read: if true;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update, delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Existing books collection rules
    match /books/{bookId} {
      allow read: if resource.data.published == true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.authorId;
    }
    
    // NEW: Messages collection rules for chat
    match /messages/{messageId} {
      // Users can read messages where they are either sender or receiver
      allow read: if request.auth != null && 
        (resource.data.senderId == request.auth.uid || 
         resource.data.receiverId == request.auth.uid);
      
      // Users can only create messages where they are the sender
      allow create: if request.auth != null && 
        request.resource.data.senderId == request.auth.uid;
      
      // Messages cannot be updated or deleted (optional - remove if you want to allow editing)
      allow update, delete: if false;
    }
  }
}
```

## Firestore Indexes Required

You also need to create a composite index for the messages query.

### Option 1: Automatic (Recommended)
1. Try to use the chat feature
2. Check the browser console for an error with a link
3. Click the link to automatically create the index

### Option 2: Manual
Go to **Firestore Database** → **Indexes** → **Composite** → **Create Index**

**Collection ID**: `messages`

**Fields to index**:
1. `senderId` - Ascending
2. `receiverId` - Ascending  
3. `timestamp` - Ascending

**Query scope**: Collection

Click **Create Index** and wait for it to build (usually takes a few minutes).

---

## How the Chat System Works

### 1. **Community Page** (`/community`)
- Shows all registered users
- Search bar to find users by name or bio
- Click on any user to start a chat

### 2. **Chat Page** (`/chat/[userId]`)
- Real-time messaging between two users
- Messages are stored in Firestore
- Auto-scrolls to latest message
- Shows timestamp for each message
- Messages are color-coded (your messages in blue, theirs in white)

### 3. **Security**
- Users can only read messages they sent or received
- Users can only send messages as themselves
- All chat requires authentication

---

## Testing the Chat Feature

1. **Create two accounts** (or use two browsers)
2. **Go to Community page**: `http://localhost:3002/community`
3. **Search for a user** or scroll through the list
4. **Click on a user** to open chat
5. **Send messages** back and forth
6. **Messages appear in real-time** without refreshing!

---

## Features Included

✅ User search with real-time filtering
✅ Profile pictures and bios displayed
✅ Real-time chat messaging
✅ Message timestamps
✅ Auto-scroll to latest message
✅ Visual distinction between sent/received messages
✅ Back button to return to community
✅ Loading states
✅ Empty states (no users, no messages)
✅ Responsive design
✅ Secure (authentication required)

---

**Your community chat system is ready!** 🎉
