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
  photoURL?: string;
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const emojis = ['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '👏', '🙌', '💪', '🔥', '✨', '❤️', '💯', '🎉', '🚀', '💡', '📚', '✅', '⭐'];

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
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full shadow-lg">
        {/* Chat Header - WhatsApp Style */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/dev-insights"
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
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
                {otherUser.photoURL ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={otherUser.photoURL}
                      alt={otherUser.nickname}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-indigo-600 font-bold text-lg shadow-lg">
                    {otherUser.nickname.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-white">
                    {otherUser.nickname}
                  </h2>
                  {otherUser.bio && (
                    <p className="text-sm text-indigo-100 truncate max-w-md">
                      {otherUser.bio}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Messages Area - WhatsApp Background */}
        <div className="flex-1 overflow-y-auto bg-[#e5ddd5] px-6 py-4 space-y-3" style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%23e5ddd5\'/%3E%3Cpath d=\'M50 0L0 50l50 50 50-50z\' fill=\'%23d9d0c7\' fill-opacity=\'.1\'/%3E%3C/svg%3E")',
          backgroundSize: '100px 100px'
        }}>
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
                    className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg shadow-sm ${
                      isCurrentUser
                        ? 'bg-[#dcf8c6] text-gray-900'
                        : 'bg-white text-gray-900'
                    }`}
                  >
                    <p className="break-words text-sm leading-relaxed">{msg.message}</p>
                    <div className="flex items-center justify-end mt-1 space-x-1">
                      <span className="text-[10px] text-gray-500">
                        {msg.timestamp?.toDate().toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isCurrentUser && (
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 16 15">
                          <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/>
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input - WhatsApp Style */}
        <div className="bg-gray-100 relative">
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-full left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Emojis</span>
                <button
                  onClick={() => setShowEmojiPicker(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-10 gap-2 max-h-32 overflow-y-auto">
                {emojis.map((emoji, idx) => (
                  <button
                    key={idx}
                    onClick={() => addEmoji(emoji)}
                    className="text-2xl hover:bg-gray-100 rounded p-1 transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="p-2 flex items-center space-x-2">
            {/* Emoji Button */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-10 h-10 text-gray-500 hover:text-gray-700 flex items-center justify-center transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm10 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-5 6c2.21 0 4-1.79 4-4h-8c0 2.21 1.79 4 4 4z"/>
              </svg>
            </button>

            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message"
              className="flex-1 px-4 py-2 bg-white border-0 rounded-full focus:outline-none text-gray-900 text-sm"
              disabled={sending}
            />
            
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="w-10 h-10 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 flex items-center justify-center disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
