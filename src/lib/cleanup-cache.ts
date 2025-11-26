import { collection, getDocs, deleteDoc, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from './firebase/config';

// Enhanced cleanup function to remove incorrectly cached BXARCHI books
export async function cleanupIncorrectCache() {
  try {
    console.log('🧹 Starting thorough cleanup of incorrectly cached BXARCHI books...');
    
    const cachedBooksRef = collection(db, 'cachedGutendexBooks');
    const cachedBooksSnap = await getDocs(cachedBooksRef);
    
    const booksToDelete = [];
    const suspiciousBooks = [];
    
    for (const cachedDoc of cachedBooksSnap.docs) {
      const data = cachedDoc.data();
      const bookId = data.id;
      
      console.log(`📖 Checking cached book: ${bookId}`);
      
      // Primary check: If the book ID doesn't start with 'gutendex-', it's incorrectly cached
      if (!bookId.startsWith('gutendex-')) {
        console.log(`❌ Found incorrectly cached book (invalid ID format): ${bookId}`);
        
        // Check if it's actually a BXARCHI book
        const realBookRef = doc(db, 'books', bookId);
        const realBookSnap = await getDoc(realBookRef);
        
        if (realBookSnap.exists()) {
          console.log(`✅ Confirmed ${bookId} is a BXARCHI book, deleting cache entry...`);
          booksToDelete.push(cachedDoc.ref);
        } else {
          console.log(`⚠️  Book ${bookId} not found in main collection, but still invalid format - deleting...`);
          booksToDelete.push(cachedDoc.ref);
        }
      } else {
        // Secondary check: Even if it starts with 'gutendex-', verify it's actually a Gutendex book
        const gutendexId = bookId.replace('gutendex-', '');
        
        // Check if this looks like a real Gutendex ID (should be numeric)
        if (!/^\d+$/.test(gutendexId)) {
          console.log(`❌ Suspicious Gutendex ID format: ${bookId} (ID: ${gutendexId})`);
          suspiciousBooks.push({ doc: cachedDoc.ref, id: bookId, gutendexId });
        }
        
        // Additional check: Look for BXARCHI-specific fields in cached data
        if (data.authorName && !data.author) {
          console.log(`❌ Found BXARCHI field structure in cached book: ${bookId}`);
          booksToDelete.push(cachedDoc.ref);
        }
        
        if (data.coverImage && !data.coverUrl) {
          console.log(`❌ Found BXARCHI field structure in cached book: ${bookId}`);
          booksToDelete.push(cachedDoc.ref);
        }
        
        // Even more aggressive checks - any presence of BXARCHI fields
        if (data.authorName) {
          console.log(`❌ Found authorName field (BXARCHI) in cached book: ${bookId}`);
          booksToDelete.push(cachedDoc.ref);
        }
        
        if (data.coverImage) {
          console.log(`❌ Found coverImage field (BXARCHI) in cached book: ${bookId}`);
          booksToDelete.push(cachedDoc.ref);
        }
        
        // Check for missing required Gutendex fields
        if (!data.author || !data.coverUrl) {
          console.log(`❌ Missing required Gutendex fields in cached book: ${bookId}`);
          booksToDelete.push(cachedDoc.ref);
        }
      }
    }
    
    // Handle suspicious books
    for (const { doc: bookRef, id: bookId, gutendexId } of suspiciousBooks) {
      console.log(`🔍 Investigating suspicious book: ${bookId}`);
      
      // Try to verify if this is actually a Gutendex book by checking external sources
      // For now, we'll be conservative and only delete if there are other red flags
      const bookData = (await getDoc(bookRef)).data();
      
      if (bookData?.authorName || bookData?.coverImage) {
        console.log(`❌ Deleting suspicious book with BXARCHI fields: ${bookId}`);
        booksToDelete.push(bookRef);
      } else {
        console.log(`⚠️  Keeping suspicious book (no clear BXARCHI markers): ${bookId}`);
      }
    }
    
    // Delete all incorrectly cached books
    console.log(`🗑️  Preparing to delete ${booksToDelete.length} incorrectly cached books...`);
    
    for (const bookRef of booksToDelete) {
      try {
        await deleteDoc(bookRef);
        console.log(`✅ Deleted: ${bookRef.id}`);
      } catch (error) {
        console.error(`❌ Failed to delete ${bookRef.id}:`, error);
      }
    }
    
    console.log(`🎉 Cleanup complete! Removed ${booksToDelete.length} incorrectly cached books`);
    console.log(`📊 Summary: ${cachedBooksSnap.docs.length - booksToDelete.length} cached books remain`);
    
    return booksToDelete.length;
  } catch (error) {
    console.error('💥 Error during cache cleanup:', error);
    return 0;
  }
}

// Additional function to validate cached books integrity
export async function validateCacheIntegrity() {
  try {
    console.log('🔍 Validating cache integrity...');
    
    const cachedBooksRef = collection(db, 'cachedGutendexBooks');
    const cachedBooksSnap = await getDocs(cachedBooksRef);
    
    const validBooks = [];
    const invalidBooks = [];
    
    for (const cachedDoc of cachedBooksSnap.docs) {
      const data = cachedDoc.data();
      const bookId = data.id;
      
      // Check if it has proper Gutendex structure
      const hasGutendexStructure = 
        bookId.startsWith('gutendex-') &&
        /^\d+$/.test(bookId.replace('gutendex-', '')) &&
        data.author && !data.authorName &&
        data.coverUrl && !data.coverImage;
      
      if (hasGutendexStructure) {
        validBooks.push(bookId);
      } else {
        invalidBooks.push({
          id: bookId,
          issues: [
            !bookId.startsWith('gutendex-') ? 'Invalid ID format' : null,
            !/^\d+$/.test(bookId.replace('gutendex-', '')) ? 'Non-numeric Gutendex ID' : null,
            data.authorName ? 'Has BXARCHI author field' : null,
            data.coverImage ? 'Has BXARCHI cover field' : null
          ].filter(Boolean)
        });
      }
    }
    
    console.log(`✅ Valid cached books: ${validBooks.length}`);
    console.log(`❌ Invalid cached books: ${invalidBooks.length}`);
    
    if (invalidBooks.length > 0) {
      console.log('🔍 Invalid books details:', invalidBooks);
    }
    
    return { validBooks, invalidBooks };
  } catch (error) {
    console.error('💥 Error validating cache integrity:', error);
    return { validBooks: [], invalidBooks: [] };
  }
}
