import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  User,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, db } from './config';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Ensure a user document exists in Firestore `users/{uid}`
async function ensureUserProfile(u: User) {
  const profileRef = doc(db, 'users', u.uid);
  const snap = await getDoc(profileRef);
  if (!snap.exists()) {
    await setDoc(profileRef, {
      uid: u.uid,
      email: u.email || '',
      displayName: u.displayName || '',
      photoURL: u.photoURL || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
    
    // Update user profile with display name
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: displayName,
      });
    }
    
    await ensureUserProfile(userCredential.user);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    await ensureUserProfile(userCredential.user);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    let errorMessage = error.message;
    
    // Provide user-friendly error messages
    if (
      error.code === 'auth/invalid-credential' ||
      error.code === 'auth/invalid-login-credentials' ||
      error.code === 'auth/wrong-password'
    ) {
      errorMessage = 'Invalid email or password. Please check your credentials and try again.';
    } else if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email. Please sign up first.';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'This account has been disabled. Please contact support.';
    } else if (error.code === 'auth/account-exists-with-different-credential' || error.code === 'auth/email-already-in-use') {
      errorMessage = 'An account already exists with this email using a different sign-in method. Try using Google sign-in or reset your password.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address format.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed login attempts. Please try again later or reset your password.';
    } else if (error.code === 'auth/provider-already-linked') {
      errorMessage = 'This account has already been linked to another provider.';
    } else if (error.code === 'auth/credential-already-in-use') {
      errorMessage = 'This credential is already in use.';
    }
    
    return { user: null, error: errorMessage };
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    await ensureUserProfile(userCredential.user);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

// Sign out
export const logOut = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Reset password
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};
