'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import Loader from '@/components/ui/Loader';

export const dynamic = 'force-dynamic';

interface Book {
  id: string;
  title: string;
  description: string;
  genre: string;
  coverImage: string;
  authorName: string;
  authorId: string;
  published: boolean;
  views?: number;
}

export default function ReadingListPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [likedBooks, setLikedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchLikedBooks = async () => {
      if (!user) return;

      try {
        // Get all book likes by this user
        const likesRef = collection(db, 'bookLikes');
        const q = query(likesRef, where('userId', '==', user.uid));
        const likesSnapshot = await getDocs(q);

        // Get book IDs
        const bookIds = likesSnapshot.docs.map(doc => doc.data().bookId);

        if (bookIds.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch book details
        const booksData: Book[] = [];
        for (const bookId of bookIds) {
          const bookRef = doc(db, 'books', bookId);
          const bookSnap = await getDoc(bookRef);
          if (bookSnap.exists()) {
            booksData.push({
              id: bookSnap.id,
              ...bookSnap.data()
            } as Book);
          }
        }

        setLikedBooks(booksData);
      } catch (error) {
        console.error('Error fetching liked books:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchLikedBooks();
    }
  }, [user]);

  if (authLoading || loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reading List</h1>
          <p className="text-gray-600">Books you&apos;ve liked and want to read</p>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-4">
            <svg className="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <div>
              <div className="text-3xl font-bold text-gray-900">{likedBooks.length}</div>
              <div className="text-gray-600">Liked Books</div>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        {likedBooks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No liked books yet</h3>
            <p className="text-gray-600 mb-6">
              Start exploring and like books to add them to your reading list!
            </p>
            <Link
              href="/browse"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {likedBooks.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative h-64">
                  <Image
                    src={book.coverImage}
                    alt={book.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">by {book.authorName}</p>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {book.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="capitalize bg-gray-100 px-3 py-1 rounded-full">
                      {book.genre}
                    </span>
                    {book.views !== undefined && (
                      <span>{book.views} views</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
