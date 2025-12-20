'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile } from '@/lib/firebase/firestore';
import { createBook, updateBook } from '@/lib/firebase/books';
import { uploadBookCover } from '@/lib/firebase/storage';
import PageStylePicker, { PAGE_STYLES } from '@/components/ui/PageStylePicker';
import '@/app/pageThemes.css';
import { validateImageFile } from '@/lib/utils/imageUtils';
import { BOOK_THEMES } from '@/constants/bookThemes';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';

export default function NewBookPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  /* ────────── form state ────────── */
  const [title,        setTitle]        = useState('');
  const [description,  setDescription]  = useState('');
  const [genre,        setGenre]        = useState('Other');
  const [themeId, setThemeId] = useState<string>('');
  const [content,      setContent]      = useState('');
  const [coverImage,   setCoverImage]   = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');

  /* ────────── ui state ────────── */
  const [activeTab,        setActiveTab]  = useState<'metadata' | 'content'>('metadata');
  const [showThemeModal,   setShowThemeModal] = useState(false);
  const [saving,           setSaving]     = useState(false);
  const [error,            setError]      = useState('');

  /* ────────── guards ────────── */
  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  /* ────────── handlers ────────── */
  // Page style picker is rendered in metadata tab below

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateImageFile(file, 5);
    if (err) { setError(err); return; }
    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
    setError('');
  };

  /* save draft (unchanged) */
  const handleSaveDraft = async () => {
    if (!user) return;
    if (!title.trim()) { setError('Please enter a book title'); return; }
    setSaving(true); setError('');
    try {
      const { profile } = await getUserProfile(user.uid);
      const authorName = profile?.nickname || profile?.displayName || user.displayName || user.email || 'Anonymous';

      // 1) Create book without cover (we'll upload it right after to Storage)
      const { bookId, error: draftErr } = await createBook({
        title: title.trim(),
        description: description.trim(),
        genre: genre || 'Other',
        content: content.trim(),
        themeId: themeId || undefined,
        coverImage: coverImage ? undefined : '', // omit if real file will be uploaded later
        authorId: user.uid,
        authorName,
        published: false,
      });

      if (draftErr || !bookId) { setError(draftErr || 'Failed to save draft'); setSaving(false); return; }

      // 2) Upload cover to Firebase Storage and patch document
      if (coverImage) {
        const { url: coverUrl, error: uploadErr } = await uploadBookCover(bookId, coverImage);
        if (uploadErr || !coverUrl) {
          setError(uploadErr || 'Failed to upload cover image');
          setSaving(false);
          return;
        }
        const { error: patchErr } = await updateBook(bookId, { coverImage: coverUrl });
        if (patchErr) {
          setError(patchErr);
          setSaving(false);
          return;
        }
      }

      alert('Draft saved!');
      router.push('/my-books');
    } catch(e:any){ setError(e.message);} finally{ setSaving(false);} };

  /* publish flow */
  const attemptPublish = () => {
    if (!title.trim())   { setError('Please enter a book title'); return; }
    if (!content.trim()) { setError('Please write some content before publishing'); return; }
    // open modal first
    setShowThemeModal(true);
  };

  const confirmPublish = async () => {
    if (!user) return;
    setSaving(true); setError('');
    try {
      const { profile } = await getUserProfile(user.uid);
      const authorName = profile?.nickname || profile?.displayName || user.displayName || user.email || 'Anonymous';

      // 1) Create book (cover added later)
      const { bookId, error: publishErr } = await createBook({
        title: title.trim(),
        description: description.trim(),
        genre: genre || 'Other',
        content: content.trim(),
        themeId: themeId || undefined,
        coverImage: coverImage ? undefined : '',
        authorId: user.uid,
        authorName,
        published: true,
      });

      if (publishErr || !bookId) { setError(publishErr || 'Failed to publish'); setSaving(false); return; }

      // 2) Upload cover if provided
      if (coverImage) {
        const { url: coverUrl, error: uploadErr } = await uploadBookCover(bookId, coverImage);
        if (uploadErr || !coverUrl) {
          setError(uploadErr || 'Failed to upload cover image');
          setSaving(false);
          return;
        }
        const { error: patchErr } = await updateBook(bookId, { coverImage: coverUrl });
        if (patchErr) {
          setError(patchErr);
          setSaving(false);
          return;
        }
      }

      alert('Book published successfully!');
      router.push('/browse');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
      setShowThemeModal(false);
    }
  };

  if (loading || !user) return null;

  /* ────────── render ────────── */
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-2">Write Your Book</h1>
        <p className="mb-6 text-gray-600">Create and publish your story on BXARCHI</p>

        {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">{error}</div>}

        {/* Tabs */}
        <div className="bg-white rounded shadow-sm mb-6">
          <nav className="flex border-b">
            {['metadata', 'content'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'metadata' ? 'Book Details' : 'Write Content'}
              </button>
            ))}
          </nav>

          {/* Book Details */}
          {activeTab === 'metadata' && (
            <div className="space-y-6 p-6">
              {/* Page Style picker */}
                <div>
                  <label className="block text-sm font-medium mb-1">Choose Page Color & Effect</label>
                  <PageStylePicker value={themeId} onChange={setThemeId} />
                </div>

                {/* Cover upload */}
              <div>
                <label className="block text-sm font-medium mb-1">Cover Image</label>
                <div className="flex space-x-4">
                  <div className="w-40 h-56 bg-gray-200 rounded overflow-hidden flex items-center justify-center">
                    {coverPreview ? (
                      <Image src={coverPreview} alt="preview" width={160} height={224} className="object-cover" />
                    ) : (
                      <span className="text-gray-400">No cover</span>
                    )}
                  </div>
                  <div>
                    <input type="file" accept="image/*" id="cover-upload" className="hidden" onChange={handleCoverImageChange}/>
                    <label htmlFor="cover-upload"
                      className="px-4 py-2 bg-white border border-gray-300 rounded text-sm cursor-pointer hover:bg-gray-50">
                      Upload Cover
                    </label>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Book Title <span className="text-red-500">*</span>
                </label>
                <input
                  value={title}
                  onChange={e=>setTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Enter your book title"
                />
              </div>

              {/* Theme selector */}
              <div>
                <label className="block text-sm font-medium mb-1">Page Style</label>
                <select
                  value={themeId}
                  onChange={e=>setThemeId(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                >
                  {BOOK_THEMES.map(t=>(
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Genre */}
              {/* …description etc (kept as before) … */}
            </div>
          )}

          {/* Write Content */}
          {activeTab === 'content' && (
            <div className="p-6">
              <label className="block text-sm font-medium mb-2">
                Book Content <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={20}
                className="w-full px-4 py-3 border rounded font-serif"
                value={content}
                onChange={e=>setContent(e.target.value)}
              />
              <p className="mt-2 text-sm text-gray-500">
                {content.split(/\s+/).filter(w=>w).length} words
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-end space-x-4">
          <button onClick={()=>router.push('/')} className="px-6 py-2 border rounded">
            Cancel
          </button>
          <button onClick={handleSaveDraft} disabled={saving}
            className="px-6 py-2 border-indigo-600 text-indigo-600 rounded disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
          <button onClick={attemptPublish} disabled={saving}
            className="px-6 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">
            Publish Book
          </button>
        </div>
      </div>

      {/* Theme preview modal */}
      {showThemeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-3xl rounded-lg overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Choose Your Page Style</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
              {BOOK_THEMES.map(t=>(
                <label key={t.id} className={`cursor-pointer border rounded overflow-hidden ${themeId===t.id?'ring-2 ring-indigo-600':''}`}>
                  <input type="radio" name="theme" value={t.id} className="hidden" onChange={()=>setThemeId(t.id)}/>
                  <div className={`${t.bg} ${t.text} ${t.extraClasses} p-4 h-48 flex flex-col`}>
                    <h3 className="font-bold mb-2">{t.name}</h3>
                    <p className="flex-1">This is how your page appears...</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="p-4 flex justify-end space-x-4 border-t">
              <button onClick={()=>setShowThemeModal(false)} className="px-4 py-2 border rounded">Back</button>
              <button onClick={confirmPublish} disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">
                {saving ? 'Publishing…' : 'Confirm & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}