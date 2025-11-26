'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import Loader from '@/components/ui/Loader';

export default function FixCachePage() {
  const params = useParams();
  const router = useRouter();
  const gutendexId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [bookData, setBookData] = useState<any>(null);
  const [realBookId, setRealBookId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkCache = async () => {
      try {
        // Check if this is a cached book that might be a BXARCHI book
        const cachedBookRef = doc(db, 'cachedGutendexBooks', `gutendex-${gutendexId}`);
        const cachedBookSnap = await getDoc(cachedBookRef);
        
        if (cachedBookSnap.exists()) {
          const data = cachedBookSnap.data();
          setBookData(data);
          
          // Try to find the real BXARCHI book by title
          const booksRef = doc(db, 'books', gutendexId);
          const bookSnap = await getDoc(booksRef);
          
          if (bookSnap.exists()) {
            // This is a BXARCHI book!
            setRealBookId(gutendexId);
            
            // Delete the incorrect cache entry
            await deleteDoc(cachedBookRef);
          } else {
            // Try to find by title (case insensitive)
            // This would require a more complex query, for now just show the message
          }
        } else {
          setError('No cached book found');
        }
      } catch (err) {
        setError('Error checking cache');
      } finally {
        setLoading(false);
      }
    };

    checkCache();
  }, [gutendexId]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Cache Issue</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/browse')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-md text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sorry! Cache Issue Detected</h1>
          <p className="text-gray-600 mb-6">
            This was a cached book. The real BXARCHI book is available at the link below.
          </p>
        </div>

        {bookData && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">{bookData.title}</h3>
            <p className="text-sm text-gray-600">by {bookData.authorName}</p>
          </div>
        )}

        {realBookId ? (
          <div className="space-y-3">
            <button
              onClick={() => router.push(`/books/${realBookId}`)}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
            >
              📖 Go to Real Book
            </button>
            <button
              onClick={() => router.push('/browse')}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Browse All Books
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push('/browse')}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Browse
          </button>
        )}
      </div>
    </div>
  );
}
