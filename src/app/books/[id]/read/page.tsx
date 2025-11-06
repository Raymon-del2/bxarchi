'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getBook, incrementBookViews } from '@/lib/firebase/books';
import type { Book } from '@/lib/firebase/books';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import Loader from '@/components/ui/Loader';

export default function ReadBookPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState<string[]>([]);
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');

  const fetchBook = useCallback(async () => {
    setLoading(true);
    const { book: fetchedBook, error: fetchError } = await getBook(params.id);

    if (fetchError) {
      setError(fetchError);
      setLoading(false);
      return;
    }

    if (!fetchedBook) {
      setError('Book not found');
      setLoading(false);
      return;
    }

    setBook(fetchedBook);
    
    // Split content into pages (every 3000 characters for comfortable reading)
    if (fetchedBook.content) {
      const pageSize = 3000;
      const pageArray: string[] = [];
      
      for (let i = 0; i < fetchedBook.content.length; i += pageSize) {
        pageArray.push(fetchedBook.content.substring(i, i + pageSize));
      }
      
      setPages(pageArray.length > 0 ? pageArray : [fetchedBook.content]);
    }
    
    setLoading(false);

    // Increment views
    await incrementBookViews(params.id);
  }, [params.id]);

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

  const handleNextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'sepia':
        return 'bg-[#f4ecd8] text-[#5c4a3a]';
      case 'dark':
        return 'bg-gray-900 text-gray-100';
      default:
        return 'bg-white text-gray-900';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center">
            <Loader />
          </div>
          <p className="mt-4 text-gray-600">Loading book...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-8">{error || 'Book not found'}</p>
          <Link
            href="/browse"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  const currentContent = pages[currentPage] || book.content || '';

  return (
    <div className={`min-h-screen ${getThemeClasses()}`}>
      <Navbar />

      {/* Reading Controls */}
      <div className="sticky top-0 z-10 border-b shadow-sm bg-white/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <Link
              href={`/books/${params.id}`}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Book
            </Link>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Font Size */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Decrease font size"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="text-sm text-gray-600">{fontSize}px</span>
                <button
                  onClick={() => setFontSize(Math.min(28, fontSize + 2))}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Increase font size"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              {/* Theme Selector */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setTheme('light')}
                  className={`w-6 h-6 rounded-full bg-white border-2 ${theme === 'light' ? 'border-indigo-600' : 'border-gray-300'}`}
                  title="Light theme"
                />
                <button
                  onClick={() => setTheme('sepia')}
                  className={`w-6 h-6 rounded-full bg-[#f4ecd8] border-2 ${theme === 'sepia' ? 'border-indigo-600' : 'border-gray-300'}`}
                  title="Sepia theme"
                />
                <button
                  onClick={() => setTheme('dark')}
                  className={`w-6 h-6 rounded-full bg-gray-900 border-2 ${theme === 'dark' ? 'border-indigo-600' : 'border-gray-300'}`}
                  title="Dark theme"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reading Area */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Book Info */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
          <p className="text-lg opacity-75">by {book.authorName}</p>
        </div>

        {/* Page Navigation */}
        {pages.length > 1 && (
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 0}
              className="flex items-center px-4 py-2 rounded-md hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <div className="text-center">
              <p className="text-sm opacity-75">
                Page {currentPage + 1} of {pages.length}
              </p>
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === pages.length - 1}
              className="flex items-center px-4 py-2 rounded-md hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none mb-12"
          style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
        >
          <div className="whitespace-pre-wrap">
            {currentContent}
          </div>
        </div>

        {/* Bottom Navigation */}
        {pages.length > 1 && (
          <div className="border-t pt-6 flex items-center justify-between">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 0}
              className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous Page
            </button>

            {currentPage === pages.length - 1 ? (
              <Link
                href={`/books/${params.id}`}
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Finished Reading
              </Link>
            ) : (
              <button
                onClick={handleNextPage}
                className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Next Page
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
