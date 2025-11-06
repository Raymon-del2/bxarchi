'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { logOut } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { getUserProfile, UserProfile } from '@/lib/firebase/firestore';

export default function Navbar() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { profile } = await getUserProfile(user.uid);
        if (profile) {
          setUserProfile(profile);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = async () => {
    await logOut();
    router.push('/');
  };

  const displayName = userProfile?.nickname || userProfile?.displayName || user?.displayName || user?.email;
  const photoURL = userProfile?.photoURL || user?.photoURL;

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              BXARCHI
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link href="/browse" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                Browse Books
              </Link>
              {user && (
                <>
                  <Link href="/write" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                    Write a Book
                  </Link>
                  <Link href="/my-books" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                    My Books
                  </Link>
                  <Link href="/reading-list" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                    Reading List
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600"
                >
                  {photoURL ? (
                    <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-indigo-600">
                      <Image
                        src={photoURL}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                      {displayName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden md:block text-sm font-medium">
                    {displayName}
                  </span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link
                      href="/setup-profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      Your Profile
                    </Link>
                    <Link
                      href="/my-books"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      My Books
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      Settings
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-indigo-600">
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
