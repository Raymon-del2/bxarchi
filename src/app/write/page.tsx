'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createBook, updateBook, getBook } from '@/lib/firebase/books';
import { uploadBookCover } from '@/lib/firebase/storage';
import Navbar from '@/components/layout/Navbar';
import Image from 'next/image';
import Loader from '@/components/ui/Loader';

export const dynamic = 'force-dynamic';

function WritePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('Other');
  const [themeId] = useState<string>('');
  const [content, setContent] = useState('');
  const [pages, setPages] = useState<string[]>(['']);
  const [currentPage, setCurrentPage] = useState(0);
  const [writeMode, setWriteMode] = useState<'single' | 'pages'>('single');
  const [genreSearch, setGenreSearch] = useState('');
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [coverImage, setCoverImage] = useState('');
  const [backCoverImage, setBackCoverImage] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [backCoverFile, setBackCoverFile] = useState<File | null>(null);

  // Comprehensive genre list
  const allGenres = [
    // Fiction
    { value: 'literary-fiction', label: 'Literary Fiction', category: 'Fiction' },
    { value: 'contemporary-fiction', label: 'Contemporary Fiction', category: 'Fiction' },
    { value: 'historical-fiction', label: 'Historical Fiction', category: 'Fiction' },
    { value: 'mystery', label: 'Mystery', category: 'Fiction' },
    { value: 'cozy-mystery', label: 'Mystery - Cozy', category: 'Fiction' },
    { value: 'detective-fiction', label: 'Mystery - Detective', category: 'Fiction' },
    { value: 'police-procedural', label: 'Mystery - Police Procedural', category: 'Fiction' },
    { value: 'noir', label: 'Mystery - Noir/Hardboiled', category: 'Fiction' },
    { value: 'thriller', label: 'Thriller', category: 'Fiction' },
    { value: 'psychological-thriller', label: 'Thriller - Psychological', category: 'Fiction' },
    { value: 'crime-thriller', label: 'Thriller - Crime', category: 'Fiction' },
    { value: 'political-thriller', label: 'Thriller - Political', category: 'Fiction' },
    { value: 'techno-thriller', label: 'Thriller - Techno', category: 'Fiction' },
    { value: 'horror', label: 'Horror', category: 'Fiction' },
    { value: 'supernatural-horror', label: 'Horror - Supernatural', category: 'Fiction' },
    { value: 'psychological-horror', label: 'Horror - Psychological', category: 'Fiction' },
    { value: 'gothic-horror', label: 'Horror - Gothic', category: 'Fiction' },
    { value: 'body-horror', label: 'Horror - Body Horror', category: 'Fiction' },
    { value: 'sci-fi', label: 'Science Fiction', category: 'Fiction' },
    { value: 'space-opera', label: 'Sci-Fi - Space Opera', category: 'Fiction' },
    { value: 'cyberpunk', label: 'Sci-Fi - Cyberpunk', category: 'Fiction' },
    { value: 'dystopian', label: 'Sci-Fi - Dystopian', category: 'Fiction' },
    { value: 'time-travel', label: 'Sci-Fi - Time Travel', category: 'Fiction' },
    { value: 'hard-scifi', label: 'Sci-Fi - Hard Sci-Fi', category: 'Fiction' },
    { value: 'fantasy', label: 'Fantasy', category: 'Fiction' },
    { value: 'high-fantasy', label: 'Fantasy - High/Epic', category: 'Fiction' },
    { value: 'urban-fantasy', label: 'Fantasy - Urban', category: 'Fiction' },
    { value: 'dark-fantasy', label: 'Fantasy - Dark', category: 'Fiction' },
    { value: 'sword-sorcery', label: 'Fantasy - Sword & Sorcery', category: 'Fiction' },
    { value: 'adventure', label: 'Adventure', category: 'Fiction' },
    { value: 'romance', label: 'Romance', category: 'Fiction' },
    { value: 'contemporary-romance', label: 'Romance - Contemporary', category: 'Fiction' },
    { value: 'historical-romance', label: 'Romance - Historical', category: 'Fiction' },
    { value: 'romantic-suspense', label: 'Romance - Suspense', category: 'Fiction' },
    { value: 'paranormal-romance', label: 'Romance - Paranormal', category: 'Fiction' },
    { value: 'young-adult', label: 'Young Adult (YA)', category: 'Fiction' },
    { value: 'ya-fantasy', label: 'YA - Fantasy', category: 'Fiction' },
    { value: 'ya-romance', label: 'YA - Romance', category: 'Fiction' },
    { value: 'ya-dystopian', label: 'YA - Dystopian', category: 'Fiction' },
    { value: 'coming-of-age', label: 'YA - Coming-of-Age', category: 'Fiction' },
    { value: 'new-adult', label: 'New Adult', category: 'Fiction' },
    { value: 'magical-realism', label: 'Magical Realism', category: 'Fiction' },
    { value: 'utopian', label: 'Utopian', category: 'Fiction' },
    { value: 'paranormal', label: 'Paranormal', category: 'Fiction' },
    // Nonfiction
    { value: 'biography', label: 'Biography/Autobiography', category: 'Nonfiction' },
    { value: 'memoir', label: 'Memoir', category: 'Nonfiction' },
    { value: 'self-help', label: 'Self-Help/Personal Development', category: 'Nonfiction' },
    { value: 'true-crime', label: 'True Crime', category: 'Nonfiction' },
    { value: 'history', label: 'History', category: 'Nonfiction' },
    { value: 'philosophy', label: 'Philosophy', category: 'Nonfiction' },
    { value: 'psychology', label: 'Psychology', category: 'Nonfiction' },
    { value: 'science', label: 'Science', category: 'Nonfiction' },
    { value: 'technology', label: 'Technology', category: 'Nonfiction' },
    { value: 'travel', label: 'Travel', category: 'Nonfiction' },
    { value: 'essay', label: 'Essay Collections', category: 'Nonfiction' },
    { value: 'religion', label: 'Religion/Spirituality', category: 'Nonfiction' },
    { value: 'business', label: 'Business/Economics', category: 'Nonfiction' },
    // Hybrid & Emerging
    { value: 'speculative', label: 'Speculative Fiction', category: 'Hybrid' },
    { value: 'cli-fi', label: 'Cli-Fi (Climate Fiction)', category: 'Hybrid' },
    { value: 'litrpg', label: 'LitRPG', category: 'Hybrid' },
    { value: 'metafiction', label: 'Metafiction', category: 'Hybrid' },
    { value: 'flash-fiction', label: 'Flash Fiction', category: 'Hybrid' },
    { value: 'poetry', label: 'Poetry/Verse Novels', category: 'Hybrid' },
  ];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingBook, setLoadingBook] = useState(false);

  const loadBookForEdit = useCallback(async () => {
    if (!editId) return;
    
    setLoadingBook(true);
    const { book, error: fetchError } = await getBook(editId);

    if (fetchError || !book) {
      setError('Failed to load book for editing');
      setLoadingBook(false);
      return;
    }

    // Check if user is the author
    if (book.authorId !== user?.uid) {
      setError('You are not authorized to edit this book');
      setLoadingBook(false);
      return;
    }

    // Load book data
    setTitle(book.title);
    setDescription(book.description);
    setGenre(book.genre);
    setContent(book.content);
    
    // Split content into pages if it exists
    if (book.content) {
      const pageSize = 2000; // characters per page
      const bookPages: string[] = [];
      for (let i = 0; i < book.content.length; i += pageSize) {
        bookPages.push(book.content.substring(i, i + pageSize));
      }
      if (bookPages.length > 0) {
        setPages(bookPages);
      }
    }
    
    setCoverImage(book.coverImage || '');
    setBackCoverImage(book.backCoverImage || '');
    setLoadingBook(false);
  }, [editId, user]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (isEditMode && editId) {
      loadBookForEdit();
    }
  }, [user, isEditMode, editId, router, loadBookForEdit]);

  const compressImageFile = async (file: File): Promise<File | null> => {
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/compress-image', { method: 'POST', body: fd });
      if (!res.ok) return null;
      const blob = await res.blob();
      return new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), { type: 'image/jpeg' });
    } catch {
      return null;
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      // Compress and convert to base64
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set max dimensions
        const maxWidth = 400;
        const maxHeight = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        setCoverImage(compressedBase64);
        setCoverFile(file);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleBackCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      // Compress and convert to base64
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set max dimensions
        const maxWidth = 400;
        const maxHeight = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        setBackCoverImage(compressedBase64);
        setBackCoverFile(file);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent, publish: boolean) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user) {
      setError('You must be logged in to write');
      return;
    }

    // Validate based on write mode
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (writeMode === 'single' && !content.trim()) {
      setError('Content is required');
      return;
    }

    if (writeMode === 'pages') {
      const hasContent = pages.some(page => page.trim().length > 0);
      if (!hasContent) {
        setError('At least one page must have content');
        return;
      }
    }

    setLoading(true);

    // Combine pages into single content if in pages mode
    const finalContent = writeMode === 'pages' ? pages.join('\n\n--- Page Break ---\n\n') : content.trim();
    
    const bookData = {
      title: title.trim(),
      description: description.trim(),
      genre,
      content: finalContent,
      coverImage,
      themeId: themeId || undefined,
      backCoverImage,
      authorId: user.uid,
      authorName: user.displayName || user.email || 'Anonymous',
      published: publish,
    };

    try {
      if (isEditMode && editId) {
        // Update existing book
        const { error: updateError } = await updateBook(editId, bookData);
        
        if (updateError) {
          setError(updateError);
        } else {
          // Upload new covers if provided and patch URLs
          if (coverFile) {
            const { url: coverUrl, error: coverErr } = await uploadBookCover(editId, coverFile);
            if (coverErr || !coverUrl) {
              setError(coverErr || 'Failed to upload cover image');
              setLoading(false);
              return;
            }
            await updateBook(editId, { coverImage: coverUrl });
          }
          if (backCoverFile) {
            const { url: backUrl, error: backErr } = await uploadBookCover(`${editId}-back`, backCoverFile);
            if (backErr || !backUrl) {
              setError(backErr || 'Failed to upload back cover image');
              setLoading(false);
              return;
            }
            await updateBook(editId, { backCoverImage: backUrl });
          }

          setSuccess(publish ? 'Book updated and published!' : 'Book updated as draft!');
          setTimeout(() => {
            router.push(`/books/${editId}`);
          }, 1500);
        }
      } else {
        // Create new book
        const { bookId, error: createError } = await createBook(bookData);
        
        if (createError || !bookId) {
          setError(createError || 'Failed to create book');
        } else {
          // Upload covers if provided
          if (coverFile) {
            const { url: coverUrl, error: coverErr } = await uploadBookCover(bookId, coverFile);
            if (coverErr || !coverUrl) {
              setError(coverErr || 'Failed to upload cover image');
              setLoading(false);
              return;
            }
            await updateBook(bookId, { coverImage: coverUrl });
          }
          if (backCoverFile) {
            const { url: backUrl, error: backErr } = await uploadBookCover(`${bookId}-back`, backCoverFile);
            if (backErr || !backUrl) {
              setError(backErr || 'Failed to upload back cover image');
              setLoading(false);
              return;
            }
            await updateBook(bookId, { backCoverImage: backUrl });
          }

          setSuccess(publish ? 'Book published successfully!' : 'Book saved as draft!');
          setTimeout(() => {
            router.push(`/books/${bookId}`);
          }, 1500);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loadingBook) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="flex justify-center">
              <Loader />
            </div>
            <p className="mt-4 text-gray-600">Loading book...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
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
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Your Book' : 'Write a New Book'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEditMode ? 'Update your book details and content' : 'Share your story with the world'}
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        {/* Form */}
        <form className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Book Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your book title"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your book"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
            />
          </div>

          {/* Genre - Searchable Dropdown */}
          <div className="relative">
            <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
              Genre
            </label>
            <div className="relative">
              <input
                type="text"
                value={genreSearch || allGenres.find(g => g.value === genre)?.label || ''}
                onChange={(e) => {
                  setGenreSearch(e.target.value);
                  setShowGenreDropdown(true);
                }}
                onFocus={() => setShowGenreDropdown(true)}
                placeholder="Search or select a genre..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {/* Dropdown */}
            {showGenreDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-y-auto">
                <div className="sticky top-0 bg-gray-50 px-3 py-2 border-b border-gray-200">
                  <p className="text-xs font-semibold text-gray-600">Select a genre ({allGenres.filter(g => 
                    g.label.toLowerCase().includes(genreSearch.toLowerCase())
                  ).length} results)</p>
                </div>
                {['Fiction', 'Nonfiction', 'Hybrid'].map(category => {
                  const categoryGenres = allGenres.filter(g => 
                    g.category === category && 
                    g.label.toLowerCase().includes(genreSearch.toLowerCase())
                  );
                  
                  if (categoryGenres.length === 0) return null;
                  
                  return (
                    <div key={category}>
                      <div className="px-3 py-2 bg-gray-100 border-b border-gray-200">
                        <p className="text-xs font-bold text-gray-700">{category}</p>
                      </div>
                      {categoryGenres.map(g => (
                        <button
                          key={g.value}
                          type="button"
                          onClick={() => {
                            setGenre(g.value);
                            setGenreSearch('');
                            setShowGenreDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-indigo-50 transition-colors ${
                            genre === g.value ? 'bg-indigo-100 text-indigo-900 font-medium' : 'text-gray-900'
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  );
                })}
                {allGenres.filter(g => g.label.toLowerCase().includes(genreSearch.toLowerCase())).length === 0 && (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <p>No genres found</p>
                    <p className="text-sm mt-1">Try a different search term</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Close dropdown when clicking outside */}
            {showGenreDropdown && (
              <div 
                className="fixed inset-0 z-0" 
                onClick={() => setShowGenreDropdown(false)}
              />
            )}
          </div>

          {/* Cover Image */}
          <div>
            <label htmlFor="cover" className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image
            </label>
            <input
              type="file"
              id="cover"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {coverImage && (
              <div className="mt-4 relative w-48 h-64">
                <Image
                  src={coverImage}
                  alt="Cover preview"
                  fill
                  className="object-cover rounded-md"
                />
              </div>
            )}
          </div>

          {/* Back Cover Image */}
          <div>
            <label htmlFor="backCover" className="block text-sm font-medium text-gray-700 mb-2">
              Back Cover Image
            </label>
            <input
              type="file"
              id="backCover"
              accept="image/*"
              onChange={handleBackCoverImageUpload}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {backCoverImage && (
              <div className="mt-4 relative w-48 h-64">
                <Image
                  src={backCoverImage}
                  alt="Back cover preview"
                  fill
                  className="object-cover rounded-md"
                />
              </div>
            )}
          </div>

          {/* Writing Mode Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Writing Mode
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setWriteMode('single')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  writeMode === 'single'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📝 Single Page
              </button>
              <button
                type="button"
                onClick={() => setWriteMode('pages')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  writeMode === 'pages'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📚 Multiple Pages
              </button>
            </div>
          </div>

          {/* Content - Single Mode */}
          {writeMode === 'single' && (
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Book Content *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your book content here..."
                rows={20}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-gray-900 bg-white"
                required
              />
              <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                <span>{content.length} characters</span>
              </div>
            </div>
          )}

          {/* Content - Pages Mode */}
          {writeMode === 'pages' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Book Content * (Page {currentPage + 1} of {pages.length})
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newPages = [...pages];
                      newPages.splice(currentPage + 1, 0, '');
                      setPages(newPages);
                      setCurrentPage(currentPage + 1);
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                  >
                    + Add Page
                  </button>
                  {pages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Delete this page?')) {
                          const newPages = pages.filter((_, idx) => idx !== currentPage);
                          setPages(newPages.length > 0 ? newPages : ['']);
                          setCurrentPage(Math.max(0, currentPage - 1));
                        }
                      }}
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                    >
                      🗑️ Delete Page
                    </button>
                  )}
                </div>
              </div>
              
              <textarea
                value={pages[currentPage]}
                onChange={(e) => {
                  const newPages = [...pages];
                  newPages[currentPage] = e.target.value;
                  setPages(newPages);
                }}
                placeholder={`Write page ${currentPage + 1} content here...`}
                rows={20}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-gray-900 bg-white"
                required
              />
              
              <div className="mt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  ← Previous Page
                </button>
                
                <div className="text-sm text-gray-600">
                  {pages[currentPage].length} characters on this page
                </div>
                
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
                  disabled={currentPage === pages.length - 1}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Next Page →
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Publishing...' : isEditMode ? 'Update & Publish' : 'Publish Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function WritePage() {
  return (
    <Suspense fallback={<Loader />}>
      <WritePageContent />
    </Suspense>
  );
}
