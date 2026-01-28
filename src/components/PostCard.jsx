import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatRelativeDate } from '../utils/dateFormatter';
import { getImageUrl, getProfileImageUrl } from '../services/api';
import { websocketService } from '../services/websocketService';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Bookmark,
  Link as LinkIcon,
  Play,
} from 'lucide-react';
import apiClient from '../services/api';
import UserLink from './UserLink';

export default function PostCard({
  post,
  onLike,
  onComment,
  onCommentSend,
  commentText,
  setCommentText,
  expandedPosts,
  toggleComments,
  selectedPostForComment,
  setSelectedPostForComment,
  userReactions,
  commentReactions,
  setCommentReactions,
  replyingTo,
  setReplyingTo,
  replyText,
  setReplyText,
  fetchPosts,
}) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(userReactions[post.id] || false);
  const [localPost, setLocalPost] = useState(post);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);

  // Écouter les nouveaux commentaires via WebSocket
  useEffect(() => {
    const unsubscribe = websocketService.on('CommentAdded', (data) => {
      if (data.postId === localPost.id) {
        console.log('Nouveau commentaire reçu:', data);

        setLocalPost((prevPost) => ({
          ...prevPost,
          commentCount: data.commentCount,
          comments: [...(prevPost.comments || []), data.comment],
        }));

        setCommentCount(data.commentCount);
      }
    });

    return unsubscribe;
  }, [localPost.id]);

  // Écouter la suppression de commentaires
  useEffect(() => {
    const unsubscribe = websocketService.on('CommentDeleted', (data) => {
      if (data.postId === localPost.id) {
        console.log('Commentaire supprimé:', data.commentId);

        setLocalPost((prevPost) => ({
          ...prevPost,
          commentCount: data.commentCount,
          comments: (prevPost.comments || []).filter((c) => c.id !== data.commentId),
        }));

        setCommentCount(data.commentCount);
      }
    });

    return unsubscribe;
  }, [localPost.id]);

  // Mettre à jour le post local si le prop change
  useEffect(() => {
    setLocalPost(post);
    setCommentCount(post.commentCount || 0);
  }, [post.id, post.commentCount]);

  const handleLikeClick = async () => {
    setLiked(!liked);
    await onLike(post.id);
  };

  // Extraire le domaine d'un URL
  const getDomainFromUrl = (url) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <div className="bg-purple-900b backdrop-blur-2xl rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-white/40 bg-gradient-to-br from-white/40 to-white/20">
      {/* Post Header - iOS 26 Style */}
      <div className="px-4 py-3 flex justify-between items-center border-b border-white/30">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md overflow-hidden cursor-pointer hover:opacity-80 transition" onClick={() => post.createdById && navigate(`/profile/${post.createdById}`)}>
            {post.createdByProfileImage ? (
              <img
                src={getImageUrl(post.createdByProfileImage)}
                alt={post.createdByName}
                className="w-full h-full object-cover"
              />
            ) : (
              post.createdByName?.charAt(0) || 'U'
            )}
          </div>
          <div className="flex-1">
            {post.createdById ? (
              <UserLink 
                user={{
                  id: post.createdById,
                  firstName: post.createdByName?.split(' ')[0] || '',
                  lastName: post.createdByName?.split(' ').slice(1).join(' ') || '',
                  profileImageUrl: post.createdByProfileImage
                }}
                showAvatar={false}
                nameClassName="text-sm"
              />
            ) : (
              <p className="font-semibold text-gray-900 text-sm">
                {post.createdByName || 'Utilisateur'}
              </p>
            )}
            <p className="text-xs text-gray-500">
              {formatRelativeDate(post.createdAt)}
            </p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100/50 transition duration-200">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Post Caption */}
      {post.content && (
        <div className="px-4 py-4">
          <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>
      )}

      {/* Post Images - iOS 26 Style */}
      {post.images && post.images.length > 0 && (
        <div className="bg-gradient-to-b from-gray-100/50 to-gray-50/50 backdrop-blur-sm">
          {post.images.length === 1 ? (
            <img
              src={post.images[0].imageUrl}
              alt="Post"
              className="w-full h-auto object-cover max-h-96 sm:max-h-72 lg:max-h-96"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : post.images.length === 2 ? (
            <div className="grid grid-cols-2 gap-0.5">
              {post.images.slice(0, 2).map((img, idx) => (
                <img
                  key={idx}
                  src={img.imageUrl}
                  alt={`Image ${idx + 1}`}
                  className="w-full h-40 sm:h-32 lg:h-72 object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ))}
            </div>
          ) : post.images.length === 3 ? (
            <div className="grid grid-cols-2 gap-0.5">
              <img
                src={post.images[0].imageUrl}
                alt="Image 1"
                className="w-full h-40 sm:h-32 lg:h-80 object-cover col-span-1 row-span-2"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <img
                src={post.images[1].imageUrl}
                alt="Image 2"
                className="w-full h-20 sm:h-16 lg:h-40 object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <img
                src={post.images[2].imageUrl}
                alt="Image 3"
                className="w-full h-20 sm:h-16 lg:h-40 object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-0.5">
              {post.images.slice(0, 4).map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={img.imageUrl}
                    alt={`Image ${idx + 1}`}
                    className="w-full h-32 sm:h-24 lg:h-56 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  {idx === 3 && post.images.length > 4 && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                      <p className="text-white text-xl font-bold">
                        +{post.images.length - 4}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Post Video */}
      {post.videoUrl && (
        <div className="relative bg-gradient-to-b from-gray-100/50 to-gray-50/50 backdrop-blur-sm aspect-video overflow-hidden">
          <video
            src={post.videoUrl}
            controls
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          {!post.videoUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200/50">
              <Play size={48} className="text-gray-400" />
            </div>
          )}
        </div>
      )}

      {/* Post External Link */}
      {post.externalLink && (
        <div className="px-4 py-3 border-t border-gray-200/40">
          <a
            href={post.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-100/40 to-purple-100/40 backdrop-blur-lg rounded-xl hover:from-blue-100/60 hover:to-purple-100/60 transition-all duration-200 group border border-blue-200/40"
          >
            <LinkIcon size={20} className="text-blue-600 shrink-0 group-hover:scale-110 transition duration-200" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600 group-hover:text-gray-700 transition">Lien partagé</p>
              <p className="text-sm font-medium text-blue-600 truncate group-hover:text-blue-700">
                {getDomainFromUrl(post.externalLink)}
              </p>
            </div>
            <span className="text-gray-400 text-xs shrink-0">→</span>
          </a>
        </div>
      )}

      {/* Post Actions - iOS 26 Style */}
      <div className="px-4 py-3 border-t border-gray-200/40">
        <div className="flex gap-4 mb-3">
          <button
            onClick={handleLikeClick}
            className="group flex items-center gap-2 transition duration-200"
          >
            <Heart
              size={22}
              className={`transition duration-200 ${
                liked
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-600 group-hover:text-red-400'
              }`}
            />
          </button>
          <button
            onClick={() => {
              toggleComments(post.id);
              onComment(post.id);
            }}
            className="group flex items-center gap-2 text-gray-600 hover:text-blue-400 transition duration-200"
          >
            <MessageCircle size={22} className="group-hover:scale-110 transition" />
          </button>
          <button className="group flex items-center gap-2 text-gray-600 hover:text-blue-400 transition duration-200">
            <Share2 size={22} className="group-hover:scale-110 transition" />
          </button>
          <button className="ml-auto text-gray-600 hover:text-blue-400 transition duration-200">
            <Bookmark size={22} />
          </button>
        </div>

        {/* Stats */}
        {(commentCount > 0 || post.reactionCount > 0) && (
          <div className="text-sm space-y-1">
            {post.reactionCount > 0 && (
              <p className="font-semibold text-gray-900">
                ❤️ {post.reactionCount} {post.reactionCount > 1 ? 'j\'aime' : 'j\'aime'}
              </p>
            )}
            {commentCount > 0 && (
              <p className="text-gray-600">
                💬 {commentCount} {commentCount > 1 ? 'commentaires' : 'commentaire'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* View/Hide Comments Button */}
      {commentCount > 0 && (
        <div className="px-4 py-2 border-t border-gray-200/40">
          <button
            onClick={() => toggleComments(post.id)}
            className="text-blue-600 hover:text-blue-700 text-sm transition font-medium"
          >
            {expandedPosts.has(post.id) 
              ? `Masquer les ${commentCount} commentaire${commentCount > 1 ? 's' : ''}`
              : `Afficher les ${commentCount} commentaire${commentCount > 1 ? 's' : ''}`
            }
          </button>
        </div>
      )}

      {/* Comments Section */}
      {expandedPosts.has(post.id) && (
        <div className="bg-white/20 backdrop-blur-lg px-4 py-3 border-t border-gray-200/40">
          {localPost.comments && localPost.comments.length > 0 ? (
            <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
              {localPost.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                    <img
                      src={getProfileImageUrl(comment.userProfileImageUrl)}
                      alt={comment.userName}
                      onError={(e) => {
                        e.target.src = '/profile_none.jpg';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-200/40 backdrop-blur-md rounded-2xl px-4 py-2 border border-gray-200/40">
                      <p className="font-semibold text-sm text-gray-900">{comment.userName}</p>
                      <p className="text-sm text-gray-800 break-words">{comment.content}</p>
                    </div>
                    <div className="mt-1 flex gap-3 text-xs text-gray-600">
                      <p>{formatRelativeDate(comment.createdAt)}</p>
                      <button className="font-semibold hover:text-gray-800 cursor-pointer transition">
                        👍
                      </button>
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="font-semibold hover:text-gray-800 cursor-pointer transition"
                      >
                        Répondre
                      </button>
                    </div>

                    {/* Zone de réponse */}
                    {replyingTo === comment.id && (
                      <div className="mt-3 bg-white/40 backdrop-blur-lg rounded-lg p-3 border border-gray-200/40">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Écrivez une réponse..."
                          className="w-full bg-white/50 backdrop-blur-sm border border-gray-200/40 rounded px-2 py-1 outline-none focus:border-blue-400 focus:bg-white/80 resize-none text-sm transition"
                          rows="2"
                        />
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                            className="flex-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100/50 rounded transition"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={async () => {
                              if (!replyText.trim()) return;
                              try {
                                await apiClient.post('/posts/comment', {
                                  postId: post.id,
                                  content: replyText,
                                  parentCommentId: comment.id,
                                  taggedUsernames: []
                                });
                                setReplyText('');
                                setReplyingTo(null);
                                fetchPosts();
                              } catch (error) {
                                console.error('Erreur:', error);
                              }
                            }}
                            disabled={!replyText.trim()}
                            className="flex-1 px-2 py-1 text-xs bg-[#3A8B89] hover:bg-[#2F6F6D] text-white/80 rounded transition disabled:opacity-50 backdrop-blur-sm"
                          >
                            Répondre
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Réponses */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-3 space-y-2 ml-4 border-l-2 border-gray-300/40 pl-3">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-500 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                              <img
                                src={getProfileImageUrl(reply.userProfileImageUrl)}
                                alt={reply.userName}
                                onError={(e) => {
                                  e.target.src = '/profile_none.jpg';
                                }}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="bg-gray-100/40 backdrop-blur-md rounded px-2 py-1 border border-gray-200/40">
                                <p className="font-semibold text-xs text-gray-900">{reply.userName}</p>
                                <p className="text-xs text-gray-800">{reply.content}</p>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">{formatRelativeDate(reply.createdAt)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 mb-4">Aucun commentaire pour le moment</p>
          )}

          {/* Comment Input */}
          {selectedPostForComment === post.id ? (
            <div className="space-y-2 border-t border-gray-200/40 pt-3">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Écrivez votre commentaire..."
                className="w-full bg-white/50 backdrop-blur-lg border border-gray-200/40 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:bg-white/80 resize-none text-sm transition"
                rows="3"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedPostForComment(null)}
                  className="flex-1 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100/50 rounded transition"
                >
                  Annuler
                </button>
                <button
                  onClick={onCommentSend}
                  disabled={!commentText.trim()}
                  className="flex-1 px-3 py-1 text-sm bg-[#3A8B89] hover:bg-[#2F6F6D] text-white/80 rounded transition disabled:opacity-50 disabled:cursor-not-allowed font-medium backdrop-blur-sm"
                >
                  Publier
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setSelectedPostForComment(post.id);
                setCommentText('');
              }}
              className="w-full text-left text-sm text-gray-600 hover:bg-gray-200/30 px-2 py-2 rounded transition border-t border-gray-200/40"
            >
              Ajouter un commentaire...
            </button>
          )}
        </div>
      )}
    </div>
  );
}