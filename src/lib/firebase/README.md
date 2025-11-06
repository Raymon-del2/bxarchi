# Firebase Authentication Usage Guide

## Available Functions

### Sign Up with Email
```typescript
import { signUpWithEmail } from '@/lib/firebase/auth';

const { user, error } = await signUpWithEmail(email, password, displayName);
```

### Sign In with Email
```typescript
import { signInWithEmail } from '@/lib/firebase/auth';

const { user, error } = await signInWithEmail(email, password);
```

### Sign In with Google
```typescript
import { signInWithGoogle } from '@/lib/firebase/auth';

const { user, error } = await signInWithGoogle();
```

### Sign Out
```typescript
import { logOut } from '@/lib/firebase/auth';

const { error } = await logOut();
```

### Reset Password
```typescript
import { resetPassword } from '@/lib/firebase/auth';

const { error } = await resetPassword(email);
```

## Using Auth Context

```typescript
'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please sign in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.displayName || user.email}!</h1>
      <p>User ID: {user.uid}</p>
    </div>
  );
}
```

## Protected Routes

Create a protected route wrapper:

```typescript
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
```

## Firebase Services

### Firestore (Database)
```typescript
import { db } from '@/lib/firebase/config';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

// Add a document
const docRef = await addDoc(collection(db, 'books'), {
  title: 'My Book',
  authorId: user.uid,
  createdAt: new Date(),
});

// Query documents
const q = query(collection(db, 'books'), where('authorId', '==', user.uid));
const querySnapshot = await getDocs(q);
```

### Storage (File Upload)
```typescript
import { storage } from '@/lib/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Upload a file
const storageRef = ref(storage, `book-covers/${bookId}/${file.name}`);
await uploadBytes(storageRef, file);
const downloadURL = await getDownloadURL(storageRef);
```
