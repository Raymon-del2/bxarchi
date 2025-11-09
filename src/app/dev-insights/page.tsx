'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Loader from '@/components/ui/Loader';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc, where, getDocs, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// Admin user IDs - add your Firebase user ID here
const ADMIN_USERS = ['FaLWjIwujeghy34NGelI0rrB7Vk2'];

interface Message {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  message: string;
  timestamp: any;
}

interface EnrichedMessage extends Message {
  realUserName?: string;
  realUserPhoto?: string;
}

export default function DevInsightsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [enrichedMessages, setEnrichedMessages] = useState<EnrichedMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSelectTextAlert, setShowSelectTextAlert] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ userId: string; userName: string; userPhoto?: string } | null>(null);
  const [userBooks, setUserBooks] = useState<any[]>([]);
  const [loadingUserBooks, setLoadingUserBooks] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const emojis = ['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '👏', '🙌', '💪', '🔥', '✨', '❤️', '💯', '🎉', '🚀', '💡', '📚', '✅', '⭐'];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // Real-time listener for messages
    const messagesRef = collection(db, 'devInsights');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Enrich messages with real user profile data
    const enrichMessages = async () => {
      const enriched = await Promise.all(
        messages.map(async (msg) => {
          try {
            const userDocRef = doc(db, 'users', msg.userId);
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists()) {
              const userProfile = userDocSnap.data();
              return {
                ...msg,
                realUserName: userProfile.nickname || msg.userName,
                realUserPhoto: userProfile.photoURL || msg.userPhoto
              };
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
          }
          return { ...msg, realUserName: msg.userName, realUserPhoto: msg.userPhoto };
        })
      );
      setEnrichedMessages(enriched);
    };

    if (messages.length > 0) {
      enrichMessages();
    } else {
      setEnrichedMessages([]);
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || sending) return;

    setSending(true);
    try {
      await addDoc(collection(db, 'devInsights'), {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhoto: user.photoURL || '',
        message: newMessage.trim(),
        timestamp: serverTimestamp()
      });
      setNewMessage('');
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  const handleLinkClick = () => {
    const input = inputRef.current;
    if (!input) return;

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const text = newMessage.substring(start, end);

    if (text.length === 0) {
      setShowSelectTextAlert(true);
      return;
    }

    setSelectedText(text);
    setSelectionStart(start);
    setSelectionEnd(end);
    setShowLinkModal(true);
  };

  const insertLink = () => {
    if (!linkUrl.trim()) {
      return;
    }

    // Ensure URL has protocol
    let url = linkUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const before = newMessage.substring(0, selectionStart);
    const after = newMessage.substring(selectionEnd);
    const link = `[${selectedText}](${url})`;
    
    setNewMessage(before + link + after);
    setShowLinkModal(false);
    setLinkUrl('');
    setSelectedText('');
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessageToDelete(messageId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!messageToDelete) return;

    try {
      await deleteDoc(doc(db, 'devInsights', messageToDelete));
      setShowDeleteModal(false);
      setMessageToDelete(null);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleUserClick = async (userId: string, userName: string, userPhoto?: string) => {
    setShowUserProfile(true);
    setLoadingUserBooks(true);
    
    try {
      // Fetch real user profile data from Firestore users collection
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      
      let userData = { userId, userName, userPhoto };
      
      if (userDocSnap.exists()) {
        const userProfile = userDocSnap.data();
        userData = {
          userId,
          userName: userProfile.nickname || userName,
          userPhoto: userProfile.photoURL || userPhoto
        };
      }
      
      setSelectedUser(userData);
      
      // Fetch user's published books
      const booksRef = collection(db, 'books');
      const q = query(booksRef, where('authorId', '==', userId), where('published', '==', true));
      const snapshot = await getDocs(q);
      const books = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserBooks(books);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setSelectedUser({ userId, userName, userPhoto });
      setUserBooks([]);
    } finally {
      setLoadingUserBooks(false);
    }
  };

  const isAdmin = user && ADMIN_USERS.includes(user.uid);

  if (authLoading) {
    return <Loader />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* Select Text Alert Modal */}
      {showSelectTextAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 animate-bounce-once">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Select Text First</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Please highlight some text in your message before adding a link.
            </p>
            <button
              onClick={() => setShowSelectTextAlert(false)}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Add Link</h3>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Text:
              </label>
              <div className="px-3 py-2 bg-indigo-50 rounded text-indigo-900 text-sm font-medium">
                {selectedText}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL:
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="youtube.com or https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Tip: You can enter just the domain (e.g., youtube.com)
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkUrl('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={insertLink}
                disabled={!linkUrl.trim()}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Message</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this message? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setMessageToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {showUserProfile && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">User Profile</h3>
                <button
                  onClick={() => {
                    setShowUserProfile(false);
                    setSelectedUser(null);
                    setUserBooks([]);
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {selectedUser.userPhoto ? (
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={selectedUser.userPhoto} alt={selectedUser.userName} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-indigo-600 font-bold text-3xl shadow-lg">
                      {selectedUser.userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xl font-semibold">{selectedUser.userName}</h4>
                    <p className="text-indigo-100 text-sm">BXARCHI Member</p>
                  </div>
                </div>
                
                {/* Private Chat Button */}
                {selectedUser.userId !== user?.uid && (
                  <Link
                    href={`/chat/${selectedUser.userId}`}
                    onClick={() => {
                      setShowUserProfile(false);
                      setSelectedUser(null);
                      setUserBooks([]);
                    }}
                    className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 font-medium transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Chat</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Books Section */}
            <div className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Published Books ({userBooks.length})
              </h4>

              {loadingUserBooks ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : userBooks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p>No published books yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userBooks.map((book: any) => (
                    <Link
                      key={book.id}
                      href={`/books/${book.id}`}
                      onClick={() => {
                        setShowUserProfile(false);
                        setSelectedUser(null);
                        setUserBooks([]);
                      }}
                      className="flex space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {book.coverImage && (
                        <div className="w-16 h-20 flex-shrink-0 rounded overflow-hidden bg-gray-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-gray-900 truncate">{book.title}</h5>
                        <p className="text-sm text-gray-600 line-clamp-2">{book.description}</p>
                        <span className="inline-block mt-1 text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded capitalize">
                          {book.genre}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* WhatsApp-style Header */}
        <div className="bg-indigo-600 text-white shadow-md">
          <div className="flex items-center px-4 py-3">
            <button onClick={() => router.back()} className="mr-3 hover:bg-indigo-700 p-2 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-xl">💡</span>
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Dev Insights</h1>
              <p className="text-xs text-indigo-200">Community Chat</p>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-[#e5ddd5] flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ 
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%23e5ddd5\'/%3E%3Cpath d=\'M50 0L0 50l50 50 50-50z\' fill=\'%23d9d0c7\' fill-opacity=\'.1\'/%3E%3C/svg%3E")',
            backgroundSize: '100px 100px'
          }}>
            {enrichedMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No messages yet</h3>
                <p className="text-gray-500">Be the first to share your thoughts!</p>
              </div>
            ) : (
              enrichedMessages.map((msg) => {
                const isCurrentUser = msg.userId === user.uid;
                const displayName = msg.realUserName || msg.userName;
                const displayPhoto = msg.realUserPhoto || msg.userPhoto;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-1`}
                  >
                    <div className={`flex max-w-[85%] md:max-w-[70%] items-start ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* User Avatar - Clickable */}
                      <button
                        onClick={() => handleUserClick(msg.userId, displayName, displayPhoto)}
                        className={`flex-shrink-0 ${isCurrentUser ? 'ml-2' : 'mr-2'} cursor-pointer hover:opacity-80 transition-opacity`}
                      >
                        {displayPhoto ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={displayPhoto}
                              alt={displayName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm border-2 border-white">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </button>

                      {/* Message Bubble */}
                      <div className="relative flex-1">
                        {/* Username above bubble */}
                        <p className={`text-xs font-semibold mb-1 px-1 ${isCurrentUser ? 'text-right text-gray-600' : 'text-left text-indigo-600'}`}>
                          {isCurrentUser ? 'You' : displayName}
                        </p>
                        
                        <div
                          className={`rounded-lg px-3 py-2 shadow-sm ${
                            isCurrentUser
                              ? 'bg-[#dcf8c6] text-gray-900'
                              : 'bg-white text-gray-900'
                          }`}
                        >
                          <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                            {msg.message.split(/(\[.*?\]\(.*?\))/).map((part, idx) => {
                              const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
                              if (linkMatch) {
                                // Ensure URL has protocol
                                let url = linkMatch[2];
                                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                                  url = 'https://' + url;
                                }
                                return (
                                  <a
                                    key={idx}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline hover:text-blue-800"
                                  >
                                    {linkMatch[1]}
                                  </a>
                                );
                              }
                              return <span key={idx}>{part}</span>;
                            })}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center space-x-1">
                              <span className="text-[10px] text-gray-500">
                                {msg.timestamp?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Now'}
                              </span>
                              {isCurrentUser && (
                                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 16 15">
                                  <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/>
                                </svg>
                              )}
                            </div>
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="text-red-500 hover:text-red-700 ml-2"
                                title="Delete message (Admin)"
                              >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
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
                      type="button"
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

              {/* Link Button */}
              <button
                type="button"
                onClick={handleLinkClick}
                className="w-10 h-10 text-gray-500 hover:text-gray-700 flex items-center justify-center transition-colors"
                title="Add link (select text first)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
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
                className="w-10 h-10 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                {sending ? (
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
