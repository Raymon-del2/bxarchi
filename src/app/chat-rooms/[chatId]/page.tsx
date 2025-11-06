'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Loader from '@/components/ui/Loader';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc, getDoc, or, and } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// Admin user IDs
const ADMIN_USERS = ['FaLWjIwujeghy34NGelI0rrB7Vk2'];

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
}

export default function ChatRoomDetailPage({ params }: { params: { chatId: string } }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const participantIds = params.chatId.split('_');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || !ADMIN_USERS.includes(user.uid)) {
      router.push('/browse');
      return;
    }

    // Fetch participant profiles
    const fetchParticipants = async () => {
      const profiles: UserProfile[] = [];
      for (const userId of participantIds) {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const data = userDoc.data();
            profiles.push({
              nickname: data.nickname || 'Unknown User',
              photoURL: data.photoURL
            });
          } else {
            profiles.push({ nickname: 'Unknown User' });
          }
        } catch (error) {
          profiles.push({ nickname: 'Unknown User' });
        }
      }
      setParticipants(profiles);
    };

    fetchParticipants();
  }, [user, router, participantIds]);

  useEffect(() => {
    if (!user || participantIds.length !== 2) return;

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      or(
        and(
          where('senderId', '==', participantIds[0]),
          where('receiverId', '==', participantIds[1])
        ),
        and(
          where('senderId', '==', participantIds[1]),
          where('receiverId', '==', participantIds[0])
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
  }, [user, participantIds]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleDeleteMessage = (messageId: string) => {
    setMessageToDelete(messageId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!messageToDelete) return;

    try {
      await deleteDoc(doc(db, 'messages', messageToDelete));
      setShowDeleteModal(false);
      setMessageToDelete(null);
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  if (authLoading || loading) {
    return <Loader />;
  }

  if (!user || !ADMIN_USERS.includes(user.uid)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

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

      <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/chat-rooms" className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>

              <div className="flex -space-x-2">
                {participants.map((participant, idx) => (
                  <div key={idx} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600">
                    {participant.photoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={participant.photoURL} alt={participant.nickname} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                        {participant.nickname.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {participants.map(p => p.nickname).join(' & ')}
                </h2>
                <p className="text-sm text-gray-500">{messages.length} messages</p>
              </div>
            </div>

            <div className="bg-red-100 border border-red-300 rounded-lg px-3 py-1">
              <p className="text-red-800 font-semibold text-xs">Admin View</p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="mt-4 text-gray-600">No messages in this chat</p>
            </div>
          ) : (
            messages.map((msg) => {
              const senderIndex = participantIds.indexOf(msg.senderId);
              const senderName = participants[senderIndex]?.nickname || 'Unknown';
              
              return (
                <div key={msg.id} className="flex items-start space-x-3">
                  {/* Sender Avatar */}
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0">
                    {participants[senderIndex]?.photoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={participants[senderIndex].photoURL} alt={senderName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
                        {senderName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900">{senderName}</span>
                      <span className="text-xs text-gray-500">
                        {msg.timestamp?.toDate().toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
                      <p className="text-gray-900 break-words">{msg.message}</p>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors"
                    title="Delete message (Admin)"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Info Footer */}
        <div className="bg-yellow-50 border-t border-yellow-200 px-6 py-3">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Admin Mode:</strong> You are viewing this conversation for moderation purposes. You can delete inappropriate messages.
          </p>
        </div>
      </div>
    </div>
  );
}
