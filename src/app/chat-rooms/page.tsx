'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Loader from '@/components/ui/Loader';
import { collection, query, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// Admin user IDs
const ADMIN_USERS = ['FaLWjIwujeghy34NGelI0rrB7Vk2'];

interface ChatRoom {
  id: string;
  participants: string[];
  participantNames: string[];
  participantPhotos: string[];
  lastMessage?: string;
  lastMessageTime?: any;
  messageCount: number;
}

export default function ChatRoomsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchChatRooms = async () => {
      if (!user || !ADMIN_USERS.includes(user.uid)) {
        router.push('/browse');
        return;
      }

      try {
        // Fetch all messages to group by chat pairs
        const messagesRef = collection(db, 'messages');
        const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'));
        const messagesSnapshot = await getDocs(messagesQuery);

        const chatPairs = new Map<string, any>();

        for (const messageDoc of messagesSnapshot.docs) {
          const data = messageDoc.data();
          const senderId = data.senderId;
          const receiverId = data.receiverId;

          // Create a unique chat ID (sorted to ensure consistency)
          const chatId = [senderId, receiverId].sort().join('_');

          if (!chatPairs.has(chatId)) {
            chatPairs.set(chatId, {
              id: chatId,
              participants: [senderId, receiverId],
              lastMessage: data.message,
              lastMessageTime: data.timestamp,
              messageCount: 1
            });
          } else {
            const existing = chatPairs.get(chatId);
            existing.messageCount++;
            // Update last message if this one is newer
            if (!existing.lastMessageTime || data.timestamp > existing.lastMessageTime) {
              existing.lastMessage = data.message;
              existing.lastMessageTime = data.timestamp;
            }
          }
        }

        // Fetch user profiles for each chat
        const rooms: ChatRoom[] = [];
        const chatPairsArray = Array.from(chatPairs.entries());
        for (const [chatId, chatData] of chatPairsArray) {
          const participantNames: string[] = [];
          const participantPhotos: string[] = [];

          for (const userId of chatData.participants) {
            try {
              const userDoc = await getDoc(doc(db, 'users', userId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                participantNames.push(userData.nickname || 'Unknown User');
                participantPhotos.push(userData.photoURL || '');
              } else {
                participantNames.push('Unknown User');
                participantPhotos.push('');
              }
            } catch (error) {
              participantNames.push('Unknown User');
              participantPhotos.push('');
            }
          }

          rooms.push({
            ...chatData,
            participantNames,
            participantPhotos
          });
        }

        // Sort by last message time
        rooms.sort((a, b) => {
          if (!a.lastMessageTime) return 1;
          if (!b.lastMessageTime) return -1;
          return b.lastMessageTime.toMillis() - a.lastMessageTime.toMillis();
        });

        setChatRooms(rooms);
        setFilteredRooms(rooms);
      } catch (error) {
        console.error('Error fetching chat rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchChatRooms();
    }
  }, [user, router]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRooms(chatRooms);
    } else {
      const filtered = chatRooms.filter(room =>
        room.participantNames.some(name =>
          name.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        room.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRooms(filtered);
    }
  }, [searchQuery, chatRooms]);

  if (authLoading || loading) {
    return <Loader />;
  }

  if (!user || !ADMIN_USERS.includes(user.uid)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <span className="mr-3">🛡️</span>
                Chat Rooms Monitoring
              </h1>
              <p className="text-gray-600 mt-2">
                Monitor all private conversations to ensure community safety
              </p>
            </div>
            <div className="bg-red-100 border border-red-300 rounded-lg px-4 py-2">
              <p className="text-red-800 font-semibold text-sm">Admin Only</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by user name or message content..."
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-full">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Total Chat Rooms</p>
                <p className="text-2xl font-bold text-gray-900">{chatRooms.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Filtered Results</p>
                <p className="text-2xl font-bold text-gray-900">{filteredRooms.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">
                  {chatRooms.reduce((sum, room) => sum + room.messageCount, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Rooms List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Active Chat Rooms</h2>
          </div>

          {filteredRooms.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="mt-4 text-gray-600">
                {searchQuery ? 'No chat rooms match your search' : 'No chat rooms found'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredRooms.map((room) => (
                <Link
                  key={room.id}
                  href={`/chat-rooms/${room.id}`}
                  className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Participant Avatars */}
                      <div className="flex -space-x-2">
                        {room.participantPhotos.map((photo, idx) => (
                          <div key={idx} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600">
                            {photo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={photo} alt={room.participantNames[idx]} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                                {room.participantNames[idx]?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Chat Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {room.participantNames.join(' & ')}
                          </p>
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded">
                            {room.messageCount} messages
                          </span>
                        </div>
                        {room.lastMessage && (
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {room.lastMessage}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Time */}
                    <div className="ml-4 flex items-center space-x-2">
                      {room.lastMessageTime && (
                        <span className="text-xs text-gray-500">
                          {room.lastMessageTime.toDate().toLocaleDateString()}
                        </span>
                      )}
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
