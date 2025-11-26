'use client';

import { useState, useEffect, useRef } from 'react';
import { searchGutendexBooks, getPopularGutendexBooks, getBookCoverUrl, extractGenreFromSubjects, type GutendexBook } from '@/lib/api/gutendex';
import Image from 'next/image';
import Loader from './Loader';

interface SearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBook: (book: any) => void;
}

// Convert Gutendex book to our format
function convertGutendexBook(book: GutendexBook): any {
  return {
    id: `gutendex-${book.id}`,
    title: book.title,
    author: book.authors.map(a => a.name).join(', ') || 'Unknown Author',
    coverUrl: getBookCoverUrl(book),
    description: book.subjects.slice(0, 2).join(', ') || 'Classic literature from Project Gutenberg',
    genre: extractGenreFromSubjects(book.subjects),
    isExternal: true,
    downloadCount: book.download_count,
    source: 'gutendex'
  };
}

export default function SearchPopup({ isOpen, onClose, onSelectBook }: SearchPopupProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Focus input when popup opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Load popular books when popup opens
  useEffect(() => {
    if (isOpen && !searchQuery) {
      loadPopularBooks();
    }
  }, [searchQuery, isOpen]);

  // Search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery);
    } else if (isOpen) {
      loadPopularBooks();
    }
  }, [debouncedQuery, searchQuery, isOpen]);

  const loadPopularBooks = async () => {
    setLoading(true);
    try {
      // Load popular books from Gutendex
      const gutendexResults = await getPopularGutendexBooks(1);
      const results = gutendexResults?.results.map(convertGutendexBook) || [];
      setSearchResults(results);
    } catch (error) {
      console.error('Error loading popular books:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (query: string) => {
    setLoading(true);
    try {
      // Search Gutendex books
      const gutendexResults = await searchGutendexBooks(query, 1);
      const results = gutendexResults?.results.map(convertGutendexBook) || [];
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSelect = (book: any) => {
    onSelectBook(book);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Search Books</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Search Input */}
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, or subject..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <svg className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
                  </div>

        {/* Results */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader />
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-gray-500">
                {searchQuery ? 'No books found for your search.' : 'Start typing to search for books...'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((book, index) => (
                <div
                  key={`${book.id}-${index}`}
                  onClick={() => handleBookSelect(book)}
                  className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="relative w-16 h-20 flex-shrink-0 bg-gray-200 rounded">
                    {book.coverUrl ? (
                      <Image
                        src={book.coverUrl}
                        alt={book.title}
                        fill
                        className="object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{book.title}</h3>
                    <p className="text-sm text-gray-600 truncate">{book.author}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                        📚 Gutenberg
                      </span>
                      {book.genre && (
                        <span className="text-xs text-gray-500">{book.genre}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
