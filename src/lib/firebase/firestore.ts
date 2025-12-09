import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './config';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  nickname?: string;
  bio?: string;
  photoURL?: string;
  country?: string;
  city?: string;
  address?: string;
  createdAt?: any;
  updatedAt?: any;
}

// Create or update user profile
export const createUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, 'users', uid);
    // Normalize nickname to lowercase for consistency
    const normalizedData = {
      ...data,
      nickname: data.nickname?.toLowerCase().trim(),
    };
    await setDoc(userRef, {
      ...normalizedData,
      uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Get user profile
export const getUserProfile = async (uid: string) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { profile: userSnap.data() as UserProfile, error: null };
    } else {
      return { profile: null, error: 'User profile not found' };
    }
  } catch (error: any) {
    return { profile: null, error: error.message };
  }
};

// Update user profile
export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Check if nickname is available
export const isNicknameAvailable = async (nickname: string, currentUserId?: string) => {
  try {
    const normalizedNickname = nickname.toLowerCase().trim();
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('nickname', '==', normalizedNickname));
    const querySnapshot = await getDocs(q);
    
    // If no users found, nickname is available
    if (querySnapshot.empty) {
      return { available: true, error: null };
    }
    
    // If only one user found and it's the current user, nickname is available
    if (querySnapshot.size === 1 && currentUserId) {
      const doc = querySnapshot.docs[0];
      if (doc.id === currentUserId) {
        return { available: true, error: null };
      }
    }
    
    return { available: false, error: null };
  } catch (error: any) {
    return { available: false, error: error.message };
  }
};

// Generate nickname suggestions
export const generateNicknameSuggestions = async (baseNickname: string): Promise<string[]> => {
  const suggestions: string[] = [];
  const base = baseNickname.toLowerCase().trim().replace(/\s+/g, '');
  
  // Generate variations
  const variations = [
    `${base}${Math.floor(Math.random() * 1000)}`,
    `${base}_${Math.floor(Math.random() * 100)}`,
    `${base}${new Date().getFullYear()}`,
    `the_${base}`,
    `${base}_official`,
  ];
  
  // Check availability of each variation
  for (const variation of variations) {
    const { available } = await isNicknameAvailable(variation);
    if (available) {
      suggestions.push(variation);
    }
    
    // Return first 3 available suggestions
    if (suggestions.length >= 3) {
      break;
    }
  }
  
  return suggestions;
};
