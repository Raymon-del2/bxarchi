'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createBook, updateBook, getBook } from '@/lib/firebase/books';
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
  const [genre, setGenre] = useState('fiction');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
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
    setCoverImage(book.coverImage || '');
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB');
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

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);

    const bookData = {
      title: title.trim(),
      description: description.trim(),
      genre,
      content: content.trim(),
      coverImage,
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
          setSuccess(publish ? 'Book updated and published!' : 'Book updated as draft!');
          setTimeout(() => {
            router.push(`/books/${editId}`);
          }, 1500);
        }
      } else {
        // Create new book
        const { bookId, error: createError } = await createBook(bookData);
        
        if (createError) {
          setError(createError);
        } else {
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

          {/* Genre */}
          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
              Genre
            </label>
            <select
              id="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
            >
              <option value="fiction">Fiction</option>
              <option value="non-fiction">Non-Fiction</option>
              <option value="mystery">Mystery</option>
              <option value="romance">Romance</option>
              <option value="sci-fi">Sci-Fi</option>
              <option value="fantasy">Fantasy</option>
              <option value="thriller">Thriller</option>
              <option value="biography">Biography</option>
              <option value="self-help">Self-Help</option>
              <option value="poetry">Poetry</option>
              <option value="other">Other</option>
            </select>
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

          {/* Content */}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-gray-900"
              required
            />
            <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
              <span>{content.length} characters</span>
              {isEditMode && content && (
                <span className="text-green-600">✓ Content loaded</span>
              )}
            </div>
          </div>

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
