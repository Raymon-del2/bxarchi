'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import Loader from '@/components/ui/Loader';
import { getGutendexBookById, getBookReadUrl, GutendexBook } from '@/lib/api/gutendex';
import { toggleBookLike, checkUserLiked } from '@/lib/firebase/books';
import BookReader from '@/components/reader/BookReader';

export const dynamic = 'force-dynamic';

function GutendexReaderContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const bookId = `gutendex-${params.id as string}`; // Use consistent ID format
  const gutendexId = params.id as string;
  const [book, setBook] = useState<GutendexBook | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const bookData = await getGutendexBookById(parseInt(gutendexId));
        if (!bookData) {
          setError('Book not found');
          return;
        }
        setBook(bookData);

        // Fetch book content
        const readUrl = getBookReadUrl(bookData);
        if (readUrl) {
          try {
            // Use proxy to avoid CORS issues
            const proxyUrl = `/api/gutendex-proxy?url=${encodeURIComponent(readUrl)}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
            
            const response = await fetch(proxyUrl, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (response.ok) {
              const text = await response.text();
              // Strip HTML tags for plain text reading
              const plainText = text
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                .replace(/<[^>]+>/g, '')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/\s+/g, ' ')
                .trim();
              
              if (plainText.length > 100) {
                setContent(plainText);
              } else {
                setError('Book content is too short or empty');
              }
            } else {
              setError('Failed to fetch book content');
            }
          } catch (fetchError) {
            console.error('Error fetching content:', fetchError);
            setError('Could not load book content. The book may not be available for reading.');
          }
        } else {
          setError('No readable format available for this book');
        }

        // Check if user liked this book
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
  }, [bookId, gutendexId, user]);

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

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Reading Not Available</h1>
            <p className="text-gray-600 mb-6">
              This book doesn&apos;t have readable content available.
            </p>
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

  return (
    <BookReader 
      book={book} 
      content={content}
      liked={liked}
      likeCount={likeCount}
      onLike={handleLike}
      liking={liking}
    />
  );
}

export default function GutendexReaderPage() {
  return (
    <Suspense fallback={<Loader />}>
      <GutendexReaderContent />
    </Suspense>
  );
}
