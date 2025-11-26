'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import Loader from '@/components/ui/Loader';
import CommentSection from '@/components/comments/CommentSection';
import { getGutendexBookById, getBookCoverUrl, extractGenreFromSubjects, type GutendexBook } from '@/lib/api/gutendex';
import { toggleBookThumb, checkUserThumb, getThumbCounts } from '@/lib/firebase/books';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export const dynamic = 'force-dynamic';

export default function GutendexBookPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const gutendexId = params.id as string;
  const bookId = `gutendex-${gutendexId}`;
  
  const [book, setBook] = useState<GutendexBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [thumbLoading, setThumbLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        // First check if this might be a BXARCHI book
        const bxarchiBookRef = doc(db, 'books', gutendexId);
        const bxarchiBookSnap = await getDoc(bxarchiBookRef);
        
        if (bxarchiBookSnap.exists()) {
          // This is actually a BXARCHI book! Redirect to the correct page
          router.push(`/books/${gutendexId}`);
          return;
        }
        
        const bookData = await getGutendexBookById(parseInt(gutendexId));
        if (!bookData) {
          setError('Book not found');
          return;
        }
        setBook(bookData);
        // Don't set likeCount from download_count, it starts at 0

        // Check if user liked this book and get counts
        if (user) {
          const { liked: userLiked } = await checkUserThumb(bookId, user.uid);
          const { likeCount: userLikeCount } = await getThumbCounts(bookId);
          setLiked(userLiked);
          setLikeCount(userLikeCount);
        } else {
          // Get counts even if user is not logged in
          const { likeCount: userLikeCount } = await getThumbCounts(bookId);
          setLikeCount(userLikeCount);
        }
      } catch (err) {
        setError('Failed to load book');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId, gutendexId, user, router, refreshKey]);

  // Refresh like status when page becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && bookId) {
        setRefreshKey(prev => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, bookId]);

  const handleThumb = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (thumbLoading) return;
    
    setThumbLoading(true);
    const result = await toggleBookThumb(bookId, user.uid, 'like');
    
    if (!result.error) {
      setLiked(result.liked);
      
      // Update like count
      if (result.liked) {
        setLikeCount(prev => prev + 1);
      } else {
        setLikeCount(prev => prev - 1);
      }
    }
    
    setThumbLoading(false);
  };

  if (loading) {
    return <Loader />;
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Book Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/browse"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Back to Browse
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const coverUrl = getBookCoverUrl(book);
  const author = book.authors.map(a => a.name).join(', ') || 'Unknown Author';
  const genre = extractGenreFromSubjects(book.subjects);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="md:flex">
            {/* Book Cover */}
            <div className="md:w-1/3 bg-gray-100 p-8 flex items-center justify-center">
              <div className="relative w-64 h-96 shadow-lg">
                <Image
                  src={coverUrl}
                  alt={book.title}
                  fill
                  className="object-cover rounded"
                />
              </div>
            </div>

            {/* Book Details */}
            <div className="md:w-2/3 p-8">
              {/* External Badge */}
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 text-sm font-bold bg-purple-500 text-white rounded-full">
                  📚 PROJECT GUTENBERG
                </span>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">{book.title}</h1>
              
              <p className="text-xl text-gray-600 mb-6">by {author}</p>

              {/* Genre */}
              {genre && (
                <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium mb-6 capitalize">
                  {genre}
                </span>
              )}

              {/* Stats and Like Button */}
              <div className="mb-6">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {book.download_count.toLocaleString()} downloads
                  </div>
                  
                  {/* Heart Like Button */}
                  <div className={thumbLoading ? 'opacity-50 pointer-events-none' : ''}>
                    <button
                      onClick={handleThumb}
                      disabled={thumbLoading}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                        liked 
                          ? 'bg-red-500 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <svg 
                        className="w-5 h-5" 
                        fill={liked ? "currentColor" : "none"} 
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
                      <span className="font-medium">{likeCount}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Languages */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Languages:</h3>
                <div className="flex flex-wrap gap-2">
                  {book.languages.map((lang, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {lang.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Subjects */}
              {book.subjects.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Subjects:</h3>
                  <div className="flex flex-wrap gap-2">
                    {book.subjects.slice(0, 10).map((subject, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-50 text-gray-600 rounded text-sm">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bookshelves */}
              {book.bookshelves.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Collections:</h3>
                  <div className="flex flex-wrap gap-2">
                    {book.bookshelves.map((shelf, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                        {shelf}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="mb-8">
                <Link
                  href={`/read/gutendex/${gutendexId}`}
                  className="inline-block px-8 py-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium text-lg"
                >
                  📖 Read Book
                </Link>
              </div>

              {/* Copyright Info */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  <strong>Public Domain:</strong> This book is part of Project Gutenberg&apos;s collection 
                  of over 60,000 free public domain books. It can be freely read, downloaded, and shared.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-8">
          <CommentSection bookId={bookId} />
        </div>
      </div>
    </div>
  );
}
