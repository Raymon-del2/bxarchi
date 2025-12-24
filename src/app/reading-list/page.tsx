'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { checkUserThumb, toggleBookThumb, getThumbCounts } from '@/lib/firebase/books';
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
  likes?: number;
  dislikes?: number;
  isLiked?: boolean;
  isDisliked?: boolean;
}

interface ReadProgress {
  bookId: string;
  currentPage: number;
  totalPages: number;
  lastRead: Date;
  completed?: boolean;
}

export default function ReadingListPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [likedBooks, setLikedBooks] = useState<Book[]>([]);
  const [readBooks, setReadBooks] = useState<(Book & { progress?: ReadProgress })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const likedScrollRef = useRef<HTMLDivElement>(null);
  const readScrollRef = useRef<HTMLDivElement>(null);

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchReadingData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Get all book thumbs (likes) by this user
        const thumbsRef = collection(db, 'bookThumbs');
        const thumbsQuery = query(thumbsRef, where('userId', '==', user.uid), where('thumbType', '==', 'like'));
        const thumbsSnapshot = await getDocs(thumbsQuery);

        // Get book IDs
        const likedBookIds = thumbsSnapshot.docs.map(doc => doc.data().bookId);

        // Fetch liked book details
        const likedBooksData: Book[] = [];
        for (const bookId of likedBookIds) {
          // Try to get from BXARCHI books first
          const bookRef = doc(db, 'books', bookId);
          const bookSnap = await getDoc(bookRef);
          
          if (bookSnap.exists()) {
            const bookData = bookSnap.data();
            const { liked, disliked } = await checkUserThumb(bookId, user.uid);
            const { likeCount, dislikeCount } = await getThumbCounts(bookId);
            likedBooksData.push({
              id: bookSnap.id,
              ...bookData,
              likes: likeCount,
              dislikes: dislikeCount,
              isLiked: liked,
              isDisliked: disliked
            } as Book);
          }
        }
        setLikedBooks(likedBooksData);

        // Get reading progress (books that have been opened)
        const progressRef = collection(db, 'readingProgress');
        const progressQuery = query(progressRef, where('userId', '==', user.uid));
        const progressSnapshot = await getDocs(progressQuery);
        
        
        // Fetch books with progress
        const readBooksData: (Book & { progress?: ReadProgress })[] = [];
        for (const progressDoc of progressSnapshot.docs) {
          const progressData = progressDoc.data();
          
          // Get from regular books collection
          const bookRef = doc(db, 'books', progressData.bookId);
          const bookSnap = await getDoc(bookRef);
          
          if (bookSnap && bookSnap.exists()) {
            const bookData = bookSnap.data();
            const { liked, disliked } = await checkUserThumb(progressData.bookId, user.uid);
            const { likeCount, dislikeCount } = await getThumbCounts(progressData.bookId);
            readBooksData.push({
              id: bookSnap.id,
              ...bookData,
              likes: likeCount,
              dislikes: dislikeCount,
              isLiked: liked,
              isDisliked: disliked,
              progress: {
                bookId: progressData.bookId,
                currentPage: progressData.currentPage || 0,
                totalPages: progressData.totalPages || 0,
                lastRead: progressData.lastRead?.toDate() || new Date(),
                completed: progressData.completed || false
              }
            } as Book & { progress?: ReadProgress });
          }
        }
        setReadBooks(readBooksData);
      } catch (error) {
        console.error('Error fetching reading data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchReadingData();
    }
  }, [user, refreshKey]);

  const scroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 400;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (authLoading || loading) {
    return <Loader />;
  }

  const BookCard = ({ book, progress, onLikeChange }: { book: Book; progress?: ReadProgress; onLikeChange?: () => void }) => {
    const [liked, setLiked] = useState(book.isLiked || false);
    const [likeCount, setLikeCount] = useState(book.likes || 0);
    const [loading, setLoading] = useState(false);

    const handleLike = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (!user || loading) return;
      
      setLoading(true);
      const result = await toggleBookThumb(book.id, user.uid, 'like');
      
      if (!result.error) {
        setLiked(result.liked);
        
        // Update like count
        if (result.liked) {
          setLikeCount(prev => prev + 1);
        } else {
          setLikeCount(prev => Math.max(0, prev - 1));
        }
        
        // Refresh data when unliked to remove from liked section
        if (!result.liked && onLikeChange) {
          onLikeChange();
        }
      }
      
      setLoading(false);
    };

    return (
      <div className="flex-shrink-0 w-64 bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all hover:scale-105 relative">
        <Link href={`/books/${book.id}`}>
          <div className="relative h-80">
            <div className="absolute top-2 right-2 z-10">
              <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-indigo-500 text-white rounded-full shadow-lg">
                ✍️ BXARCHI
              </span>
            </div>
            <Image
              src={book.coverImage}
              alt={book.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          </div>
          <div className="p-4 pb-12">
            <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
              {book.title}
            </h3>
            <p className="text-sm text-gray-600 mb-2">by {book.authorName}</p>
            {progress && (
              <div className="mt-2">
                {progress.totalPages === 1 ? (
                  // Single page book
                  progress.completed ? (
                    <div className="flex items-center space-x-1 text-xs text-green-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold">You read all</span>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-600">
                      <span>Single page book</span>
                    </div>
                  )
                ) : (
                  // Multi-page book
                  <>
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>Page {progress.currentPage + 1}/{progress.totalPages}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${((progress.currentPage + 1) / progress.totalPages) * 100}%` }}
                      />
                    </div>
                    {progress.completed ? (
                      <div className="flex items-center space-x-1 text-xs text-green-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold">Completed</span>
                      </div>
                    ) : (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/books/${book.id}/read`);
                        }}
                        className="inline-block text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                      >
                        Continue Reading →
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </Link>
        {/* Heart Like Button - Bottom Right */}
        <div className="absolute bottom-3 right-3 z-10">
          <button
            onClick={handleLike}
            disabled={loading}
            className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-lg hover:bg-white transition-all group"
          >
            <span className={`text-lg transition-transform ${liked ? 'scale-110 text-red-500' : 'scale-100 text-gray-400 group-hover:text-red-400'}`}>
              {liked ? '❤️' : '🤍'}
            </span>
            <span className={`text-xs font-medium transition-colors ${liked ? 'text-red-500' : 'text-gray-600 group-hover:text-red-400'}`}>
              {likeCount}
            </span>
          </button>
        </div>
      </div>
    );
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reading List</h1>
          <p className="text-gray-600">Your liked books and reading progress</p>
        </div>

        {/* Liked Books Section */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Liked Books</h2>
              <p className="text-sm text-gray-600">{likedBooks.length} books</p>
            </div>
          </div>

          {likedBooks.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No liked books yet</h3>
              <p className="text-gray-600 mb-6">Start exploring and like books!</p>
              <Link href="/browse" className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Browse Books
              </Link>
            </div>
          ) : (
            <div className="relative md:px-20">
              {/* Left Arrow - Grey Vertical Bar Style */}
              <button
                onClick={() => scroll(likedScrollRef, 'left')}
                className="hidden md:flex absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 items-center justify-center z-10 transition-all shadow-lg"
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Scrollable Container */}
              <div
                ref={likedScrollRef}
                className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth md:px-20"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {likedBooks.map((book) => (
                  <BookCard key={book.id} book={book} onLikeChange={refreshData} />
                ))}
              </div>

              {/* Right Arrow - Grey Vertical Bar Style */}
              <button
                onClick={() => scroll(likedScrollRef, 'right')}
                className="hidden md:flex absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 items-center justify-center z-10 transition-all shadow-lg"
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Read Books Section */}
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Currently Reading</h2>
              <p className="text-sm text-gray-600">{readBooks.length} books in progress</p>
            </div>
          </div>

          {readBooks.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No books in progress</h3>
              <p className="text-gray-600 mb-6">Start reading to track your progress!</p>
              <Link href="/browse" className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Browse Books
              </Link>
            </div>
          ) : (
            <div className="relative md:px-20">
              {/* Left Arrow - Grey Vertical Bar Style */}
              <button
                onClick={() => scroll(readScrollRef, 'left')}
                className="hidden md:flex absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 items-center justify-center z-10 transition-all shadow-lg"
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Scrollable Container */}
              <div
                ref={readScrollRef}
                className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth md:px-20"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {readBooks.map((book) => (
                  <BookCard key={book.id} book={book} progress={book.progress} onLikeChange={refreshData} />
                ))}
              </div>

              {/* Right Arrow - Grey Vertical Bar Style */}
              <button
                onClick={() => scroll(readScrollRef, 'right')}
                className="hidden md:flex absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 items-center justify-center z-10 transition-all shadow-lg"
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
