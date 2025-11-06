'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPublishedBooks } from '@/lib/firebase/books';
import type { Book } from '@/lib/firebase/books';
import { getPopularGutendexBooks, searchGutendexBooks, getBookCoverUrl, extractGenreFromSubjects, type GutendexBook } from '@/lib/api/gutendex';
import { generateBookPlaceholder } from '@/lib/utils/placeholderGenerator';
import Navbar from '@/components/layout/Navbar';
import Loader from '@/components/ui/Loader';

// Convert Gutendex book to our format
interface ExternalBook {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  genre: string;
  isExternal: true;
  downloadCount: number;
}

type CombinedBook = (Book & { isExternal?: false }) | ExternalBook;

function convertGutendexBook(book: GutendexBook): ExternalBook {
  return {
    id: `gutendex-${book.id}`,
    title: book.title,
    author: book.authors.map(a => a.name).join(', ') || 'Unknown Author',
    coverUrl: getBookCoverUrl(book),
    description: book.subjects.slice(0, 2).join(', ') || 'Classic literature from Project Gutenberg',
    genre: extractGenreFromSubjects(book.subjects),
    isExternal: true,
    downloadCount: book.download_count
  };
}

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

  // Fetch external books when search changes
  useEffect(() => {
    const fetchExternalBooks = async () => {
      if (searchQuery.length > 2) {
        setLoadingExternal(true);
        const results = await searchGutendexBooks(searchQuery, 1);
        
        const { books: localBooks } = await getPublishedBooks();
        const externalBooks = results?.results.map(convertGutendexBook) || [];
        setBooks([...localBooks, ...externalBooks]);
        setLoadingExternal(false);
      } else if (searchQuery.length === 0) {
        // Reset to all books when search is cleared
        fetchBooks();
      }
    };

    const timeoutId = setTimeout(fetchExternalBooks, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchBooks = async () => {
    setLoading(true);
    
    // Fetch local books
    const { books: fetchedBooks, error: fetchError } = await getPublishedBooks();
    
    if (fetchError) {
      setError(fetchError);
    }
    
    // Fetch external books from Gutendex
    setLoadingExternal(true);
    const gutendexResponse = await getPopularGutendexBooks(1);
    const externalBooks = gutendexResponse?.results.map(convertGutendexBook) || [];
    setLoadingExternal(false);
    
    // Combine local and external books
    setBooks([...fetchedBooks, ...externalBooks]);
    setLoading(false);
  };

  const genres = [
    'all',
    'fiction',
    'non-fiction',
    'mystery',
    'romance',
    'sci-fi',
    'fantasy',
    'thriller',
    'biography',
    'self-help',
    'poetry',
    'literature',
    'history',
    'philosophy',
    'drama',
    'other',
  ];

  const filteredBooks = books.filter((book) => {
    const matchesGenre = selectedGenre === 'all' || book.genre === selectedGenre;
    const matchesSearch = searchQuery === '' || 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.isExternal ? (book as ExternalBook).author : (book as Book).authorName)
        .toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesGenre && matchesSearch;
  });

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Books</h1>
          <p className="text-gray-600">
            Discover books from our community and Project Gutenberg&apos;s 60,000+ free classics
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
            />
          </div>

          {/* Genre Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Filter by Genre
            </label>
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
        </div>

        {/* Loading External Books */}
        {loadingExternal && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="text-gray-600 mt-2">Loading more books...</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredBooks.length === 0 && (
          <div className="text-center py-12">
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
            <p className="text-gray-600">
              {selectedGenre === 'all' 
                ? 'No books found' 
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
                    // Extract Gutendex ID and navigate to details page
                    const gutendexId = book.id.replace('gutendex-', '');
                    router.push(`/books/gutendex/${gutendexId}`);
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
                      <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-purple-500 text-white rounded-full shadow-lg">
                        📚 GUTENDEX
                      </span>
                    </div>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
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
                    </div>
                  )}
                  {isExternal && (
                    <div className="mt-3 text-xs text-purple-600 font-medium">
                      📖 {(book as ExternalBook).downloadCount.toLocaleString()} downloads
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
