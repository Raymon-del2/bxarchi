'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import Loader from '@/components/ui/Loader';
import { generateBookPlaceholder } from '@/lib/utils/placeholderGenerator';

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
  createdAt: any;
  views?: number;
}

export default function MyBooksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [deletingBookId, setDeletingBookId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchMyBooks = async () => {
      if (!user) return;

      try {
        const booksRef = collection(db, 'books');
        const q = query(
          booksRef,
          where('authorId', '==', user.uid)
        );

        const snapshot = await getDocs(q);
        const booksData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Book[];

        // Sort by createdAt in JavaScript
        booksData.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });

        setBooks(booksData);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMyBooks();
    }
  }, [user]);

  const handleDeleteBook = async (bookId: string) => {
    if (!user) return;
    
    setDeletingBookId(bookId);
    try {
      // Delete the book document
      const bookRef = doc(db, 'books', bookId);
      await deleteDoc(bookRef);
      
      // Remove from local state
      setBooks(books.filter(b => b.id !== bookId));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Failed to delete book. Please try again.');
    } finally {
      setDeletingBookId(null);
    }
  };

  const filteredBooks = books.filter(book => {
    if (filter === 'published') return book.published;
    if (filter === 'draft') return !book.published;
    return true;
  });

  const publishedCount = books.filter(b => b.published).length;
  const draftCount = books.filter(b => !b.published).length;

  if (authLoading || loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Books</h1>
          <p className="text-gray-600">Manage your written books and drafts</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-3xl font-bold text-indigo-600 mb-1">{books.length}</div>
            <div className="text-gray-600">Total Books</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-3xl font-bold text-green-600 mb-1">{publishedCount}</div>
            <div className="text-gray-600">Published</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-3xl font-bold text-yellow-600 mb-1">{draftCount}</div>
            <div className="text-gray-600">Drafts</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All ({books.length})
            </button>
            <button
              onClick={() => setFilter('published')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'published'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Published ({publishedCount})
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'draft'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Drafts ({draftCount})
            </button>
          </div>
        </div>

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No books yet' : `No ${filter} books`}
            </h3>
            <p className="text-gray-600 mb-6">
              Start writing your first book and share it with the world!
            </p>
            <Link
              href="/write"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Write a Book
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <div key={book.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-64">
                  {(() => {
                    const coverSrc = book.coverImage || generateBookPlaceholder(book.title, book.authorName);
                    return (
                  <Image
                    src={coverSrc}
                    alt={book.title}
                    fill
                    className="object-cover"
                  />
                    );
                  })()}
                  {!book.published && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      DRAFT
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                    {book.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {book.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="capitalize">{book.genre}</span>
                    {book.views !== undefined && (
                      <span>{book.views} views</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Link
                        href={`/write?edit=${book.id}`}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white text-center rounded-md hover:bg-indigo-700 text-sm font-medium"
                      >
                        Edit
                      </Link>
                      {book.published && (
                        <Link
                          href={`/books/${book.id}`}
                          className="flex-1 px-4 py-2 border border-indigo-600 text-indigo-600 text-center rounded-md hover:bg-indigo-50 text-sm font-medium"
                        >
                          View
                        </Link>
                      )}
                    </div>
                    
                    {/* Delete Button */}
                    {showDeleteConfirm === book.id ? (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-sm text-red-800 mb-2 font-medium">
                          Delete this book permanently?
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            disabled={deletingBookId === book.id}
                            className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 disabled:opacity-50"
                          >
                            {deletingBookId === book.id ? 'Deleting...' : 'Yes, Delete'}
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-xs font-medium hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowDeleteConfirm(book.id)}
                        className="w-full px-4 py-2 border border-red-600 text-red-600 text-center rounded-md hover:bg-red-50 text-sm font-medium"
                      >
                        Delete Book
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
