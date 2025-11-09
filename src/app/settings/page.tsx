'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { updatePassword, updateEmail, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import Loader from '@/components/ui/Loader';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { theme: currentTheme, setTheme: setGlobalTheme, fontSize: currentFontSize, setFontSize: setGlobalFontSize } = useTheme();
  const router = useRouter();
  
  // Profile Settings
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  
  // Account Settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  
  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [likeNotifications, setLikeNotifications] = useState(true);
  
  // Privacy Settings
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private'>('public');
  const [showEmail, setShowEmail] = useState(false);
  
  // Theme Settings (local state for form)
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia' | 'auto'>(currentTheme === 'auto' ? 'light' : currentTheme);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>(currentFontSize);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'notifications' | 'privacy' | 'appearance'>('profile');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load user settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setNickname(data.nickname || '');
          setBio(data.bio || '');
          setEmailNotifications(data.emailNotifications ?? true);
          setMessageNotifications(data.messageNotifications ?? true);
          setLikeNotifications(data.likeNotifications ?? true);
          setProfileVisibility(data.profileVisibility || 'public');
          setShowEmail(data.showEmail ?? false);
          setTheme(data.theme || 'light');
          setFontSize(data.fontSize || 'medium');
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      }
    };
    
    loadSettings();
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        nickname: nickname.trim(),
        bio: bio.trim(),
      });
      
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || !user.email) return;
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      setMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      if (err.code === 'auth/wrong-password') {
        setError('Current password is incorrect');
      } else {
        setError('Failed to change password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!user || !user.email) return;
    
    if (!newEmail.trim() || !newEmail.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update email
      await updateEmail(user, newEmail);
      
      setMessage('Email changed successfully!');
      setNewEmail('');
      setCurrentPassword('');
    } catch (err: any) {
      if (err.code === 'auth/wrong-password') {
        setError('Current password is incorrect');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email is already in use');
      } else {
        setError('Failed to change email');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        emailNotifications,
        messageNotifications,
        likeNotifications,
      });
      
      setMessage('Notification preferences updated!');
    } catch (err) {
      setError('Failed to update notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrivacy = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        profileVisibility,
        showEmail,
      });
      
      setMessage('Privacy settings updated!');
    } catch (err) {
      setError('Failed to update privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAppearance = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      // Apply theme immediately
      setGlobalTheme(theme);
      setGlobalFontSize(fontSize);
      
      // Save to Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        theme,
        fontSize,
      });
      
      setMessage('Appearance settings updated!');
    } catch (err) {
      setError('Failed to update appearance');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  👤 Profile
                </button>
                <button
                  onClick={() => setActiveTab('account')}
                  className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'account'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🔐 Account Security
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'notifications'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🔔 Notifications
                </button>
                <button
                  onClick={() => setActiveTab('privacy')}
                  className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'privacy'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🔒 Privacy
                </button>
                <button
                  onClick={() => setActiveTab('appearance')}
                  className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                    activeTab === 'appearance'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🎨 Appearance
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nickname
                      </label>
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        placeholder="Enter your nickname"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        placeholder="Tell us about yourself..."
                      />
                      <p className="mt-1 text-sm text-gray-500">{bio.length}/500 characters</p>
                    </div>

                    <button
                      onClick={handleUpdateProfile}
                      disabled={loading}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {loading ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </div>
              )}

              {/* Account Security Tab */}
              {activeTab === 'account' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Security</h2>
                  
                  {/* Change Password */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        />
                      </div>

                      <button
                        onClick={handleChangePassword}
                        disabled={loading}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {loading ? 'Changing...' : 'Change Password'}
                      </button>
                    </div>
                  </div>

                  {/* Change Email */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Email</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Email
                        </label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Email
                        </label>
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        />
                      </div>

                      <button
                        onClick={handleChangeEmail}
                        disabled={loading}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {loading ? 'Changing...' : 'Change Email'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                      <div>
                        <h3 className="font-medium text-gray-900">Email Notifications</h3>
                        <p className="text-sm text-gray-600">Receive email updates about your account</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={emailNotifications}
                          onChange={(e) => setEmailNotifications(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                      <div>
                        <h3 className="font-medium text-gray-900">Message Notifications</h3>
                        <p className="text-sm text-gray-600">Get notified when you receive new messages</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={messageNotifications}
                          onChange={(e) => setMessageNotifications(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                      <div>
                        <h3 className="font-medium text-gray-900">Like Notifications</h3>
                        <p className="text-sm text-gray-600">Get notified when someone likes your book</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={likeNotifications}
                          onChange={(e) => setLikeNotifications(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <button
                      onClick={handleUpdateNotifications}
                      disabled={loading}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {loading ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-md">
                      <h3 className="font-medium text-gray-900 mb-3">Profile Visibility</h3>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            checked={profileVisibility === 'public'}
                            onChange={() => setProfileVisibility('public')}
                            className="mr-2"
                          />
                          <div>
                            <span className="font-medium text-gray-900">Public</span>
                            <p className="text-sm text-gray-600">Anyone can see your profile</p>
                          </div>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            checked={profileVisibility === 'private'}
                            onChange={() => setProfileVisibility('private')}
                            className="mr-2"
                          />
                          <div>
                            <span className="font-medium text-gray-900">Private</span>
                            <p className="text-sm text-gray-600">Only you can see your profile</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                      <div>
                        <h3 className="font-medium text-gray-900">Show Email on Profile</h3>
                        <p className="text-sm text-gray-600">Display your email address publicly</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showEmail}
                          onChange={(e) => setShowEmail(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <button
                      onClick={handleUpdatePrivacy}
                      disabled={loading}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {loading ? 'Saving...' : 'Save Privacy Settings'}
                    </button>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Appearance</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Theme</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <button
                          onClick={() => {
                            setTheme('light');
                            setGlobalTheme('light');
                          }}
                          className={`p-4 border-2 rounded-md transition-all ${
                            theme === 'light'
                              ? 'border-indigo-600 bg-indigo-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">☀️</div>
                            <div className={`font-medium ${theme === 'light' ? 'text-indigo-700' : 'text-gray-900'}`}>Light</div>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            setTheme('dark');
                            setGlobalTheme('dark');
                          }}
                          className={`p-4 border-2 rounded-md transition-all ${
                            theme === 'dark'
                              ? 'border-indigo-600 bg-indigo-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">🌙</div>
                            <div className={`font-medium ${theme === 'dark' ? 'text-indigo-700' : 'text-gray-900'}`}>Dark</div>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            setTheme('sepia');
                            setGlobalTheme('sepia');
                          }}
                          className={`p-4 border-2 rounded-md transition-all ${
                            theme === 'sepia'
                              ? 'border-indigo-600 bg-indigo-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">📖</div>
                            <div className={`font-medium ${theme === 'sepia' ? 'text-indigo-700' : 'text-gray-900'}`}>Sepia</div>
                          </div>
                        </button>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        {theme === 'sepia' ? 'Warm sepia tones perfect for reading' : `Use ${theme} theme for the app`}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Font Size</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <button
                          onClick={() => setFontSize('small')}
                          className={`p-4 border-2 rounded-md transition-all ${
                            fontSize === 'small'
                              ? 'border-indigo-600 bg-indigo-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="text-center">
                            <div className={`text-sm mb-2 ${fontSize === 'small' ? 'text-indigo-600' : 'text-gray-700'}`}>Aa</div>
                            <div className={`font-medium text-sm ${fontSize === 'small' ? 'text-indigo-700' : 'text-gray-900'}`}>Small</div>
                          </div>
                        </button>
                        <button
                          onClick={() => setFontSize('medium')}
                          className={`p-4 border-2 rounded-md transition-all ${
                            fontSize === 'medium'
                              ? 'border-indigo-600 bg-indigo-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="text-center">
                            <div className={`text-base mb-2 ${fontSize === 'medium' ? 'text-indigo-600' : 'text-gray-700'}`}>Aa</div>
                            <div className={`font-medium text-sm ${fontSize === 'medium' ? 'text-indigo-700' : 'text-gray-900'}`}>Medium</div>
                          </div>
                        </button>
                        <button
                          onClick={() => setFontSize('large')}
                          className={`p-4 border-2 rounded-md transition-all ${
                            fontSize === 'large'
                              ? 'border-indigo-600 bg-indigo-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="text-center">
                            <div className={`text-lg mb-2 ${fontSize === 'large' ? 'text-indigo-600' : 'text-gray-700'}`}>Aa</div>
                            <div className={`font-medium text-sm ${fontSize === 'large' ? 'text-indigo-700' : 'text-gray-900'}`}>Large</div>
                          </div>
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleUpdateAppearance}
                      disabled={loading}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {loading ? 'Saving...' : 'Save Appearance'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
