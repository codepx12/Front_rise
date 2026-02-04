import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Trash2, ThumbsUp, Laugh, AlertCircle, Frown, Zap, Send } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getImageUrl, getProfileImageUrl } from '../services/api';

const REACTIONS = [
  { icon: ThumbsUp, name: 'thumbsup', label: 'Pouce levé' },
  { icon: Heart, name: 'heart', label: 'Cœur' },
  { icon: Laugh, name: 'laugh', label: 'Rire' },
  { icon: AlertCircle, name: 'wow', label: 'Wow' },
  { icon: Frown, name: 'sad', label: 'Triste' },
  { icon: Zap, name: 'angry', label: 'Fâché' },
];

export default function CommentSection({ postId, comments = [], onAddComment, onDeleteComment, onReact }) {
  const { user } = useAuthStore();
  const [commentText, setCommentText] = useState('');
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [replyText, setReplyText] = useState({});

  const handleAddComment = async () => {
    if (commentText.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onAddComment(postId, {
          content: commentText,
          taggedUserIds: taggedUsers.map((u) => u.id),
        });
        setCommentText('');
        setTaggedUsers([]);
      } catch (error) {
        console.error('Erreur lors de l\'ajout du commentaire:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !isSubmitting) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const handleMention = (e) => {
    const text = e.target.value;
    setCommentText(text);

    // Détecter les mentions avec @
    const atIndex = text.lastIndexOf('@');
    if (atIndex !== -1) {
      const searchText = text.substring(atIndex + 1);
      if (searchText && !searchText.includes(' ')) {
        setMentionSearch(searchText);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const addTaggedUser = (user) => {
    if (!taggedUsers.find((u) => u.id === user.id)) {
      setTaggedUsers([...taggedUsers, user]);
      // Remplacer la mention par le nom de l'utilisateur
      const atIndex = commentText.lastIndexOf('@');
      const beforeMention = commentText.substring(0, atIndex);
      setCommentText(beforeMention + '@' + user.firstName + ' ');
    }
    setShowMentions(false);
    setMentionSearch('');
  };

  return (
    <div className="mt-4 border-t pt-4">
      <h3 className="font-bold text-lg mb-4">Commentaires ({comments.length})</h3>

      {/* Ajouter un commentaire - Style Instagram */}
      <div className="mb-6 pb-6 border-b border-gray-200/40">
        <div className="flex gap-3 items-end">
          <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
            <img
              src={getProfileImageUrl(user?.profileImageUrl)}
              alt={user?.firstName}
              onError={(e) => {
                e.target.src = '/profile_none.jpg';
              }}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="relative flex items-center gap-2 bg-white/60 backdrop-blur-lg rounded-full border border-gray-200/40 px-4 py-2.5 hover:border-gray-300/60 transition-colors">
              <textarea
                ref={textareaRef}
                value={commentText}
                onChange={handleMention}
                onKeyPress={handleKeyPress}
                placeholder="Ajouter un commentaire..."
                className="flex-1 bg-transparent outline-none resize-none text-sm placeholder-gray-400 max-h-24 scrollbar-hide"
                rows="1"
                style={{
                  overflow: 'hidden',
                  minHeight: '20px',
                }}
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim() || isSubmitting}
                className="flex-shrink-0 text-blue-600 hover:text-blue-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                title="Envoyer (Ctrl+Entrée)"
              >
                <Send size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Utilisateurs mentionnés */}
            {taggedUsers.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2 px-4">
                {taggedUsers.map((u) => (
                  <span
                    key={u.id}
                    className="inline-flex items-center gap-1 bg-blue-100/80 text-blue-700 px-2 py-1 rounded-full text-xs backdrop-blur-sm"
                  >
                    @{u.firstName}
                    <button
                      onClick={() =>
                        setTaggedUsers(taggedUsers.filter((tagged) => tagged.id !== u.id))
                      }
                      className="ml-1 text-blue-700 hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {showMentions && (
              <div className="absolute top-full mt-1 left-12 right-0 bg-white/90 backdrop-blur-lg border border-gray-200/40 rounded-xl shadow-lg z-10 max-h-40 overflow-y-auto">
                <div className="p-2 text-sm text-gray-600">
                  Suggestions de mention (mises en place - intégrer avec API)
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Liste des commentaires */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Aucun commentaire pour le moment</p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onDelete={() => onDeleteComment(postId, comment.id)}
              onReact={onReact}
              user={user}
              postId={postId}
            />
          ))
        )}
      </div>
    </div>
  );
}

function CommentItem({ comment, onDelete, onReact, user, postId }) {
  const [showReactions, setShowReactions] = useState(false);
  const [reactions, setReactions] = useState(comment.reactions || []);

  const handleReact = (reactionType) => {
    onReact(postId, comment.id, reactionType);
    setShowReactions(false);
  };

  const userReaction = reactions.find((r) => r.userId === user?.id);

  return (
    <div className="flex gap-3 p-3">
      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
        {comment.userProfileImageUrl ? (
          <img
            src={getImageUrl(comment.userProfileImageUrl)}
            alt={comment.userName}
            className="w-full h-full object-cover"
          />
        ) : (
          `${comment.userName?.charAt(0) || 'U'}`
        )}
      </div>
      <div className="flex-1">
        <div className="bg-gray-100/50 backdrop-blur-sm rounded-2xl p-3 border border-gray-200/40">
          <div className="font-semibold text-sm text-gray-900">
            {comment.userName}
          </div>
          <p className="text-sm mt-1 text-gray-800">{comment.content}</p>

          {/* Tags mentionnés */}
          {comment.taggedUsers && comment.taggedUsers.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {comment.taggedUsers.map((u) => (
                <span key={u.id} className="text-blue-600 text-sm font-medium">
                  @{u.username}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions de commentaire - Style Instagram */}
        <div className="mt-2 flex gap-6 items-center text-xs text-gray-600 px-1">
          <div className="relative">
            <button
              onClick={() => setShowReactions(!showReactions)}
              className="hover:text-gray-900 flex items-center gap-1.5 transition-colors duration-200 font-medium"
            >
              <Heart size={14} />
              Réagir
            </button>
            {showReactions && (
              <div className="absolute left-0 top-full mt-1 bg-white/95 backdrop-blur-lg border border-gray-200/40 rounded-full shadow-lg p-2 flex gap-1.5 z-10">
                {REACTIONS.map((reaction) => {
                  const Icon = reaction.icon;
                  return (
                    <button
                      key={reaction.name}
                      onClick={() => handleReact(reaction.name)}
                      className="p-1.5 hover:bg-gray-100/50 rounded-full transition-all duration-200 hover:scale-125"
                      title={reaction.label}
                    >
                      <Icon size={16} className="text-gray-700" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {user?.id === comment.userId && (
            <button
              onClick={onDelete}
              className="hover:text-red-600 flex items-center gap-1.5 transition-colors duration-200 font-medium"
            >
              <Trash2 size={14} />
              Supprimer
            </button>
          )}
        </div>

        {/* Réactions affichées */}
        {reactions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {reactions.map((reaction, idx) => {
              const reactionObj = REACTIONS.find(r => r.name === reaction.type);
              const Icon = reactionObj?.icon;
              return (
                <span key={idx} className="bg-gray-200/50 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1 border border-gray-200/40 text-xs">
                  {Icon ? <Icon size={12} className="text-gray-700" /> : reaction.type}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
