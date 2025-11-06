'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  or,
  and,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: any;
}

interface UserProfile {
  nickname: string;
  profilePicture?: string;
  bio?: string;
}

export default function ChatPage({ params }: { params: { userId: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherUserId = params.userId;

  // Fetch other user's profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', otherUserId));
        if (userDoc.exists()) {
          setOtherUser(userDoc.data() as UserProfile);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    if (otherUserId) {
      fetchUserProfile();
    }
  }, [otherUserId]);

  // Listen to messages in real-time
  useEffect(() => {
    if (!user || !otherUserId) return;

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      or(
        and(
          where('senderId', '==', user.uid),
          where('receiverId', '==', otherUserId)
        ),
        and(
          where('senderId', '==', otherUserId),
          where('receiverId', '==', user.uid)
        )
      ),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, otherUserId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || sending) return;

    setSending(true);
    try {
      await addDoc(collection(db, 'messages'), {
        senderId: user.uid,
        receiverId: otherUserId,
        message: newMessage.trim(),
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/community"
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>

            {otherUser && (
              <>
                {otherUser.profilePicture ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={otherUser.profilePicture}
                      alt={otherUser.nickname}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                    {otherUser.nickname.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {otherUser.nickname}
                  </h2>
                  {otherUser.bio && (
                    <p className="text-sm text-gray-500 truncate max-w-md">
                      {otherUser.bio}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-4 space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="mt-4 text-gray-600">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isCurrentUser = msg.senderId === user.uid;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isCurrentUser
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="break-words">{msg.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isCurrentUser ? 'text-indigo-200' : 'text-gray-500'
                      }`}
                    >
                      {msg.timestamp?.toDate().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <form onSubmit={handleSendMessage} className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
