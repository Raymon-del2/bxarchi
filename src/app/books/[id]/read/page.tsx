'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getBook, toggleBookLike, checkUserLiked } from '@/lib/firebase/books';
import type { Book } from '@/lib/firebase/books';
import type { GutendexBook } from '@/lib/api/gutendex';
import Loader from '@/components/ui/Loader';
import BookReader from '@/components/reader/BookReader';

export const dynamic = 'force-dynamic';

function BXARCHIReaderContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const bookId = params.id as string;
  const [book, setBook] = useState<Book | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { book: fetchedBook, error: fetchError } = await getBook(bookId);
        if (fetchError || !fetchedBook) {
          setError(fetchError || 'Book not found');
          return;
        }
        setBook(fetchedBook);
        setContent(fetchedBook.content || '');

        // Check if user liked this book
        if (user) {
          const { liked: userLiked } = await checkUserLiked(bookId, user.uid);
          setLiked(userLiked);
          setLikeCount(fetchedBook.likes || 0);
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

  if (loading) {
    return <Loader />;
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Book Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/browse')}
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Back to Browse
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Reading Not Available</h1>
            <p className="text-gray-600 mb-6">
              This book doesn&apos;t have readable content available.
            </p>
            <button
              onClick={() => router.push('/browse')}
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Back to Browse
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Convert Book to GutendexBook format for BookReader compatibility
  const gutendexCompatibleBook: any = {
    id: book.id ? parseInt(book.id, 10) : 0, // Convert string ID to number for GutendexBook compatibility
    title: book.title,
    authors: [{ name: book.authorName, birth_year: null, death_year: null }],
    subjects: [book.genre || 'literature'],
    bookshelves: [], // Empty array as required
    languages: ['en'],
    copyright: false,
    media_type: 'text',
    formats: {
      'text/html': undefined,
      'application/epub+zip': undefined,
      'text/plain': content,
      'image/jpeg': book.coverImage || undefined
    },
    download_count: 0
  };

  return (
    <BookReader 
      book={gutendexCompatibleBook} 
      content={content}
      liked={liked}
      likeCount={likeCount}
      onLike={handleLike}
      liking={liking}
    />
  );
}

export default function BXARCHIReaderPage() {
  return (
    <BXARCHIReaderContent />
  );
}
