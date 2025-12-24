'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPublishedBooks, type Book } from '@/lib/firebase/books';
import { generateBookPlaceholder } from '@/lib/utils/placeholderGenerator';
import { getSafeImageUrl, createImageErrorHandler, createImageLoadHandler, getImageStyles } from '@/lib/image-utils';
import Navbar from '@/components/layout/Navbar';
import Loader from '@/components/ui/Loader';

export default function BrowseBooksPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    const { books: fetchedBooks, error: fetchError } = await getPublishedBooks();
    
    if (fetchError) {
      setError(fetchError);
    }
    
    setBooks(fetchedBooks);
    setLoading(false);
  };

  const genres = [
    'all',
    'fiction',
    'fantasy',
    'romance',
    'mystery',
    'thriller',
    'sci-fi',
    'horror',
    'biography',
    'history',
    'self-help',
    'poetry',
    'other',
  ];

  const filteredBooks = books.filter((book) => {
    const matchesGenre = selectedGenre === 'all' || book.genre?.toLowerCase().includes(selectedGenre);
    const matchesSearch = searchQuery === '' || 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesGenre && matchesSearch;
  });

  if (loading) {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Books</h1>
          <p className="text-gray-600">
            Discover amazing stories from our BXARCHI community
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
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? 'No books found matching your search.' 
                : selectedGenre === 'all' 
                  ? 'No books published yet. Be the first to write one!' 
                  : `No books in the ${selectedGenre} genre yet.`}
            </p>
            <button
              onClick={() => router.push('/write')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
            >
              ✍️ Write a Book
            </button>
          </div>
        )}

        {/* Books Grid */}
        {!loading && filteredBooks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredBooks.map((book) => {
              const placeholderUrl = generateBookPlaceholder(book.title, book.authorName);
              const coverImage = getSafeImageUrl(book.coverImage || '', placeholderUrl);
              
              return (
                <div
                  key={book.id}
                  onClick={() => router.push(`/books/${book.id}`)}
                  className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer transition-transform hover:scale-105 hover:shadow-lg"
                >
                  {/* Book Cover */}
                  <div className="relative h-64 bg-gray-200">
                    <div className="absolute top-2 right-2 z-10">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-indigo-500 text-white rounded-full shadow-lg">
                        ✍️ BXARCHI
                      </span>
                    </div>
                    
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      onError={createImageErrorHandler(placeholderUrl)}
                      onLoad={createImageLoadHandler()}
                      style={getImageStyles()}
                    />
                  </div>

                  {/* Book Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">by {book.authorName}</p>
                    
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
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {book.views || 0}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {book.likes || 0}
                      </div>
                    </div>
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
