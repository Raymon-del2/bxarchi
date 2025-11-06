'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function ExternalReadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  const title = searchParams.get('title');

  useEffect(() => {
    // Redirect to external book if URL is provided
    if (url) {
      window.open(url, '_blank');
      // Redirect back to browse after opening external link
      setTimeout(() => {
        router.push('/browse');
      }, 1000);
    }
  }, [url, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <svg
            className="mx-auto h-16 w-16 text-indigo-600 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">Opening External Book</h1>
          
          {title && (
            <p className="text-lg text-gray-700 mb-6">
              &quot;{title}&quot;
            </p>
          )}

          <p className="text-gray-600 mb-8">
            This book is hosted on Open Library. We&apos;re opening it in a new tab for you.
          </p>

          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              If the book didn&apos;t open automatically, click below:
            </p>
            
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Open on Open Library
              </a>
            )}

            <div>
              <Link
                href="/browse"
                className="inline-block text-indigo-600 hover:text-indigo-700"
              >
                ← Back to Browse
              </Link>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> External books are provided by Open Library, 
              a free online library with millions of books. You can read them for free 
              on their website.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
