'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile } from '@/lib/firebase/firestore';
import { createBook } from '@/lib/firebase/books';
import { compressImageToBase64, validateImageFile } from '@/lib/utils/imageUtils';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';

export default function NewBookPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Book metadata
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  
  // Book content
  const [content, setContent] = useState('');
  
  // UI state
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'metadata' | 'content'>('metadata');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validationError = validateImageFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSaveDraft = async () => {
    if (!user) return;

    if (!title.trim()) {
      setError('Please enter a book title');
      return;
    }

    setSaving(true);
    setError('');

    try {
      let coverImageBase64 = '';

      // Convert cover image to Base64 if selected
      if (coverImage) {
        try {
          coverImageBase64 = await compressImageToBase64(coverImage, 600, 800, 0.85);
        } catch (imageError) {
          console.warn('Cover image compression failed:', imageError);
        }
      }

      // Get user profile for author name
      const { profile } = await getUserProfile(user.uid);
      const authorName = profile?.nickname || profile?.displayName || user.displayName || user.email || 'Anonymous';

      // Save book to Firestore as draft
      const { bookId, error: saveError } = await createBook({
        title: title.trim(),
        description: description.trim(),
        genre: genre || 'Other',
        content: content.trim(),
        coverImage: coverImageBase64,
        authorId: user.uid,
        authorName: authorName,
        published: false, // Save as draft
      });

      if (saveError) {
        setError(saveError);
        setSaving(false);
        return;
      }

      alert('Book draft saved successfully!');
      router.push('/my-books');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!user) return;

    if (!title.trim()) {
      setError('Please enter a book title');
      return;
    }

    if (!content.trim()) {
      setError('Please write some content before publishing');
      return;
    }

    setSaving(true);
    setError('');

    try {
      let coverImageBase64 = '';

      if (coverImage) {
        try {
          coverImageBase64 = await compressImageToBase64(coverImage, 600, 800, 0.85);
        } catch (imageError) {
          console.warn('Cover image compression failed:', imageError);
        }
      }

      // Get user profile for author name
      const { profile } = await getUserProfile(user.uid);
      const authorName = profile?.nickname || profile?.displayName || user.displayName || user.email || 'Anonymous';

      // Publish book to Firestore
      const { bookId, error: publishError } = await createBook({
        title: title.trim(),
        description: description.trim(),
        genre: genre || 'Other',
        content: content.trim(),
        coverImage: coverImageBase64,
        authorId: user.uid,
        authorName: authorName,
        published: true, // Publish immediately
      });

      if (publishError) {
        setError(publishError);
        setSaving(false);
        return;
      }

      alert('Book published successfully!');
      router.push('/browse');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Write Your Book</h1>
          <p className="mt-2 text-gray-600">Create and publish your story on BXARCHI</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('metadata')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'metadata'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Book Details
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'content'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Write Content
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Book Details Tab */}
            {activeTab === 'metadata' && (
              <div className="space-y-6">
                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Book Cover
                  </label>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-40 h-56 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                        {coverPreview ? (
                          <Image
                            src={coverPreview}
                            alt="Cover preview"
                            width={160}
                            height={224}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                        className="hidden"
                        id="cover-upload"
                      />
                      <label
                        htmlFor="cover-upload"
                        className="inline-block px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                      >
                        Upload Cover
                      </label>
                      <p className="mt-2 text-xs text-gray-500">
                        Recommended: 600x800px, JPG or PNG (max 5MB)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Book Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your book title"
                    maxLength={200}
                  />
                </div>

                {/* Genre */}
                <div>
                  <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">
                    Genre
                  </label>
                  <select
                    id="genre"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a genre</option>
                    <option value="fiction">Fiction</option>
                    <option value="non-fiction">Non-Fiction</option>
                    <option value="mystery">Mystery</option>
                    <option value="romance">Romance</option>
                    <option value="sci-fi">Science Fiction</option>
                    <option value="fantasy">Fantasy</option>
                    <option value="thriller">Thriller</option>
                    <option value="biography">Biography</option>
                    <option value="self-help">Self-Help</option>
                    <option value="poetry">Poetry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Write a brief description of your book..."
                    maxLength={1000}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {description.length}/1000 characters
                  </p>
                </div>
              </div>
            )}

            {/* Write Content Tab */}
            {activeTab === 'content' && (
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Book Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-serif text-lg leading-relaxed"
                  placeholder="Start writing your story here..."
                />
                <p className="mt-2 text-sm text-gray-500">
                  {content.split(/\s+/).filter(word => word.length > 0).length} words
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <div className="flex space-x-4">
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="px-6 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={handlePublish}
              disabled={saving}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Publishing...' : 'Publish Book'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
