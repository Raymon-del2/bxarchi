'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getBook, incrementBookViews, toggleBookLike, checkUserLiked } from '@/lib/firebase/books';
import type { Book } from '@/lib/firebase/books';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import CommentSection from '@/components/comments/CommentSection';
import Loader from '@/components/ui/Loader';
import BookLikeButton from '@/components/ui/BookLikeButton';

export default function BookPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const bookId = params.id as string;

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);

  const fetchBook = useCallback(async () => {
    setLoading(true);
    
    // Increment view count
    await incrementBookViews(bookId);
    
    const { book: fetchedBook, error: fetchError } = await getBook(bookId);
    
    if (fetchError) {
      setError(fetchError);
    } else if (fetchedBook) {
      setBook(fetchedBook);
      setLikeCount(fetchedBook.likes || 0);
      
      // Check if user liked this book
      if (user) {
        const { liked: userLiked } = await checkUserLiked(bookId, user.uid);
        setLiked(userLiked);
      }
    }
    
    setLoading(false);
  }, [bookId, user]);

  useEffect(() => {
    if (bookId) {
      fetchBook();
    }
  }, [bookId, fetchBook]);

  const handleLike = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (liking) return;
    
    setLiking(true);
    const { liked: newLikedState } = await toggleBookLike(bookId, user.uid);
    
    setLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));
    setLiking(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="flex justify-center">
              <Loader />
            </div>
            <p className="mt-4 text-gray-600">Loading book...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Book Not Found</h2>
          <p className="text-gray-600 mb-8">{error || 'This book does not exist.'}</p>
          <button
            onClick={() => router.push('/browse')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Browse Books
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/browse')}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Browse
        </button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Book Header */}
          <div className="md:flex">
            {/* Cover Image */}
            <div className="md:flex-shrink-0 md:w-80 bg-gray-200">
              {book.coverImage ? (
                <div className="relative h-96 md:h-full">
                  <Image
                    src={book.coverImage}
                    alt={book.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 md:h-full">
                  <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              )}
            </div>

            {/* Book Info */}
            <div className="p-8 flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{book.title}</h1>
              
              <p className="text-lg text-gray-600 mb-4">by {book.authorName}</p>

              {book.genre && (
                <span className="inline-block px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full mb-4">
                  {book.genre.charAt(0).toUpperCase() + book.genre.slice(1)}
                </span>
              )}

              {/* Stats and Like Button */}
              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {book.views || 0} views
                </div>
                
                {/* Like Button */}
                <div className={liking ? 'opacity-50 pointer-events-none' : ''}>
                  <BookLikeButton
                    liked={liked}
                    count={likeCount}
                    onToggle={handleLike}
                    disabled={liking}
                  />
                </div>
              </div>

              {/* Description */}
              {book.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">About this book</h3>
                  <p className="text-gray-700 leading-relaxed">{book.description}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                {user && user.uid === book.authorId && (
                  <button 
                    onClick={() => router.push(`/write?edit=${bookId}`)}
                    className="flex items-center px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 font-medium transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Book
                  </button>
                )}
                <button 
                  onClick={() => router.push(`/books/${bookId}/read`)}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium transition-colors"
                >
                  Start Reading
                </button>
              </div>
            </div>
          </div>

          {/* Book Content */}
          <div className="border-t border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Read</h2>
            <div className="prose max-w-none">
              <div className="text-gray-800 leading-relaxed whitespace-pre-wrap font-serif text-lg">
                {book.content}
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
