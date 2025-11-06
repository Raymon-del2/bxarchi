'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface UserProfile {
  uid: string;
  nickname: string;
  bio?: string;
  profilePicture?: string;
  createdAt: any;
}

export default function CommunityPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all users (including current user)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);
        
        const users: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Include ALL users (including current user)
          const userProfile = {
            uid: doc.id,
            nickname: data.nickname || 'Anonymous',
            bio: data.bio || '',
            profilePicture: data.photoURL || data.profilePicture || '', // Check both fields
            createdAt: data.createdAt,
          };
          
          // Debug log for current user
          if (doc.id === user?.uid) {
            console.log('Current user profile data:', userProfile);
            console.log('photoURL:', data.photoURL);
            console.log('profilePicture:', data.profilePicture);
          }
          
          users.push(userProfile);
        });

        setAllUsers(users);
        setFilteredUsers(users);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    if (user) {
      fetchUsers();
    }
  }, [user]);

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(allUsers);
    } else {
      const filtered = allUsers.filter((u) =>
        u.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.bio && u.bio.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, allUsers]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Join Our Community</h1>
            <p className="text-gray-600 mb-8">Please sign in to connect with other members</p>
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Community</h1>
          <p className="text-gray-600">Connect with writers and readers on BXARCHI</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for users by name or bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
            />
            <svg
              className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* User List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading community members...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No users found</h3>
            <p className="mt-2 text-gray-600">
              {searchQuery ? 'Try a different search term' : 'Be the first to join the community!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((profile) => {
              const isCurrentUser = profile.uid === user?.uid;
              
              return (
                <div
                  key={profile.uid}
                  className={`bg-white rounded-lg shadow-sm p-6 border-2 ${
                    isCurrentUser
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
                  } transition-all ${!isCurrentUser ? 'cursor-pointer' : ''}`}
                  onClick={() => {
                    if (!isCurrentUser) {
                      window.location.href = `/chat/${profile.uid}`;
                    }
                  }}
                >
                  <div className="flex items-start space-x-4">
                    {/* Profile Picture */}
                    <div className="flex-shrink-0 relative">
                      {profile.profilePicture ? (
                        <div className={`relative w-16 h-16 rounded-full overflow-hidden border-2 ${
                          isCurrentUser ? 'border-indigo-500' : 'border-gray-200'
                        }`}>
                          <Image
                            src={profile.profilePicture}
                            alt={profile.nickname}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold border-2 ${
                          isCurrentUser ? 'border-indigo-500' : 'border-gray-200'
                        }`}>
                          {profile.nickname.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {isCurrentUser && (
                        <div className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          You
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate flex items-center">
                        {profile.nickname}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs bg-indigo-600 text-white px-2 py-1 rounded-full">
                            Your Profile
                          </span>
                        )}
                      </h3>
                      {profile.bio && (
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                          {profile.bio}
                        </p>
                      )}
                      {!isCurrentUser && (
                        <div className="mt-3 flex items-center text-sm text-indigo-600 font-medium">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          Start chat
                        </div>
                      )}
                      {isCurrentUser && (
                        <Link
                          href="/setup-profile"
                          className="mt-3 inline-flex items-center text-sm text-indigo-600 font-medium hover:text-indigo-700"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Edit Profile
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Results Count */}
        {!loading && filteredUsers.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Showing {filteredUsers.length} of {allUsers.length} members
          </div>
        )}
      </div>
    </div>
  );
}
