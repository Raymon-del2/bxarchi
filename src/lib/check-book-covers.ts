import { getDocs, collection, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase/config';

// Debug function to check BXARCHI book covers
export async function debugBookCovers() {
  console.log('🔍 Debugging BXARCHI book covers...');
  
  try {
    const booksRef = collection(db, 'books');
    const booksSnap = await getDocs(booksRef);
    
    console.log(`📚 Found ${booksSnap.docs.length} BXARCHI books`);
    
    for (const bookDoc of booksSnap.docs) {
      const data = bookDoc.data();
      console.log(`📖 Book: ${data.title}`, {
        id: bookDoc.id,
        hasCoverImage: !!data.coverImage,
        coverImageUrl: data.coverImage,
        published: data.published
      });
    }
    
    return booksSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('💥 Error debugging book covers:', error);
    return [];
  }
}

// Check specific book by ID
export async function checkBookCover(bookId: string) {
  try {
    const bookRef = doc(db, 'books', bookId);
    const bookSnap = await getDoc(bookRef);
    
    if (bookSnap.exists()) {
      const data = bookSnap.data();
      console.log(`📖 Book "${data.title}" details:`, {
        id: bookId,
        hasCoverImage: !!data.coverImage,
        coverImageUrl: data.coverImage,
        allFields: Object.keys(data)
      });
      return data;
    } else {
      console.log(`❌ Book ${bookId} not found`);
      return null;
    }
  } catch (error) {
    console.error(`💥 Error checking book ${bookId}:`, error);
    return null;
  }
}
