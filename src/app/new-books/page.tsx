'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
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
  createdAt: any;
  views?: number;
}

export default function NewBooksPage() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    const fetchNewBooks = async () => {
      try {
        const booksRef = collection(db, 'books');
        
        // Calculate date threshold
        const now = new Date();
        let daysAgo = 7; // default to week
        if (timeFilter === 'day') daysAgo = 1;
        if (timeFilter === 'month') daysAgo = 30;
        
        const threshold = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        
        const q = query(
          booksRef,
          where('published', '==', true),
          where('createdAt', '>=', Timestamp.fromDate(threshold))
        );

        const snapshot = await getDocs(q);
        const booksData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Book[];

        // Sort by createdAt descending
        booksData.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });

        setBooks(booksData);
      } catch (error) {
        console.error('Error fetching new books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewBooks();
  }, [timeFilter]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">New Books</h1>
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {books.length} NEW
            </span>
          </div>
          <p className="text-gray-600">Recently published books on BXARCHI</p>
        </div>

        {/* Time Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setTimeFilter('day')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                timeFilter === 'day'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Last 24 Hours
            </button>
            <button
              onClick={() => setTimeFilter('week')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                timeFilter === 'week'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Last Week
            </button>
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                timeFilter === 'month'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Last Month
            </button>
          </div>
        </div>

        {/* Books Grid */}
        {books.length === 0 ? (
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
              No new books in this period
            </h3>
            <p className="text-gray-600 mb-6">
              Check back later or try a different time range!
            </p>
            <Link
              href="/browse"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Browse All Books
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow relative"
              >
                {/* NEW Badge */}
                <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10 shadow-lg">
                  NEW
                </div>
                
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
                  <div className="mt-3 text-xs text-gray-500">
                    Published {getTimeAgo(book.createdAt)}
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

function getTimeAgo(timestamp: any): string {
  if (!timestamp?.seconds) return 'recently';
  
  const now = Date.now();
  const then = timestamp.seconds * 1000;
  const diff = now - then;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
