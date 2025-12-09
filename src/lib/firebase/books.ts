import { collection, addDoc, doc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

export interface Book {
  id?: string;
  title: string;
  description: string;
  genre: string;
  content: string;
  themeId?: string;
  coverImage?: string;
  backCoverImage?: string;
  authorId: string;
  authorName: string;
  published: boolean;
  createdAt?: any;
  updatedAt?: any;
  views?: number;
  likes?: number;
  dislikes?: number;
}

// Create a new book
export const createBook = async (bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'likes' | 'dislikes'>) => {
  try {
    const booksRef = collection(db, 'books');
    const docRef = await addDoc(booksRef, {
      ...bookData,
      views: 0,
      likes: 0,
      dislikes: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return { bookId: docRef.id, error: null };
  } catch (error: any) {
    return { bookId: null, error: error.message };
  }
};

// Get a single book by ID
export const getBook = async (bookId: string) => {
  try {
    const bookRef = doc(db, 'books', bookId);
    const bookSnap = await getDoc(bookRef);
    
    if (bookSnap.exists()) {
      return { book: { id: bookSnap.id, ...bookSnap.data() } as Book, error: null };
    } else {
      return { book: null, error: 'Book not found' };
    }
  } catch (error: any) {
    return { book: null, error: error.message };
  }
};

// Get all books by a specific author
export const getBooksByAuthor = async (authorId: string) => {
  try {
    const booksRef = collection(db, 'books');
    const q = query(booksRef, where('authorId', '==', authorId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const books: Book[] = [];
    querySnapshot.forEach((doc) => {
      books.push({ id: doc.id, ...doc.data() } as Book);
    });
    
    return { books, error: null };
  } catch (error: any) {
    return { books: [], error: error.message };
  }
};

// Get all published books
export const getPublishedBooks = async () => {
  try {
    const booksRef = collection(db, 'books');
    const q = query(booksRef, where('published', '==', true), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const books: Book[] = [];
    querySnapshot.forEach((doc) => {
      books.push({ id: doc.id, ...doc.data() } as Book);
    });
    
    return { books, error: null };
  } catch (error: any) {
    return { books: [], error: error.message };
  }
};

// Update a book
export const updateBook = async (bookId: string, bookData: Partial<Book>) => {
  try {
    const bookRef = doc(db, 'books', bookId);
    await updateDoc(bookRef, {
      ...bookData,
      updatedAt: serverTimestamp(),
    });
    
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Delete a book
export const deleteBook = async (bookId: string) => {
  try {
    const bookRef = doc(db, 'books', bookId);
    await deleteDoc(bookRef);
    
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Increment book views
export const incrementBookViews = async (bookId: string) => {
  try {
    const bookRef = doc(db, 'books', bookId);
    const bookSnap = await getDoc(bookRef);
    
    if (bookSnap.exists()) {
      const currentViews = bookSnap.data().views || 0;
      await updateDoc(bookRef, {
        views: currentViews + 1,
      });
    }
    
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Toggle book like
export const toggleBookLike = async (bookId: string, userId: string) => {
  try {
    const bookRef = doc(db, 'books', bookId);
    const likesRef = collection(db, 'bookLikes');
    
    // Check if user already liked this book
    const likeQuery = query(likesRef, where('bookId', '==', bookId), where('userId', '==', userId));
    const likeSnap = await getDocs(likeQuery);
    
    if (likeSnap.empty) {
      // Add like
      await addDoc(likesRef, {
        bookId,
        userId,
        createdAt: serverTimestamp(),
      });
      
      // Increment like count
      const bookSnap = await getDoc(bookRef);
      if (bookSnap.exists()) {
        const currentLikes = bookSnap.data().likes || 0;
        await updateDoc(bookRef, {
          likes: currentLikes + 1,
        });
      }
      
      return { liked: true, error: null };
    } else {
      // Remove like
      const likeDoc = likeSnap.docs[0];
      await deleteDoc(doc(db, 'bookLikes', likeDoc.id));
      
      // Decrement like count
      const bookSnap = await getDoc(bookRef);
      if (bookSnap.exists()) {
        const currentLikes = bookSnap.data().likes || 0;
        await updateDoc(bookRef, {
          likes: Math.max(0, currentLikes - 1),
        });
      }
      
      return { liked: false, error: null };
    }
  } catch (error: any) {
    return { liked: false, error: error.message };
  }
};

// Check if user liked a book
export const checkUserLiked = async (bookId: string, userId: string) => {
  try {
    const likesRef = collection(db, 'bookLikes');
    const likeQuery = query(likesRef, where('bookId', '==', bookId), where('userId', '==', userId));
    const likeSnap = await getDocs(likeQuery);
    
    return { liked: !likeSnap.empty, error: null };
  } catch (error: any) {
    return { liked: false, error: error.message };
  }
};

// Thumb system functions
export const toggleBookThumb = async (bookId: string, userId: string, thumbType: 'like' | 'dislike') => {
  try {
    const bookRef = doc(db, 'books', bookId);
    const thumbsRef = collection(db, 'bookThumbs');
    
    // Check if user already thumbed this book
    const thumbQuery = query(thumbsRef, where('bookId', '==', bookId), where('userId', '==', userId));
    const thumbSnap = await getDocs(thumbQuery);
    
    if (thumbSnap.empty) {
      // Add new thumb
      await addDoc(thumbsRef, {
        bookId,
        userId,
        thumbType,
        createdAt: serverTimestamp(),
      });
      
      // Update counts in both books and cachedGutendexBooks collections
      await updateThumbCounts(bookId, thumbType, 1);
      
      return { liked: thumbType === 'like', disliked: thumbType === 'dislike', error: null };
    } else {
      const existingThumb = thumbSnap.docs[0].data();
      const existingType = existingThumb.thumbType;
      
      if (existingType === thumbType) {
        // Remove thumb (user is un-liking/un-disliking)
        await deleteDoc(thumbSnap.docs[0].ref);
        await updateThumbCounts(bookId, thumbType, -1);
        
        return { liked: false, disliked: false, error: null };
      } else {
        // Change thumb type (from like to dislike or vice versa)
        await updateDoc(thumbSnap.docs[0].ref, { thumbType });
        await updateThumbCounts(bookId, existingType as 'like' | 'dislike', -1);
        await updateThumbCounts(bookId, thumbType, 1);
        
        return { 
          liked: thumbType === 'like', 
          disliked: thumbType === 'dislike', 
          error: null 
        };
      }
    }
  } catch (error: any) {
    return { liked: false, disliked: false, error: error.message };
  }
};

// Update thumb counts in both collections
const updateThumbCounts = async (bookId: string, thumbType: 'like' | 'dislike', delta: number) => {
  // Update books collection
  const bookRef = doc(db, 'books', bookId);
  const bookSnap = await getDoc(bookRef);
  if (bookSnap.exists()) {
    const currentCount = bookSnap.data()[thumbType === 'like' ? 'likes' : 'dislikes'] || 0;
    await updateDoc(bookRef, {
      [thumbType === 'like' ? 'likes' : 'dislikes']: Math.max(0, currentCount + delta),
    });
  }
  
  // Update cachedGutendexBooks collection
  const cachedBookRef = doc(db, 'cachedGutendexBooks', bookId);
  const cachedBookSnap = await getDoc(cachedBookRef);
  if (cachedBookSnap.exists()) {
    const currentCount = cachedBookSnap.data()[thumbType === 'like' ? 'likes' : 'dislikes'] || 0;
    await updateDoc(cachedBookRef, {
      [thumbType === 'like' ? 'likes' : 'dislikes']: Math.max(0, currentCount + delta),
    });
  }
};

// Check user thumb status
export const checkUserThumb = async (bookId: string, userId: string) => {
  try {
    const thumbsRef = collection(db, 'bookThumbs');
    const thumbQuery = query(thumbsRef, where('bookId', '==', bookId), where('userId', '==', userId));
    const thumbSnap = await getDocs(thumbQuery);
    
    if (thumbSnap.empty) {
      return { liked: false, disliked: false, error: null };
    }
    
    const thumbData = thumbSnap.docs[0].data();
    return { 
      liked: thumbData.thumbType === 'like', 
      disliked: thumbData.thumbType === 'dislike', 
      error: null 
    };
  } catch (error: any) {
    return { liked: false, disliked: false, error: error.message };
  }
};

// Get thumb counts
export const getThumbCounts = async (bookId: string) => {
  try {
    const thumbsRef = collection(db, 'bookThumbs');
    const likeQuery = query(thumbsRef, where('bookId', '==', bookId), where('thumbType', '==', 'like'));
    const dislikeQuery = query(thumbsRef, where('bookId', '==', bookId), where('thumbType', '==', 'dislike'));
    
    const [likeSnap, dislikeSnap] = await Promise.all([
      getDocs(likeQuery),
      getDocs(dislikeQuery)
    ]);
    
    return {
      likeCount: likeSnap.size,
      dislikeCount: dislikeSnap.size,
      error: null
    };
  } catch (error: any) {
    return { likeCount: 0, dislikeCount: 0, error: error.message };
  }
};
