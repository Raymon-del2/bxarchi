import { NextResponse } from 'next/server';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function GET() {
  try {
    const booksRef = collection(db, 'books');
    const q = query(booksRef, orderBy('createdAt', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    
    const books = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        genre: data.genre,
        authorName: data.authorName,
        published: data.published,
        views: data.views || 0,
        likes: data.likes || 0,
        content: data.content?.substring(0, 500) + '...' // First 500 chars for plot summary
      };
    });
    
    return NextResponse.json({ books });
  } catch (error: any) {
    console.error('Error fetching books:', error);
    return NextResponse.json({ books: [], error: error.message }, { status: 500 });
  }
}
