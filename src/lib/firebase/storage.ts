import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

// Upload profile picture
export const uploadProfilePicture = async (userId: string, file: File) => {
  try {
    // Create a unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${userId}_${timestamp}.${fileExtension}`;
    
    // Create storage reference
    const storageRef = ref(storage, `profile-pictures/${userId}/${fileName}`);
    
    // Upload file
    await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return { url: downloadURL, error: null };
  } catch (error: any) {
    return { url: null, error: error.message };
  }
};

// Delete profile picture
export const deleteProfilePicture = async (userId: string, photoURL: string) => {
  try {
    // Extract file path from URL
    const storageRef = ref(storage, photoURL);
    await deleteObject(storageRef);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Upload book cover
export const uploadBookCover = async (bookId: string, file: File) => {
  try {
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${bookId}_${timestamp}.${fileExtension}`;
    
    const storageRef = ref(storage, `book-covers/${bookId}/${fileName}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    return { url: downloadURL, error: null };
  } catch (error: any) {
    return { url: null, error: error.message };
  }
};
