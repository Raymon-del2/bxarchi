'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/config';
import Image from 'next/image';

// Admin user IDs
const ADMIN_USERS = ['FaLWjIwujeghy34NGelI0rrB7Vk2'];

interface Announcement {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  link?: string;
  linkText?: string;
  createdAt: any;
  authorId: string;
}

export default function WhatsNewPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    link: '',
    linkText: ''
  });
  const [submitting, setSubmitting] = useState(false);
  
  const isAdmin = user && ADMIN_USERS.includes(user.uid);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      console.log('📋 Fetching announcements...');
      const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      console.log('📊 Found', snapshot.size, 'announcements');
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Announcement[];
      console.log('📄 Announcements data:', data);
      setAnnouncements(data);
    } catch (error) {
      console.error('❌ Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !user) return;

    setSubmitting(true);
    try {
      console.log('📝 Creating announcement with data:', formData);
      const docRef = await addDoc(collection(db, 'announcements'), {
        title: formData.title,
        content: formData.content,
        link: formData.link,
        linkText: formData.linkText,
        createdAt: serverTimestamp(),
        authorId: user.uid
      });
      console.log('✅ Announcement created with ID:', docRef.id);

      // Reset form
      setFormData({
        title: '',
        content: '',
        imageUrl: '',
        link: '',
        linkText: ''
      });
      setShowForm(false);
      fetchAnnouncements();
    } catch (error) {
      console.error('❌ Error creating announcement:', error);
      alert('Failed to create announcement. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, 'announcements', id));
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🎉 What&apos;s New</h1>
          <p className="text-xl text-gray-600">Latest updates and features in BXARCHI</p>
        </div>

        {/* Admin Post Button */}
        {isAdmin && (
          <div className="mb-8 text-center">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              {showForm ? '✖️ Cancel' : '➕ Create Announcement'}
            </button>
          </div>
        )}

        {/* Admin Form */}
        {isAdmin && showForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Announcement</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter announcement title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={4}
                  placeholder="Write your announcement content here..."
                />
              </div>

              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link URL (Optional)</label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link Text (Optional)</label>
                <input
                  type="text"
                  value={formData.linkText}
                  onChange={(e) => setFormData({...formData, linkText: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Learn More"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : '📢 Post Announcement'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Announcements List */}
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <div className="text-gray-500 text-lg">No announcements yet</div>
              {isAdmin && (
                <p className="text-gray-400 mt-2">Create your first announcement above!</p>
              )}
            </div>
          ) : (
            announcements.map((announcement) => (
              <div 
                key={announcement.id} 
                className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-indigo-500"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{announcement.title}</h3>
                    <div className="text-sm text-gray-500 mb-4">
                      📅 {announcement.createdAt?.toDate()?.toLocaleDateString() || 'Recent'}
                    </div>
                  </div>
                  
                  {/* Admin Delete Button */}
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="ml-4 text-red-600 hover:text-red-700 font-medium"
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="prose max-w-none text-gray-700 mb-4">
                  {announcement.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-2">{paragraph}</p>
                  ))}
                </div>

                {/* Link */}
                {announcement.link && (
                  <div className="mt-4">
                    <a
                      href={announcement.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      {announcement.linkText || 'Learn More'} →
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer for non-admin users */}
        {!isAdmin && announcements.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              Stay tuned for more updates! 🚀
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
