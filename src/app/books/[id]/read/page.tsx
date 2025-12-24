'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getBook, toggleBookLike, checkUserLiked } from '@/lib/firebase/books';
import type { Book } from '@/lib/firebase/books';
import Navbar from '@/components/layout/Navbar';
import Loader from '@/components/ui/Loader';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function BookReaderPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const bookId = params.id as string;
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);
  const [fontSize, setFontSize] = useState(18);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { book: fetchedBook, error: fetchError } = await getBook(bookId);
        if (fetchError || !fetchedBook) {
          setError(fetchError || 'Book not found');
          return;
        }
        setBook(fetchedBook);
        setLikeCount(fetchedBook.likes || 0);

        if (user) {
          const { liked: userLiked } = await checkUserLiked(bookId, user.uid);
          setLiked(userLiked);
        }
      } catch (err) {
        setError('Failed to load book');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId, user]);

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

  if (loading) return <Loader />;

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Book Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/browse" className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              Back to Browse
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const content = book.content || '';

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-indigo-600">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          
          <div className="flex items-center gap-4">
            {/* Font Size */}
            <div className="flex items-center gap-2">
              <button onClick={() => setFontSize(s => Math.max(14, s - 2))} className="p-2 hover:bg-gray-100 rounded">
                <span className="text-sm">A-</span>
              </button>
              <button onClick={() => setFontSize(s => Math.min(28, s + 2))} className="p-2 hover:bg-gray-100 rounded">
                <span className="text-lg">A+</span>
              </button>
            </div>
            
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={liking}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                liked ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-5 h-5" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {likeCount}
            </button>
          </div>
        </div>
      </div>

      {/* Book Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">{book.title}</h1>
          <p className="text-xl text-gray-600">by {book.authorName}</p>
          {book.genre && (
            <span className="inline-block mt-4 px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
              {book.genre}
            </span>
          )}
        </div>

        {/* Content */}
        <div 
          className="prose prose-lg max-w-none font-serif leading-relaxed text-gray-800"
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
        >
          {content.split('\n').map((paragraph, idx) => (
            paragraph.trim() ? (
              <p key={idx} className="mb-6 text-justify">
                {paragraph}
              </p>
            ) : null
          ))}
        </div>

        {/* End */}
        <div className="text-center mt-16 pt-8 border-t border-gray-300">
          <p className="text-gray-500 text-lg font-serif italic">— The End —</p>
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={handleLike}
              disabled={liking}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium ${
                liked ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              <svg className="w-5 h-5" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {liked ? 'Liked!' : 'Like this book'}
            </button>
            <Link href="/browse" className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300">
              Browse More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
