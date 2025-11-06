import { collection, addDoc, doc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

export interface Comment {
  id?: string;
  bookId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  likes?: number;
  createdAt?: any;
  updatedAt?: any;
}

// Add a comment
export const addComment = async (commentData: Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'likes'>) => {
  try {
    const commentsRef = collection(db, 'comments');
    const docRef = await addDoc(commentsRef, {
      ...commentData,
      likes: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return { commentId: docRef.id, error: null };
  } catch (error: any) {
    return { commentId: null, error: error.message };
  }
};

// Get comments for a book
export const getBookComments = async (bookId: string) => {
  try {
    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, where('bookId', '==', bookId));
    const querySnapshot = await getDocs(q);
    
    const comments: Comment[] = [];
    querySnapshot.forEach((doc) => {
      comments.push({ id: doc.id, ...doc.data() } as Comment);
    });
    
    // Sort by createdAt on the client side
    comments.sort((a, b) => {
      const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return bTime - aTime; // Descending order (newest first)
    });
    
    return { comments, error: null };
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return { comments: [], error: error.message };
  }
};

// Update a comment
export const updateComment = async (commentId: string, content: string) => {
  try {
    const commentRef = doc(db, 'comments', commentId);
    await updateDoc(commentRef, {
      content,
      updatedAt: serverTimestamp(),
    });
    
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Delete a comment
export const deleteComment = async (commentId: string) => {
  try {
    const commentRef = doc(db, 'comments', commentId);
    await deleteDoc(commentRef);
    
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Toggle comment like
export const toggleCommentLike = async (commentId: string, userId: string) => {
  try {
    const commentRef = doc(db, 'comments', commentId);
    const likesRef = collection(db, 'commentLikes');
    
    // Check if user already liked this comment
    const likeQuery = query(likesRef, where('commentId', '==', commentId), where('userId', '==', userId));
    const likeSnap = await getDocs(likeQuery);
    
    if (likeSnap.empty) {
      // Add like
      await addDoc(likesRef, {
        commentId,
        userId,
        createdAt: serverTimestamp(),
      });
      
      // Increment like count
      const commentSnap = await getDoc(commentRef);
      if (commentSnap.exists()) {
        const currentLikes = commentSnap.data().likes || 0;
        await updateDoc(commentRef, {
          likes: currentLikes + 1,
        });
      }
      
      return { liked: true, error: null };
    } else {
      // Remove like
      const likeDoc = likeSnap.docs[0];
      await deleteDoc(doc(db, 'commentLikes', likeDoc.id));
      
      // Decrement like count
      const commentSnap = await getDoc(commentRef);
      if (commentSnap.exists()) {
        const currentLikes = commentSnap.data().likes || 0;
        await updateDoc(commentRef, {
          likes: Math.max(0, currentLikes - 1),
        });
      }
      
      return { liked: false, error: null };
    }
  } catch (error: any) {
    return { liked: false, error: error.message };
  }
};

// Check if user liked a comment
export const checkUserLikedComment = async (commentId: string, userId: string) => {
  try {
    const likesRef = collection(db, 'commentLikes');
    const likeQuery = query(likesRef, where('commentId', '==', commentId), where('userId', '==', userId));
    const likeSnap = await getDocs(likeQuery);
    
    return { liked: !likeSnap.empty, error: null };
  } catch (error: any) {
    return { liked: false, error: error.message };
  }
};
