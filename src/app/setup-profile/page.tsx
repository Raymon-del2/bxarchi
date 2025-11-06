'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createUserProfile, isNicknameAvailable, generateNicknameSuggestions, getUserProfile } from '@/lib/firebase/firestore';
import { compressImageToBase64, validateImageFile } from '@/lib/utils/imageUtils';
import { updateProfile } from 'firebase/auth';
import Image from 'next/image';

export default function SetupProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(null);
  const [checkingNickname, setCheckingNickname] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [originalNickname, setOriginalNickname] = useState('');

  // Load existing profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        setLoadingProfile(true);
        const { profile } = await getUserProfile(user.uid);
        
        if (profile) {
          setNickname(profile.nickname || '');
          setOriginalNickname(profile.nickname || '');
          setBio(profile.bio || '');
          
          // Set preview URL if profile picture exists
          if (profile.photoURL) {
            setPreviewUrl(profile.photoURL);
          }
        }
        
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [user]);

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Check nickname availability with debounce
  useEffect(() => {
    const checkNickname = async () => {
      if (!nickname || nickname.length < 3) {
        setNicknameAvailable(null);
        setSuggestions([]);
        return;
      }

      // Skip checking if nickname hasn't changed (editing existing profile)
      if (nickname === originalNickname) {
        setNicknameAvailable(true);
        setSuggestions([]);
        return;
      }

      setCheckingNickname(true);
      const { available } = await isNicknameAvailable(nickname, user?.uid);
      setNicknameAvailable(available);
      setCheckingNickname(false);

      // Generate suggestions if nickname is taken
      if (!available) {
        const newSuggestions = await generateNicknameSuggestions(nickname);
        setSuggestions(newSuggestions);
      } else {
        setSuggestions([]);
      }
    };

    const timeoutId = setTimeout(checkNickname, 500); // Debounce for 500ms
    return () => clearTimeout(timeoutId);
  }, [nickname, user, originalNickname]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file
      const validationError = validateImageFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (!nickname.trim()) {
      setError('Please enter a nickname');
      return;
    }

    if (nickname.length < 3) {
      setError('Nickname must be at least 3 characters');
      return;
    }

    if (nicknameAvailable === false) {
      setError('This nickname is already taken. Please choose another or select from suggestions below.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      let photoURL = user.photoURL || '';

      // Convert profile picture to Base64 if selected
      if (profileImage) {
        try {
          // Compress and convert to Base64
          const base64Image = await compressImageToBase64(profileImage, 400, 400, 0.8);
          photoURL = base64Image;
          
          // Update Firebase Auth profile with Base64
          await updateProfile(user, { photoURL: base64Image });
        } catch (imageError: any) {
          console.warn('Image compression failed:', imageError);
          // Continue without image instead of failing
        }
      }

      // Create user profile in Firestore
      const { error: firestoreError } = await createUserProfile(user.uid, {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || nickname,
        nickname: nickname,
        bio: bio,
        photoURL: photoURL,
      });

      if (firestoreError) {
        setError(`Failed to save profile: ${firestoreError}. Please check Firebase rules are set correctly.`);
        setUploading(false);
        return;
      }

      // Wait 3 seconds before redirecting
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Redirect to home page
      router.push('/');
      router.refresh(); // Refresh to update navbar
    } catch (err: any) {
      setError(err.message);
      setUploading(false);
    }
  };

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {originalNickname ? 'Edit Your Profile' : 'Complete Your Profile'}
            </h1>
            <p className="mt-2 text-gray-600">
              {originalNickname 
                ? 'Update your profile information below' 
                : 'Let&apos;s set up your profile to get started on BXARCHI'}
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Profile Picture
              </label>
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Profile preview"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt="Current profile"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <label
                  htmlFor="profile-upload"
                  className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-2 cursor-pointer hover:bg-indigo-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                JPG, PNG or GIF (max. 5MB)
              </p>
            </div>

            {/* Nickname */}
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                Nickname <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="nickname"
                  type="text"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className={`w-full px-3 py-2 pr-10 border rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                    nicknameAvailable === true
                      ? 'border-green-500 focus:ring-green-500'
                      : nicknameAvailable === false
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-indigo-500'
                  }`}
                  placeholder="Enter your nickname (min. 3 characters)"
                  maxLength={50}
                  minLength={3}
                />
                {checkingNickname && (
                  <div className="absolute right-3 top-2.5">
                    <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                  </div>
                )}
                {!checkingNickname && nicknameAvailable === true && (
                  <div className="absolute right-3 top-2.5">
                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {!checkingNickname && nicknameAvailable === false && (
                  <div className="absolute right-3 top-2.5">
                    <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {nicknameAvailable === true && (
                <p className="mt-1 text-xs text-green-600">
                  ✓ This nickname is available!
                </p>
              )}
              {nicknameAvailable === false && (
                <p className="mt-1 text-xs text-red-600">
                  ✗ This nickname is already taken
                </p>
              )}
              {!nicknameAvailable && (
                <p className="mt-1 text-xs text-gray-500">
                  This is how other users will see you (min. 3 characters)
                </p>
              )}
              
              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-xs font-medium text-blue-900 mb-2">Available suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setNickname(suggestion)}
                        className="px-3 py-1 bg-white border border-blue-300 rounded-md text-sm text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Bio (Optional)
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Tell us about yourself..."
                maxLength={500}
              />
              <p className="mt-1 text-xs text-gray-500">
                {bio.length}/500 characters
              </p>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={user.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
            </div>

            {/* Buttons */}
            <div>
              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Saving...' : 'Complete Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
