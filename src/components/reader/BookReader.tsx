'use client';

import { useState, useEffect, useCallback } from 'react';
import { GutendexBook, getBookCoverUrl } from '@/lib/api/gutendex';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface BookPage {
  content: string;
  type: 'cover' | 'intro' | 'normal' | 'end';
  number: string;
}

interface BookReaderProps {
  book: GutendexBook;
  content: string;
  liked?: boolean;
  likeCount?: number;
  onLike?: () => void;
  liking?: boolean;
}

export default function BookReader({ book, content, liked = false, likeCount = 0, onLike, liking = false }: BookReaderProps) {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState<BookPage[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const bookId = `gutendex-${book.id}`;

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Split content preserving chapter headers, intro pages, and page breaks
    let contentPages: BookPage[] = [];
    
    // Check if content has explicit page breaks or chapter headers
    if (content.includes('--- Page Break ---') || content.includes('PAGE ') || content.includes('INTRO ') || content.includes('COVER') || content.includes('END')) {
      // Match different page types - more flexible patterns
      const introPattern = /(INTRO\s+([IVXLCDM]+)\s*—\s*"[^"]*")/g;
      const pagePattern = /(PAGE\s+(\d+)\s*—\s*"[^"]*")/g;
      const coverPattern = /COVER/g;
      const endPattern = /END/g;
      const breakPattern = /--- Page Break ---/g;
      
      // Process content to identify page types
      let processedContent = content
        .replace(breakPattern, '===PAGE_BREAK===') // Temporarily replace breaks
        .replace(coverPattern, '===SPECIAL_PAGE===COVER===') // Mark cover pages
        .replace(endPattern, '===SPECIAL_PAGE===END===') // Mark end pages
        .replace(introPattern, '===INTRO_PAGE===ROMAN $2===') // Mark intro pages with Roman numerals
        .replace(pagePattern, '===NORMAL_PAGE===PAGE $2==='); // Mark normal pages
      
      // Split by page breaks
      const rawPages = processedContent.split('===PAGE_BREAK===');
      
      contentPages = rawPages.map((page, index) => {
        const cleanPage = page.trim();
        if (!cleanPage) return null;
        
        // Extract page type and clean content
        let pageType: 'cover' | 'intro' | 'normal' | 'end' = 'normal';
        let pageNumber = '';
        let cleanContent = cleanPage;
        
        if (cleanPage.includes('===SPECIAL_PAGE===COVER===')) {
          pageType = 'cover';
          pageNumber = '0';
          cleanContent = cleanPage.replace('===SPECIAL_PAGE===COVER===', '').trim();
        } else if (cleanPage.includes('===SPECIAL_PAGE===END===')) {
          pageType = 'end';
          pageNumber = '0';
          cleanContent = cleanPage.replace('===SPECIAL_PAGE===END===', '').trim();
        } else if (cleanPage.includes('===INTRO_PAGE===ROMAN')) {
          pageType = 'intro';
          const romanMatch = cleanPage.match(/===INTRO_PAGE===ROMAN ([IVXLCDM]+)===/);
          if (romanMatch) {
            pageNumber = romanMatch[1];
          }
          cleanContent = cleanPage.replace(/===INTRO_PAGE===ROMAN [IVXLCDM]+===/, '').trim();
        } else if (cleanPage.includes('===NORMAL_PAGE===PAGE')) {
          const pageMatch = cleanPage.match(/===NORMAL_PAGE===PAGE (\d+)===/);
          if (pageMatch) {
            pageNumber = pageMatch[1];
          }
          cleanContent = cleanPage.replace(/===NORMAL_PAGE===PAGE \d+===/, '').trim();
        } else {
          // Default page numbering for unmarked pages
          pageNumber = String(index + 1);
        }
        
        return {
          content: cleanContent,
          type: pageType,
          number: pageNumber
        };
      }).filter((page): page is BookPage => page !== null && page.content.length > 0);
    } else {
      // Fallback to character-based pagination
      const charsPerPage = 2000;
      for (let i = 0; i < content.length; i += charsPerPage) {
        contentPages.push({
          content: content.slice(i, i + charsPerPage),
          type: 'normal',
          number: String(Math.floor(i / charsPerPage) + 1)
        });
      }
    }
    
    // If no pages were created, create one with all content
    if (contentPages.length === 0 && content) {
      contentPages = [{
        content: content,
        type: 'normal',
        number: '1'
      }];
    }
    
    setPages(contentPages);
  }, [content]);

  // Cache Gutendex book to Firestore (only for actual Gutendex books)
  useEffect(() => {
    const cacheBook = async () => {
      if (!user) return;
      
      // Only cache if this is actually a Gutendex book (starts with 'gutendex-')
      if (!bookId.startsWith('gutendex-')) return;
      
      try {
        const cachedBookRef = doc(db, 'cachedGutendexBooks', bookId);
        const cachedBookSnap = await getDoc(cachedBookRef);
        
        // Only cache if not already cached
        if (!cachedBookSnap.exists()) {
          await setDoc(cachedBookRef, {
            id: bookId,
            gutendexId: book.id,
            title: book.title,
            authorName: book.authors.map(a => a.name).join(', ') || 'Unknown Author',
            coverImage: getBookCoverUrl(book),
            description: book.subjects.slice(0, 3).join(', ') || 'Classic literature from Project Gutenberg',
            genre: book.subjects[0] || 'Classic',
            content: content,
            cached: true,
            cachedAt: new Date()
          });
        }
      } catch (error) {
        console.error('Error caching Gutendex book:', error);
      }
    };
    
    if (content && user) {
      cacheBook();
    }
  }, [book, content, user, bookId]);

  // Save reading progress
  const saveProgress = useCallback(async (page: number, total: number) => {
    if (!user) return;
    
    try {
      const progressRef = doc(db, 'readingProgress', `${user.uid}_${bookId}`);
      await setDoc(progressRef, {
        userId: user.uid,
        bookId: bookId,
        currentPage: page,
        totalPages: total,
        lastRead: new Date(),
        completed: page === total - 1
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [user, bookId]);

  // Load saved progress
  useEffect(() => {
    const loadProgress = async () => {
      if (!user || pages.length === 0) return;
      
      try {
        const progressRef = doc(db, 'readingProgress', `${user.uid}_${bookId}`);
        const progressSnap = await getDoc(progressRef);
        
        if (progressSnap.exists()) {
          const data = progressSnap.data();
          const totalPages = Math.ceil(pages.length / 2) + 3;
          if (data.currentPage < totalPages) {
            setCurrentPage(data.currentPage);
          }
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    };
    
    loadProgress();
  }, [user, bookId, pages.length]);

  // Save progress when page changes
  useEffect(() => {
    if (pages.length > 0 && user) {
      const totalPages = Math.ceil(pages.length / 2) + 3;
      saveProgress(currentPage, totalPages);
    }
  }, [currentPage, pages.length, user, saveProgress]);

  const totalPages = Math.ceil(pages.length / 2) + 3; // Cover + Contents + Story spreads + End
  const author = book.authors.map(a => a.name).join(', ') || 'Unknown Author';
  const coverUrl = getBookCoverUrl(book);

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Mobile view with pagination
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-100 relative">
        {/* Back Button - Mobile */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
          <Link href="/browse" className="flex items-center text-gray-600 hover:text-indigo-600">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Back to Browse</span>
          </Link>
        </div>
        <div className="min-h-screen bg-white p-6 pb-32 overflow-y-auto">
          {/* Cover Page */}
          {currentPage === 0 && (
            <div className="flex flex-col items-center justify-center min-h-full text-center">
              <div className="relative w-48 h-64 mb-6 shadow-lg">
                <Image src={coverUrl} alt={book.title} fill className="object-cover" />
              </div>
              <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
              <p className="text-xl text-gray-600 mb-4">{author}</p>
              <p className="text-sm text-gray-500">{bookId.startsWith('gutendex-') ? '📚 Project Gutenberg' : '✍️ BXARCHI'}</p>
            </div>
          )}

          {/* Contents Page */}
          {currentPage === 1 && (
            <div className="min-h-full">
              <h1 className="text-2xl font-bold mb-6 text-center">Contents</h1>
              <div className="space-y-4">
                <p className="text-gray-700">
                  <strong>Title:</strong> {book.title}
                </p>
                <p className="text-gray-700">
                  <strong>Author:</strong> {author}
                </p>
                <p className="text-gray-700">
                  <strong>Language:</strong> {book.languages.join(', ').toUpperCase()}
                </p>
                <p className="text-gray-700">
                  <strong>Downloads:</strong> {book.download_count.toLocaleString()}
                </p>
                {book.subjects.length > 0 && (
                  <div>
                    <strong className="text-gray-700">Subjects:</strong>
                    <ul className="list-disc list-inside mt-2 text-gray-600 text-sm">
                      {book.subjects.slice(0, 5).map((subject, idx) => (
                        <li key={idx}>{subject}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Story Pages */}
          {currentPage >= 2 && currentPage < totalPages - 1 && (() => {
                const pageIndex = currentPage - 2;
                const page = pages[pageIndex];
                if (!page) return null;
                
                let pageLabel = `Page ${currentPage - 1}`;
                
                if (page.type === 'intro') {
                  pageLabel = `Intro ${page.number}`;
                } else if (page.type === 'cover' || page.type === 'end') {
                  pageLabel = page.type.charAt(0).toUpperCase() + page.type.slice(1);
                } else {
                  pageLabel = `Page ${page.number}`;
                }
                
                return (
                  <div className="min-h-full">
                    <p className="text-base leading-relaxed text-gray-800 whitespace-pre-wrap font-serif">
                      {page.content}
                    </p>
                    <div className="text-center mt-6 text-sm text-gray-500">
                      {pageLabel} of {totalPages - 2}
                    </div>
                  </div>
                );
              })()}

          {/* End Page */}
          {currentPage === totalPages - 1 && (
            <div className="flex flex-col items-center justify-center min-h-full text-center">
              <h1 className="text-4xl font-bold mb-4">The End</h1>
              <p className="text-gray-600 mb-6">Thank you for reading</p>
              <p className="text-lg font-semibold mb-2">{book.title}</p>
              <p className="text-gray-600 mb-8">by {author}</p>
              <Link
                href="/browse"
                className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Browse More Books
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Navigation - Floating */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          {/* Like Button Row */}
          {onLike && (
            <div className="px-4 pt-3 pb-2 border-b border-gray-100">
              <button
                onClick={onLike}
                disabled={liking}
                className={`flex items-center justify-center w-full py-2 rounded-md transition-all ${
                  liked
                    ? 'bg-red-50 text-red-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } ${liking ? 'opacity-50' : ''}`}
              >
                <svg
                  className={`w-5 h-5 mr-2 ${liked ? 'fill-current' : ''}`}
                  fill={liked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span className="font-medium">{liked ? 'Liked' : 'Like'} ({likeCount})</span>
              </button>
            </div>
          )}
          
          {/* Navigation Row */}
          <div className="p-4 flex items-center justify-between">
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              ← Back
            </button>
            <span className="text-sm text-gray-600 font-medium">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop view with book flip animation
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-8">
      {/* Back Button - Desktop */}
      <Link 
        href="/browse"
        className="fixed top-8 left-8 z-50 flex items-center px-4 py-2 bg-white rounded-full shadow-lg text-gray-700 hover:text-indigo-600 hover:shadow-xl transition-all"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="font-medium">Back</span>
      </Link>
      
      <style jsx>{`
        .book-container {
          width: 720px;
          height: 511px;
          box-shadow: 0 0 100px rgba(0, 0, 0, 0.3);
          perspective: 1200px;
          position: relative;
        }

        .book {
          width: 100%;
          height: 100%;
          display: flex;
          position: relative;
          transform-style: preserve-3d;
        }

        .book-page {
          position: absolute;
          width: 50%;
          height: 100%;
          background-color: #F5F5F5;
          background-image: linear-gradient(90deg, rgba(227,227,227,1) 0%, rgba(247,247,247,0) 18%);
          transform-origin: left center;
          transition: transform 0.9s cubic-bezier(0.645, 0.045, 0.355, 1);
          transform-style: preserve-3d;
          cursor: pointer;
        }

        .book-page.flipped {
          transform: rotateY(-180deg);
        }

        .book-page-front,
        .book-page-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          padding: 36px;
          overflow-y: auto;
        }

        .book-page-back {
          transform: rotateY(180deg);
        }

        .page-content {
          font-family: 'Georgia', serif;
          color: #2A2935;
        }

        .cover-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      `}</style>

      <div className="book-container">
        <div className="book">
          {/* Left Page (always visible) */}
          <div className="book-page" style={{ left: 0, backgroundImage: 'linear-gradient(-90deg, rgba(227,227,227,1) 0%, rgba(247,247,247,0) 18%)' }}>
            <div className="book-page-front page-content">
              {currentPage === 0 && (
                <div className="relative w-full h-full">
                  <Image src={coverUrl} alt={book.title} fill className="object-cover" />
                </div>
              )}
              {currentPage === 1 && (
                <>
                  <h1 className="text-3xl font-bold text-center mb-8">{book.title}</h1>
                  <h2 className="text-xl text-center mb-8 border-t border-b border-gray-800 inline-block w-full py-2">
                    {author}
                  </h2>
                  <div className="mt-12">
                    <h3 className="text-lg font-semibold mb-4">About This Book</h3>
                    <p className="text-sm mb-2"><strong>Language:</strong> {book.languages.join(', ').toUpperCase()}</p>
                    <p className="text-sm mb-2"><strong>Downloads:</strong> {book.download_count.toLocaleString()}</p>
                  </div>
                  <div className="absolute bottom-8 left-0 right-0 text-center text-xs">
                    <p>{bookId.startsWith('gutendex-') ? '📚 Project Gutenberg' : '✍️ BXARCHI'}</p>
                  </div>
                </>
              )}
              {currentPage >= 2 && currentPage < totalPages - 1 && (() => {
                const pageIndex = Math.floor((currentPage - 2) * 2);
                const page = pages[pageIndex];
                if (!page) return null;
                
                return (
                  <>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {page.content}
                    </p>
                    <div className="absolute bottom-8 left-0 right-0 text-center text-xs text-gray-600">
                      {page.number}
                    </div>
                  </>
                );
              })()}
              {currentPage === totalPages - 1 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <h1 className="text-5xl font-bold mb-6">The End</h1>
                  <p className="text-gray-600 mb-8">Thank you for reading</p>
                  <p className="text-2xl font-semibold mb-2">{book.title}</p>
                  <p className="text-xl text-gray-600 mb-12">by {author}</p>
                  <Link
                    href="/browse"
                    className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Browse More Books
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Page (always visible) */}
          <div className="book-page" style={{ left: '50%', backgroundImage: 'linear-gradient(90deg, rgba(227,227,227,1) 0%, rgba(247,247,247,0) 18%)' }}>
            <div className="book-page-front page-content">
              {currentPage === 0 && (
                <div className="flex items-center justify-center h-full text-center">
                  <p className="text-gray-500 text-sm">Click to start reading →</p>
                </div>
              )}
              {currentPage === 1 && book.subjects.length > 0 && (
                <div>
                  <strong className="text-sm">Subjects:</strong>
                  <ul className="list-disc list-inside mt-2 text-sm">
                    {book.subjects.slice(0, 8).map((subject, idx) => (
                      <li key={idx}>{subject}</li>
                    ))}
                  </ul>
                </div>
              )}
              {currentPage >= 2 && currentPage < totalPages - 2 && (() => {
                const pageIndex = Math.floor((currentPage - 2) * 2) + 1;
                const page = pages[pageIndex];
                if (!page) return null;
                
                return (
                  <>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {page.content}
                    </p>
                    <div className="absolute bottom-8 left-0 right-0 text-center text-xs text-gray-600">
                      {page.number}
                    </div>
                  </>
                );
              })()}
              {(currentPage === totalPages - 2 || currentPage >= totalPages - 1) && (
                <div className="flex items-center justify-center h-full text-center text-gray-400">
                  <p className="text-sm">End of book</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg px-6 py-3 flex items-center space-x-6 z-50">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className="text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:text-indigo-600 font-medium"
        >
          ← Previous
        </button>
        <span className="text-sm text-gray-600 font-medium">
          {currentPage + 1} / {totalPages}
        </span>
        {onLike && (
          <>
            <div className="h-6 w-px bg-gray-300"></div>
            <button
              onClick={onLike}
              disabled={liking}
              className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-all ${
                liked
                  ? 'bg-red-50 text-red-600'
                  : 'text-gray-600 hover:bg-gray-100'
              } ${liking ? 'opacity-50' : ''}`}
            >
              <svg
                className={`w-5 h-5 ${liked ? 'fill-current' : ''}`}
                fill={liked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className="font-medium">{likeCount}</span>
            </button>
          </>
        )}
        <button
          onClick={nextPage}
          disabled={currentPage === totalPages - 1}
          className="text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:text-indigo-600 font-medium"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
