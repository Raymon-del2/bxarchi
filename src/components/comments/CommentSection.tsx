'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Loader from '@/components/ui/Loader';
import LikeCheckbox from '@/components/ui/LikeCheckbox';
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';
import { 
  addComment, 
  getBookComments, 
  updateComment, 
  deleteComment, 
  toggleCommentLike,
  checkUserLikedComment,
  type Comment 
} from '@/lib/firebase/comments';
import Image from 'next/image';

interface CommentSectionProps {
  bookId: string;
}

export default function CommentSection({ bookId }: CommentSectionProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    const { comments: fetchedComments, error } = await getBookComments(bookId);
    
    if (error) {
      console.error('Error fetching comments:', error);
    } else {
      console.log('Fetched comments:', fetchedComments.length);
    }
    
    setComments(fetchedComments);
    
    // Check which comments user has liked
    if (user) {
      const liked = new Set<string>();
      for (const comment of fetchedComments) {
        if (comment.id) {
          const { liked: isLiked } = await checkUserLikedComment(comment.id, user.uid);
          if (isLiked) {
            liked.add(comment.id);
          }
        }
      }
      setLikedComments(liked);
    }
    
    setLoading(false);
  }, [bookId, user]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmitComment = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!newComment.trim()) return;

    setSubmitting(true);
    
    const commentData = {
      bookId,
      userId: user.uid,
      userName: user.displayName || user.email || 'Anonymous',
      userPhoto: user.photoURL || '',
      content: newComment.trim(),
    };
    
    const { commentId, error } = await addComment(commentData);

    if (!error && commentId) {
      // Optimistically add the comment to the list
      const newCommentObj: Comment = {
        id: commentId,
        ...commentData,
        likes: 0,
        createdAt: new Date(),
      };
      
      setComments(prev => [newCommentObj, ...prev]);
      setNewComment('');
    } else if (error) {
      alert('Failed to post comment: ' + error);
    }
    
    setSubmitting(false);
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    const { error } = await updateComment(commentId, editContent.trim());
    if (!error) {
      setEditingId(null);
      setEditContent('');
      fetchComments();
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setCommentToDelete(commentId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!commentToDelete) return;

    const { error } = await deleteComment(commentToDelete);
    if (!error) {
      // Optimistically remove the comment from the list
      setComments(prev => prev.filter(c => c.id !== commentToDelete));
    } else {
      alert('Failed to delete comment: ' + error);
    }
    
    setDeleteModalOpen(false);
    setCommentToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setCommentToDelete(null);
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    const { liked } = await toggleCommentLike(commentId, user.uid);
    
    // Update local state
    setLikedComments(prev => {
      const newSet = new Set(prev);
      if (liked) {
        newSet.add(commentId);
      } else {
        newSet.delete(commentId);
      }
      return newSet;
    });

    // Update comment likes count
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          likes: (comment.likes || 0) + (liked ? 1 : -1)
        };
      }
      return comment;
    }));
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
      />

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Comments ({comments.length})
        </h2>

      {/* Add Comment */}
      <div className="mb-8">
        <div className="flex items-start space-x-4">
          {user?.photoURL ? (
            <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={user.photoURL}
                alt={user.displayName || 'User'}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
              </span>
            </div>
          )}
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? "Write a comment..." : "Login to comment"}
              rows={3}
              disabled={!user}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white resize-none"
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || submitting || !user}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="flex justify-center">
            <Loader />
          </div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-4">
              {/* User Avatar */}
              {comment.userPhoto ? (
                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={comment.userPhoto}
                    alt={comment.userName}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 font-semibold">
                    {comment.userName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Comment Content */}
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold text-gray-900">{comment.userName}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    {user && user.uid === comment.userId && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingId(comment.id || null);
                            setEditContent(comment.content);
                          }}
                          className="text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id!)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {editingId === comment.id ? (
                    <div>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                        rows={3}
                      />
                      <div className="mt-2 flex space-x-2">
                        <button
                          onClick={() => handleEditComment(comment.id!)}
                          className="px-4 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditContent('');
                          }}
                          className="px-4 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  )}
                </div>

                {/* Like Button */}
                <div className="mt-2">
                  <LikeCheckbox
                    checked={likedComments.has(comment.id!)}
                    onChange={() => handleLikeComment(comment.id!)}
                    count={comment.likes || 0}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </>
  );
}
