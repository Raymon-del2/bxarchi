import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { detectUserLocation } from './locationUtils';

// Function to update existing users with location data
export async function updateExistingUsersWithLocation() {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const userDoc of snapshot.docs) {
      const userData = userDoc.data();
      
      // Skip if user already has location data
      if (userData.country || userData.city) {
        continue;
      }
      
      try {
        // Try to detect location based on user's last activity or IP
        // For existing users, we'll use IP-based detection as fallback
        const location = await detectUserLocation();
        
        if (location) {
          const userRef = doc(db, 'users', userDoc.id);
          await updateDoc(userRef, {
            country: location.country || '',
            city: location.city || '',
            address: location.address || '',
            updatedAt: new Date()
          });
          
          updatedCount++;
          console.log(`Updated location for user: ${userData.displayName || userData.email}`);
        }
      } catch (error) {
        console.error(`Failed to update location for user ${userDoc.id}:`, error);
        errorCount++;
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`Location update complete: ${updatedCount} updated, ${errorCount} errors`);
    return { updatedCount, errorCount };
  } catch (error) {
    console.error('Error updating user locations:', error);
    throw error;
  }
}

// Function to update a single user's location
export async function updateUserLocation(userId: string) {
  try {
    const location = await detectUserLocation();
    
    if (location) {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        country: location.country || '',
        city: location.city || '',
        address: location.address || '',
        updatedAt: new Date()
      });
      
      return location;
    }
    
    return null;
  } catch (error) {
    console.error('Error updating user location:', error);
    throw error;
  }
}
