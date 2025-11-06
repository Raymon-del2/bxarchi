'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPublishedBooks } from '@/lib/firebase/books';
import type { Book } from '@/lib/firebase/books';
import { fetchPopularBooks, searchExternalBooks, fetchBooksByGenre, type ExternalBook } from '@/lib/api/openLibrary';
import { generateBookPlaceholder } from '@/lib/utils/placeholderGenerator';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Loader from '@/components/ui/Loader';

type CombinedBook = (Book & { isExternal?: false }) | ExternalBook;

export default function BrowseBooksPage() {
  const router = useRouter();
  const [books, setBooks] = useState<CombinedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingExternal, setLoadingExternal] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  // Fetch external books when search or genre changes
  useEffect(() => {
    const fetchExternalBooks = async () => {
      if (searchQuery.length > 2) {
        // Search external books when user types
        setLoadingExternal(true);
        const results = await searchExternalBooks(searchQuery, 8);
        
        // Combine with local books
        const { books: localBooks } = await getPublishedBooks();
        setBooks([...localBooks, ...results]);
        setLoadingExternal(false);
      } else if (selectedGenre !== 'all' && selectedGenre !== 'other') {
        // Fetch by genre
        setLoadingExternal(true);
        const genreMap: { [key: string]: string } = {
          'fiction': 'Fiction',
          'non-fiction': 'Nonfiction',
          'mystery': 'Mystery',
          'romance': 'Romance',
          'sci-fi': 'Science Fiction',
          'fantasy': 'Fantasy',
          'thriller': 'Thriller',
          'biography': 'Biography',
          'self-help': 'Self-Help',
          'poetry': 'Poetry',
        };
        const results = await fetchBooksByGenre(genreMap[selectedGenre] || selectedGenre, 8);
        
        const { books: localBooks } = await getPublishedBooks();
        setBooks([...localBooks, ...results]);
        setLoadingExternal(false);
      }
    };

    const timeoutId = setTimeout(fetchExternalBooks, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedGenre]);

  const fetchBooks = async () => {
    setLoading(true);
    
    // Fetch local books
    const { books: fetchedBooks, error: fetchError } = await getPublishedBooks();
    
    if (fetchError) {
      setError(fetchError);
    }
    
    // Fetch external books from Open Library
    setLoadingExternal(true);
    const externalBooks = await fetchPopularBooks(12);
    setLoadingExternal(false);
    
    // Combine both sources
    const combinedBooks: CombinedBook[] = [
      ...fetchedBooks,
      ...externalBooks,
    ];
    
    setBooks(combinedBooks);
    setLoading(false);
  };

  // Filter books by genre and search query
  const filteredBooks = books.filter(book => {
    const author = book.isExternal ? book.author : (book as Book).authorName;
    const matchesGenre = selectedGenre === 'all' || book.genre?.toLowerCase() === selectedGenre;
    const matchesSearch = searchQuery === '' || 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.description && book.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesGenre && matchesSearch;
  });

  const genres = ['all', 'fiction', 'non-fiction', 'mystery', 'romance', 'sci-fi', 'fantasy', 'thriller', 'biography', 'self-help', 'poetry', 'other'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Books</h1>
          <p className="mt-2 text-gray-600">
            Discover amazing stories from our community and beyond
            {loadingExternal && (
              <span className="ml-2 text-sm text-indigo-600">
                <span className="inline-block animate-pulse">● </span>
                Searching external books...
              </span>
            )}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by title, author, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Genre Filter */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">Filter by Genre</label>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedGenre === genre
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {genre.charAt(0).toUpperCase() + genre.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="flex justify-center">
                <Loader />
              </div>
              <p className="mt-4 text-gray-600">Loading books...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredBooks.length === 0 && (
          <div className="text-center py-20">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No books found</h3>
            <p className="mt-2 text-gray-500">
              {selectedGenre === 'all' 
                ? 'Be the first to publish a book!' 
                : `No books in the ${selectedGenre} genre yet.`}
            </p>
          </div>
        )}

        {/* Books Grid */}
        {!loading && filteredBooks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredBooks.map((book) => {
              const isExternal = book.isExternal === true;
              const author = isExternal ? (book as ExternalBook).author : (book as Book).authorName;
              const originalCover = isExternal ? (book as ExternalBook).coverUrl : (book as Book).coverImage;
              
              // Generate placeholder if no cover image
              const coverImage = originalCover || generateBookPlaceholder(book.title, author);
              
              return (
              <div
                key={book.id}
                onClick={() => {
                  if (isExternal) {
                    // Navigate to in-app external reader
                    const encodedId = encodeURIComponent(book.id);
                    router.push(`/read/${encodedId}`);
                  } else {
                    router.push(`/books/${book.id}`);
                  }
                }}
                className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer transition-transform hover:scale-105 hover:shadow-lg"
              >
                {/* Book Cover */}
                <div className="relative h-64 bg-gray-200">
                  {isExternal && (
                    <div className="absolute top-2 right-2 z-10">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-green-500 text-white rounded-full shadow-lg">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        EXTERNAL
                      </span>
                    </div>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = generateBookPlaceholder(book.title, author);
                    }}
                  />
                </div>

                {/* Book Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">by {author}</p>
                  
                  {book.genre && (
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full mb-2">
                      {book.genre.charAt(0).toUpperCase() + book.genre.slice(1)}
                    </span>
                  )}
                  
                  {book.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mt-2">
                      {book.description}
                    </p>
                  )}

                  {/* Stats */}
                  {!isExternal && (
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {(book as Book).views || 0}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {(book as Book).likes || 0}
                      </div>
                    </div>
                  )}
                  {isExternal && (
                    <div className="mt-3 text-xs text-green-600 font-medium">
                      Click to read in-app
                    </div>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
