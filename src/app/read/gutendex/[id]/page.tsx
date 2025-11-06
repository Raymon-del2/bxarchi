'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import Loader from '@/components/ui/Loader';
import { getGutendexBookById, getBookReadUrl, GutendexBook } from '@/lib/api/gutendex';

export const dynamic = 'force-dynamic';

function GutendexReaderContent() {
  const params = useParams();
  const bookId = params.id as string;
  const [book, setBook] = useState<GutendexBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const bookData = await getGutendexBookById(parseInt(bookId));
        if (!bookData) {
          setError('Book not found');
          return;
        }
        setBook(bookData);
      } catch (err) {
        setError('Failed to load book');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

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

  const readUrl = getBookReadUrl(book);

  if (!readUrl) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Reading Not Available</h1>
            <p className="text-gray-600 mb-6">
              This book doesn&apos;t have an online reading format available.
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900 truncate">{book.title}</h1>
              <p className="text-sm text-gray-600">
                by {book.authors.map(a => a.name).join(', ') || 'Unknown Author'}
              </p>
            </div>
            <Link
              href="/browse"
              className="ml-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
            >
              ← Back
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 bg-blue-50 border-b border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>📚 Project Gutenberg:</strong> This book is from Project Gutenberg&apos;s collection 
              of over 60,000 free public domain books. Downloaded {book.download_count.toLocaleString()} times.
            </p>
          </div>

          {/* Embedded Reader */}
          <div className="relative" style={{ height: 'calc(100vh - 250px)', minHeight: '600px' }}>
            <iframe
              src={readUrl}
              className="w-full h-full border-0"
              title={book.title}
              sandbox="allow-same-origin allow-scripts"
            />
          </div>

          {/* Download Options */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Download Options:</h3>
            <div className="flex flex-wrap gap-3">
              {book.formats['application/epub+zip'] && (
                <a
                  href={book.formats['application/epub+zip']}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
                >
                  📱 Download ePub
                </a>
              )}
              {book.formats['text/plain'] && (
                <a
                  href={book.formats['text/plain']}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium"
                >
                  📄 Download Text
                </a>
              )}
              {book.formats['text/html'] && (
                <a
                  href={book.formats['text/html']}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                >
                  🌐 Open in New Tab
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GutendexReaderPage() {
  return (
    <Suspense fallback={<Loader />}>
      <GutendexReaderContent />
    </Suspense>
  );
}
