'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { forceCleanAllCache } from '@/lib/cache-utils';
import { debugBookCovers, checkBookCover } from '@/lib/check-book-covers';

// Admin user ID - only this user can see debug info
const ADMIN_UID = 'FaLWjIwujeghy34NGelI0rrB7Vk2';

interface BookDebugInfo {
  id: string;
  docId: string; // Firestore document ID
  title: string;
  author?: string;
  authorName?: string;
  coverUrl?: string;
  coverImage?: string;
  download_count?: number;
  isBXARCHI: boolean;
  isGutendex: boolean;
  issues: string[];
}

export default function BookDebugInfo() {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<BookDebugInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  // Only show debug component for admin user
  if (!user || user.uid !== ADMIN_UID) {
    return null;
  }

  const forceCleanup = async () => {
    setLoading(true);
    try {
      console.log('🧹 Force cleaning entire cache...');
      const deletedCount = await forceCleanAllCache();
      console.log(`✅ Force cleaned ${deletedCount} cached books`);
      setDebugInfo([]); // Clear the debug info after cleanup
    } catch (error) {
      console.error('💥 Error during force cleanup:', error);
    } finally {
      setLoading(false);
    }
  };

  const debugBXARCHICovers = async () => {
    setLoading(true);
    try {
      console.log('🔍 Debugging BXARCHI book covers...');
      await debugBookCovers();
    } catch (error) {
      console.error('💥 Error debugging BXARCHI covers:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSpecificBook = async (bookId: string) => {
    try {
      console.log(`🔍 Checking specific book: ${bookId}`);
      await checkBookCover(bookId);
    } catch (error) {
      console.error(`💥 Error checking book ${bookId}:`, error);
    }
  };

  const deleteInvalidBook = async (docId: string) => {
    try {
      setDeletingId(docId);
      console.log(`🗑️ Deleting invalid book: ${docId}`);
      const bookRef = doc(db, 'cachedGutendexBooks', docId);
      await deleteDoc(bookRef);
      console.log(`✅ Deleted: ${docId}`);
      
      // Refresh the analysis
      await analyzeCache();
    } catch (error) {
      console.error(`❌ Failed to delete ${docId}:`, error);
      alert(`Failed to delete book: ${error}`);
    } finally {
      setDeletingId(null);
    }
  };

  const analyzeCache = async () => {
    setLoading(true);
    try {
      console.log('🔍 Analyzing cache for debugging...');
      
      const cachedBooksRef = collection(db, 'cachedGutendexBooks');
      const cachedBooksSnap = await getDocs(cachedBooksRef);
      
      const analysis: BookDebugInfo[] = [];
      
      for (const doc of cachedBooksSnap.docs) {
        const data = doc.data();
        const bookId = data.id;
        
        const issues: string[] = [];
        
        // Check if it's a BXARCHI book
        const isBXARCHI = !bookId.startsWith('gutendex-') || 
                          data.authorName || 
                          data.coverImage;
        
        // Check if it's a Gutendex book
        const isGutendex = bookId.startsWith('gutendex-') && 
                          /^\d+$/.test(bookId.replace('gutendex-', '')) &&
                          data.author && !data.authorName &&
                          data.coverUrl && !data.coverImage;
        
        if (!bookId.startsWith('gutendex-')) {
          issues.push('Invalid ID format - not gutendex-');
        }
        
        if (!/^\d+$/.test(bookId.replace('gutendex-', ''))) {
          issues.push('Non-numeric Gutendex ID');
        }
        
        if (data.authorName && !data.author) {
          issues.push('Has BXARCHI author field (authorName)');
        }
        
        if (data.coverImage && !data.coverUrl) {
          issues.push('Has BXARCHI cover field (coverImage)');
        }
        
        if (data.author && data.authorName) {
          issues.push('Has both author formats');
        }
        
        if (data.coverUrl && data.coverImage) {
          issues.push('Has both cover formats');
        }
        
        if (typeof data.download_count !== 'number' && data.download_count !== undefined) {
          issues.push('Invalid download_count type');
        }
        
        analysis.push({
          id: bookId,
          docId: doc.id, // Use the Firestore document ID
          title: data.title,
          author: data.author,
          authorName: data.authorName,
          coverUrl: data.coverUrl,
          coverImage: data.coverImage,
          download_count: data.download_count,
          isBXARCHI,
          isGutendex,
          issues
        });
      }
      
      console.log('📊 Cache analysis complete:', analysis);
      setDebugInfo(analysis);
      
    } catch (error) {
      console.error('💥 Error analyzing cache:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setVisible(true)}
          className="bg-red-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium hover:bg-red-700 transition-colors"
        >
          🔍 Debug Books
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">🔍 Book Cache Debug Info</h2>
            <button
              onClick={() => setVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-4 flex flex-wrap gap-3">
            <button
              onClick={analyzeCache}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? '🔄 Analyzing...' : '🔍 Analyze Cache'}
            </button>
            <button
              onClick={forceCleanup}
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? '🧹 Cleaning...' : '🧹 Force Clean Cache'}
            </button>
            <button
              onClick={debugBXARCHICovers}
              disabled={loading}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? '🔍 Debugging...' : '📚 Debug BXARCHI Covers'}
            </button>
          </div>
          
          {/* Book ID checker */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Check Specific Book:</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Book ID"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    if (input.value.trim()) {
                      checkSpecificBook(input.value.trim());
                    }
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = e.currentTarget.parentElement?.querySelector('input');
                  if (input && input.value.trim()) {
                    checkSpecificBook(input.value.trim());
                  }
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                🔍 Check
              </button>
            </div>
          </div>
          
          {debugInfo.length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-700 mb-2">
                <div>Total: {debugInfo.length}</div>
                <div className="text-red-600">BXARCHI: {debugInfo.filter(b => b.isBXARCHI).length}</div>
                <div className="text-green-600">Valid Gutendex: {debugInfo.filter(b => b.isGutendex).length}</div>
              </div>
              
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left">ID</th>
                      <th className="px-4 py-2 text-left">Title</th>
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-left">Issues</th>
                    </tr>
                  </thead>
                  <tbody>
                    {debugInfo.map((book) => (
                      <tr key={book.id} className="border-t border-gray-100">
                        <td className="px-4 py-2 font-mono text-xs">{book.id}</td>
                        <td className="px-4 py-2 max-w-xs truncate">{book.title}</td>
                        <td className="px-4 py-2">
                          {book.isBXARCHI && (
                            <span className="inline-block px-2 py-1 text-xs font-bold bg-red-100 text-red-800 rounded-full mr-1">
                              BXARCHI
                            </span>
                          )}
                          {book.isGutendex && (
                            <span className="inline-block px-2 py-1 text-xs font-bold bg-green-100 text-green-800 rounded-full">
                              GUTENDEX
                            </span>
                          )}
                          {!book.isBXARCHI && !book.isGutendex && (
                            <span className="inline-block px-2 py-1 text-xs font-bold bg-yellow-100 text-yellow-800 rounded-full">
                              UNKNOWN
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <div className="space-y-1">
                            {book.issues.length > 0 ? (
                              <div className="space-y-1">
                                {book.issues.map((issue, idx) => (
                                  <div key={idx} className="text-xs text-red-600 truncate">
                                    • {issue}
                                  </div>
                                ))}
                                <button
                                  onClick={() => deleteInvalidBook(book.docId)}
                                  disabled={deletingId === book.docId}
                                  className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {deletingId === book.docId ? '🗑️ Deleting...' : '🗑️ Delete'}
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-green-600">✅ Valid</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
