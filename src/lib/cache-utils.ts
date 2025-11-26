import { collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase/config';

// Manual cache cleanup utilities
export async function forceCleanAllCache() {
  try {
    console.log('🧹 Force cleaning entire cache...');
    
    const cachedBooksRef = collection(db, 'cachedGutendexBooks');
    const cachedBooksSnap = await getDocs(cachedBooksRef);
    
    let deletedCount = 0;
    
    for (const cachedDoc of cachedBooksSnap.docs) {
      await deleteDoc(cachedDoc.ref);
      deletedCount++;
    }
    
    console.log(`✅ Force cleaned ${deletedCount} cached books`);
    return deletedCount;
  } catch (error) {
    console.error('💥 Error force cleaning cache:', error);
    return 0;
  }
}

// Rebuild cache with only valid Gutendex books
export async function rebuildCacheFromScratch(gutendexBooks: any[]) {
  try {
    console.log('🔨 Rebuilding cache from scratch...');
    
    // First, clear existing cache
    await forceCleanAllCache();
    
    // Add only valid Gutendex books
    const cachedBooksRef = collection(db, 'cachedGutendexBooks');
    let addedCount = 0;
    
    for (const book of gutendexBooks) {
      if (book.id && book.id.startsWith('gutendex-')) {
        const cacheRef = doc(cachedBooksRef, book.id);
        await setDoc(cacheRef, {
          id: book.id,
          title: book.title,
          author: book.author,
          coverUrl: book.coverUrl,
          description: book.description,
          genre: book.genre,
          download_count: book.downloadCount || 0,
          cachedAt: new Date().toISOString()
        });
        addedCount++;
      }
    }
    
    console.log(`✅ Rebuilt cache with ${addedCount} valid Gutendex books`);
    return addedCount;
  } catch (error) {
    console.error('💥 Error rebuilding cache:', error);
    return 0;
  }
}

// Get cache statistics
export async function getCacheStats() {
  try {
    const cachedBooksRef = collection(db, 'cachedGutendexBooks');
    const cachedBooksSnap = await getDocs(cachedBooksRef);
    
    const stats = {
      total: cachedBooksSnap.docs.length,
      validGutendex: 0,
      invalidBXARCHI: 0,
      suspicious: 0,
      details: [] as any[]
    };
    
    for (const doc of cachedBooksSnap.docs) {
      const data = doc.data();
      const bookId = data.id;
      
      const isBXARCHI = !bookId.startsWith('gutendex-') || 
                        data.authorName || 
                        data.coverImage;
      
      const isGutendex = bookId.startsWith('gutendex-') && 
                        /^\d+$/.test(bookId.replace('gutendex-', '')) &&
                        data.author && !data.authorName &&
                        data.coverUrl && !data.coverImage;
      
      if (isBXARCHI) {
        stats.invalidBXARCHI++;
      } else if (isGutendex) {
        stats.validGutendex++;
      } else {
        stats.suspicious++;
      }
      
      stats.details.push({
        id: bookId,
        title: data.title,
        type: isBXARCHI ? 'BXARCHI' : isGutendex ? 'GUTENDEX' : 'SUSPICIOUS'
      });
    }
    
    return stats;
  } catch (error) {
    console.error('💥 Error getting cache stats:', error);
    return null;
  }
}
