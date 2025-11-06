'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { fetchBookContent, getBookPreview } from '@/lib/api/openLibraryReader';

export default function ExternalReadPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState<string[]>([]);

  // Decode the work key from params
  const workKey = decodeURIComponent(params.id);

  useEffect(() => {
    loadBookContent();
  }, [workKey]);

  const loadBookContent = async () => {
    setLoading(true);
    setError('');

    try {
      // Try to fetch full content
      const bookData = await fetchBookContent(workKey);

      if (bookData) {
        setTitle(bookData.title);
        setAuthor(bookData.author);

        if (bookData.error) {
          // Full text not available, show preview
          const preview = await getBookPreview(workKey);
          setContent(preview);
          setError('Full text not available. Showing preview only.');
        } else {
          // Split content into pages (every 3000 characters)
          const fullText = bookData.fullText || bookData.content;
          const pageSize = 3000;
          const pageArray: string[] = [];
          
          for (let i = 0; i < fullText.length; i += pageSize) {
            pageArray.push(fullText.substring(i, i + pageSize));
          }
          
          setPages(pageArray);
          setContent(pageArray[0] || fullText);
        }
      } else {
        setError('Unable to load book content. The book may not be available for reading.');
      }
    } catch (err) {
      setError('Failed to load book content.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
      setContent(pages[currentPage + 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setContent(pages[currentPage - 1]);
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

  const openOnOpenLibrary = () => {
    window.open(`https://openlibrary.org${workKey}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading book...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${getThemeClasses()}`}>
      <Navbar />

      {/* Reading Controls */}
      <div className="sticky top-0 z-10 border-b shadow-sm bg-white/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <Link
              href="/browse"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Browse
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

              {/* Open on Open Library */}
              <button
                onClick={openOnOpenLibrary}
                className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                title="Open on Open Library"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open Library
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reading Area */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Book Info */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            External Book
          </div>
          <h1 className="text-3xl font-bold mb-2">{title || 'Loading...'}</h1>
          <p className="text-lg opacity-75">by {author || 'Unknown Author'}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm text-yellow-800 font-medium">{error}</p>
                <button
                  onClick={openOnOpenLibrary}
                  className="mt-2 text-sm text-yellow-700 underline hover:text-yellow-900"
                >
                  Read full book on Open Library →
                </button>
              </div>
            </div>
          </div>
        )}

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
            {content || 'No content available.'}
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

            <button
              onClick={handleNextPage}
              disabled={currentPage === pages.length - 1}
              className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next Page
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
